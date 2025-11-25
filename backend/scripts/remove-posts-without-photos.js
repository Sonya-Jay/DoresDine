require('dotenv').config();
const { Pool } = require('pg');

async function removePostsWithoutPhotos() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    console.log('🔍 Checking posts for photos...\n');

    // Find posts without photos
    const postsWithoutPhotos = await pool.query(`
      SELECT p.id, p.caption, p.author_id
      FROM posts p
      LEFT JOIN post_photos pp ON p.id = pp.post_id
      WHERE pp.id IS NULL
    `);

    console.log(`Found ${postsWithoutPhotos.rows.length} posts without photos`);

    if (postsWithoutPhotos.rows.length > 0) {
      console.log('\nPosts to be deleted:');
      postsWithoutPhotos.rows.forEach((post, i) => {
        console.log(`  ${i + 1}. "${post.caption.substring(0, 50)}..." (ID: ${post.id.substring(0, 8)}...)`);
      });

      // Delete posts without photos
      // First delete related data (likes, comments) due to foreign key constraints
      const postIds = postsWithoutPhotos.rows.map(r => r.id);
      
      console.log('\n🗑️  Deleting related data...');
      await pool.query('DELETE FROM likes WHERE post_id = ANY($1)', [postIds]);
      await pool.query('DELETE FROM comments WHERE post_id = ANY($1)', [postIds]);
      
      console.log('🗑️  Deleting posts...');
      await pool.query('DELETE FROM posts WHERE id = ANY($1)', [postIds]);
      
      console.log(`\n✅ Deleted ${postsWithoutPhotos.rows.length} posts without photos`);
    } else {
      console.log('✅ All posts have photos!');
    }

    // Also check for posts with invalid/empty photo URLs
    console.log('\n🔍 Checking for posts with invalid photo URLs...\n');
    
    const postsWithInvalidPhotos = await pool.query(`
      SELECT DISTINCT p.id, p.caption
      FROM posts p
      JOIN post_photos pp ON p.id = pp.post_id
      WHERE pp.storage_key IS NULL 
         OR pp.storage_key = ''
         OR pp.storage_key NOT LIKE 'http%'
    `);

    if (postsWithInvalidPhotos.rows.length > 0) {
      console.log(`Found ${postsWithInvalidPhotos.rows.length} posts with invalid photo URLs`);
      console.log('\nPosts to be deleted:');
      postsWithInvalidPhotos.rows.forEach((post, i) => {
        console.log(`  ${i + 1}. "${post.caption.substring(0, 50)}..." (ID: ${post.id.substring(0, 8)}...)`);
      });

      const invalidPostIds = postsWithInvalidPhotos.rows.map(r => r.id);
      
      console.log('\n🗑️  Deleting related data...');
      await pool.query('DELETE FROM likes WHERE post_id = ANY($1)', [invalidPostIds]);
      await pool.query('DELETE FROM comments WHERE post_id = ANY($1)', [invalidPostIds]);
      await pool.query('DELETE FROM post_photos WHERE post_id = ANY($1)', [invalidPostIds]);
      
      console.log('🗑️  Deleting posts...');
      await pool.query('DELETE FROM posts WHERE id = ANY($1)', [invalidPostIds]);
      
      console.log(`\n✅ Deleted ${postsWithInvalidPhotos.rows.length} posts with invalid photos`);
    } else {
      console.log('✅ All posts have valid photo URLs!');
    }

    // Final summary
    const remainingPosts = await pool.query('SELECT COUNT(*) as count FROM posts');
    const remainingPhotos = await pool.query('SELECT COUNT(*) as count FROM post_photos');
    
    console.log('\n📊 Final Summary:');
    console.log(`   - Posts remaining: ${remainingPosts.rows[0].count}`);
    console.log(`   - Photos remaining: ${remainingPhotos.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

removePostsWithoutPhotos();

