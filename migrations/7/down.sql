
-- Recreate payment and report tables in reverse order (for rollback only)
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
