const app = require('./app');
const config = require('./config');
const { pool } = require('./config/database');

const PORT = config.app.port;

// Test database connection before starting server
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established');

    // Start server - bind to 0.0.0.0 to allow access from Android emulator
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('🚀 ============================================');
      console.log(`🚀 ${config.app.name} API Server`);
      console.log('🚀 ============================================');
      console.log(`🚀 Environment: ${config.app.env}`);
      console.log(`🚀 Port: ${PORT}`);
      console.log(`🚀 API Version: ${config.app.apiVersion}`);
      console.log(`🚀 Server URL: http://localhost:${PORT}`);
      console.log(`🚀 API URL: http://localhost:${PORT}/api`);
      console.log(`🚀 Health Check: http://localhost:${PORT}/health`);
      console.log(`🚀 Android Emulator: http://10.0.2.2:${PORT}/api`);
      console.log('🚀 ============================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start the server
startServer();
