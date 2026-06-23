import express from 'express';
import upload from '../../middlewares/upload.js';
import {
  addProductImages,
  createProduct,
  deleteProduct,
  getProductById,
  getProductImages,
  getProducts,
  updateProduct,
  uploadProductImages,
} from '../../controllers/admin/productsController.js';

const router = express.Router();

/**
 * @route   GET /api/admin/products
 * @desc    Get all products with filters
 * @access  Private/Admin
 */
router.get('/', getProducts);

/**
 * @route   GET /api/admin/products/:id
 * @desc    Get product details
 * @access  Private/Admin
 */
router.get('/:id', getProductById);

/**
 * @route   POST /api/admin/products
 * @desc    Create new product
 * @access  Private/Admin
 */
router.post('/', createProduct);

/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update product
 * @access  Private/Admin
 */
router.put('/:id', updateProduct);

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Soft delete product
 * @access  Private/Admin
 */
router.delete('/:id', deleteProduct);

/**
 * @route   POST /api/admin/products/upload-images
 * @desc    Upload product images
 * @access  Private/Admin
 */
router.post('/upload-images', upload.array('images', 5), uploadProductImages);

/**
 * @route   GET /api/admin/products/:id/images
 * @desc    Get all images for a product
 * @access  Private/Admin
 */
router.get('/:id/images', getProductImages);

/**
 * @route   POST /api/admin/products/:id/images
 * @desc    Add images to existing product
 * @access  Private/Admin
 */
router.post('/:id/images', upload.array('images', 5), addProductImages);

export default router;
