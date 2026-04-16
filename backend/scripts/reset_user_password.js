const bcrypt = require('bcryptjs');
const { query } = require('../src/config/database');

async function resetPassword() {
  try {
    const email = process.argv[2] || 'admin@ganacsade.com';
    const newPassword = process.argv[3] || 'password123';

    console.log(`🔐 Resetting password for: ${email}\n`);

    // Check if user exists
    const userCheck = await query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (userCheck.rows.length === 0) {
      console.log('❌ User not found with email:', email);
      console.log('\n📋 Available users:');
      
      const allUsers = await query(
        'SELECT email, first_name, last_name FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC'
      );
      
      allUsers.rows.forEach(u => {
        console.log(`   - ${u.email} (${u.first_name} ${u.last_name})`);
      });
      
      process.exit(1);
    }

    const user = userCheck.rows[0];

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, user.id]
    );

    console.log('✅ Password reset successfully!\n');
    console.log('👤 User:', user.first_name, user.last_name);
    console.log('📧 Email:', user.email);
    console.log('🔑 New Password:', newPassword);
    console.log('🎭 Role:', user.role);
    console.log('\n🚀 You can now sign in with these credentials!');

  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

resetPassword();
