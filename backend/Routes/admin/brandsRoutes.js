import express from 'express';
import { body } from 'express-validator';
import validate from '../../middlewares/validate.js';
import { uploadBrand } from '../../middlewares/upload.js';
import {
  createBrand,
  deleteBrand,
  getBrandById,
  getBrands,
  updateBrand,
  uploadBrandLogo,
} from '../../controllers/admin/brandsController.js';

const router = express.Router();

/**
 * @route   GET /api/admin/brands
 * @desc    Get all brands
 * @access  Private/Admin
 */
router.get('/', getBrands);

/**
 * @route   GET /api/admin/brands/:id
 * @desc    Get single brand
 * @access  Private/Admin
 */
router.get('/:id', getBrandById);

/**
 * @route   POST /api/admin/brands
 * @desc    Create new brand
 * @access  Private/Admin
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Brand name is required'),
    body('description').optional().trim(),
    body('logoUrl').optional().trim(),
    body('isActive').optional().isBoolean(),
    validate,
  ],
  createBrand
);

/**
 * @route   PUT /api/admin/brands/:id
 * @desc    Update brand
 * @access  Private/Admin
 */
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Brand name cannot be empty'),
    body('description').optional().trim(),
    body('logoUrl').optional().trim(),
    body('isActive').optional().isBoolean(),
    validate,
  ],
  updateBrand
);

/**
 * @route   DELETE /api/admin/brands/:id
 * @desc    Delete brand
 * @access  Private/Admin
 */
router.delete('/:id', deleteBrand);

/**
 * @route   POST /api/admin/brands/upload-logo
 * @desc    Upload brand logo
 * @access  Private/Admin
 */
router.post('/upload-logo', uploadBrand.single('logo'), uploadBrandLogo);

export default router;
