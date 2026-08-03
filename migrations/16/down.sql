DROP INDEX IF EXISTS idx_report_sections_profile;

ALTER TABLE report_sections DROP COLUMN profile_fingerprint;
