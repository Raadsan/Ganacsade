const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ganacsade_db',
  user: 'postgres',
  password: 'Mohamed@123'
});

async function checkProductImagesTable() {
  try {
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'product_images'
    `);
    
    console.log('='.repeat(60));
    console.log('PRODUCT IMAGES TABLE CHECK');
    console.log('='.repeat(60));
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ Table "product_images" does NOT exist!');
      console.log('\nThe database needs this table to store product images.');
      pool.end();
      return;
    }
    
    console.log('✅ Table "product_images" EXISTS\n');
    
    // Get table structure
    const columns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'product_images' 
      ORDER BY ordinal_position
    `);
    
    console.log('Table Structure:');
    console.log('-'.repeat(60));
    columns.rows.forEach(col => {
      const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      console.log(`  ${col.column_name.padEnd(20)} ${col.data_type.padEnd(15)} ${nullable}${defaultVal}`);
    });
    
    // Check if there are any images
    const imageCount = await pool.query('SELECT COUNT(*) as count FROM product_images');
    console.log('\n' + '-'.repeat(60));
    console.log(`Total images in database: ${imageCount.rows[0].count}`);
    
    if (imageCount.rows[0].count > 0) {
      const images = await pool.query(`
        SELECT 
          p.name_en,
          pi.image_url,
          pi.is_primary
        FROM product_images pi
        JOIN products p ON pi.product_id = p.id
        ORDER BY p.name_en
      `);
      
      console.log('\nExisting Product Images:');
      console.log('-'.repeat(60));
      images.rows.forEach(img => {
        const primary = img.is_primary ? '⭐ PRIMARY' : '';
        console.log(`  ${img.name_en.padEnd(25)} ${primary}`);
        console.log(`    ${img.image_url}`);
      });
    } else {
      console.log('ℹ️  No product images found in database');
    }
    
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

checkProductImagesTable();
