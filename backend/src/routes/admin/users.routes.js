const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const bcrypt = require('bcryptjs');

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters
 * @access  Private/Admin
 */
router.get('/', async (req, res, next) => {
  try {
    const { 
      role = 'customer',
      status,
      is_verified,
      search,
      page = 1,
      limit = 50
    } = req.query;

    // Check if table exists
    const tableCheck = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )`
    );

    if (!tableCheck.rows[0].exists) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 50, total: 0, pages: 0 }
      });
    }

    let queryText = `
      SELECT 
        id,
        first_name,
        last_name,
        display_name,
        email,
        phone_number,
        role,
        status,
        is_email_verified as is_verified,
        created_at,
        updated_at,
        last_login_at
      FROM users
      WHERE deleted_at IS NULL
    `;
    const params = [];
    let paramCount = 0;

    // Filter by role
    if (role) {
      paramCount++;
      params.push(role);
      queryText += ` AND role = $${paramCount}`;
    }

    // Filter by status
    if (status) {
      paramCount++;
      params.push(status);
      queryText += ` AND status = $${paramCount}`;
    }

    // Filter by verification
    if (is_verified !== undefined) {
      paramCount++;
      params.push(is_verified === 'true');
      queryText += ` AND is_verified = $${paramCount}`;
    }

    // Search
    if (search) {
      paramCount++;
      params.push(`%${search}%`);
      queryText += ` AND (
        first_name ILIKE $${paramCount} OR
        last_name ILIKE $${paramCount} OR
        display_name ILIKE $${paramCount} OR
        email ILIKE $${paramCount} OR
        phone_number ILIKE $${paramCount}
      )`;
    }

    // Count total
    const countResult = await query(
      queryText.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM'),
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Pagination
    const offset = (page - 1) * limit;
    paramCount++;
    params.push(limit);
    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    
    paramCount++;
    params.push(offset);
    queryText += ` OFFSET $${paramCount}`;

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/users/stats
 * @desc    Get user statistics
 * @access  Private/Admin
 */
router.get('/stats', async (req, res, next) => {
  try {
    // Check if table exists
    const tableCheck = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )`
    );

    if (!tableCheck.rows[0].exists) {
      return res.json({
        success: true,
        data: {
          total_users: 0,
          total_customers: 0,
          active_users: 0,
          verified_users: 0,
          new_users_30d: 0
        }
      });
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'customer' THEN 1 END) as total_customers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_30d
      FROM users
      WHERE deleted_at IS NULL
    `;

    const result = await query(statsQuery);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user
 * @access  Private/Admin
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        id, name, email, phone, role, status, is_verified,
        email_verified_at, created_at, updated_at, last_login_at
      FROM users
      WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Private/Admin
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, password, role = 'customer' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if email exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, phone, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role, status, is_verified, created_at`,
      [name, email, phone || null, hashedPassword, role]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Private/Admin
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status } = req.body;

    const result = await query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           role = COALESCE($4, role),
           status = COALESCE($5, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND deleted_at IS NULL
       RETURNING id, name, email, phone, role, status, is_verified, updated_at`,
      [name, email, phone, role, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Update user status
 * @access  Private/Admin
 */
router.put('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const result = await query(
      `UPDATE users
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING id, name, email, status`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private/Admin
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE users
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

module.exports = router;
