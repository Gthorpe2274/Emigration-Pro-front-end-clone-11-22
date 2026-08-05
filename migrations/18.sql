-- Preserve the attribution required for featured images selected through the
-- Unsplash API. Non-Unsplash and legacy images leave these fields NULL.
ALTER TABLE blog_posts ADD COLUMN featured_image_credit TEXT;
ALTER TABLE blog_posts ADD COLUMN featured_image_credit_url TEXT;
ALTER TABLE blog_posts ADD COLUMN featured_image_source_url TEXT;
