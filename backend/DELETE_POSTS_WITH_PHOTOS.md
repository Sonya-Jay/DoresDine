# Delete All Posts With Photos

This script deletes all posts that have photos from the database. This is useful for cleaning up posts with broken photo links (e.g., photos stored locally on Elastic Beanstalk that were lost).

## What Gets Deleted

When a post with photos is deleted, the following are automatically deleted (via CASCADE):
- The post itself
- All photos associated with the post (`post_photos`)
- All likes on the post (`likes`)
- All comments on the post (`comments`)

## How to Run

### Option 1: Using Node.js Script (Recommended)

```bash
cd backend
node scripts/delete-posts-with-photos.js
```

Make sure you have `DATABASE_URL` set in your `.env` file or environment variables.

### Option 2: Using psql

```bash
psql $DATABASE_URL -f migrations/010_delete_posts_with_photos.sql
```

### Option 3: Manual SQL

Connect to your database and run:

```sql
-- Count posts with photos first
SELECT COUNT(DISTINCT post_id) as posts_with_photos_count
FROM post_photos;

-- Delete all posts that have photos
DELETE FROM posts
WHERE id IN (
  SELECT DISTINCT post_id 
  FROM post_photos
);

-- Verify deletion
SELECT COUNT(*) as remaining_photos
FROM post_photos;
```

## Warning

⚠️ **This operation cannot be undone!** All posts with photos will be permanently deleted.

## What Happens After

- Posts without photos will remain
- All posts with photos will be deleted
- After this, you can start uploading new photos (they should go to S3 if configured)

