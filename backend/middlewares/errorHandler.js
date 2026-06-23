import config from '../lib/config/index.js';

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((e) => e.message);
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Unauthorized - Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Unauthorized - Token expired';
  }

  // Prisma errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Duplicate entry - Resource already exists';
  }

  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Invalid reference - Related resource not found';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
    stack: config.app.env === 'development' ? err.stack : undefined,
  });
};

export default errorHandler;
