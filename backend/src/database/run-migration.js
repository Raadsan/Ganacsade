const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * Run database migration for data package orders
 */
async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Running migration: add_data_package_orders...\n');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'migrations', 'add_data_package_orders.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Execute the migration
    await client.query(sql);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('✅ Migration completed successfully!');
    console.log('   - Added order_type column to orders table');
    console.log('   - Added data package columns to order_items table');
    console.log('   - Created indexes for better performance\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed:', error.message);
    process.exit(1);
  });
