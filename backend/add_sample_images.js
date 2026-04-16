const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ganacsade_db',
  user: 'postgres',
  password: 'Mohamed@123'
});

async function addSampleImages() {
  try {
    console.log('Adding sample product images...\n');
    
    const images = [
      {
        product_id: '949c6646-f439-43a3-8f91-10ba1e07edfc',
        image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
        alt_text: 'Samsung Galaxy S24',
        name: 'Samsung Galaxy S24'
      },
      {
        product_id: '6fee0d32-bde9-462c-ae03-083ab8335f17',
        image_url: 'https://images.unsplash.com/photo-1592286927505-2c0e0d7c0144?w=400&h=400&fit=crop',
        alt_text: 'iPhone 15 Pro',
        name: 'iPhone 15 Pro'
      },
      {
        product_id: '53bb2c01-4577-45ea-a9d2-3fc62448ee03',
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        alt_text: 'Nike Air Max',
        name: 'Nike Air Max'
      },
      {
        product_id: 'dd02d04b-d219-40f5-8e5b-5d464df88671',
        image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop',
        alt_text: 'Adidas Ultraboost',
        name: 'Adidas Ultraboost'
      },
      {
        product_id: 'fe586fc5-7b15-4d2b-bd37-881fe2f9b49e',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        alt_text: 'Wireless Headphones',
        name: 'Wireless Headphones'
      },
      {
        product_id: 'd0843aef-97bf-4161-af0d-62fdf6f88820',
        image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
        alt_text: 'Water Bottle',
        name: 'Water'
      }
    ];
    
    for (const img of images) {
      try {
        await pool.query(`
          INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
          VALUES ($1, $2, true, 1, $3)
        `, [img.product_id, img.image_url, img.alt_text]);
        
        console.log(`✅ Added image for: ${img.name}`);
      } catch (err) {
        if (err.code === '23503') {
          console.log(`⚠️  Product not found: ${img.name} (skipped)`);
        } else {
          console.log(`❌ Error adding image for ${img.name}: ${err.message}`);
        }
      }
    }
    
    // Verify
    const result = await pool.query(`
      SELECT COUNT(*) as count FROM product_images
    `);
    
    console.log(`\n✅ Total images in database: ${result.rows[0].count}`);
    console.log('\n🎉 Done! Refresh your Products page to see the images!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

addSampleImages();
