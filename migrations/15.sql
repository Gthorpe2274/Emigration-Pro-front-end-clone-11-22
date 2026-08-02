-- Per-section storage for generated reports.
--
-- The existing `reports` table holds a finished report as a single blob, which
-- is only written once everything has been generated. Sections are produced one
-- at a time by 13 separate AI calls, so a buyer who closes the tab part-way
-- through previously lost the lot and had to be regenerated from scratch —
-- paying for the same sections twice.
--
-- Saving each section as it completes makes generation resumable: on return we
-- reload what is already stored and only generate what is missing.

CREATE TABLE IF NOT EXISTS report_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL,
  concern_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sources TEXT,                      -- JSON array of { title, uri }
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- One row per section per assessment; re-running a section overwrites it
  -- rather than duplicating, so a retry cannot produce two copies.
  UNIQUE (assessment_id, concern_id)
);

CREATE INDEX IF NOT EXISTS idx_report_sections_assessment
  ON report_sections(assessment_id);
