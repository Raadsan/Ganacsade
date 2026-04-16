const { query } = require('../config/database');

async function fixSettingsValues() {
  try {
    console.log('🔄 Checking current settings values...');

    // Get current values
    const current = await query(
      `SELECT key, value FROM settings 
       WHERE key IN ('shipping_flat_rate', 'shipping_free_threshold', 'tax_rate', 'tax_enabled')`
    );

    console.log('\n📋 Current values in database:');
    current.rows.forEach(row => {
      console.log(`  ${row.key}:`, row.value);
    });

    console.log('\n🔄 Updating values to plain text format...');

    // Update shipping_flat_rate
    await query(
      `UPDATE settings SET value = '5.99' WHERE key = 'shipping_flat_rate'`
    );
    console.log('✅ Updated shipping_flat_rate to 5.99');

    // Update shipping_free_threshold
    await query(
      `UPDATE settings SET value = '50' WHERE key = 'shipping_free_threshold'`
    );
    console.log('✅ Updated shipping_free_threshold to 50');

    // Update tax_rate
    await query(
      `UPDATE settings SET value = '0.08' WHERE key = 'tax_rate'`
    );
    console.log('✅ Updated tax_rate to 0.08');

    // Update tax_enabled
    await query(
      `UPDATE settings SET value = 'true' WHERE key = 'tax_enabled'`
    );
    console.log('✅ Updated tax_enabled to true');

    // Verify updates
    const updated = await query(
      `SELECT key, value FROM settings 
       WHERE key IN ('shipping_flat_rate', 'shipping_free_threshold', 'tax_rate', 'tax_enabled')`
    );

    console.log('\n📋 Updated values in database:');
    updated.rows.forEach(row => {
      console.log(`  ${row.key}:`, row.value);
    });

    console.log('\n✅ Settings values fixed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fixing settings values:', error);
    process.exit(1);
  }
}

fixSettingsValues();
