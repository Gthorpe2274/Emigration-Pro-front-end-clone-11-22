-- Normalize the one legacy blog slug that contains spaces. The Netlify edge
-- function and Worker preserve the old URL with a permanent redirect.
UPDATE blog_posts
SET slug = 'avoid-mistakes-when-leaving',
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'Avoid Mistakes When Leaving';
