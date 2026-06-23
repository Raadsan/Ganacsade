import express from 'express';
import { getCategories, getCategoryById } from '../../controllers/customer/categoriesController.js';

const router = express.Router();

/**
 * @route   GET /api/customer/categories
 * @access  Public
 */
router.get('/', getCategories);

/**
 * @route   GET /api/customer/categories/:id
 * @access  Public
 */
router.get('/:id', getCategoryById);

export default router;
