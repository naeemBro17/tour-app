import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";import React, { useState, useEffect, useCallback } from 'react';
import { useTourSocket } from './useSocket';
import AddTransactionModal from './AddTransactionModal';
import { STYLES, fmt, COLORS, Icon, ICONS, Toast, initTheme, getTheme, setTheme } from './shared';

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  console.log("test change"); //
  const [tours,        setTours]        = useState([]);
  const [activeTourId, setActiveTourId] = useState(null);
  const [showCreate,   setShowCreate]   = useState(false);
  const [toast,        setToast]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [theme,        setThemeState]   = useState(() => initTheme());

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#tour-')) setActiveTourId(hash.slice(6));
  }, []);
  useEffect(() => {
  setLoading(false);
}, []);

  const handleCreate = async name => {
    try {
     const docRef = await addDoc(collection(db, "tours"), {
  name: name,
  created_at: new Date().toISOString(),
});

const newTour = {
  id: docRef.id,
  name: name,
  created_at: new Date().toISOString(),
};

setTours(prev => [newTour, ...prev]);
setActiveTourId(docRef.id);
      setShowCreate(false);
      showToast('Tour created! 🎉');
    } catch (e) {
      showToast('Error: ' + e.message);
    }
  };

  const handleDeleteTour = id => {
    setTours(prev => prev.filter(t => t.id !== id));
    setActiveTourId(null);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <Toast msg={toast} />

        {/* Theme toggle — always visible */}
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {!activeTourId
          ? <HomePage
              tours={tours} loading={loading}
              onSelect={setActiveTourId}
              onNew={() => setShowCreate(true)}
            />
          : <TourPage
              tourId={activeTourId}
              onBack={() => { setActiveTourId(null); window.location.hash = ''; }}
              onDeleted={() => handleDeleteTour(activeTourId)}
              showToast={showToast}
            />
        }
        {showCreate && <CreateModal onCreate={handleCreate} onClose={() => setShowCreate(false)} />}
      </div>
    </>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ tours, loading, onSelect, onNew }) {
  return (
    <div className="page">
      <div className="logo">
        <div className="logo-icon">✈</div>
        <div className="logo-name">Tour<span>Split</span></div>
      </div>
      <h1 className="home-title">Track every taka on your trip</h1>
      <p className="home-sub">Split group expenses fairly. No drama, just math.</p>
      <button className="btn btn-primary" onClick={onNew}>
        <Icon d={ICONS.plus} /> New Tour
      </button>

      {loading && <div className="spinner"><span className="dot-spin"/>Loading tours…</div>}

      {!loading && tours.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div className="section-label">Your Tours</div>
          {tours.map(t => (
            <div key={t.id} className="tour-card" onClick={() => onSelect(t.id)}>
              <div>
                <div className="tour-card-name">
                  {t.name}
                  {t.ended_at && <span className="tour-ended-badge">ENDED</span>}
                </div>
                <div className="tour-card-meta">
                  Created {new Date(t.created_at).toLocaleDateString()}
                  {t.ended_at && ` · Ended ${new Date(t.ended_at).toLocaleDateString()}`}
                </div>
              </div>
              <Icon d={ICONS.arrow} size={16} />
            </div>
          ))}
        </div>
      )}

      {!loading && tours.length === 0 && (
        <div className="empty" style={{ marginTop: 48 }}>
          <div className="empty-icon">🗺️</div>
          <p>No tours yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}

// ─── Create Tour Modal ────────────────────────────────────────────────────────
function CreateModal({ onCreate, onClose }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await onCreate(name.trim());
    setLoading(false);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">New Tour 🧳</div>
        <div className="field">
          <label>Tour Name</label>
          <input autoFocus placeholder="Cox's Bazar 2025…"
            value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>
        <button className="btn btn-primary" onClick={submit} disabled={loading || !name.trim()}>
          <Icon d={ICONS.plus} /> {loading ? 'Creating…' : 'Create Tour'}
        </button>
        <button className="cancel-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Tour Page ────────────────────────────────────────────────────────────────
function TourPage({ tourId, onBack, onDeleted, showToast }) {
  const [data,          setData]          = useState(null);
  const [tab,           setTab]           = useState('feed');
  const [showAdd,       setShowAdd]       = useState(false);
  const [copied,        setCopied]        = useState(false);
  const [connected,     setConnected]     = useState(false);
  const [loadErr,       setLoadErr]       = useState('');
  const [showEndModal,  setShowEndModal]  = useState(false);

// 🔴 SOCKET OFF (backend removed)
// useTourSocket(tourId, snap => {
//   setData(snap);
//   setConnected(true);
// });

// ✅ TEMP DATA (so app doesn't hang)
useEffect(() => {
  setData({
    tour: { id: tourId, name: "My Tour" },
    members: [],
    deposits: [],
    expenses: [],
    paymentMethods: [],
    balances: [],
    settlements: [],
    summary: {
      totalDeposit: 0,
      totalExpense: 0,
      remaining: 0
    }
  });

  setConnected(true);
}, [tourId]);

// 🔥 CALCULATION LOGIC (ADD THIS)
useEffect(() => {
  if (!data) return;

  const totalDeposit = (data.deposits || []).reduce(
    (sum, d) => sum + (d.amount || 0),
    0
  );

  const totalExpense = (data.expenses || []).reduce(
    (sum, e) => sum + (e.amount || 0),
    0
  );

  const memberCount = (data.members || []).length;
  const perPerson = memberCount ? totalExpense / memberCount : 0;

  const balances = (data.members || []).map(m => {
    const deposited = (data.deposits || [])
      .filter(d => d.member_id === m.id)
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    return {
      memberId: m.id,
      name: m.name,
      deposits: deposited,
      share: perPerson,
      balance: deposited - perPerson
    };
  });

  setData(prev => ({
    ...prev,
    balances,
    summary: {
      totalDeposit,
      totalExpense,
      remaining: totalDeposit - totalExpense
    }
  }));
}, [data?.members, data?.deposits, data?.expenses]);

  const handleCopy = () => {
    const url = `${window.location.origin}${window.location.pathname}#tour-${tourId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnd = async () => {
    try {
      //const snap = await api.endTour(tourId);
      //setData(snap);
      setShowEndModal(false);
      showToast('Tour ended and locked 🔒');
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const handleReopen = async () => {
  try {
    // const snap = await api.reopenTour(tourId);
    // setData(snap);
    showToast('Tour reopened ✓');
  } catch (e) {
    showToast('Error: ' + e.message);
  }
};

  if (loadErr) return (
    <div className="page">
      <button className="back-btn" onClick={onBack}><Icon d={ICONS.home} size={15}/> All Tours</button>
      <div className="warn-box">Failed to load: {loadErr}</div>
      <button className="btn btn-ghost" onClick={() => {}}>
  <Icon d={ICONS.refresh}/> Retry
</button>
    </div>
  );

  if (!data) return <div className="spinner"><span className="dot-spin"/>Loading tour…</div>;

  const { tour, members, deposits, expenses, paymentMethods, balances, settlements, summary } = data;
  const isEnded = !!tour.ended_at;
  const shareUrl = `${window.location.origin}${window.location.pathname}#tour-${tourId}`;

  return (
    <div>
      {/* Header */}
      <div className="tour-header">
        <button className="back-btn" onClick={onBack}><Icon d={ICONS.home} size={15}/> All Tours</button>
        <div className="tour-name">
          {tour.name}
          {isEnded && <span className="tour-ended-badge" style={{ fontSize: 12, marginLeft: 10 }}>🔒 ENDED</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className={`connection-dot ${connected ? 'connected' : 'disconnected'}`}/>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
            {connected ? 'live' : 'connecting…'}
          </span>
          {!isEnded && (
            <button
              className="btn btn-end btn-xs"
              style={{ marginLeft: 'auto' }}
              onClick={() => setShowEndModal(true)}
            >
              <Icon d={ICONS.flag} size={13}/> End Tour
            </button>
          )}
        </div>
        <div className="share-bar">
          <div className="share-link">{shareUrl}</div>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? <Icon d={ICONS.check} size={16}/> : <Icon d={ICONS.copy} size={16}/>}
          </button>
        </div>
      </div>

      {/* Locked banner */}
      {isEnded && (
        <div className="locked-banner">
          <span className="locked-banner-text">
            🔒 This tour is finalized. Editing is disabled.
          </span>
          <button className="reopen-btn" onClick={handleReopen}>Reopen</button>
        </div>
      )}

      {/* Final summary card when ended */}
      {isEnded && (
        <div className="final-summary">
          <h2>Final Summary</h2>
          <p>Ended on {new Date(tour.ended_at).toLocaleString()}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Deposited</div>
              <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)', fontSize: 15 }}>{fmt(summary.totalDeposit)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Spent</div>
              <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--red)', fontSize: 15 }}>{fmt(summary.totalExpense)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Balance</div>
              <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: summary.remaining >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 15 }}>{fmt(summary.remaining)}</div>
            </div>
          </div>
          <div className="final-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => exportPDF(tour, members, balances, settlements, summary)}>
              <Icon d={ICONS.download} size={14}/> Export PDF
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => exportJSON(tour, members, deposits, expenses, balances, settlements, summary)}>
              <Icon d={ICONS.download} size={14}/> Export JSON
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-label">Deposits</div>
          <div className="stat-value gold">{fmt(summary.totalDeposit)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Spent</div>
          <div className="stat-value red">{fmt(summary.totalExpense)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Left</div>
          <div className={`stat-value ${summary.remaining >= 0 ? 'green' : 'red'}`}>
            {fmt(summary.remaining)}
          </div>
        </div>
      </div>

      {/* Overspend warning (not locked) */}
      {!isEnded && summary.remaining < 0 && (
        <div className="overspend-box" style={{ margin: '0 20px 4px' }}>
          ⚠️ Expenses exceed deposits by {fmt(Math.abs(summary.remaining))}. You are overspending.
        </div>
      )}

      {/* Tabs */}
      <div className="tab-bar">
        {[['feed','Timeline'],['members','Members'],['settle','Settle']].map(([id, label]) => (
          <button key={id} className={`tab${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="tab-content">
  {tab === 'feed' && (
    <FeedTab
      tourId={tourId}
      members={members}
      deposits={deposits}
      expenses={expenses}
      onUpdate={() => {}}
      showToast={showToast}
      locked={isEnded}
    />
  )}

 {tab === 'members' && (
  <MembersTab
    data={data}           // ✅ ADD
    setData={setData}     // ✅ ADD
    balances={data?.balances || []}
    onUpdate={() => {}}
    showToast={showToast}
    locked={isEnded}
  />
)}

  {tab === 'settle' && (
    <SettleTab
      settlements={settlements}
      balances={balances}
      tourId={tourId}
      onDeleted={onDeleted}
      showToast={showToast}
      tour={tour}
      members={members}
      deposits={deposits}
      expenses={expenses}
      summary={summary}
    />
  )}
</div>

      {/* FAB — hidden when locked */}
      {!isEnded && <button className="fab" onClick={() => setShowAdd(true)}>+</button>}

{showAdd && (
  <AddTransactionModal
    data={data}                 // ✅ ADD
    setData={setData}           // ✅ ADD
    tourId={tourId}
    members={members}
    paymentMethods={paymentMethods}
    totalDeposit={summary.totalDeposit}
    totalExpense={summary.totalExpense}
    onClose={() => setShowAdd(false)}
    onSaved={() => { showToast('Saved successfully ✓'); }}
    showToast={showToast}
  />
)}
      {/* End Tour confirmation modal */}
      {showEndModal && (
        <div className="overlay" onClick={() => setShowEndModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">End Tour? 🔒</div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 20 }}>
              This will finalize the tour and lock all editing. You can still reopen it later if needed.
            </p>
            <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, marginBottom: 20, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>Total Deposited</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)' }}>{fmt(summary.totalDeposit)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>Total Spent</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--red)' }}>{fmt(summary.totalExpense)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Remaining</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: summary.remaining >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(summary.remaining)}</span>
              </div>
            </div>
            <button className="btn btn-end" style={{ width: '100%', marginBottom: 0 }} onClick={handleEnd}>
              <Icon d={ICONS.lock} size={15}/> Yes, End Tour
            </button>
            <button className="cancel-btn" onClick={() => setShowEndModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Export helpers ───────────────────────────────────────────────────────────
function exportPDF(tour, members, balances, settlements, summary) {
  const endedStr = tour.ended_at ? new Date(tour.ended_at).toLocaleString() : '—';
  const memberRows = members.map((m, i) => {
    const b = balances.find(b => b.memberId === m.id) || { deposits: 0, share: 0, balance: 0 };
    return `<tr>
      <td>${m.name}</td>
      <td>৳${b.deposits.toFixed(2)}</td>
      <td>৳${b.share.toFixed(2)}</td>
      <td style="color:${b.balance >= 0 ? '#1a9a52' : '#d02848'};font-weight:700">
        ${b.balance >= 0 ? '+' : ''}৳${b.balance.toFixed(2)}
      </td>
    </tr>`;
  }).join('');

  const settlementRows = settlements.length
    ? settlements.map(s => `<tr><td>${s.from}</td><td>→</td><td>${s.to}</td><td>৳${s.amount.toFixed(2)}</td></tr>`).join('')
    : '<tr><td colspan="4" style="color:#888;text-align:center">All settled — no payments needed</td></tr>';

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>TourSplit — ${tour.name}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:700px;margin:40px auto;color:#1a1a2e;padding:0 20px}
  h1{font-size:26px;font-weight:700;margin-bottom:4px}
  .meta{color:#888;font-size:13px;margin-bottom:28px}
  .summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:28px}
  .stat{background:#f5f5f7;border-radius:12px;padding:14px 16px}
  .stat-label{font-size:11px;color:#888;text-transform:uppercase;font-weight:600;margin-bottom:4px}
  .stat-value{font-size:20px;font-weight:700;font-family:monospace}
  table{width:100%;border-collapse:collapse;margin-bottom:28px}
  th{font-size:12px;text-align:left;padding:8px 12px;color:#888;text-transform:uppercase;border-bottom:2px solid #e2e2ea;font-weight:600}
  td{padding:11px 12px;border-bottom:1px solid #e2e2ea;font-size:14px}
  h2{font-size:17px;font-weight:700;margin-bottom:14px}
  .footer{margin-top:32px;font-size:12px;color:#aaa;text-align:center}
</style></head><body>
  <h1>${tour.name}</h1>
  <div class="meta">Ended: ${endedStr} · ${members.length} members · Generated by TourSplit</div>
  <div class="summary">
    <div class="stat"><div class="stat-label">Total Deposited</div><div class="stat-value" style="color:#c87800">৳${summary.totalDeposit.toFixed(2)}</div></div>
    <div class="stat"><div class="stat-label">Total Spent</div><div class="stat-value" style="color:#d02848">৳${summary.totalExpense.toFixed(2)}</div></div>
    <div class="stat"><div class="stat-label">Remaining</div><div class="stat-value" style="color:${summary.remaining >= 0 ? '#1a9a52' : '#d02848'}">৳${summary.remaining.toFixed(2)}</div></div>
  </div>
  <h2>Member Balances</h2>
  <table><thead><tr><th>Name</th><th>Deposited</th><th>Share</th><th>Balance</th></tr></thead>
  <tbody>${memberRows}</tbody></table>
  <h2>Settlement Plan</h2>
  <table><thead><tr><th>From</th><th></th><th>To</th><th>Amount</th></tr></thead>
  <tbody>${settlementRows}</tbody></table>
  <div class="footer">Generated by TourSplit · ${new Date().toLocaleString()}</div>
</body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.onload = () => win.print();
}

function exportJSON(tour, members, deposits, expenses, balances, settlements, summary) {
  const exportData = {
    exportedAt: new Date().toISOString(),
    tour: { id: tour.id, name: tour.name, createdAt: tour.created_at, endedAt: tour.ended_at },
    members: members.map(m => ({ id: m.id, name: m.name })),
    summary,
    balances,
    settlements,
    deposits: deposits.map(d => ({ id: d.id, memberId: d.member_id, amount: d.amount, note: d.note, paymentMethod: d.payment_method, createdAt: d.created_at })),
    expenses: expenses.map(e => ({ id: e.id, title: e.title, amount: e.amount, paidBy: e.paid_by, splitType: e.split_type, paymentMethod: e.payment_method, createdAt: e.created_at, splits: e.splits })),
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `toursplit-${tour.name.replace(/\s+/g, '-').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Feed Tab ─────────────────────────────────────────────────────────────────
function FeedTab({ tourId, members, deposits, expenses, onUpdate, showToast, locked }) {
  const memberName = id => members.find(m => m.id === id)?.name || '?';

  const allItems = [
    ...deposits.map(d => ({ ...d, _kind: 'deposit' })),
    ...expenses.map(e => ({ ...e, _kind: 'expense' })),
  ].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

  const deleteItem = async item => {
    try {
      //if (item._kind === 'deposit') await api.deleteDeposit(tourId, item.id);
      //else await api.deleteExpense(tourId, item.id);
      showToast('Deleted');
      onUpdate();
    } catch (e) { showToast('Error: ' + e.message); }
  };

  if (!allItems.length) return (
    <div className="empty">
      <div className="empty-icon">📋</div>
      <p>{locked ? 'No transactions were recorded.' : 'No transactions yet. Tap + to add.'}</p>
    </div>
  );

  return (
    <div>
      {allItems.map(item => (
        <div key={item.id} className="feed-item">
          <div style={{ paddingTop: 6 }}>
            <div className={`feed-dot ${item._kind === 'deposit' ? 'dot-deposit' : 'dot-expense'}`}/>
          </div>
          <div className="feed-body">
            <div className="feed-head">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="feed-title">
                  {item._kind === 'deposit'
                    ? `${memberName(item.member_id)} deposited`
                    : item.title}
                  {item.payment_method && <span className="feed-tag">{item.payment_method}</span>}
                </div>
                <div className="feed-meta">
                  {item._kind === 'expense'
                    ? `paid by ${memberName(item.paid_by)} · ${item.split_type}`
                    : item.note || 'deposit'}
                  {' · '}{new Date(item.created_at).toLocaleString()}
                </div>
              </div>
              {/* Hide delete when locked */}
              {!locked && (
                <button className="del-btn" onClick={() => deleteItem(item)}>
                  <Icon d={ICONS.trash} size={14}/>
                </button>
              )}
            </div>
            <div className={`feed-amount ${item._kind === 'deposit' ? 'green' : 'red'}`}>
              {item._kind === 'deposit' ? '+' : '-'}{fmt(item.amount)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Members Tab ──────────────────────────────────────────────────────────────
function MembersTab({ data, setData, balances, onUpdate, showToast, locked }) {
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

const addMember = async () => {
  if (!newName.trim()) return;

  setLoading(true);

  try {
    const newMember = {
      id: Date.now().toString(),
      name: newName.trim()
    };

    setData(prev => ({
      ...prev,
      members: [...(prev.members || []), newMember]
    }));

    setNewName('');
    showToast(`${newName.trim()} added ✓`);
    onUpdate();
  } catch (e) {
    showToast('Error: ' + e.message);
  } finally {
    setLoading(false);
  }
};

  const removeMember = async (id, name) => {
    try {
      //await api.deleteMember(tourId, id);
      setData(prev => ({ ...prev, members: prev.members.filter(m => m.id !== id) }));
      showToast(`${name} removed`);
      onUpdate();
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const getBalance = memberId => {
    const b = balances?.find(b => b.memberId === memberId);
    return b || { deposits: 0, share: 0, balance: 0 };
  };

  return (
    <div>
      {/* Hide add form when locked */}
      {!locked && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input
            style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 15, outline: 'none' }}
            placeholder="Member name…" value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMember()}
          />
          <button className="btn btn-ghost" onClick={addMember} disabled={loading}>
            <Icon d={ICONS.plus}/>
          </button>
        </div>
      )}

      {!(data?.members || []).length && (
        <div className="empty"><div className="empty-icon">👥</div><p>Add members to get started</p></div>
      )}

      {(data?.members || []).map((m, i) => {
        const b = getBalance(m.id);
        const color = COLORS[i % COLORS.length];
        const net = b.balance;
        return (
          <div key={m.id} className="member-row">
            <div className="avatar" style={{ background: color + '22', color }}>
              {m.name[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="member-name">{m.name}</div>
              <div className="member-stats">↓{fmt(b.deposits)} · ↑{fmt(b.share)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className={`balance-pill ${net > 0.01 ? 'pill-pos' : net < -0.01 ? 'pill-neg' : 'pill-zero'}`}>
                {net > 0.01 ? '+' : ''}{fmt(net)}
              </div>
              {/* Hide delete when locked */}
              {!locked && (
                <button className="del-btn" onClick={() => removeMember(m.id, m.name)}>
                  <Icon d={ICONS.trash} size={14}/>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Settle Tab ───────────────────────────────────────────────────────────────
function SettleTab({ settlements, balances, tourId, onDeleted, showToast, tour, members, deposits, expenses, summary }) {
  const [confirm, setConfirm] = useState(false);
  const isEnded = !!tour?.ended_at;

  const deleteTour = async () => {
    try {
      //await api.deleteTour(tourId);
      showToast('Tour deleted');
      onDeleted();
    } catch (e) { showToast('Error: ' + e.message); }
  };

  return (
    <div>
      <div className="section-label">Who pays whom</div>

      {!settlements?.length
        ? <div className="empty"><div className="empty-icon">🎉</div><p>All settled! No payments needed.</p></div>
        : settlements.map((s, i) => (
          <div key={i} className="settle-card">
            <span className="settle-from">{s.from}</span>
            <Icon d={ICONS.arrow} size={16}/>
            <span className="settle-to">{s.to}</span>
            <span className="settle-amt">{fmt(s.amount)}</span>
          </div>
        ))
      }

      {balances?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>All Balances</div>
          {balances.map(b => (
            <div key={b.memberId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</span>
              <span className={`balance-pill ${b.balance > 0.01 ? 'pill-pos' : b.balance < -0.01 ? 'pill-neg' : 'pill-zero'}`}>
                {b.balance > 0.01 ? '+' : ''}{fmt(b.balance)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Export buttons — always visible in settle tab */}
      {isEnded && (
        <div style={{ marginTop: 24 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Export</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => exportPDF(tour, members, balances, settlements, summary)}>
              <Icon d={ICONS.download} size={14}/> PDF
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => exportJSON(tour, members, deposits, expenses, balances, settlements, summary)}>
              <Icon d={ICONS.download} size={14}/> JSON
            </button>
          </div>
        </div>
      )}

      <div className="danger-zone">
        <div className="section-label" style={{ marginBottom: 12 }}>Danger Zone</div>
        {!confirm
          ? <button className="btn btn-danger btn-sm" onClick={() => setConfirm(true)}>
              <Icon d={ICONS.trash} size={14}/> Delete This Tour
            </button>
          : <div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>
                This will permanently delete all data. Are you sure?
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-danger btn-sm" onClick={deleteTour}>Yes, delete</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirm(false)}>Cancel</button>
              </div>
            </div>
        }
      </div>
    </div>
  );
}
