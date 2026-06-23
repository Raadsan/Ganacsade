import express from 'express';
import {
  getAdvertisements,
  recordAdvertisementClick,
  recordAdvertisementView,
} from '../../controllers/customer/advertisementsController.js';

const router = express.Router();

/**
 * @route   GET /api/customer/advertisements
 * @access  Public
 */
router.get('/', getAdvertisements);

/**
 * @route   POST /api/customer/advertisements/:id/view
 * @access  Public
 */
router.post('/:id/view', recordAdvertisementView);

/**
 * @route   POST /api/customer/advertisements/:id/click
 * @access  Public
 */
router.post('/:id/click', recordAdvertisementClick);

export default router;
