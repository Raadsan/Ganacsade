// Quick database connection test
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ganacsade_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log(`📍 Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`📍 Database: ${process.env.DB_NAME || 'ganacsade_db'}`);
    console.log(`📍 User: ${process.env.DB_USER || 'postgres'}`);
    console.log('');

    // Test connection
    const result = await pool.query('SELECT NOW(), current_database()');
    console.log('✅ Database connected successfully!');
    console.log(`⏰ Server time: ${result.rows[0].now}`);
    console.log(`📊 Database: ${result.rows[0].current_database}`);
    console.log('');

    // Count tables
    const tables = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(`📋 Total tables: ${tables.rows[0].count}`);

    // Count users
    const users = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Total users: ${users.rows[0].count}`);

    // Count categories
    const categories = await pool.query('SELECT COUNT(*) as count FROM categories');
    console.log(`📁 Total categories: ${categories.rows[0].count}`);

    console.log('');
    console.log('🎉 Database is ready!');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('1. Check if PostgreSQL is running');
    console.error('2. Verify database "ganacsade_db" exists');
    console.error('3. Check credentials in .env file');
    console.error('4. Ensure database was created with PGADMIN_CLEAN.sql');
    process.exit(1);
  }
}

testConnection();
