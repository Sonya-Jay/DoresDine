require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Food images from Unsplash (free to use, high quality)
const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop&q=80', // Salad
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=800&fit=crop&q=80', // Pizza
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=800&fit=crop&q=80', // Pasta
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=800&fit=crop&q=80', // Burger
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&h=800&fit=crop&q=80', // Food
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&h=800&fit=crop&q=80', // Sushi
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop&q=80', // Breakfast
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=800&fit=crop&q=80', // Food bowl
  'https://images.unsplash.com/photo-1504113888839-1c8eb50233d3?w=1200&h=800&fit=crop&q=80', // Tacos
  'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=1200&h=800&fit=crop&q=80', // Dessert
  'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=1200&h=800&fit=crop&q=80', // Burger
  'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=1200&h=800&fit=crop&q=80', // Soup
  'https://images.unsplash.com/photo-1512621776951-a5739dfd84f4?w=1200&h=800&fit=crop&q=80', // Healthy food
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=800&fit=crop&q=80', // Pizza slice
  'https://images.unsplash.com/photo-1506354616782-cd1614ce2306?w=1200&h=800&fit=crop&q=80', // Grilled food
  'https://images.unsplash.com/photo-1504754524776-8f4f696becb7?w=1200&h=800&fit=crop&q=80', // Breakfast plate
  'https://images.unsplash.com/photo-1540189549336-e69e73727c2f?w=1200&h=800&fit=crop&q=80', // Salad bowl
  'https://images.unsplash.com/photo-1561043432-fd076846a152?w=1200&h=800&fit=crop&q=80', // Burger and fries
  'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=1200&h=800&fit=crop&q=80', // Pasta dish
  'https://images.unsplash.com/photo-1574652645529-7b7be2c6d9b8?w=1200&h=800&fit=crop&q=80', // Sushi platter
  'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1200&h=800&fit=crop&q=80', // Burger close-up
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=800&fit=crop&q=80', // Food spread
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=800&fit=crop&q=80', // Pizza close-up
  'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1200&h=800&fit=crop&q=80', // Burger stack
];

const DINING_HALLS = [
  'Rand Dining Center',
  'The Commons',
  'E. Bronson Ingram Dining Hall',
  'Rothschild Dining Hall',
];

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

const MENU_ITEMS = [
  ['Grilled Chicken', 'Mashed Potatoes', 'Green Beans'],
  ['Caesar Salad', 'Garlic Bread'],
  ['Pizza', 'French Fries', 'Coca Cola'],
  ['Pasta Carbonara', 'Caesar Salad'],
  ['Burger', 'Sweet Potato Fries'],
  ['Sushi Roll', 'Miso Soup', 'Edamame'],
  ['Pancakes', 'Scrambled Eggs', 'Bacon'],
  ['Tacos', 'Rice', 'Beans'],
  ['Salmon', 'Quinoa', 'Roasted Vegetables'],
  ['BBQ Ribs', 'Mac and Cheese', 'Coleslaw'],
];

const CAPTIONS = [
  'Amazing lunch at Rand today! 🍽️',
  'The pasta here is incredible!',
  'Best pizza on campus, hands down 🍕',
  'Love the variety at The Commons',
  'Fresh salad bar never disappoints',
  'Sushi Wednesday! 🍣',
  'Great breakfast to start the day',
  'Taco Tuesday vibes 🌮',
  'Healthy and delicious!',
  'Comfort food at its finest',
  'The burger was perfectly cooked',
  'Can\'t get enough of this place!',
];

async function populateDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('🌱 Starting database population...\n');
    console.log(`📍 Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown'}\n`);

    // Create users
    const users = [
      { username: 'alice_smith', email: 'alice.smith@vanderbilt.edu', first_name: 'Alice', last_name: 'Smith' },
      { username: 'bob_jones', email: 'bob.jones@vanderbilt.edu', first_name: 'Bob', last_name: 'Jones' },
      { username: 'charlie_brown', email: 'charlie.brown@vanderbilt.edu', first_name: 'Charlie', last_name: 'Brown' },
      { username: 'diana_wilson', email: 'diana.wilson@vanderbilt.edu', first_name: 'Diana', last_name: 'Wilson' },
      { username: 'emma_davis', email: 'emma.davis@vanderbilt.edu', first_name: 'Emma', last_name: 'Davis' },
    ];

    const createdUsers = [];
    const password_hash = await bcrypt.hash('password123', 10);

    for (const userData of users) {
      try {
        // Check if user exists
        const existing = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [userData.email.toLowerCase()]
        );

        let userId;
        if (existing.rows.length > 0) {
          userId = existing.rows[0].id;
          // Update password and verification status for existing user
          await client.query(
            `UPDATE users SET password_hash = $1, email_verified = true WHERE id = $2`,
            [password_hash, userId]
          );
          console.log(`✓ User ${userData.username} already exists (updated password and verification)`);
        } else {
          // Create user
          const result = await client.query(
            `INSERT INTO users (id, username, first_name, last_name, email, password_hash, email_verified)
             VALUES ($1, $2, $3, $4, $5, $6, true)
             RETURNING id, username, email`,
            [uuidv4(), userData.username, userData.first_name, userData.last_name, userData.email.toLowerCase(), password_hash]
          );
          userId = result.rows[0].id;
          console.log(`✓ Created user: ${userData.username} (${userData.email})`);
        }
        createdUsers.push({ id: userId, username: userData.username, email: userData.email, first_name: userData.first_name, last_name: userData.last_name });
      } catch (error) {
        if (error.code === '23505') {
          // User already exists, fetch it
          const result = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [userData.email.toLowerCase()]
          );
          if (result.rows.length > 0) {
            createdUsers.push({ id: result.rows[0].id, ...userData });
            console.log(`✓ User ${userData.username} already exists`);
          }
        } else {
          console.error(`✗ Error creating user ${userData.username}:`, error.message);
        }
      }
    }

    console.log(`\n📝 Creating posts...\n`);

    // Verify all users exist in database before creating posts
    console.log(`\n🔍 Verifying users before creating posts...\n`);
    const verifiedUsers = [];
    for (const user of createdUsers) {
      const verifyResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [user.email.toLowerCase()]
      );
      if (verifyResult.rows.length > 0) {
        verifiedUsers.push({
          ...user,
          id: verifyResult.rows[0].id // Use the actual database ID
        });
        console.log(`✓ Verified: ${user.username} (${verifyResult.rows[0].id})`);
      } else {
        console.log(`✗ User not found: ${user.username}`);
      }
    }

    console.log(`\n📝 Creating posts...\n`);

    // Create posts for each user (more posts for a richer feed)
    for (let i = 0; i < verifiedUsers.length; i++) {
      const user = verifiedUsers[i];
      const numPosts = Math.floor(Math.random() * 4) + 3; // 3-6 posts per user

      for (let j = 0; j < numPosts; j++) {
        try {
          const postId = uuidv4();
          const caption = CAPTIONS[(i * numPosts + j) % CAPTIONS.length];
          const rating = parseFloat((Math.random() * 4 + 6).toFixed(1)); // 6.0 - 10.0
          const dining_hall = DINING_HALLS[Math.floor(Math.random() * DINING_HALLS.length)];
          const meal_type = MEAL_TYPES[Math.floor(Math.random() * MEAL_TYPES.length)];
          const menu_items = MENU_ITEMS[(i * numPosts + j) % MENU_ITEMS.length];
          
          // Add 1-4 photos per post (more photos for better visuals)
          const numPhotos = Math.floor(Math.random() * 4) + 1;
          const photoIndices = [];
          const usedIndices = new Set();
          for (let k = 0; k < numPhotos; k++) {
            let randomIndex;
            do {
              randomIndex = Math.floor(Math.random() * FOOD_IMAGES.length);
            } while (usedIndices.has(randomIndex) && usedIndices.size < FOOD_IMAGES.length);
            usedIndices.add(randomIndex);
            photoIndices.push(randomIndex);
          }

          // Calculate overall rating as average of dish ratings (will be set after rated_items are created)
          // For now, use the random rating, but we'll recalculate it from rated_items
          
          // Create post (rating will be calculated from rated_items average)
          await client.query(
            `INSERT INTO posts (id, author_id, caption, rating, menu_items, dining_hall_name, meal_type, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '${i * numPosts + j} hours')`,
            [postId, user.id, caption, rating, menu_items, dining_hall, meal_type]
          );

          // Create rated items for each menu item
          const ratedItems = [];
          for (let m = 0; m < menu_items.length; m++) {
            const itemRating = parseFloat((Math.random() * 4 + 6).toFixed(1)); // 6.0 - 10.0
            ratedItems.push({
              menu_item_name: menu_items[m],
              rating: itemRating,
              display_order: m
            });
          }

          // Insert rated items
          for (const item of ratedItems) {
            await client.query(
              `INSERT INTO post_rated_items (post_id, menu_item_name, rating, display_order)
               VALUES ($1, $2, $3, $4)`,
              [postId, item.menu_item_name, item.rating, item.display_order]
            );
          }

          // Calculate average rating from rated items and update post
          const avgRating = ratedItems.reduce((sum, item) => sum + item.rating, 0) / ratedItems.length;
          await client.query(
            `UPDATE posts SET rating = $1 WHERE id = $2`,
            [parseFloat(avgRating.toFixed(1)), postId]
          );

          // Add photos - associate each photo with a dish
          for (let k = 0; k < photoIndices.length; k++) {
            const photoId = uuidv4();
            const imageUrl = FOOD_IMAGES[photoIndices[k]];
            // Associate photo with a dish (cycle through menu items)
            const dishName = menu_items[k % menu_items.length];
            await client.query(
              `INSERT INTO post_photos (id, post_id, storage_key, display_order, dish_name)
               VALUES ($1, $2, $3, $4, $5)`,
              [photoId, postId, imageUrl, k, dishName]
            );
          }

          console.log(`  ✓ Post by ${user.username}: "${caption.substring(0, 30)}..." (${numPhotos} photo(s), ${ratedItems.length} rated items)`);
        } catch (error) {
          console.error(`  ✗ Error creating post for ${user.username}:`, error.message);
        }
      }
    }

    // Add some likes and comments
    console.log(`\n❤️  Adding likes and comments...\n`);

    // Get all posts
    const postsResult = await client.query('SELECT id, author_id FROM posts ORDER BY created_at DESC');
    const posts = postsResult.rows;

    // Add likes (each user likes multiple posts from other users for engagement)
    for (const user of verifiedUsers) {
      const postsToLike = posts
        .filter(p => p.author_id !== user.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 5) + 3); // Like 3-7 random posts

      for (const post of postsToLike) {
        try {
          await client.query(
            `INSERT INTO likes (post_id, user_id)
             VALUES ($1, $2)
             ON CONFLICT (post_id, user_id) DO NOTHING`,
            [post.id, user.id]
          );
        } catch (error) {
          // Ignore duplicate likes
        }
      }
    }
    
    console.log(`  ✓ Added likes and comments to posts`);

    // Add comments (more comments for engagement)
    const comments = [
      'Looks delicious! 😋',
      'I need to try this!',
      'Great choice!',
      'Yum! 🤤',
      'Adding this to my list!',
      'That looks amazing!',
      'Can\'t wait to try this!',
      'So good!',
      'Love it! ❤️',
      'Definitely trying this next time!',
      'Looks perfect!',
      'Yummy! 🍽️',
    ];
    
    // Add 2-3 comments per post (for first 10 posts)
    for (let i = 0; i < Math.min(10, posts.length); i++) {
      const post = posts[i];
      const possibleCommenters = verifiedUsers.filter(u => u.id !== post.author_id);
      const numComments = Math.floor(Math.random() * 2) + 2; // 2-3 comments
      
      for (let j = 0; j < numComments && j < possibleCommenters.length; j++) {
        const commenter = possibleCommenters[j];
        const commentText = comments[Math.floor(Math.random() * comments.length)];
        
        try {
          await client.query(
            `INSERT INTO comments (id, post_id, author_id, text, created_at)
             VALUES ($1, $2, $3, $4, NOW() - INTERVAL '${i * 10 + j} minutes')
             ON CONFLICT DO NOTHING`,
            [uuidv4(), post.id, commenter.id, commentText]
          );
        } catch (error) {
          // Ignore duplicate comments
        }
      }
    }

    console.log(`\n✅ Database population complete!`);
    console.log(`\n📊 Summary:`);
    console.log(`   - ${verifiedUsers.length} users`);
    console.log(`   - ${posts.length} posts`);
    console.log(`   - Posts have food images from Unsplash`);
    console.log(`\n🔑 All users have password: password123`);
    console.log(`   (Email verification is already set to true)`);
    
    await client.query('COMMIT');
    console.log(`\n✅ Transaction committed successfully!`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error populating database:', error);
    console.error('   Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

populateDatabase();

