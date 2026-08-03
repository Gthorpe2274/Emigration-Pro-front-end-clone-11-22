-- Tie resumable report sections to the exact assessment profile used to
-- generate them. Rows created before this migration have a NULL fingerprint
-- and are intentionally regenerated once with the corrected customer data.
ALTER TABLE report_sections ADD COLUMN profile_fingerprint TEXT;

CREATE INDEX IF NOT EXISTS idx_report_sections_profile
  ON report_sections(assessment_id, profile_fingerprint);
