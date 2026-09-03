-- Mantém a sequência real dos períodos comprados, sem misturar benefícios de planos diferentes.
CREATE TABLE IF NOT EXISTS plan_access_periods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  payment_order_id INTEGER UNIQUE,
  plan_code TEXT NOT NULL CHECK(plan_code IN ('BETA','PRO')),
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(payment_order_id) REFERENCES payment_orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_plan_access_periods_user_window
  ON plan_access_periods(user_id, starts_at, ends_at);
