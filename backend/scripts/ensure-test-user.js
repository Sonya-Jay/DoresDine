require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function ensureTestUser() {
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
    
    console.log(`🔍 Ensuring test user exists: ${emailLower}\n`);
    
    // Check if user exists
    const checkResult = await client.query(
      'SELECT id, email, email_verified, password_hash FROM users WHERE email = $1',
      [emailLower]
    );

    let userId;
    if (checkResult.rows.length > 0) {
      const user = checkResult.rows[0];
      userId = user.id;
      console.log(`✅ User exists:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Verified: ${user.email_verified}`);
      console.log(`   - Has password: ${user.password_hash ? 'Yes' : 'No'}`);
      
      // Update password and verification
      const passwordHash = await bcrypt.hash(password, 10);
      await client.query(
        'UPDATE users SET password_hash = $1, email_verified = true WHERE id = $2',
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
    
    // Verify it exists in the same transaction
    const verifyResult = await client.query(
      'SELECT id, email, email_verified FROM users WHERE id = $1',
      [userId]
    );
    
    if (verifyResult.rows.length > 0) {
      console.log(`\n✅ Verification successful:`);
      console.log(`   - ID: ${verifyResult.rows[0].id}`);
      console.log(`   - Email: ${verifyResult.rows[0].email}`);
      console.log(`   - Verified: ${verifyResult.rows[0].email_verified}`);
    }
    
    // Test password
    const testResult = await client.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );
    if (testResult.rows[0] && testResult.rows[0].password_hash) {
      const isValid = await bcrypt.compare(password, testResult.rows[0].password_hash);
      console.log(`\n🔐 Password test: ${isValid ? '✅ CORRECT' : '❌ INCORRECT'}`);
    }
    
    await client.query('COMMIT');
    
    console.log(`\n💡 Login credentials:`);
    console.log(`   Email: ${emailLower}`);
    console.log(`   Password: ${password}`);
    
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

ensureTestUser();

