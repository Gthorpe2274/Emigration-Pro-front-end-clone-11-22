-- Optional family details used to personalize the education section.
ALTER TABLE assessments ADD COLUMN children_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE assessments ADD COLUMN children_ages TEXT;
ALTER TABLE assessments ADD COLUMN education_preferences TEXT;
