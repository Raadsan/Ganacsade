const { query } = require('../config/database');

async function initializeSettings() {
  try {
    console.log('🔄 Creating settings table...');

    // Create settings table
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL DEFAULT 'general',
        data_type VARCHAR(20) NOT NULL DEFAULT 'string',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Settings table created');

    // Create indexes
    console.log('🔄 Creating indexes...');
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key)
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category)
    `);

    console.log('✅ Indexes created');

    // Insert default settings
    console.log('🔄 Inserting default settings...');

    await query(`
      INSERT INTO settings (key, value, description, category, is_public) VALUES
        ('shipping_flat_rate', '5.99', 'Flat rate shipping cost', 'shipping', true),
        ('shipping_free_threshold', '50.00', 'Minimum order amount for free shipping', 'shipping', true),
        ('tax_rate', '0.08', 'Tax rate (as decimal, e.g., 0.08 for 8%)', 'tax', true),
        ('tax_enabled', 'true', 'Enable or disable tax calculation', 'tax', true)
      ON CONFLICT (key) DO NOTHING
    `);

    console.log('✅ Default settings inserted');

    // Create trigger function
    console.log('🔄 Creating trigger function...');

    await query(`
      CREATE OR REPLACE FUNCTION update_settings_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    console.log('✅ Trigger function created');

    // Create trigger
    console.log('🔄 Creating trigger...');

    await query(`
      DROP TRIGGER IF EXISTS settings_updated_at ON settings
    `);

    await query(`
      CREATE TRIGGER settings_updated_at
        BEFORE UPDATE ON settings
        FOR EACH ROW
        EXECUTE FUNCTION update_settings_updated_at()
    `);

    console.log('✅ Trigger created');

    // Verify settings
    const result = await query('SELECT * FROM settings ORDER BY category, key');
    
    console.log('\n📋 Current settings:');
    result.rows.forEach(setting => {
      console.log(`  - ${setting.key}: ${setting.value} (${setting.category})`);
    });

    console.log('\n✅ Settings initialization completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error initializing settings:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeSettings();
