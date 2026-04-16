/**
 * Migration Script: Remove Internet Packages Feature
 * Run: node scripts/remove-internet-packages.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ganacsade_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function removeInternetPackages() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting migration: Remove Internet Packages...\n');
    
    // Check if tables exist first
    const checkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('internet_packages', 'internet_providers')
    `);
    
    if (checkTables.rows.length === 0) {
      console.log('ℹ️  Tables internet_packages and internet_providers do not exist.');
      console.log('✅ Nothing to remove - database is already clean!');
      return;
    }
    
    console.log('📋 Found tables to remove:', checkTables.rows.map(r => r.table_name).join(', '));
    
    // Drop triggers
    console.log('\n1️⃣  Dropping triggers...');
    await client.query('DROP TRIGGER IF EXISTS update_internet_packages_updated_at ON internet_packages');
    await client.query('DROP TRIGGER IF EXISTS update_internet_providers_updated_at ON internet_providers');
    console.log('   ✓ Triggers dropped');
    
    // Drop indexes
    console.log('\n2️⃣  Dropping indexes...');
    await client.query('DROP INDEX IF EXISTS idx_internet_packages_provider_id');
    await client.query('DROP INDEX IF EXISTS idx_internet_packages_status');
    await client.query('DROP INDEX IF EXISTS idx_internet_packages_api_package_id');
    await client.query('DROP INDEX IF EXISTS idx_internet_providers_is_active');
    console.log('   ✓ Indexes dropped');
    
    // Drop tables
    console.log('\n3️⃣  Dropping tables...');
    await client.query('DROP TABLE IF EXISTS internet_packages CASCADE');
    await client.query('DROP TABLE IF EXISTS internet_providers CASCADE');
    console.log('   ✓ Tables dropped');
    
    // Verify removal
    console.log('\n4️⃣  Verifying removal...');
    const verifyTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('internet_packages', 'internet_providers')
    `);
    
    if (verifyTables.rows.length === 0) {
      console.log('   ✓ Verification passed - tables removed successfully');
    } else {
      console.log('   ⚠️  Warning: Some tables still exist:', verifyTables.rows);
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('   - Removed: internet_packages table');
    console.log('   - Removed: internet_providers table');
    console.log('   - Removed: Related indexes and triggers');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

removeInternetPackages()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
