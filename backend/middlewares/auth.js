import jwt from 'jsonwebtoken';
import config from '../lib/config/index.js';
import prisma from '../lib/config/prisma.js';

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header first, then fallback to cookie
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = headerToken || cookieToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database using Prisma
    const user = await prisma.users.findFirst({
      where: {
        id: decoded.userId,
        deleted_at: null,
      },
      select: {
        id: true,
        email: true,
        phone_number: true,
        role_id: true,
        role: true,
        first_name: true,
        last_name: true,
        status: true,
        token_invalidated_at: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User not found',
      });
    }

    // Check if token was issued before the user logged out
    if (user.token_invalidated_at) {
      const invalidatedAt = new Date(user.token_invalidated_at).getTime() / 1000;
      if (decoded.iat <= invalidatedAt) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Token has been invalidated',
        });
      }
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Account is not active',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Token expired',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid token',
      });
    }

    next(error);
  }
};

/**
 * Check if user has required role
 */
export const authorize = (...roles) => {
  const allowedRoles = new Set(
    roles.flatMap((role) => {
      if (role === 'delivery_person') {
        return ['delivery_person', 'delivery'];
      }
      return [role];
    }),
  );

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Please login first',
      });
    }

    const userRole = String(req.user.role || '').toLowerCase();
    const isAllowed = [...allowedRoles].some((role) => {
      const normalizedRole = String(role).toLowerCase();
      return userRole === normalizedRole || userRole.includes(normalizedRole);
    });

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You do not have permission to access this resource',
      });
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await prisma.users.findFirst({
      where: {
        id: decoded.userId,
        deleted_at: null,
        status: 'active',
      },
      select: {
        id: true,
        email: true,
        phone_number: true,
        role: true,
        first_name: true,
        last_name: true,
        status: true,
      },
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};
