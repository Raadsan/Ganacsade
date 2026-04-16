const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');

/**
 * Generate transaction ID in format: TXN-2025-0001234
 */
const generateTransactionId = async () => {
  const year = new Date().getFullYear();
  
  // Get the latest transaction for this year
  const result = await query(
    `SELECT transaction_id FROM transactions 
     WHERE transaction_id LIKE $1 
     ORDER BY transaction_id DESC LIMIT 1`,
    [`TXN-${year}-%`]
  );

  let nextNumber = 1;
  if (result.rows.length > 0) {
    const lastId = result.rows[0].transaction_id;
    const lastNumber = parseInt(lastId.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  // Format: TXN-2025-0001234 (7 digits, zero-padded)
  const paddedNumber = String(nextNumber).padStart(7, '0');
  return `TXN-${year}-${paddedNumber}`;
};

/**
 * @route   GET /api/admin/transactions
 * @desc    Get all transactions with filters
 * @access  Private/Admin
 */
router.get('/', async (req, res, next) => {
  try {
    const { 
      status, 
      type, 
      payment_method,
      user_id,
      order_id,
      start_date,
      end_date,
      search,
      page = 1,
      limit = 50
    } = req.query;

    // Check if table exists first
    const tableCheck = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions'
      )`
    );

    if (!tableCheck.rows[0].exists) {
      console.error('Transactions table does not exist');
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0
        },
        message: 'Transactions table not found. Please run database migrations.'
      });
    }

    // Simple query without complex joins to avoid errors
    let queryText = `
      SELECT 
        t.id,
        t.transaction_id,
        t.type,
        t.status,
        t.amount,
        t.currency,
        t.payment_method,
        t.user_id,
        t.user_name,
        t.user_email,
        t.order_id,
        t.description,
        t.failure_reason,
        t.created_at,
        t.updated_at,
        t.completed_at,
        t.failed_at
      FROM transactions t
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Filters
    if (status) {
      paramCount++;
      params.push(status);
      queryText += ` AND t.status = $${paramCount}`;
    }

    if (type) {
      paramCount++;
      params.push(type);
      queryText += ` AND t.type = $${paramCount}`;
    }

    if (payment_method) {
      paramCount++;
      params.push(payment_method);
      queryText += ` AND t.payment_method = $${paramCount}`;
    }

    if (user_id) {
      paramCount++;
      params.push(user_id);
      queryText += ` AND t.user_id = $${paramCount}`;
    }

    if (order_id) {
      paramCount++;
      params.push(order_id);
      queryText += ` AND t.order_id = $${paramCount}`;
    }

    if (start_date) {
      paramCount++;
      params.push(start_date);
      queryText += ` AND t.created_at >= $${paramCount}`;
    }

    if (end_date) {
      paramCount++;
      params.push(end_date);
      queryText += ` AND t.created_at <= $${paramCount}`;
    }

    if (search) {
      paramCount++;
      const searchPattern = `%${search}%`;
      params.push(searchPattern);
      queryText += ` AND (
        t.transaction_id ILIKE $${paramCount} OR
        t.user_name ILIKE $${paramCount} OR
        t.user_email ILIKE $${paramCount}
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
    queryText += ` ORDER BY t.created_at DESC LIMIT $${paramCount}`;
    
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
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/transactions/stats
 * @desc    Get transaction statistics
 * @access  Private/Admin
 */
router.get('/stats', async (req, res, next) => {
  try {
    // Check if table exists first
    const tableCheck = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions'
      )`
    );

    if (!tableCheck.rows[0].exists) {
      return res.json({
        success: true,
        data: {
          total_transactions: 0,
          total_revenue: 0,
          total_refunds: 0,
          net_revenue: 0,
          completed_count: 0,
          pending_count: 0,
          failed_count: 0
        }
      });
    }

    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      params.push(start_date, end_date);
      dateFilter = 'WHERE created_at BETWEEN $1 AND $2';
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN type = 'refund' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_refunds,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN type = 'refund' AND status = 'completed' THEN amount ELSE 0 END), 0) as net_revenue,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
      FROM transactions
      ${dateFilter}
    `;

    const result = await query(statsQuery, params);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/transactions/:id
 * @desc    Get single transaction
 * @access  Private/Admin
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        o.order_number,
        o.total_amount as order_total
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN orders o ON t.order_id = o.id
      WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/transactions
 * @desc    Create new transaction
 * @access  Private/Admin
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      type,
      amount,
      currency = 'USD',
      paymentMethod,
      userId,
      userName,
      userEmail,
      orderId,
      description,
      gatewayResponse,
      metadata
    } = req.body;

    // Validation
    if (!type || !amount || !paymentMethod || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Type, amount, payment method, and user ID are required'
      });
    }

    // Generate transaction ID
    const transactionId = await generateTransactionId();

    const result = await query(
      `INSERT INTO transactions 
       (transaction_id, type, amount, currency, payment_method, user_id, user_name, user_email, 
        order_id, description, gateway_response, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        transactionId, type, amount, currency, paymentMethod, userId, userName, userEmail,
        orderId || null, description || null, gatewayResponse || null, metadata || {}
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/admin/transactions/:id/status
 * @desc    Update transaction status
 * @access  Private/Admin
 */
router.put('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, failureReason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    let updateQuery = `
      UPDATE transactions
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
    `;
    const params = [status];
    let paramCount = 1;

    if (status === 'completed') {
      updateQuery += `, completed_at = CURRENT_TIMESTAMP`;
    } else if (status === 'failed') {
      updateQuery += `, failed_at = CURRENT_TIMESTAMP`;
      if (failureReason) {
        paramCount++;
        params.push(failureReason);
        updateQuery += `, failure_reason = $${paramCount}`;
      }
    }

    paramCount++;
    params.push(id);
    updateQuery += ` WHERE id = $${paramCount} RETURNING *`;

    const result = await query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/admin/transactions/:id
 * @desc    Delete transaction (soft delete - mark as cancelled)
 * @access  Private/Admin
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE transactions 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
