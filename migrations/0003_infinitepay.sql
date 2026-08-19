CREATE TABLE IF NOT EXISTS payment_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider TEXT NOT NULL DEFAULT 'INFINITEPAY',
  plan_code TEXT NOT NULL CHECK(plan_code IN ('BETA','PRO')),
  amount_cents INTEGER NOT NULL,
  order_nsu TEXT NOT NULL UNIQUE,
  invoice_slug TEXT UNIQUE,
  checkout_url TEXT,
  transaction_nsu TEXT UNIQUE,
  receipt_url TEXT,
  capture_method TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','PAID','FAILED','CANCELLED','EXPIRED')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TEXT,
  expires_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_status
  ON payment_orders(user_id, status);
