-- Delete all posts that have photos
-- This will automatically cascade delete:
-- - post_photos (via ON DELETE CASCADE)
-- - likes (via ON DELETE CASCADE)
-- - comments (via ON DELETE CASCADE)

-- First, let's see how many posts with photos exist
SELECT COUNT(DISTINCT post_id) as posts_with_photos_count
FROM post_photos;

-- Delete all posts that have at least one photo
DELETE FROM posts
WHERE id IN (
  SELECT DISTINCT post_id 
  FROM post_photos
);

-- Verify deletion
SELECT COUNT(*) as remaining_posts_with_photos
FROM post_photos;

