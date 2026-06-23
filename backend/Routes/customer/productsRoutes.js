import express from 'express';
import {
  getFeaturedProducts,
  getFlashSaleProducts,
  getProductById,
  getProducts,
} from '../../controllers/customer/productsController.js';

const router = express.Router();

/**
 * @route   GET /api/customer/products
 * @desc    Get all active products for customers
 * @access  Public
 */
router.get('/', getProducts);

/**
 * @route   GET /api/customer/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', getFeaturedProducts);

/**
 * @route   GET /api/customer/products/flash-sales
 * @desc    Get flash sale products
 * @access  Public
 */
router.get('/flash-sales', getFlashSaleProducts);

/**
 * @route   GET /api/customer/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', getProductById);

export default router;
