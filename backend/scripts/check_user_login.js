const bcrypt = require('bcryptjs');
const { query } = require('../src/config/database');

async function checkUserLogin() {
  try {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      console.log('❌ Usage: node check_user_login.js <email> <password>');
      console.log('Example: node check_user_login.js user@example.com password123');
      process.exit(1);
    }

    console.log(`🔍 Checking login for: ${email}\n`);

    // Find user
    const result = await query(
      `SELECT id, email, phone_number, password_hash, role, first_name, last_name, status, is_email_verified, created_at
       FROM users
       WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found with email:', email);
      console.log('\n💡 Tip: Make sure the email is exactly as you entered during sign-up');
      
      // Show recent users
      const recentUsers = await query(
        'SELECT email, first_name, last_name, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5'
      );
      
      console.log('\n📋 Recent users:');
      recentUsers.rows.forEach(u => {
        console.log(`   - ${u.email} (${u.first_name} ${u.last_name}) - Created: ${u.created_at}`);
      });
      
      process.exit(1);
    }

    const user = result.rows[0];

    console.log('✅ User found!\n');
    console.log('👤 User Details:');
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Phone: ${user.phone_number}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Email Verified: ${user.is_email_verified ? 'Yes' : 'No'}`);
    console.log(`   Created: ${user.created_at}`);
    console.log(`   User ID: ${user.id}`);

    // Check status
    if (user.status !== 'active') {
      console.log('\n⚠️  ISSUE: User status is not "active"');
      console.log(`   Current status: ${user.status}`);
      console.log('   This will prevent login!');
      process.exit(1);
    }

    console.log('\n🔐 Password Check:');
    console.log(`   Testing password: ${password}`);
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (isPasswordValid) {
      console.log('   ✅ Password is CORRECT!');
      console.log('\n🎉 Login should work!');
      console.log('\n📝 Use these credentials:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${password}`);
    } else {
      console.log('   ❌ Password is INCORRECT!');
      console.log('\n💡 Possible issues:');
      console.log('   1. Password was typed incorrectly during sign-up');
      console.log('   2. Password contains special characters that were not saved correctly');
      console.log('   3. There was an error during password hashing');
      console.log('\n🔧 Solution: Reset the password');
      console.log(`   Run: node scripts/reset_user_password.js ${email} newPassword123`);
    }

  } catch (error) {
    console.error('❌ Error checking user login:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

checkUserLogin();
