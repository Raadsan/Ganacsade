const { query } = require('../config/database');

async function testFlashSaleAPI() {
  try {
    console.log('Testing Flash Sale API...\n');
    
    const result = await query(
      `SELECT 
        p.id,
        p.name_en,
        p.price,
        p.discount_price,
        fsp.discount_percentage,
        fsp.sale_price as flash_sale_price,
        fsp.original_price as flash_original_price,
        fs.start_time as flash_start_time,
        fs.end_time as flash_end_time
      FROM products p
      INNER JOIN flash_sale_products fsp ON p.id = fsp.product_id
      INNER JOIN flash_sales fs ON fsp.flash_sale_id = fs.id
      WHERE p.deleted_at IS NULL
        AND p.status = 'active'
        AND p.in_stock = true
        AND fs.status = 'active'
        AND fs.start_time <= CURRENT_TIMESTAMP
        AND fs.end_time >= CURRENT_TIMESTAMP
      ORDER BY fs.created_at DESC
      LIMIT 8`
    );

    console.log('Flash Sale Products:');
    console.log('===================\n');
    
    result.rows.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name_en}`);
      console.log(`   Product Price: $${product.price}`);
      console.log(`   Product Discount Price: $${product.discount_price || 'N/A'}`);
      console.log(`   Flash Original Price: $${product.flash_original_price}`);
      console.log(`   Flash Sale Price: $${product.flash_sale_price}`);
      console.log(`   Discount: ${product.discount_percentage}%`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testFlashSaleAPI();
