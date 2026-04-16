const bcrypt = require('bcryptjs');
const { query } = require('../src/config/database');

async function createTestUser() {
  try {
    console.log('🔐 Creating test user...\n');

    // Hash the password
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await query(
      'SELECT id, email FROM users WHERE email = $1',
      ['test@example.com']
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  User already exists!');
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: password123');
      console.log('👤 User ID:', existingUser.rows[0].id);
      return;
    }

    // Create the user
    const result = await query(
      `INSERT INTO users (
        email,
        phone_number,
        password_hash,
        role,
        first_name,
        last_name,
        status,
        is_email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, first_name, last_name, role, status`,
      [
        'test@example.com',
        '+252612345678',
        hashedPassword,
        'customer',
        'Test',
        'User',
        'active',
        true
      ]
    );

    const user = result.rows[0];

    console.log('✅ Test user created successfully!\n');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
    console.log('👤 User ID:', user.id);
    console.log('👤 Name:', user.first_name, user.last_name);
    console.log('🎭 Role:', user.role);
    console.log('📊 Status:', user.status);
    console.log('\n🚀 You can now use these credentials to sign in!');

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createTestUser();
