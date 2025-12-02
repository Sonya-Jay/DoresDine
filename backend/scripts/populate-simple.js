require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function populateSimple() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    console.log('🌱 Populating database...\n');
    console.log(`📍 Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown'}\n`);
    
    const password_hash = await bcrypt.hash('password123', 10);
    const users = [
      { username: 'alice_smith', email: 'alice.smith@vanderbilt.edu', first_name: 'Alice', last_name: 'Smith' },
      { username: 'bob_jones', email: 'bob.jones@vanderbilt.edu', first_name: 'Bob', last_name: 'Jones' },
      { username: 'charlie_brown', email: 'charlie.brown@vanderbilt.edu', first_name: 'Charlie', last_name: 'Brown' },
      { username: 'diana_wilson', email: 'diana.wilson@vanderbilt.edu', first_name: 'Diana', last_name: 'Wilson' },
      { username: 'emma_davis', email: 'emma.davis@vanderbilt.edu', first_name: 'Emma', last_name: 'Davis' },
    ];

    const createdUsers = [];
    
    // Create users one by one, verifying each
    for (const userData of users) {
      // Check if exists
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email.toLowerCase()]
      );
      
      let userId;
      if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
        await pool.query(
          'UPDATE users SET password_hash = $1, email_verified = true WHERE id = $2',
          [password_hash, userId]
        );
        console.log(`✓ Updated: ${userData.username}`);
      } else {
        const result = await pool.query(
          `INSERT INTO users (id, username, first_name, last_name, email, password_hash, email_verified)
           VALUES ($1, $2, $3, $4, $5, $6, true)
           RETURNING id`,
          [uuidv4(), userData.username, userData.first_name, userData.last_name, userData.email.toLowerCase(), password_hash]
        );
        userId = result.rows[0].id;
        console.log(`✓ Created: ${userData.username} (${userId})`);
      }
      
      // Verify it exists
      const verify = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
      if (verify.rows.length === 0) {
        console.error(`✗ ERROR: User ${userData.username} not found after creation!`);
      }
      
      createdUsers.push({ id: userId, ...userData });
    }
    
    console.log(`\n✅ Created ${createdUsers.length} users`);
    
    // Verify all users exist
    const allUsers = await pool.query('SELECT email FROM users WHERE email LIKE \'%@vanderbilt.edu\'');
    console.log(`\n📊 Total Vanderbilt users in database: ${allUsers.rows.length}`);
    allUsers.rows.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await pool.end();
  }
}

populateSimple();

