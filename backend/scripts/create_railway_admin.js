const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function createRailwayAdmin() {
  // You need to set your Railway DATABASE_URL as an environment variable
  const databaseUrl = process.env.DATABASE_URL || process.env.RAILWAY_DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL not found');
    console.log('\n💡 Set your Railway DATABASE_URL:');
    console.log('   Windows: $env:DATABASE_URL="your-railway-postgres-url"');
    console.log('   Then run: node scripts/create_railway_admin.js');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to Railway database...\n');
    await client.connect();
    console.log('✅ Connected!\n');

    const email = 'admin@ganacsade.com';
    const password = 'password123';

    console.log(`🔐 Creating admin user: ${email}\n`);

    // Check if user already exists
    const checkResult = await client.query(
      'SELECT id, email, role FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (checkResult.rows.length > 0) {
      console.log('⚠️  User already exists. Updating password and role...\n');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update existing user
      await client.query(
        `UPDATE users 
         SET password_hash = $1, role = 'admin', status = 'active'
         WHERE email = $2`,
        [hashedPassword, email]
      );
      
      console.log('✅ Admin user updated successfully!\n');
    } else {
      console.log('Creating new admin user...\n');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new admin user
      await client.query(
        `INSERT INTO users (
          email, phone_number, password_hash, role,
          first_name, last_name, display_name,
          status, is_email_verified, is_phone_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          email,
          '+252612345678',
          hashedPassword,
          'admin',
          'Admin',
          'User',
          'GANACSADE Admin',
          'active',
          true,
          true
        ]
      );
      
      console.log('✅ Admin user created successfully!\n');
    }

    console.log('📋 Login Credentials:');
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Password: ${password}`);
    console.log('\n🚀 You can now login to the admin dashboard!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. DATABASE_URL is correct');
    console.log('   2. Railway database is accessible');
    console.log('   3. Users table exists in the database');
  } finally {
    await client.end();
    process.exit(0);
  }
}

createRailwayAdmin();
