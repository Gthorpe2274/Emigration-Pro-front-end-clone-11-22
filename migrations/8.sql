
CREATE TABLE relocation_hub_access (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  session_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT 1,
  purchase_confirmed BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX idx_relocation_hub_email ON relocation_hub_access(email);
CREATE INDEX idx_relocation_hub_session_code ON relocation_hub_access(session_code);
CREATE INDEX idx_relocation_hub_assessment ON relocation_hub_access(assessment_id);
