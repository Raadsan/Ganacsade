const express = require('express');

const router = express.Router();

// Import customer route modules
const productsRoutes = require('./products.routes');
const categoriesRoutes = require('./categories.routes');
const advertisementsRoutes = require('./advertisements.routes');
const reviewsRoutes = require('./reviews.routes');
const settingsRoutes = require('./settings.routes');
const ordersRoutes = require('./orders.routes');
const paymentsRoutes = require('./payments.routes');
const wishlistRoutes = require('./wishlist.routes');
const addressesRoutes = require('./addresses.routes');
const dataPackageOrdersRoutes = require('./data-package-orders.routes');
// const cartRoutes = require('./cart.routes');

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
// router.use('/cart', cartRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Customer API routes - Active',
  });
});

module.exports = router;
