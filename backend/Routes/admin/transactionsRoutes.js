import express from 'express';
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactionStats,
  getTransactions,
  refundTransaction,
  updateTransactionStatus,
} from '../../controllers/admin/transactionsController.js';

const router = express.Router();

router.get('/', getTransactions);
router.get('/stats', getTransactionStats);
router.get('/:id', getTransactionById);
router.post('/:id/refund', refundTransaction);
router.post('/', createTransaction);
router.put('/:id/status', updateTransactionStatus);
router.delete('/:id', deleteTransaction);

export default router;
