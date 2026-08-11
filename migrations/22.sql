-- Migration 22: Add is_archived to relocation_hub_access
ALTER TABLE relocation_hub_access ADD COLUMN is_archived BOOLEAN DEFAULT 0;
