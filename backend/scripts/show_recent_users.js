const { query } = require('../src/config/database');

async function showRecentUsers() {
  try {
    console.log('📋 Showing most recent users...\n');

    const result = await query(
      `SELECT 
        id, 
        email, 
        phone_number, 
        first_name, 
        last_name, 
        role, 
        status,
        is_email_verified,
        created_at
      FROM users 
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 10`
    );

    if (result.rows.length === 0) {
      console.log('⚠️  No users found in the database.');
      return;
    }

    console.log(`✅ Found ${result.rows.length} recent user(s):\n`);

    result.rows.forEach((user, index) => {
      const isRecent = (Date.now() - new Date(user.created_at).getTime()) < 3600000; // Less than 1 hour
      const marker = isRecent ? '🆕' : '  ';
      
      console.log(`${marker} ${index + 1}. ${user.first_name} ${user.last_name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📱 Phone: ${user.phone_number}`);
      console.log(`   🎭 Role: ${user.role}`);
      console.log(`   📊 Status: ${user.status}`);
      console.log(`   ✉️  Email Verified: ${user.is_email_verified ? 'Yes' : 'No'}`);
      console.log(`   📅 Created: ${user.created_at}`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log('');
    });

    console.log('🆕 = Created in the last hour (likely your new sign-up)');

  } catch (error) {
    console.error('❌ Error showing recent users:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

showRecentUsers();
