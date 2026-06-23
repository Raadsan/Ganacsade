import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import config from './lib/config/index.js';

// Import routes
import authRoutes from './Routes/authRoutes.js';
import adminRoutes from './Routes/admin/index.js';
import customerRoutes from './Routes/customer/index.js';
import systemRoutes from './Routes/systemRoutes.js';

// Import middleware
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';

// Import prisma for database connection testing 
import prisma from './lib/config/prisma.js';

// Create Express app
const app = express();

// =====================================================
// Security Middleware
// =====================================================

// Helmet helps secure Express apps by setting various HTTP headers
// Configure helmet to allow images to be loaded by frontend
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "http://178.18.241.5:5002", "http://localhost:3003", "http://localhost:5000", "https://ganacsade-production.up.railway.app"],
    },
  },
}));

// CORS — allowed origins from env (comma-separated CORS_ORIGIN)
const allowedOrigins = new Set(
  (config.cors.origin || []).map((origin) => origin.trim()).filter(Boolean),
);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isDev = config.app.env === 'development';

  if (origin && allowedOrigins.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else if (isDev && origin) {
    // Local dev: admin (2002), mobile tools, etc.
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  if (isDev) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${origin || 'none'}`);
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  return next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// =====================================================
// Body Parsing Middleware
// =====================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// =====================================================
// Logging Middleware
// =====================================================

if (config.app.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// =====================================================
// Compression Middleware
// =====================================================

app.use(compression());

// =====================================================
// Static Files
// =====================================================

app.use('/uploads', express.static('uploads'));

// =====================================================
// API Routes
// =====================================================

// System routes (public)
app.use('/', systemRoutes);

// Authentication routes (public)
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/auth', authRoutes); // Fallback for resolution issues

// Admin routes (protected)
app.use('/api/admin', adminRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/admin', adminRoutes); // Fallback for resolution issues

// Customer routes (protected/public)
app.use('/api/customer', customerRoutes);
app.use('/api/v1/customer', customerRoutes);
app.use('/customer', customerRoutes); // Fallback for resolution issues

// =====================================================
// Error Handling Middleware
// =====================================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// =====================================================
// Server Initialization
// =====================================================

const PORT = config.app.port || 5002;

const startServer = async () => {
  try {
    // Test database connection using Prisma
    await prisma.$connect();
    console.log('✅ Database connection established via Prisma');

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
    if (error?.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Stop old process first, then rerun npm run dev.`);
      console.error('💡 Tip (PowerShell): netstat -ano | findstr :5002');
      return;
    }
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} already in use (EADDRINUSE).`);
    return;
  }
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer();
