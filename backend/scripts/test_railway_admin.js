const { query } = require('../src/config/database');

async function testRailwayAdmin() {
  try {
    console.log('🔍 Checking for admin users in Railway database...\n');

    // Check all users with admin role
    const result = await query(
      `SELECT id, email, role, status, first_name, last_name, created_at
       FROM users 
       WHERE role = 'admin' AND deleted_at IS NULL
       ORDER BY created_at DESC`
    );

    if (result.rows.length === 0) {
      console.log('❌ No admin users found in the database!');
      console.log('\n💡 You need to create an admin user in Railway database.');
      console.log('\nOptions:');
      console.log('1. Run the seed data SQL in Railway PostgreSQL');
      console.log('2. Or manually insert an admin user');
    } else {
      console.log(`✅ Found ${result.rows.length} admin user(s):\n`);
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🎭 Role: ${user.role}`);
        console.log(`   📊 Status: ${user.status}`);
        console.log(`   📅 Created: ${user.created_at}`);
        console.log('');
      });
    }

    // Test specific email
    const testEmail = 'admin@ganacsade.com';
    console.log(`\n🔍 Checking specific email: ${testEmail}`);
    
    const adminCheck = await query(
      `SELECT id, email, role, status, password_hash
       FROM users 
       WHERE email = $1 AND deleted_at IS NULL`,
      [testEmail]
    );

    if (adminCheck.rows.length === 0) {
      console.log(`❌ User ${testEmail} not found`);
    } else {
      const admin = adminCheck.rows[0];
      console.log(`✅ User found!`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Status: ${admin.status}`);
      console.log(`   Has password: ${admin.password_hash ? 'Yes' : 'No'}`);
      
      if (admin.role !== 'admin') {
        console.log(`\n⚠️  WARNING: User role is '${admin.role}', not 'admin'`);
      }
      if (admin.status !== 'active') {
        console.log(`\n⚠️  WARNING: User status is '${admin.status}', not 'active'`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('connect')) {
      console.log('\n💡 Make sure DATABASE_URL is set in Railway environment variables');
    }
  } finally {
    process.exit(0);
  }
}

testRailwayAdmin();
