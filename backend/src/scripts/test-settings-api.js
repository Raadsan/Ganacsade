const { query } = require('../config/database');

async function testSettingsAPI() {
  try {
    console.log('🔄 Testing settings API...\n');

    // Get settings from database
    const result = await query(
      `SELECT key, value, is_public 
       FROM settings 
       WHERE key IN ('shipping_flat_rate', 'shipping_free_threshold', 'tax_rate', 'tax_enabled')
       ORDER BY key`
    );

    console.log('📋 Raw database values:');
    result.rows.forEach(row => {
      console.log(`  ${row.key}:`, row.value, `(type: ${typeof row.value}, is_public: ${row.is_public})`);
    });

    // Simulate API processing
    console.log('\n📋 Processed API response:');
    const settings = {};
    result.rows.forEach(row => {
      let value = row.value;
      
      if (typeof value === 'string') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && value.trim() !== '') {
          value = numValue;
        } else if (value === 'true' || value === 'false') {
          value = value === 'true';
        }
      }
      
      settings[row.key] = value;
      console.log(`  ${row.key}:`, value, `(type: ${typeof value})`);
    });

    console.log('\n📦 Final API response:');
    console.log(JSON.stringify({
      success: true,
      data: { settings }
    }, null, 2));

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testSettingsAPI();
