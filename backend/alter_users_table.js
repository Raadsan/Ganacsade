const { query } = require('./src/config/database');

async function alterUsersTable() {
  try {
    console.log('Altering users table to make email, first_name, and last_name nullable...');
    
    await query(`
      ALTER TABLE users 
      ALTER COLUMN email DROP NOT NULL,
      ALTER COLUMN first_name DROP NOT NULL,
      ALTER COLUMN last_name DROP NOT NULL;
    `);
    
    console.log('✅ Successfully altered users table.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error altering users table:', error);
    process.exit(1);
  }
}

alterUsersTable();
