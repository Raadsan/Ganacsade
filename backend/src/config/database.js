const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool configuration
const isUsingDatabaseUrl = Boolean(process.env.DATABASE_URL);
const sslEnabled = process.env.DB_SSL === 'true';

const poolConfig = isUsingDatabaseUrl
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'ganacsade_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '', 10) || 10000,
});

console.log('🗄️  Database configuration:', {
  usingDatabaseUrl: isUsingDatabaseUrl,
  host: isUsingDatabaseUrl ? undefined : poolConfig.host,
  port: isUsingDatabaseUrl ? undefined : poolConfig.port,
  database: isUsingDatabaseUrl ? undefined : poolConfig.database,
  user: isUsingDatabaseUrl ? undefined : poolConfig.user,
  ssl: Boolean(poolConfig.ssl),
  connectionTimeoutMillis: pool.options.connectionTimeoutMillis,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

// Query helper function
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Get a client from the pool
const getClient = () => pool.connect();

module.exports = {
  pool,
  query,
  transaction,
  getClient,
};
