import express from 'express';
import { body } from 'express-validator';
import validate from '../../middlewares/validate.js';
import { uploadSubcategory } from '../../middlewares/upload.js';
import {
  createSubcategory,
  deleteSubcategory,
  getSubcategories,
  getSubcategoryById,
  updateSubcategory,
  uploadSubcategoryImage,
} from '../../controllers/admin/subcategoriesController.js';

const router = express.Router();

/**
 * @route   GET /api/admin/subcategories
 * @desc    Get all subcategories or by category
 * @access  Private/Admin
 */
router.get('/', getSubcategories);

/**
 * @route   GET /api/admin/subcategories/:id
 * @desc    Get subcategory by ID
 * @access  Private/Admin
 */
router.get('/:id', getSubcategoryById);

/**
 * @route   POST /api/admin/subcategories
 * @desc    Create new subcategory
 * @access  Private/Admin
 */
router.post(
  '/',
  [
    body('categoryId').notEmpty().withMessage('Category ID is required'),
    body('nameEn').notEmpty().withMessage('English name is required'),
    body('nameSo').notEmpty().withMessage('Somali name is required'),
    body('nameAr').notEmpty().withMessage('Arabic name is required'),
    validate,
  ],
  createSubcategory
);

/**
 * @route   PUT /api/admin/subcategories/:id
 * @desc    Update subcategory
 * @access  Private/Admin
 */
router.put('/:id', updateSubcategory);

/**
 * @route   DELETE /api/admin/subcategories/:id
 * @desc    Delete subcategory
 * @access  Private/Admin
 */
router.delete('/:id', deleteSubcategory);

/**
 * @route   POST /api/admin/subcategories/upload-image
 * @desc    Upload subcategory image
 * @access  Private/Admin
 */
router.post('/upload-image', uploadSubcategory.single('image'), uploadSubcategoryImage);

export default router;
