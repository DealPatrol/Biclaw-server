import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';

if (!existsSync('./data')) mkdirSync('./data');

const db = new Database('./data/biclaw.db');

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// ── SCHEMA ──────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT    UNIQUE NOT NULL,
    password    TEXT    NOT NULL,
    name        TEXT    NOT NULL,
    company     TEXT,
    plan        TEXT    DEFAULT 'free',
    stripe_customer_id  TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    audits_this_month   INTEGER DEFAULT 0,
    audits_reset_at     TEXT,
    created_at  TEXT    DEFAULT (datetime('now')),
    last_login  TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    target      TEXT    NOT NULL,
    site_title  TEXT,
    site_tech   TEXT,
    responses   TEXT,
    token_count INTEGER DEFAULT 0,
    cost_usd    REAL    DEFAULT 0,
    created_at  TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ab_tests (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    name        TEXT    NOT NULL,
    status      TEXT    DEFAULT 'running',
    notes       TEXT,
    created_at  TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS trendscout (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    topics      TEXT,
    updated_at  TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

export default db;
