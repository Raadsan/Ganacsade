import express from 'express';

import productsRoutes from './productsRoutes.js';
import categoriesRoutes from './categoriesRoutes.js';
import advertisementsRoutes from './advertisementsRoutes.js';
import reviewsRoutes from './reviewsRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import ordersRoutes from './ordersRoutes.js';
import paymentsRoutes from './paymentsRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import addressesRoutes from './addressesRoutes.js';
import dataPackageOrdersRoutes from './dataPackageOrdersRoutes.js';
import { getCustomerHealth } from '../../controllers/customer/healthController.js';

const router = express.Router();

// Mount routes
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/advertisements', advertisementsRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/settings', settingsRoutes);
router.use('/orders', ordersRoutes);
router.use('/payments', paymentsRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/addresses', addressesRoutes);
router.use('/data-package-orders', dataPackageOrdersRoutes);

// Health check
router.get('/health', getCustomerHealth);

export default router;
