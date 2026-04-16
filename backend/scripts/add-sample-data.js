const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database configuration
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ganacsade_db',
  user: 'postgres',
  password: 'Mohamed@123',
});

async function addSampleData() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adding sample user and transactions...\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert user
    const userResult = await client.query(`
      INSERT INTO users (
        first_name, last_name, display_name, email, phone_number, password_hash, 
        role, status, is_email_verified, is_phone_verified
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
      ON CONFLICT (email) DO UPDATE 
      SET first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          display_name = EXCLUDED.display_name
      RETURNING id, first_name, last_name, display_name, email, phone_number, role, status
    `, [
      'Ahmed',
      'Mohamed',
      'Ahmed Mohamed',
      'ahmed.mohamed@example.com',
      '+252612345678',
      hashedPassword,
      'customer',
      'active',
      true,
      true
    ]);

    const user = userResult.rows[0];
    console.log('✅ User added:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Phone: ${user.phone_number}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Password: password123\n`);

    // Insert transactions
    const transactions = [
      {
        transaction_id: 'TXN-2025-0000001',
        type: 'order_payment',
        status: 'completed',
        amount: 299.99,
        payment_method: 'waafi_pay',
        description: 'Payment for Order #ORD-2025-001'
      },
      {
        transaction_id: 'TXN-2025-0000002',
        type: 'order_payment',
        status: 'completed',
        amount: 599.98,
        payment_method: 'edahab',
        description: 'Payment for Order #ORD-2025-002'
      },
      {
        transaction_id: 'TXN-2025-0000003',
        type: 'refund',
        status: 'completed',
        amount: 89.99,
        payment_method: 'premier_wallet',
        description: 'Refund for Order #ORD-2025-001'
      },
      {
        transaction_id: 'TXN-2025-0000004',
        type: 'order_payment',
        status: 'pending',
        amount: 149.99,
        payment_method: 'cash_on_delivery',
        description: 'Payment for Order #ORD-2025-003 (Cash on Delivery)'
      },
      {
        transaction_id: 'TXN-2025-0000005',
        type: 'order_payment',
        status: 'failed',
        amount: 199.99,
        payment_method: 'credit_card',
        description: 'Payment for Order #ORD-2025-004',
        failure_reason: 'Insufficient funds'
      }
    ];

    console.log('✅ Transactions added:');
    
    for (const txn of transactions) {
      const completedAt = txn.status === 'completed' ? 'CURRENT_TIMESTAMP' : 'NULL';
      const failedAt = txn.status === 'failed' ? 'CURRENT_TIMESTAMP' : 'NULL';
      
      await client.query(`
        INSERT INTO transactions (
          transaction_id, type, status, amount, currency, payment_method,
          user_id, user_name, user_email, description, failure_reason,
          completed_at, failed_at
        ) VALUES (
          $1, $2::transaction_type, $3::transaction_status, $4, $5, $6::payment_method_type, 
          $7, $8, $9, $10, $11, ${completedAt}, ${failedAt}
        )
        ON CONFLICT (transaction_id) DO NOTHING
      `, [
        txn.transaction_id,
        txn.type,
        txn.status,
        txn.amount,
        'USD',
        txn.payment_method,
        user.id,
        user.display_name,
        user.email,
        txn.description,
        txn.failure_reason || null
      ]);

      const sign = txn.type === 'refund' ? '-' : '+';
      console.log(`   ${txn.transaction_id}: ${sign}$${txn.amount} (${txn.payment_method}) - ${txn.status}`);
    }

    console.log('\n🎉 Sample data added successfully!');
    console.log('\n📊 Summary:');
    console.log('   - 1 User created');
    console.log('   - 5 Transactions created');
    console.log('\n🌐 You can now view these in:');
    console.log('   - Users: http://localhost:3003/users');
    console.log('   - Transactions: http://localhost:3003/transactions');

  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
addSampleData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
