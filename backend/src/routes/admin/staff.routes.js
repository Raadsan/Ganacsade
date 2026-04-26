const express = require('express');
const { query } = require('../../config/database');
const { hashPassword } = require('../../utils/password');
const { authorize } = require('../../middleware/auth');

const router = express.Router();

// Only admins can manage staff — staff cannot manage other staff
const adminOnly = authorize('admin');

/**
 * @route   GET /api/admin/staff
 * @desc    List all staff members (admin + staff roles)
 * @access  Admin
 */
router.get('/', adminOnly, async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 50 } = req.query;

    let conditions = [`role IN ('admin', 'staff')`, 'deleted_at IS NULL'];
    const params = [];
    let n = 1;

    if (role && ['admin', 'staff'].includes(role)) {
      conditions.push(`role = $${n++}`);
      params.push(role);
    }

    if (status) {
      conditions.push(`status = $${n++}`);
      params.push(status);
    }

    if (search) {
      conditions.push(
        `(first_name ILIKE $${n} OR last_name ILIKE $${n} OR email ILIKE $${n})`
      );
      params.push(`%${search}%`);
      n++;
    }

    const where = 'WHERE ' + conditions.join(' AND ');

    const countResult = await query(
      `SELECT COUNT(*) FROM users ${where}`,
      params
    );

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const result = await query(
      `SELECT id, first_name, last_name, display_name, email, phone_number,
              role, status, is_email_verified, created_at, last_login_at
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT $${n} OFFSET $${n + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.rows[0].count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/staff
 * @desc    Create a new staff member
 * @access  Admin only
 */
router.post('/', adminOnly, async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, role } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'firstName, lastName, email, phoneNumber, password, and role are required',
      });
    }

    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'role must be "admin" or "staff"',
      });
    }

    // Check for conflicts on email and phone separately for clear error messages
    const emailCheck = await query(
      'SELECT id, role FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );
    if (emailCheck.rows.length > 0) {
      const existing = emailCheck.rows[0];
      if (['admin', 'staff'].includes(existing.role)) {
        return res.status(409).json({
          success: false,
          message: 'A staff member with this email already exists',
        });
      }
      // Existing customer — promote them and set the password entered in the form
      const promotedHash = await hashPassword(password);
      const updated = await query(
        `UPDATE users
         SET role = $1, first_name = COALESCE($2, first_name), last_name = COALESCE($3, last_name),
             phone_number = COALESCE($4, phone_number), password_hash = $5,
             token_invalidated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING id, first_name, last_name, email, phone_number, role, status, created_at`,
        [role, firstName, lastName, phoneNumber, promotedHash, existing.id]
      );
      return res.status(200).json({
        success: true,
        message: 'Existing user promoted to staff successfully',
        data: updated.rows[0],
      });
    }

    const phoneCheck = await query(
      'SELECT id FROM users WHERE phone_number = $1 AND deleted_at IS NULL',
      [phoneNumber]
    );
    if (phoneCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'This phone number is already registered to another account',
      });
    }

    const passwordHash = await hashPassword(password);

    const result = await query(
      `INSERT INTO users
         (first_name, last_name, email, phone_number, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING id, first_name, last_name, email, phone_number, role, status, created_at`,
      [firstName, lastName, email, phoneNumber, passwordHash, role]
    );

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A user with this email or phone number already exists',
      });
    }
    next(error);
  }
});

/**
 * @route   GET /api/admin/staff/:id
 * @desc    Get a single staff member
 * @access  Admin only
 */
router.get('/:id', adminOnly, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, first_name, last_name, display_name, email, phone_number,
              role, status, is_email_verified, created_at, last_login_at
       FROM users
       WHERE id = $1 AND role IN ('admin', 'staff') AND deleted_at IS NULL`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/admin/staff/:id
 * @desc    Update a staff member's details or role
 * @access  Admin only
 */
router.put('/:id', adminOnly, async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, role, status } = req.body;

    if (role && !['admin', 'staff'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'role must be "admin" or "staff"',
      });
    }

    // Prevent self-demotion from admin
    if (req.params.id === req.user.id && role && role !== req.user.role) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role',
      });
    }

    const result = await query(
      `UPDATE users
       SET first_name    = COALESCE($1, first_name),
           last_name     = COALESCE($2, last_name),
           email         = COALESCE($3, email),
           phone_number  = COALESCE($4, phone_number),
           role          = COALESCE($5, role),
           status        = COALESCE($6, status),
           updated_at    = CURRENT_TIMESTAMP
       WHERE id = $7 AND role IN ('admin', 'staff') AND deleted_at IS NULL
       RETURNING id, first_name, last_name, email, phone_number, role, status`,
      [firstName, lastName, email, phoneNumber, role, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/admin/staff/:id/password
 * @desc    Reset a staff member's password
 * @access  Admin only
 */
router.patch('/:id/password', adminOnly, async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const passwordHash = await hashPassword(password);

    const result = await query(
      `UPDATE users
       SET password_hash = $1, token_invalidated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND role IN ('admin', 'staff') AND deleted_at IS NULL
       RETURNING id`,
      [passwordHash, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/admin/staff/:id
 * @desc    Soft-delete a staff member
 * @access  Admin only
 */
router.delete('/:id', adminOnly, async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const result = await query(
      `UPDATE users
       SET deleted_at = CURRENT_TIMESTAMP, token_invalidated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND role IN ('admin', 'staff') AND deleted_at IS NULL
       RETURNING id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    res.json({ success: true, message: 'Staff member removed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
