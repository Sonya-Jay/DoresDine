require('dotenv').config();
const { Pool } = require('pg');

async function deleteUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    const email = 'sonya.jayathilake@vanderbilt.edu';
    
    console.log(`🗑️  Deleting user ${email}...\n`);
    
    const result = await pool.query(
      'DELETE FROM users WHERE email = $1 RETURNING id, email',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      console.log(`❌ User ${email} not found.`);
    } else {
      console.log(`✅ User ${email} deleted successfully!`);
    }
  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
  } finally {
    await pool.end();
  }
}

deleteUser();

