require('dotenv').config();
const { Pool } = require('pg');

async function findUsers() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('amazonaws.com') 
      ? { rejectUnauthorized: false } 
      : false,
  });

  try {
    console.log('🔍 Searching for users...\n');
    
    // Search for sonya.jayathilake
    const sonyaResult = await pool.query(
      "SELECT id, email, first_name, last_name FROM users WHERE email LIKE '%sonya.jayathilake%' OR email LIKE '%jayathilake%'"
    );
    
    // Search for isabelle.t.pham
    const isabelleResult = await pool.query(
      "SELECT id, email, first_name, last_name FROM users WHERE email LIKE '%isabelle%pham%' OR email LIKE '%isabelle.t.pham%'"
    );

    console.log('Users matching "sonya.jayathilake":');
    if (sonyaResult.rows.length > 0) {
      sonyaResult.rows.forEach(user => {
        console.log(`  - ${user.email} (${user.first_name} ${user.last_name})`);
      });
    } else {
      console.log('  None found');
    }

    console.log('\nUsers matching "isabelle.t.pham":');
    if (isabelleResult.rows.length > 0) {
      isabelleResult.rows.forEach(user => {
        console.log(`  - ${user.email} (${user.first_name} ${user.last_name})`);
      });
    } else {
      console.log('  None found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

findUsers();

