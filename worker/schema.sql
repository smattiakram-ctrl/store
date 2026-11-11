-- NABIL Store — Cloudflare D1 Database Schema
-- Run: npx wrangler d1 execute nabil-db --file=worker/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,          -- "salt:hash" (SHA-256, 128-bit random salt)
  role       TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS categories (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL,
  image TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  price       REAL NOT NULL CHECK (price >= 0),
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  image       TEXT,
  available   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- Initial empty settings (no fictional contact info — the store owner fills these in the admin panel)
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('facebook_url', ''), ('whatsapp_url', ''), ('maps_url', ''), ('maps_embed', '');
