-- Add access_token to assessments for IDOR protection.
-- Each assessment gets a random token at creation time. Subsequent GET
-- requests must include the matching token, so a sequential ID alone is not
-- enough to read another user's assessment data.
ALTER TABLE assessments ADD COLUMN access_token TEXT;
