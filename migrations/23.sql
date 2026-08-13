-- Record auditable proof that a CRM contact completed Stripe checkout.
ALTER TABLE relocation_hub_access ADD COLUMN stripe_session_id TEXT;
ALTER TABLE relocation_hub_access ADD COLUMN stripe_confirmed_at TIMESTAMP;
CREATE UNIQUE INDEX IF NOT EXISTS idx_relocation_hub_stripe_session
  ON relocation_hub_access(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
