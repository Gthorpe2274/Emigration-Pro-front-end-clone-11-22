
CREATE TABLE assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_age INTEGER,
  user_job TEXT,
  preferred_country TEXT,
  preferred_city TEXT,
  location_preference TEXT,
  immigration_policies_importance INTEGER,
  healthcare_importance INTEGER,
  safety_importance INTEGER,
  internet_importance INTEGER,
  emigration_process_importance INTEGER,
  ease_of_immigration_importance INTEGER,
  local_acceptance_importance INTEGER,
  climate_importance INTEGER,
  overall_score INTEGER,
  match_level TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  featured_image TEXT,
  body TEXT NOT NULL,
  excerpt TEXT,
  published_date DATETIME,
  is_published BOOLEAN DEFAULT 0,
  allow_comments BOOLEAN DEFAULT 1,
  author TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published, published_date DESC);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL,
  stripe_payment_intent_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  payment_method TEXT,
  customer_email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL,
  payment_id INTEGER,
  report_content TEXT NOT NULL,
  pdf_url TEXT,
  download_token TEXT UNIQUE,
  download_expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE report_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT UNIQUE NOT NULL,
  assessment_id INTEGER NOT NULL,
  payment_id INTEGER NOT NULL,
  customer_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_jobs_status ON report_jobs(status);
CREATE INDEX idx_report_jobs_created_at ON report_jobs(created_at);

ALTER TABLE assessments ADD COLUMN climate_preference TEXT;

ALTER TABLE assessments ADD COLUMN monthly_budget INTEGER;
ALTER TABLE assessments ADD COLUMN budget_compatibility TEXT;

-- Add retention tracking columns to assessments table
ALTER TABLE assessments ADD COLUMN retention_expires_at DATETIME;

-- Set retention expiry date for existing assessments (2 years from creation)
UPDATE assessments 
SET retention_expires_at = datetime(created_at, '+2 years')
WHERE retention_expires_at IS NULL;

-- Add trigger to automatically set retention expiry for new assessments
CREATE TRIGGER set_assessment_retention_expiry 
AFTER INSERT ON assessments
BEGIN
  UPDATE assessments 
  SET retention_expires_at = datetime(NEW.created_at, '+2 years')
  WHERE id = NEW.id;
END;

-- Remove payment and report related tables completely
DROP TABLE IF EXISTS report_jobs;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS payments;

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
