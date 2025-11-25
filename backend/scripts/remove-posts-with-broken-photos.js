require('dotenv').config();
const { Pool } = require('pg');
const https = require('https');
const http = require('http');

async function testUrl(url, timeout = 2000) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      // Consider 200-299 as success, don't follow redirects (too slow)
      resolve(res.statusCode >= 200 && res.statusCode < 400);
      req.destroy(); // Close connection immediately after checking status
    });
    
    req.on('error', () => resolve(false));
    req.setTimeout(timeout, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function removePostsWithBrokenPhotos() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    console.log('🔍 Finding all posts with photos...\n');

    // Get all posts with their photos
    const postsResult = await pool.query(`
      SELECT p.id, p.caption, ARRAY_AGG(pp.storage_key) as photo_urls
      FROM posts p
      JOIN post_photos pp ON p.id = pp.post_id
      WHERE pp.storage_key LIKE 'http%'
      GROUP BY p.id, p.caption
    `);

    console.log(`Testing ${postsResult.rows.length} posts...\n`);

    const postsToDelete = [];
    let tested = 0;

    for (const post of postsResult.rows) {
      tested++;
      const photoUrls = post.photo_urls;
      let hasBrokenPhoto = false;

      // Test each photo URL for this post (test in parallel for speed)
      const testPromises = photoUrls.map(url => testUrl(url, 2000));
      const results = await Promise.all(testPromises);
      
      // Check if ANY photo is broken
      if (results.some(result => result === false)) {
        hasBrokenPhoto = true;
        const brokenCount = results.filter(r => r === false).length;
        const totalCount = results.length;
        console.log(`  ❌ Post "${post.caption.substring(0, 40)}..." - ${brokenCount}/${totalCount} photos broken`);
        postsToDelete.push(post.id);
      }

      if (tested % 5 === 0) {
        console.log(`  ⏳ Tested ${tested}/${postsResult.rows.length} posts...`);
      }
    }

    if (postsToDelete.length > 0) {
      console.log(`\n🗑️  Deleting ${postsToDelete.length} posts with at least one broken photo...\n`);

      // Delete related data first (due to foreign key constraints)
      await pool.query('DELETE FROM likes WHERE post_id = ANY($1)', [postsToDelete]);
      await pool.query('DELETE FROM comments WHERE post_id = ANY($1)', [postsToDelete]);
      await pool.query('DELETE FROM post_photos WHERE post_id = ANY($1)', [postsToDelete]);
      await pool.query('DELETE FROM posts WHERE id = ANY($1)', [postsToDelete]);

      console.log(`✅ Deleted ${postsToDelete.length} posts with broken photos\n`);
    } else {
      console.log('\n✅ All posts have only working photos!\n');
    }

    // Final summary
    const remainingPosts = await pool.query('SELECT COUNT(*) as count FROM posts');
    const remainingPhotos = await pool.query('SELECT COUNT(*) as count FROM post_photos');
    
    console.log('📊 Final Summary:');
    console.log(`   - Posts remaining: ${remainingPosts.rows[0].count}`);
    console.log(`   - Photos remaining: ${remainingPhotos.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

removePostsWithBrokenPhotos();

