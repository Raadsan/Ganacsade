const bcrypt = require('bcryptjs');
const { query } = require('../src/config/database');

async function createAdmin() {
  try {
    const email = 'superadmin@ganacsade.com';
    const password = 'admin123';

    console.log(`🔐 Creating new admin user: ${email}\n`);

    // Check if user already exists
    const userCheck = await query(
      'SELECT id, email FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (userCheck.rows.length > 0) {
      console.log('❌ User already exists with email:', email);
      console.log('💡 Use reset_user_password.js to change the password instead');
      process.exit(1);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new admin user
    await query(
      `INSERT INTO users (
        email, phone_number, password_hash, role,
        first_name, last_name, display_name,
        status, is_email_verified, is_phone_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        email,
        '+252612345679',
        hashedPassword,
        'admin',
        'Super',
        'Admin',
        'Super Admin',
        'active',
        true,
        true
      ]
    );

    console.log('✅ New admin user created successfully!\n');
    console.log('👤 Name: Super Admin');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🎭 Role: admin');
    console.log('📱 Phone: +252612345679');
    console.log('\n🚀 You can now sign in with these credentials!');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createAdmin();
