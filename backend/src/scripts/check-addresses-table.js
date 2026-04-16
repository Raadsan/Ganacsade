const { query } = require('../config/database');

async function checkAddressesTable() {
  try {
    console.log('🔍 Checking if user_addresses table exists...');
    
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_addresses'
      );
    `);
    
    console.log('Table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      console.log('\n📊 Getting table structure...');
      const structure = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'user_addresses'
        ORDER BY ordinal_position;
      `);
      
      console.log('Table structure:');
      console.table(structure.rows);
      
      console.log('\n📋 Getting all addresses...');
      const addresses = await query('SELECT * FROM user_addresses');
      console.log(`Found ${addresses.rows.length} addresses`);
      if (addresses.rows.length > 0) {
        console.table(addresses.rows);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAddressesTable();
