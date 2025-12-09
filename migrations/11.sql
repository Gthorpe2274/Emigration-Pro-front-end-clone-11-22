-- Migration 11: Relocation Hub Video Storage
-- Stores YouTube videos for each relocation hub with smart curation support

CREATE TABLE relocation_hub_videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL,
  video_slot INTEGER NOT NULL, -- 1-6 for the video positions
  video_id TEXT, -- YouTube video ID
  title TEXT NOT NULL,
  channel_name TEXT,
  channel_id TEXT,
  thumbnail_url TEXT,
  description TEXT,
  youtube_url TEXT NOT NULL,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  next_update_date DATETIME, -- When to check for updates (6 months from last_updated)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assessment_id, video_slot)
);

CREATE INDEX idx_relocation_hub_videos_assessment ON relocation_hub_videos(assessment_id);
CREATE INDEX idx_relocation_hub_videos_next_update ON relocation_hub_videos(next_update_date);
CREATE INDEX idx_relocation_hub_videos_video_slot ON relocation_hub_videos(assessment_id, video_slot);

-- Set initial next_update_date for existing assessments (if any videos exist)
-- This will be set to 6 months from creation when videos are first added


