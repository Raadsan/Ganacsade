import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/models/product.dart';
import '../../../cart/presentation/controllers/cart_controller.dart';
import '../../../navigation/navigation_controller.dart';
import '../../../products/presentation/pages/product_detail_screen.dart';
import '../controllers/wishlist_controller.dart';

class WishlistScreen extends StatelessWidget {
  const WishlistScreen({super.key});

  void _goHome() {
    if (Get.isRegistered<NavigationController>()) {
      Get.find<NavigationController>().changeIndex(0);
    }
  }

  @override
  Widget build(BuildContext context) {
    final WishlistController controller = Get.find<WishlistController>();
    final CartController cartController = Get.find<CartController>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          isDark ? AppColors.darkScaffoldBackground : AppColors.grey50,
      appBar: AppBar(
        title: Text('wishlist_title'.tr),
        backgroundColor:
            isDark ? AppColors.darkCardBackground : AppColors.primaryGreen,
        foregroundColor: isDark ? AppColors.darkTextPrimary : AppColors.white,
        elevation: 0,
        centerTitle: true,
        actions: [
          Obx(
            () => controller.wishlistItems.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.delete_outline),
                    onPressed: () => _showClearDialog(context, controller),
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.primaryGreen),
          );
        }

        if (controller.wishlistItems.isEmpty) {
          return _buildEmptyWishlist(isDark);
        }

        return RefreshIndicator(
          onRefresh: () => controller.loadWishlist(),
          color: AppColors.primaryGreen,
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: controller.wishlistItems.length,
            itemBuilder: (context, index) {
              final product = controller.wishlistItems[index];
              return _buildWishlistItem(
                context,
                product,
                controller,
                cartController,
                index,
                isDark,
              );
            },
          ),
        );
      }),
    );
  }

  Widget _buildEmptyWishlist(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: isDark
                      ? AppColors.primaryGreen.withOpacity(0.15)
                      : AppColors.primaryGreen.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.favorite_outline,
                  size: 60,
                  color: isDark
                      ? AppColors.primaryGreen.withOpacity(0.9)
                      : AppColors.primaryGreen,
                ),
              )
              .animate()
              .scale(duration: 600.ms, curve: Curves.elasticOut)
              .then(delay: 200.ms)
              .shake(duration: 500.ms),
          const SizedBox(height: 24),
          Text(
                'wishlist_empty'.tr,
                style: AppTextStyles.headlineMedium.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isDark
                      ? AppColors.darkTextPrimary
                      : AppColors.grey700,
                ),
              )
              .animate()
              .fadeIn(delay: 400.ms, duration: 600.ms)
              .slideY(begin: 0.3, end: 0),
          const SizedBox(height: 8),
          Text(
                'wishlist_empty_desc'.tr,
                style: AppTextStyles.bodyLarge.copyWith(
                  color: isDark
                      ? AppColors.darkTextSecondary
                      : AppColors.grey600,
                ),
                textAlign: TextAlign.center,
              )
              .animate()
              .fadeIn(delay: 600.ms, duration: 600.ms)
              .slideY(begin: 0.3, end: 0),
          const SizedBox(height: 32),
          ElevatedButton(
                onPressed: _goHome,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: AppColors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 16,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text('nav_home'.tr),
              )
              .animate()
              .fadeIn(delay: 800.ms, duration: 600.ms)
              .slideY(begin: 0.3, end: 0),
        ],
      ),
    );
  }

  Widget _buildWishlistItem(
    BuildContext context,
    Product product,
    WishlistController controller,
    CartController cartController,
    int index,
    bool isDark,
  ) {
    return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCardBackground : AppColors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: isDark ? Colors.black26 : AppColors.shadowLight,
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: InkWell(
            onTap: () {
              HapticFeedback.lightImpact();
              Get.to(() => ProductDetailScreen(product: product));
            },
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      product.imageUrl,
                      width: 100,
                      height: 100,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        width: 100,
                        height: 100,
                        color: isDark
                            ? AppColors.darkElevatedSurface
                            : AppColors.grey200,
                        child: Icon(
                          Icons.image_not_supported,
                          color: isDark
                              ? AppColors.darkTextSecondary
                              : AppColors.grey500,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.name,
                          style: AppTextStyles.titleMedium.copyWith(
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? AppColors.darkTextPrimary
                                : AppColors.textPrimary,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        if (product.discountPrice != null &&
                            product.discountPrice! > 0)
                          Row(
                            children: [
                              Text(
                                '\$${product.discountPrice!.toStringAsFixed(2)}',
                                style: AppTextStyles.titleMedium.copyWith(
                                  color: AppColors.primaryGreen,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                '\$${product.price.toStringAsFixed(2)}',
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: isDark
                                      ? AppColors.darkTextSecondary
                                      : AppColors.grey500,
                                  decoration: TextDecoration.lineThrough,
                                ),
                              ),
                            ],
                          )
                        else
                          Text(
                            '\$${product.price.toStringAsFixed(2)}',
                            style: AppTextStyles.titleMedium.copyWith(
                              color: AppColors.primaryGreen,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: product.inStock
                                    ? () {
                                        HapticFeedback.lightImpact();
                                        cartController.addToCart(product, 1);
                                      }
                                    : null,
                                icon: const Icon(
                                  Icons.shopping_cart_outlined,
                                  size: 18,
                                ),
                                label: Text(
                                  'wishlist_add_to_cart'.tr,
                                  style: const TextStyle(fontSize: 12),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primaryGreen,
                                  foregroundColor: AppColors.white,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 8,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              onPressed: () {
                                HapticFeedback.lightImpact();
                                controller.removeFromWishlist(product.id);
                              },
                              icon: const Icon(Icons.delete_outline),
                              color: AppColors.error,
                              style: IconButton.styleFrom(
                                backgroundColor: AppColors.error.withOpacity(
                                  0.1,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        )
        .animate()
        .fadeIn(delay: (100 * index).ms, duration: 400.ms)
        .slideX(begin: 0.2, end: 0);
  }

  void _showClearDialog(BuildContext context, WishlistController controller) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor:
            isDark ? AppColors.darkCardBackground : AppColors.white,
        title: Text(
          'wishlist_clear_all'.tr,
          style: TextStyle(
            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
          ),
        ),
        content: Text(
          'wishlist_cleared_desc'.tr,
          style: TextStyle(
            color: isDark
                ? AppColors.darkTextSecondary
                : AppColors.textSecondary,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: Text(
              'cancel'.tr,
              style: TextStyle(
                color: isDark
                    ? AppColors.darkTextSecondary
                    : AppColors.grey600,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(dialogContext).pop();
              controller.clearWishlist();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: AppColors.white,
            ),
            child: Text('wishlist_clear_all'.tr),
          ),
        ],
      ),
    );
  }
}
