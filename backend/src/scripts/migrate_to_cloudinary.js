const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { query } = require('../config/database');
const config = require('../config');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

async function migrateImages() {
  console.log('🚀 Starting migration to Cloudinary...');

  const tables = [
    { name: 'product_images', column: 'image_url', folder: 'products' },
    { name: 'categories', column: 'image_url', folder: 'categories' },
    { name: 'subcategories', column: 'image_url', folder: 'subcategories' },
    { name: 'brands', column: 'logo_url', folder: 'brands' },
    { name: 'advertisements', column: 'image_url', folder: 'advertisements' }
  ];

  for (const table of tables) {
    console.log(`\n📦 Checking table: ${table.name}...`);
    
    try {
      const result = await query(`SELECT id, ${table.column} FROM ${table.name} WHERE ${table.column} LIKE '/uploads/%'`);
      console.log(`🔍 Found ${result.rows.length} local images to migrate.`);

      for (const row of result.rows) {
        const localPath = row[table.column];
        // Convert relative path to absolute path
        const absolutePath = path.join(__dirname, '../../../', localPath);

        if (fs.existsSync(absolutePath)) {
          console.log(`📤 Uploading: ${localPath}...`);
          try {
            const uploadResult = await cloudinary.uploader.upload(absolutePath, {
              folder: `ganacsade/${table.folder}`,
              use_filename: true,
              unique_filename: true,
            });

            const newUrl = uploadResult.secure_url;
            await query(`UPDATE ${table.name} SET ${table.column} = $1 WHERE id = $2`, [newUrl, row.id]);
            console.log(`✅ Success: ${newUrl}`);
          } catch (uploadError) {
            console.error(`❌ Upload failed for ${localPath}:`, uploadError.message);
          }
        } else {
          console.warn(`⚠️ File not found: ${absolutePath}`);
        }
      }
    } catch (dbError) {
      console.error(`❌ Error querying table ${table.name}:`, dbError.message);
    }
  }

  console.log('\n✨ Migration completed!');
  process.exit(0);
}

migrateImages();
