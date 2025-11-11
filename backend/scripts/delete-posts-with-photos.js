#!/usr/bin/env node

/**
 * Script to delete all posts that have photos
 * This will cascade delete:
 * - post_photos
 * - likes
 * - comments
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function deletePostsWithPhotos() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking posts with photos...');
    
    // Count posts with photos
    const countResult = await client.query(`
      SELECT COUNT(DISTINCT post_id) as posts_with_photos_count
      FROM post_photos
    `);
    
    const postsWithPhotosCount = parseInt(countResult.rows[0].posts_with_photos_count);
    console.log(`📊 Found ${postsWithPhotosCount} posts with photos`);
    
    if (postsWithPhotosCount === 0) {
      console.log('✅ No posts with photos to delete');
      return;
    }
    
    // Count photos that will be deleted
    const photosResult = await client.query(`
      SELECT COUNT(*) as photos_count
      FROM post_photos
    `);
    const photosCount = parseInt(photosResult.rows[0].photos_count);
    console.log(`📸 These posts have ${photosCount} photos total`);
    
    // Count likes that will be deleted
    const likesResult = await client.query(`
      SELECT COUNT(*) as likes_count
      FROM likes
      WHERE post_id IN (SELECT DISTINCT post_id FROM post_photos)
    `);
    const likesCount = parseInt(likesResult.rows[0].likes_count);
    console.log(`❤️  These posts have ${likesCount} likes`);
    
    // Count comments that will be deleted
    const commentsResult = await client.query(`
      SELECT COUNT(*) as comments_count
      FROM comments
      WHERE post_id IN (SELECT DISTINCT post_id FROM post_photos)
    `);
    const commentsCount = parseInt(commentsResult.rows[0].comments_count);
    console.log(`💬 These posts have ${commentsCount} comments`);
    
    console.log('\n🗑️  Deleting posts with photos...');
    
    // Delete posts with photos (cascade will delete photos, likes, comments)
    const deleteResult = await client.query(`
      DELETE FROM posts
      WHERE id IN (
        SELECT DISTINCT post_id 
        FROM post_photos
      )
    `);
    
    console.log(`✅ Deleted ${deleteResult.rowCount} posts`);
    
    // Verify deletion
    const verifyResult = await client.query(`
      SELECT COUNT(*) as remaining_photos
      FROM post_photos
    `);
    const remainingPhotos = parseInt(verifyResult.rows[0].remaining_photos);
    
    if (remainingPhotos === 0) {
      console.log('✅ All photos deleted successfully');
    } else {
      console.log(`⚠️  Warning: ${remainingPhotos} photos still remain (this should be 0)`);
    }
    
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error deleting posts:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
deletePostsWithPhotos()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

