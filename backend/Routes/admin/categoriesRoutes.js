import express from 'express';
import { body } from 'express-validator';
import validate from '../../middlewares/validate.js';
import { uploadCategory } from '../../middlewares/upload.js';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  uploadCategoryImage,
} from '../../controllers/admin/categoriesController.js';

const router = express.Router();

/**
 * @route   GET /api/admin/categories
 * @desc    Get all categories
 * @access  Private/Admin
 */
router.get('/', getCategories);

/**
 * @route   GET /api/admin/categories/:id
 * @desc    Get category by ID
 * @access  Private/Admin
 */
router.get('/:id', getCategoryById);

/**
 * @route   POST /api/admin/categories
 * @desc    Create new category
 * @access  Private/Admin
 */
router.post(
  '/',
  [
    body('nameEn').notEmpty().withMessage('English name is required'),
    body('nameSo').notEmpty().withMessage('Somali name is required'),
    body('nameAr').notEmpty().withMessage('Arabic name is required'),
    validate,
  ],
  createCategory
);

/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Update category
 * @access  Private/Admin
 */
router.put('/:id', updateCategory);

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Delete category
 * @access  Private/Admin
 */
router.delete('/:id', deleteCategory);

/**
 * @route   POST /api/admin/categories/upload-image
 * @desc    Upload category image
 * @access  Private/Admin
 */
router.post('/upload-image', uploadCategory.single('image'), uploadCategoryImage);

export default router;
