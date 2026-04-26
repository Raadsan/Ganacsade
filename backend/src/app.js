const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');

// Import routes
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin');
const customerRoutes = require('./routes/customer');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

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

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins for debugging
  credentials: true,
}));

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
// Health Check
// =====================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.app.env,
  });
});

// API Root
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome to ${config.app.name} API`,
    version: config.app.apiVersion,
    documentation: '/api/docs',
  });
});

// =====================================================
// API Routes
// =====================================================

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

module.exports = app;
