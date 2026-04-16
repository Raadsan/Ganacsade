const { query } = require('../config/database');

async function checkFlashSaleDB() {
  try {
    console.log('Checking Flash Sale Products Table...\n');
    
    const result = await query(
      `SELECT 
        fsp.id,
        fsp.product_name,
        fsp.original_price,
        fsp.sale_price,
        fsp.discount_percentage,
        p.name_en as actual_product_name,
        p.price as actual_product_price,
        p.discount_price as actual_product_discount,
        fs.title as flash_sale_name
      FROM flash_sale_products fsp
      LEFT JOIN products p ON fsp.product_id = p.id
      LEFT JOIN flash_sales fs ON fsp.flash_sale_id = fs.id
      WHERE fs.status = 'active'
      ORDER BY fsp.created_at DESC`
    );

    console.log('Flash Sale Products in Database:');
    console.log('=================================\n');
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.product_name} (${row.actual_product_name})`);
      console.log(`   Flash Sale: ${row.flash_sale_name}`);
      console.log(`   Original Price (flash_sale_products): $${row.original_price}`);
      console.log(`   Sale Price (flash_sale_products): $${row.sale_price}`);
      console.log(`   Discount: ${row.discount_percentage}%`);
      console.log(`   Actual Product Price: $${row.actual_product_price}`);
      console.log(`   Actual Product Discount: $${row.actual_product_discount || 'N/A'}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkFlashSaleDB();
