import express from 'express';
import { authenticate } from '../../middlewares/auth.js';
import {
  createAddress,
  deleteAddress,
  getAddressById,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from '../../controllers/customer/addressesController.js';

const router = express.Router();

/**
 * @route   GET /api/customer/addresses
 * @access  Private
 */
router.get('/', authenticate, getAddresses);

/**
 * @route   GET /api/customer/addresses/:id
 * @access  Private
 */
router.get('/:id', authenticate, getAddressById);

/**
 * @route   POST /api/customer/addresses
 * @access  Private
 */
router.post('/', authenticate, createAddress);

/**
 * @route   PUT /api/customer/addresses/:id
 * @access  Private
 */
router.put('/:id', authenticate, updateAddress);

/**
 * @route   DELETE /api/customer/addresses/:id
 * @access  Private
 */
router.delete('/:id', authenticate, deleteAddress);

/**
 * @route   PUT /api/customer/addresses/:id/set-default
 * @access  Private
 */
router.put('/:id/set-default', authenticate, setDefaultAddress);

export default router;
