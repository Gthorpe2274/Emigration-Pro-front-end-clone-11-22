-- Tracks whether a buyer has already been sent the "your report is ready"
-- recovery email, so a closed tab or a later revisit doesn't trigger a
-- second (or third) copy of the same email. NULL means not sent yet.
ALTER TABLE assessments ADD COLUMN recovery_email_sent_at DATETIME;
