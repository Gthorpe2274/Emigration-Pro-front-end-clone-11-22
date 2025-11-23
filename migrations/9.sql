
CREATE TABLE email_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  assessment_id INTEGER,
  source TEXT DEFAULT 'relocation_hub_temp_access',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_leads_email ON email_leads(email);
CREATE INDEX idx_email_leads_assessment_id ON email_leads(assessment_id);
