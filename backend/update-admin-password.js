// Update admin password to 'admin123'
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ganacsade_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function updateAdminPassword() {
  try {
    console.log('🔐 Updating admin password...');
    
    // Hash the password 'admin123'
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Update admin user
    const result = await pool.query(
      `UPDATE users 
       SET password_hash = $1 
       WHERE email = 'admin@ganacsade.com'
       RETURNING email, role`,
      [passwordHash]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log(`📧 Email: ${result.rows[0].email}`);
      console.log(`👤 Role: ${result.rows[0].role}`);
      console.log(`🔑 Password: admin123`);
    } else {
      console.log('❌ Admin user not found!');
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateAdminPassword();
