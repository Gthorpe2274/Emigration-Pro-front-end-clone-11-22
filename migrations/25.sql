-- Monthly immigration-requirements audit and report provenance.
--
-- A run owns one idempotent item per destination. Queue delivery is at least
-- once, so the UNIQUE(run_id, country) constraints prevent duplicate work and
-- duplicate snapshots when a message is retried.

CREATE TABLE IF NOT EXISTS immigration_audit_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_key TEXT NOT NULL UNIQUE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('monthly', 'manual', 'on_demand')),
  scheduled_for TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'seeding'
    CHECK (status IN ('seeding', 'queued', 'running', 'completed', 'completed_with_errors', 'failed')),
  total_countries INTEGER NOT NULL DEFAULT 0,
  completed_count INTEGER NOT NULL DEFAULT 0,
  changed_count INTEGER NOT NULL DEFAULT 0,
  review_required_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  actual_cost_usd REAL NOT NULL DEFAULT 0,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS immigration_audit_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER NOT NULL,
  country TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'approved', 'review_required', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  snapshot_id INTEGER,
  last_error TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (run_id, country),
  FOREIGN KEY (run_id) REFERENCES immigration_audit_runs(id)
);

CREATE TABLE IF NOT EXISTS immigration_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER,
  country TEXT NOT NULL,
  status TEXT NOT NULL
    CHECK (status IN ('approved', 'review_required', 'rejected')),
  content_json TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  source_manifest TEXT NOT NULL,
  official_source_count INTEGER NOT NULL DEFAULT 0,
  verified_at TEXT NOT NULL,
  published_or_effective_at TEXT,
  approved_at TEXT,
  supersedes_snapshot_id INTEGER,
  change_summary TEXT,
  provider TEXT NOT NULL DEFAULT 'perplexity',
  model TEXT NOT NULL DEFAULT 'sonar',
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  request_cost_usd REAL NOT NULL DEFAULT 0,
  total_cost_usd REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (run_id, country),
  FOREIGN KEY (run_id) REFERENCES immigration_audit_runs(id),
  FOREIGN KEY (supersedes_snapshot_id) REFERENCES immigration_snapshots(id)
);

CREATE TABLE IF NOT EXISTS immigration_changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_id INTEGER NOT NULL UNIQUE,
  previous_snapshot_id INTEGER,
  country TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('baseline', 'unchanged', 'modified')),
  severity TEXT NOT NULL CHECK (severity IN ('none', 'low', 'medium', 'high')),
  summary TEXT NOT NULL,
  details_json TEXT,
  review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('not_required', 'pending', 'approved', 'rejected')),
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (snapshot_id) REFERENCES immigration_snapshots(id),
  FOREIGN KEY (previous_snapshot_id) REFERENCES immigration_snapshots(id)
);

CREATE INDEX IF NOT EXISTS idx_immigration_audit_items_run_status
  ON immigration_audit_items(run_id, status);

CREATE INDEX IF NOT EXISTS idx_immigration_snapshots_country_status_verified
  ON immigration_snapshots(country, status, verified_at DESC);

CREATE INDEX IF NOT EXISTS idx_immigration_changes_review
  ON immigration_changes(review_status, created_at DESC);

-- Tie cached high-stakes report sections to the evidence version used to
-- create them. A newer approved hash makes those sections ineligible for
-- resume and the existing UI regenerates only the affected sections.
ALTER TABLE report_sections ADD COLUMN immigration_snapshot_id INTEGER;
ALTER TABLE report_sections ADD COLUMN immigration_snapshot_hash TEXT;
ALTER TABLE report_sections ADD COLUMN immigration_verified_at TEXT;

CREATE INDEX IF NOT EXISTS idx_report_sections_immigration_snapshot
  ON report_sections(immigration_snapshot_id);
