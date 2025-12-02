require('dotenv').config();
const { Pool } = require('pg');
const https = require('https');
const http = require('http');

async function checkImageUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = 5000; // 5 second timeout
    
    const req = protocol.get(url, { timeout }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function removePostsWithBrokenImages() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    console.log('🔍 Finding posts with broken images...\n');
    
    // Get all posts with their photos
    const postsResult = await pool.query(`
      SELECT 
        p.id,
        p.caption,
        p.dining_hall_name,
        u.email as author_email,
        JSON_AGG(pp.storage_key) as photo_urls
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN post_photos pp ON p.id = pp.post_id
      WHERE pp.storage_key IS NOT NULL
      GROUP BY p.id, p.caption, p.dining_hall_name, u.email
      HAVING COUNT(pp.id) > 0
    `);
    
    console.log(`Found ${postsResult.rows.length} posts with photos\n`);
    
    const postsToDelete = [];
    
    for (const post of postsResult.rows) {
      const photoUrls = post.photo_urls || [];
      let hasBrokenImage = false;
      
      console.log(`Checking post ${post.id.substring(0, 8)}... (${photoUrls.length} photos)`);
      
      for (const url of photoUrls) {
        if (!url || !url.startsWith('http')) {
          console.log(`  ⚠️  Invalid URL: ${url}`);
          hasBrokenImage = true;
          break;
        }
        
        const isValid = await checkImageUrl(url);
        if (!isValid) {
          console.log(`  ❌ Broken image: ${url.substring(0, 60)}...`);
          hasBrokenImage = true;
          break;
        } else {
          console.log(`  ✅ Valid: ${url.substring(0, 60)}...`);
        }
      }
      
      if (hasBrokenImage) {
        postsToDelete.push(post);
        console.log(`  🗑️  Marked for deletion\n`);
      } else {
        console.log(`  ✓ All images valid\n`);
      }
    }
    
    if (postsToDelete.length === 0) {
      console.log('✅ No posts with broken images found!');
      return;
    }
    
    console.log(`\n🗑️  Found ${postsToDelete.length} posts with broken images:`);
    postsToDelete.forEach((post, i) => {
      console.log(`   ${i + 1}. Post ${post.id.substring(0, 8)}... - "${post.caption?.substring(0, 40) || 'No caption'}..."`);
      console.log(`      Author: ${post.author_email}`);
      console.log(`      Dining Hall: ${post.dining_hall_name || 'N/A'}`);
    });
    
    // Delete the posts (CASCADE will delete photos, rated_items, likes, comments)
    console.log(`\n🗑️  Deleting ${postsToDelete.length} posts...\n`);
    
    for (const post of postsToDelete) {
      await pool.query('DELETE FROM posts WHERE id = $1', [post.id]);
      console.log(`  ✓ Deleted post ${post.id.substring(0, 8)}...`);
    }
    
    console.log(`\n✅ Successfully deleted ${postsToDelete.length} posts with broken images!`);
    
    // Verify remaining posts
    const remainingResult = await pool.query('SELECT COUNT(*) as count FROM posts');
    console.log(`\n📊 Remaining posts: ${remainingResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

removePostsWithBrokenImages();

