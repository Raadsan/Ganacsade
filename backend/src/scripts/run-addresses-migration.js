const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

async function runMigration() {
  try {
    console.log('🔄 Running user_addresses migration...');
    
    const migrationPath = path.join(__dirname, '../migrations/007_create_user_addresses.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await query(sql);
    
    console.log('✅ User addresses migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
