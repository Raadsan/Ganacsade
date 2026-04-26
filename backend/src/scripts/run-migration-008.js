require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function run() {
  const client = await pool.connect();
  try {
    console.log('Running migration 008: staff role + token invalidation...\n');
    const sql = fs.readFileSync(
      path.join(__dirname, '../migrations/008_staff_and_security.sql'),
      'utf8'
    );
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration 008 completed successfully.');
    console.log('  - Added staff to user_role enum');
    console.log('  - Added token_invalidated_at column to users');
    console.log('  - Added index on token_invalidated_at');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => { console.error('Migration failed:', err.message); process.exit(1); });
