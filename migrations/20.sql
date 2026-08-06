-- Send at most one paid-generation failure notice per assessment. The claim is
-- cleared when delivery fails, allowing a later attempt to retry the email.
ALTER TABLE assessments ADD COLUMN generation_failure_email_sent_at DATETIME;
