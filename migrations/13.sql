-- Add affiliate tracking to relocation hub access and email leads
ALTER TABLE relocation_hub_access ADD COLUMN affiliate_code TEXT;
ALTER TABLE email_leads ADD COLUMN affiliate_code TEXT;
