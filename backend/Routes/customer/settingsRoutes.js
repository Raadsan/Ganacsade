import express from 'express';
import { getPublicSettings } from '../../controllers/customer/settingsController.js';

const router = express.Router();

/**
 * @route   GET /api/customer/settings/public
 * @access  Public
 */
router.get('/public', getPublicSettings);

export default router;
