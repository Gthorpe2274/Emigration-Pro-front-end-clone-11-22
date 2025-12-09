-- Rollback migration 11

DROP INDEX IF EXISTS idx_relocation_hub_videos_video_slot;
DROP INDEX IF EXISTS idx_relocation_hub_videos_next_update;
DROP INDEX IF EXISTS idx_relocation_hub_videos_assessment;
DROP TABLE IF EXISTS relocation_hub_videos;


