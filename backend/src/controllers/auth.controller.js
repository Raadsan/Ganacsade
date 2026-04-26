const { query } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

/**
 * Register new user
 */
const register = async (req, res, next) => {
  try {
    const { email, phoneNumber, password, firstName, lastName } = req.body;
    const role = 'customer'; // Role is never taken from client input

    // Check if user already exists
    const existingUser = await query(
      'SELECT id, email, phone_number FROM users WHERE (email = $1 OR phone_number = $2) AND deleted_at IS NULL',
      [email, phoneNumber]
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      let message = '';
      
      if (user.email === email && user.phone_number === phoneNumber) {
        message = 'An account with this email and phone number already exists';
      } else if (user.email === email) {
        message = 'An account with this email already exists';
      } else {
        message = 'An account with this phone number already exists';
      }
      
      return res.status(409).json({
        success: false,
        message: message,
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO users (email, phone_number, password_hash, first_name, last_name, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING id, email, phone_number, role, first_name, last_name, created_at`,
      [email, phoneNumber, passwordHash, firstName, lastName, role]
    );

    const user = result.rows[0];

    // Generate tokens
    const token = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          phoneNumber: user.phone_number,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, phoneNumber, password } = req.body;

    // Find user by email OR phone number
    const result = await query(
      `SELECT id, email, phone_number, password_hash, role, first_name, last_name, status
       FROM users
       WHERE (email = $1 OR phone_number = $2) AND deleted_at IS NULL`,
      [email || null, phoneNumber || null]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const user = result.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active. Please contact support.',
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    await query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Generate tokens
    const token = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          phoneNumber: user.phone_number,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin login (restricted to admin role)
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, phoneNumber, password } = req.body;

    // Find admin or staff user by email OR phone number
    const result = await query(
      `SELECT id, email, phone_number, password_hash, role, first_name, last_name, status
       FROM users
       WHERE (email = $1 OR phone_number = $2) AND role IN ('admin', 'staff') AND deleted_at IS NULL`,
      [email || null, phoneNumber || null]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or not authorized',
      });
    }

    const user = result.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active',
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or not authorized',
      });
    }

    // Update last login
    await query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Generate tokens
    const token = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          phoneNumber: user.phone_number,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, email, phone_number, role, first_name, last_name, display_name,
              profile_image_url, gender, date_of_birth, preferred_language, preferred_currency,
              is_email_verified, is_phone_verified, status, preferences, created_at
       FROM users
       WHERE id = $1 AND deleted_at IS NULL`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, displayName, phoneNumber, gender, dateOfBirth, preferredLanguage } = req.body;

    const result = await query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           display_name = COALESCE($3, display_name),
           phone_number = COALESCE($4, phone_number),
           gender = COALESCE($5, gender),
           date_of_birth = COALESCE($6, date_of_birth),
           preferred_language = COALESCE($7, preferred_language)
       WHERE id = $8 AND deleted_at IS NULL
       RETURNING id, email, phone_number, role, first_name, last_name, display_name`,
      [firstName, lastName, displayName, phoneNumber, gender, dateOfBirth, preferredLanguage, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, result.rows[0].password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user — invalidates all tokens issued before this moment
 */
const logout = async (req, res, next) => {
  try {
    await query(
      'UPDATE users SET token_invalidated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [req.user.id]
    );
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const { verifyRefreshToken } = require('../utils/jwt');
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new access token
    const result = await query(
      'SELECT id, role FROM users WHERE id = $1 AND deleted_at IS NULL AND status = $2',
      [decoded.userId, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const user = result.rows[0];
    const newToken = generateAccessToken(user.id, user.role);

    res.json({
      success: true,
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshToken,
};
