-- Retain deleted CRM sales for optional historical totals and allow refunded
-- sales to be excluded from the default running total.
ALTER TABLE relocation_hub_access ADD COLUMN is_refunded BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE relocation_hub_access ADD COLUMN deleted_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_relocation_hub_sales_status
  ON relocation_hub_access(purchase_confirmed, is_refunded, deleted_at, stripe_confirmed_at);
