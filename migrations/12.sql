-- File converter table to store metadata about converted files
CREATE TABLE IF NOT EXISTS converted_files (
  id TEXT PRIMARY KEY,
  original_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK(file_type IN ('md', 'pdf')),
  file_size INTEGER NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  converted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_converted_files_converted_at ON converted_files(converted_at DESC);
CREATE INDEX IF NOT EXISTS idx_converted_files_file_type ON converted_files(file_type);

