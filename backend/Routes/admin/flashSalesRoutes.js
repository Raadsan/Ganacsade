import express from 'express';
import {
  addFlashSaleProduct,
  createFlashSale,
  deleteFlashSale,
  deleteFlashSaleProduct,
  getFlashSaleById,
  getFlashSales,
  updateFlashSale,
  updateFlashSaleProduct,
} from '../../controllers/admin/flashSalesController.js';

const router = express.Router();

router.get('/', getFlashSales);
router.get('/:id', getFlashSaleById);
router.post('/', createFlashSale);
router.put('/:id', updateFlashSale);
router.delete('/:id', deleteFlashSale);
router.post('/:id/products', addFlashSaleProduct);
router.put('/:id/products/:productId', updateFlashSaleProduct);
router.delete('/:id/products/:productId', deleteFlashSaleProduct);

export default router;
