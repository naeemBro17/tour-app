const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'toursplit.db');

function initDb() {
  const db = new Database(DB_PATH);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS tours (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      ended_at    TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payment_methods (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      tour_id   TEXT NOT NULL,
      name      TEXT NOT NULL,
      FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
      UNIQUE(tour_id, name)
    );

    CREATE TABLE IF NOT EXISTS members (
      id         TEXT PRIMARY KEY,
      tour_id    TEXT NOT NULL,
      name       TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deposits (
      id             TEXT PRIMARY KEY,
      tour_id        TEXT NOT NULL,
      member_id      TEXT NOT NULL,
      amount         REAL NOT NULL,
      note           TEXT,
      payment_method TEXT NOT NULL DEFAULT 'Cash',
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (tour_id)   REFERENCES tours(id)   ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id             TEXT PRIMARY KEY,
      tour_id        TEXT NOT NULL,
      title          TEXT NOT NULL,
      amount         REAL NOT NULL,
      paid_by        TEXT NOT NULL,
      split_type     TEXT NOT NULL DEFAULT 'equal',
      payment_method TEXT NOT NULL DEFAULT 'Cash',
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (tour_id)  REFERENCES tours(id)   ON DELETE CASCADE,
      FOREIGN KEY (paid_by)  REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expense_splits (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      expense_id  TEXT NOT NULL,
      member_id   TEXT NOT NULL,
      included    INTEGER NOT NULL DEFAULT 1,
      amount      REAL    NOT NULL DEFAULT 0,
      FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id)  REFERENCES members(id)  ON DELETE CASCADE
    );
  `);

  // Migrate existing DBs that don't have ended_at yet
  const cols = db.prepare("PRAGMA table_info(tours)").all().map(c => c.name);
  if (!cols.includes('ended_at')) {
    db.exec("ALTER TABLE tours ADD COLUMN ended_at TEXT");
  }

  return db;
}

module.exports = { initDb };
