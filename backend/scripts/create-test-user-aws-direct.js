require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function createTestUserAWS() {
  // Use the AWS database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const email = 'test@vanderbilt.edu';
    const emailLower = email.toLowerCase().trim();
    const password = 'test123';
    const username = emailLower.split('@')[0];
    
    console.log(`🔍 Creating/updating test user in AWS database: ${emailLower}\n`);
    console.log(`📍 Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown'}\n`);
    
    // Check if user exists
    const checkResult = await client.query(
      'SELECT id, email, email_verified, password_hash IS NOT NULL as has_password FROM users WHERE email = $1',
      [emailLower]
    );

    let userId;
    if (checkResult.rows.length > 0) {
      const user = checkResult.rows[0];
      userId = user.id;
      console.log(`✅ User exists:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Verified: ${user.email_verified}`);
      console.log(`   - Has password: ${user.has_password}`);
      
      // Update password and verification
      const passwordHash = await bcrypt.hash(password, 10);
      await client.query(
        'UPDATE users SET password_hash = $1, email_verified = true, verification_code = NULL, verification_code_expires = NULL WHERE id = $2',
        [passwordHash, userId]
      );
      console.log(`✅ Updated password and verified email`);
    } else {
      // Create new user
      console.log(`📝 Creating new user...`);
      userId = uuidv4();
      const passwordHash = await bcrypt.hash(password, 10);
      
      await client.query(
        `INSERT INTO users (id, username, email, password_hash, email_verified, first_name, last_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, username, emailLower, passwordHash, true, 'Test', 'User']
      );
      console.log(`✅ User created`);
    }
    
    // Verify it exists and test password
    const verifyResult = await client.query(
      'SELECT id, email, email_verified, password_hash FROM users WHERE id = $1',
      [userId]
    );
    
    if (verifyResult.rows.length > 0) {
      const user = verifyResult.rows[0];
      console.log(`\n✅ Verification:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Verified: ${user.email_verified}`);
      
      // Test password
      if (user.password_hash) {
        const isValid = await bcrypt.compare(password, user.password_hash);
        console.log(`   - Password test: ${isValid ? '✅ CORRECT' : '❌ INCORRECT'}`);
      }
    }
    
    await client.query('COMMIT');
    
    console.log(`\n💡 Login credentials:`);
    console.log(`   Email: ${emailLower}`);
    console.log(`   Password: ${password}`);
    console.log(`\n⚠️  Note: Make sure the backend is deployed with email verification disabled!`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    if (error.code === '23505') {
      console.error('   User already exists (unique constraint violation)');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

createTestUserAWS();

