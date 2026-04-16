const { pool } = require('../config/database');

/**
 * Fix hardcoded IP addresses in image URLs
 * Converts absolute URLs to relative paths
 */
async function fixImageUrls() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting image URL fix...\n');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Fix order_items table
    console.log('📦 Fixing order_items table...');
    const orderItemsResult = await client.query(`
      UPDATE order_items
      SET product_image_url = REGEXP_REPLACE(
        product_image_url,
        'http://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+',
        '',
        'g'
      )
      WHERE product_image_url LIKE 'http://%'
      RETURNING id, product_name, product_image_url
    `);
    console.log(`✅ Updated ${orderItemsResult.rowCount} order items`);
    
    // Show sample of updated URLs
    if (orderItemsResult.rows.length > 0) {
      console.log('\nSample updated order items:');
      orderItemsResult.rows.slice(0, 3).forEach(row => {
        console.log(`  - ${row.product_name}: ${row.product_image_url}`);
      });
    }
    
    // Fix flash_sale_products table (if exists)
    console.log('\n🔥 Fixing flash_sale_products table...');
    try {
      const flashSaleResult = await client.query(`
        UPDATE flash_sale_products
        SET product_image_url = REGEXP_REPLACE(
          product_image_url,
          'http://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+',
          '',
          'g'
        )
        WHERE product_image_url LIKE 'http://%'
        RETURNING id, product_name, product_image_url
      `);
      console.log(`✅ Updated ${flashSaleResult.rowCount} flash sale products`);
    } catch (err) {
      console.log('ℹ️  Flash sale products table not found or no updates needed');
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n✅ Image URLs fixed successfully!');
    console.log('All image URLs now use relative paths (e.g., /uploads/products/...)');
    console.log('The frontend will automatically prepend the correct server URL.');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error fixing image URLs:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the fix
fixImageUrls()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error.message);
    process.exit(1);
  });
