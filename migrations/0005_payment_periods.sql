-- Registra a quantidade de períodos de 15 dias comprada em cada pagamento.
ALTER TABLE payment_orders ADD COLUMN periods INTEGER NOT NULL DEFAULT 1 CHECK(periods > 0);
ALTER TABLE payment_orders ADD COLUMN access_days INTEGER NOT NULL DEFAULT 15 CHECK(access_days > 0);

ALTER TABLE payments ADD COLUMN periods INTEGER NOT NULL DEFAULT 1 CHECK(periods > 0);
ALTER TABLE payments ADD COLUMN access_days INTEGER NOT NULL DEFAULT 15 CHECK(access_days > 0);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_expiry
  ON payment_orders(user_id, expires_at);
