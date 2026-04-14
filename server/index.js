const http       = require('http');
const express    = require('express');
const cors       = require('cors');
const { v4: uuidv4 } = require('uuid');
const { initDb } = require('./db');
const { setupWss, broadcast } = require('./ws');
const { calcBalances, minSettlements } = require('./balances');

// ─── Init ─────────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);
setupWss(server);

const db = initDb();

app.use(cors());
app.use(express.json());

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Load all data for a tour and return a consistent snapshot. */
function tourSnapshot(tourId) {
  const tour = db.prepare('SELECT * FROM tours WHERE id = ?').get(tourId);
  if (!tour) return null;

  const members = db.prepare('SELECT * FROM members WHERE tour_id = ? ORDER BY created_at').all(tourId);
  const deposits = db.prepare('SELECT * FROM deposits WHERE tour_id = ? ORDER BY created_at DESC').all(tourId);
  const paymentMethods = db.prepare('SELECT name FROM payment_methods WHERE tour_id = ?').all(tourId).map(r => r.name);

  const rawExpenses = db.prepare('SELECT * FROM expenses WHERE tour_id = ? ORDER BY created_at DESC').all(tourId);
  const expenses = rawExpenses.map(e => ({
    ...e,
    splits: db.prepare('SELECT * FROM expense_splits WHERE expense_id = ?').all(e.id),
  }));

  const balances = calcBalances(members, deposits, expenses);
  const settlements = minSettlements(balances);
  const totalDeposit = deposits.reduce((s, d) => s + d.amount, 0);
  const totalExpense = balances.reduce((s, b) => s + b.share, 0);

  return {
    tour,
    members,
    deposits,
    expenses,
    paymentMethods,
    balances,
    settlements,
    summary: {
      totalDeposit: parseFloat(totalDeposit.toFixed(2)),
      totalExpense: parseFloat(totalExpense.toFixed(2)),
      remaining:    parseFloat((totalDeposit - totalExpense).toFixed(2)),
    },
  };
}

/** Broadcast updated snapshot to all tour subscribers. */
function pushUpdate(tourId) {
  const snap = tourSnapshot(tourId);
  if (snap) broadcast(tourId, { type: 'update', data: snap });
}

// ─── Tours ────────────────────────────────────────────────────────────────────

// GET /api/tours – list all tours
app.get('/api/tours', (req, res) => {
  const tours = db.prepare('SELECT * FROM tours ORDER BY created_at DESC').all();
  res.json(tours);
});

// POST /api/tours – create a tour
app.post('/api/tours', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

  const id = uuidv4();
  db.prepare('INSERT INTO tours (id, name) VALUES (?, ?)').run(id, name.trim());

  // Seed default payment methods
  const defaults = ['Cash', 'Bank', 'bKash', 'Nagad'];
  const insertPM = db.prepare('INSERT OR IGNORE INTO payment_methods (tour_id, name) VALUES (?, ?)');
  defaults.forEach(m => insertPM.run(id, m));

  res.status(201).json(tourSnapshot(id));
});

// GET /api/tours/:tourId – full snapshot
app.get('/api/tours/:tourId', (req, res) => {
  const snap = tourSnapshot(req.params.tourId);
  if (!snap) return res.status(404).json({ error: 'Tour not found' });
  res.json(snap);
});

// DELETE /api/tours/:tourId
app.delete('/api/tours/:tourId', (req, res) => {
  db.prepare('DELETE FROM tours WHERE id = ?').run(req.params.tourId);
  res.json({ ok: true });
});

// PATCH /api/tours/:tourId/end – mark tour as ended
app.patch('/api/tours/:tourId/end', (req, res) => {
  const { tourId } = req.params;
  db.prepare("UPDATE tours SET ended_at = datetime('now') WHERE id = ?").run(tourId);
  pushUpdate(tourId);
  res.json(tourSnapshot(tourId));
});

// PATCH /api/tours/:tourId/reopen – clear ended_at
app.patch('/api/tours/:tourId/reopen', (req, res) => {
  const { tourId } = req.params;
  db.prepare("UPDATE tours SET ended_at = NULL WHERE id = ?").run(tourId);
  pushUpdate(tourId);
  res.json(tourSnapshot(tourId));
});

// ─── Payment Methods ──────────────────────────────────────────────────────────

// POST /api/tours/:tourId/payment-methods
app.post('/api/tours/:tourId/payment-methods', (req, res) => {
  const { tourId } = req.params;
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  db.prepare('INSERT OR IGNORE INTO payment_methods (tour_id, name) VALUES (?, ?)').run(tourId, name.trim());
  pushUpdate(tourId);
  res.json({ ok: true });
});

// ─── Members ──────────────────────────────────────────────────────────────────

// POST /api/tours/:tourId/members
app.post('/api/tours/:tourId/members', (req, res) => {
  const { tourId } = req.params;
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });

  const id = uuidv4();
  db.prepare('INSERT INTO members (id, tour_id, name) VALUES (?, ?, ?)').run(id, tourId, name.trim());

  pushUpdate(tourId);
  res.status(201).json(tourSnapshot(tourId));
});

// DELETE /api/tours/:tourId/members/:memberId
app.delete('/api/tours/:tourId/members/:memberId', (req, res) => {
  const { tourId, memberId } = req.params;
  db.prepare('DELETE FROM members WHERE id = ? AND tour_id = ?').run(memberId, tourId);
  pushUpdate(tourId);
  res.json(tourSnapshot(tourId));
});

// ─── Deposits ─────────────────────────────────────────────────────────────────

// POST /api/tours/:tourId/deposits
app.post('/api/tours/:tourId/deposits', (req, res) => {
  const { tourId } = req.params;
  const { memberId, amount, note, paymentMethod } = req.body;

  if (!memberId || !amount || amount <= 0)
    return res.status(400).json({ error: 'memberId and positive amount required' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO deposits (id, tour_id, member_id, amount, note, payment_method)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, tourId, memberId, parseFloat(amount), note || null, paymentMethod || 'Cash');

  pushUpdate(tourId);
  res.status(201).json(tourSnapshot(tourId));
});

// DELETE /api/tours/:tourId/deposits/:depositId
app.delete('/api/tours/:tourId/deposits/:depositId', (req, res) => {
  const { tourId, depositId } = req.params;
  db.prepare('DELETE FROM deposits WHERE id = ? AND tour_id = ?').run(depositId, tourId);
  pushUpdate(tourId);
  res.json(tourSnapshot(tourId));
});

// ─── Expenses ─────────────────────────────────────────────────────────────────

// POST /api/tours/:tourId/expenses
app.post('/api/tours/:tourId/expenses', (req, res) => {
  const { tourId } = req.params;
  const { title, amount, paidBy, splitType, splits, paymentMethod } = req.body;

  if (!title?.trim() || !amount || amount <= 0 || !paidBy)
    return res.status(400).json({ error: 'title, amount, paidBy required' });

  if (!['equal', 'custom'].includes(splitType))
    return res.status(400).json({ error: 'splitType must be equal or custom' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO expenses (id, tour_id, title, amount, paid_by, split_type, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, tourId, title.trim(), parseFloat(amount), paidBy, splitType, paymentMethod || 'Cash');

  // Insert splits
  if (Array.isArray(splits) && splits.length) {
    const insertSplit = db.prepare(`
      INSERT INTO expense_splits (expense_id, member_id, included, amount)
      VALUES (?, ?, ?, ?)
    `);
    splits.forEach(s => {
      insertSplit.run(id, s.memberId, s.included ? 1 : 0, parseFloat(s.amount || 0));
    });
  }

  pushUpdate(tourId);
  res.status(201).json(tourSnapshot(tourId));
});

// DELETE /api/tours/:tourId/expenses/:expenseId
app.delete('/api/tours/:tourId/expenses/:expenseId', (req, res) => {
  const { tourId, expenseId } = req.params;
  db.prepare('DELETE FROM expenses WHERE id = ? AND tour_id = ?').run(expenseId, tourId);
  pushUpdate(tourId);
  res.json(tourSnapshot(tourId));
});

// ─── Balances (read-only convenience endpoint) ────────────────────────────────

// GET /api/tours/:tourId/balances
app.get('/api/tours/:tourId/balances', (req, res) => {
  const snap = tourSnapshot(req.params.tourId);
  if (!snap) return res.status(404).json({ error: 'Tour not found' });
  res.json({ balances: snap.balances, settlements: snap.settlements, summary: snap.summary });
});

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ TourSplit API running on http://localhost:${PORT}`);
  console.log(`✅ WebSocket ready at  ws://localhost:${PORT}/ws`);
});
