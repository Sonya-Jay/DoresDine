require('dotenv').config();
const { Pool } = require('pg');
const https = require('https');
const http = require('http');

async function testUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return testUrl(res.headers.location).then(resolve).catch(() => resolve(false));
      }
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function cleanupBrokenPhotos() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    console.log('🔍 Finding posts with potentially broken photos...\n');

    // Get all unique photo URLs
    const photosResult = await pool.query(`
      SELECT DISTINCT pp.storage_key, COUNT(DISTINCT pp.post_id) as post_count
      FROM post_photos pp
      WHERE pp.storage_key LIKE 'http%'
      GROUP BY pp.storage_key
    `);

    console.log(`Found ${photosResult.rows.length} unique photo URLs\n`);
    console.log('Testing URLs (this may take a moment)...\n');

    const brokenUrls = new Set();
    let tested = 0;

    // Test each URL
    for (const photo of photosResult.rows) {
      tested++;
      const url = photo.storage_key;
      const isWorking = await testUrl(url);
      
      if (!isWorking) {
        console.log(`  ❌ Broken: ${url.substring(0, 70)}...`);
        brokenUrls.add(url);
      } else if (tested % 5 === 0) {
        console.log(`  ✅ Tested ${tested}/${photosResult.rows.length} URLs...`);
      }
    }

    if (brokenUrls.size > 0) {
      console.log(`\n⚠️  Found ${brokenUrls.size} broken photo URLs\n`);
      
      // Find posts that ONLY have broken photos
      const brokenUrlsArray = Array.from(brokenUrls);
      const postsWithOnlyBrokenPhotos = await pool.query(`
        SELECT p.id, p.caption
        FROM posts p
        WHERE NOT EXISTS (
          SELECT 1 
          FROM post_photos pp 
          WHERE pp.post_id = p.id 
          AND pp.storage_key NOT IN (${brokenUrlsArray.map((_, i) => `$${i + 1}`).join(', ')})
        )
        AND EXISTS (
          SELECT 1 
          FROM post_photos pp 
          WHERE pp.post_id = p.id 
          AND pp.storage_key IN (${brokenUrlsArray.map((_, i) => `$${brokenUrlsArray.length + i + 1}`).join(', ')})
        )
      `, [...brokenUrlsArray, ...brokenUrlsArray]);

      if (postsWithOnlyBrokenPhotos.rows.length > 0) {
        console.log(`Found ${postsWithOnlyBrokenPhotos.rows.length} posts with only broken photos:\n`);
        postsWithOnlyBrokenPhotos.rows.forEach((post, i) => {
          console.log(`  ${i + 1}. "${post.caption.substring(0, 50)}..."`);
        });

        const postIds = postsWithOnlyBrokenPhotos.rows.map(r => r.id);
        
        console.log('\n🗑️  Deleting posts with broken photos...');
        
        // Delete related data
        await pool.query('DELETE FROM likes WHERE post_id = ANY($1)', [postIds]);
        await pool.query('DELETE FROM comments WHERE post_id = ANY($1)', [postIds]);
        await pool.query('DELETE FROM post_photos WHERE post_id = ANY($1)', [postIds]);
        await pool.query('DELETE FROM posts WHERE id = ANY($1)', [postIds]);
        
        console.log(`✅ Deleted ${postsWithOnlyBrokenPhotos.rows.length} posts with broken photos\n`);
      } else {
        console.log('✅ No posts found with only broken photos (all posts have at least one working photo)\n');
      }
    } else {
      console.log('\n✅ All photo URLs are working!\n');
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

// Alternative: Simple approach - delete posts with photos that don't match expected patterns
async function quickCleanup() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    console.log('🔍 Quick cleanup: Removing posts with invalid photo URLs...\n');

    // Find posts with photos that don't start with http or are empty
    const invalidPosts = await pool.query(`
      SELECT DISTINCT p.id, p.caption
      FROM posts p
      JOIN post_photos pp ON p.id = pp.post_id
      WHERE pp.storage_key IS NULL 
         OR pp.storage_key = ''
         OR pp.storage_key NOT LIKE 'http%'
         OR pp.storage_key NOT LIKE 'https://images.unsplash.com%'
    `);

    if (invalidPosts.rows.length > 0) {
      console.log(`Found ${invalidPosts.rows.length} posts with invalid photo URLs\n`);
      
      const postIds = invalidPosts.rows.map(r => r.id);
      
      // Delete related data
      await pool.query('DELETE FROM likes WHERE post_id = ANY($1)', [postIds]);
      await pool.query('DELETE FROM comments WHERE post_id = ANY($1)', [postIds]);
      await pool.query('DELETE FROM post_photos WHERE post_id = ANY($1)', [postIds]);
      await pool.query('DELETE FROM posts WHERE id = ANY($1)', [postIds]);
      
      console.log(`✅ Deleted ${invalidPosts.rows.length} posts with invalid photos\n`);
    } else {
      console.log('✅ All posts have valid Unsplash photo URLs\n');
    }

    // Final summary
    const remainingPosts = await pool.query('SELECT COUNT(*) as count FROM posts');
    const remainingPhotos = await pool.query('SELECT COUNT(*) as count FROM post_photos');
    
    console.log('📊 Summary:');
    console.log(`   - Posts remaining: ${remainingPosts.rows[0].count}`);
    console.log(`   - Photos remaining: ${remainingPhotos.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

// Run quick cleanup (faster, checks URL format)
quickCleanup();

