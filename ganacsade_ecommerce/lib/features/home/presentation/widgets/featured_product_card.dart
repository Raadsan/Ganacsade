import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import 'package:iconly/iconly.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/models/product.dart';
import '../../../wishlist/presentation/controllers/wishlist_controller.dart';

class FeaturedProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback onTap;

  const FeaturedProductCard({
    super.key,
    required this.product,
    required this.onTap,
  });

  Widget _buildProductImage(String imagePath) {
    // Check if it's a placeholder or invalid path
    if (imagePath == 'placeholder' || imagePath.isEmpty) {
      return _buildImagePlaceholder();
    }

    // Check if it's a network URL or local asset
    if (imagePath.startsWith('http')) {
      return Image.network(
        imagePath,
        width: double.infinity,
        height: double.infinity,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return _buildImagePlaceholder();
        },
      );
    } else {
      return Image.asset(
        imagePath,
        width: double.infinity,
        height: double.infinity,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return _buildImagePlaceholder();
        },
      );
    }
  }

  Widget _buildImagePlaceholder() {
    return Container(
      width: double.infinity,
      height: double.infinity,
      color: AppColors.grey100,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            'assets/logos/GANACSADE LOGO-06.png',
            width: 80,
            height: 80,
            errorBuilder: (context, error, stackTrace) {
              return Icon(
                Icons.shopping_bag_outlined,
                size: 60,
                color: AppColors.grey400,
              );
            },
          ),
          const SizedBox(height: 8),
          Text(
            'GANACSADE',
            style: AppTextStyles.labelMedium.copyWith(
              color: AppColors.primaryGreen,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final hasDiscount = product.hasDiscount;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 170,
        margin: const EdgeInsets.fromLTRB(4, 0, 4, 16),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCardBackground : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(4),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black26 : AppColors.shadowLight,
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image area with soft background and heart button
            Stack(
              children: [
                Container(
                  height: 140,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: isDark
                        ? Colors.white.withOpacity(0.05)
                        : const Color(0xFFF5F5F7),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: _buildProductImage(product.mainImage),
                      ),
                    ),
                  ),
                ),
                // Wishlist Toggle
                Positioned(
                  top: 8,
                  right: 8,
                  child: Obx(() {
                    final wishlistController = Get.find<WishlistController>();
                    final isInWishlist = wishlistController.isInWishlist(
                      product.id,
                    );

                    return GestureDetector(
                      onTap: () async {
                        await wishlistController.toggleWishlist(product);
                        final newStatus = wishlistController.isInWishlist(
                          product.id,
                        );

                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              newStatus
                                  ? '${product.name} added to wishlist'
                                  : '${product.name} removed from wishlist',
                            ),
                            backgroundColor: newStatus
                                ? AppColors.primaryGreen
                                : AppColors.error,
                            behavior: SnackBarBehavior.floating,
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      },
                      child: Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: isDark
                              ? Colors.black26
                              : Colors.white.withOpacity(0.9),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Icon(
                          isInWishlist ? IconlyBold.heart : IconlyLight.heart,
                          size: 18,
                          color: isInWishlist
                              ? AppColors.error
                              : (isDark
                                    ? AppColors.grey400
                                    : const Color(0xFF9E9E9E)),
                        ),
                      ),
                    );
                  }),
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Product Info
            Text(
              product.name,
              style: AppTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.w700,
                fontSize: 14,
                color: isDark
                    ? AppColors.darkTextPrimary
                    : const Color(0xFF1A1A1A),
                height: 1.2,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            // Price and Rating Row
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (hasDiscount)
                        Text(
                          '\$${product.price.toStringAsFixed(2)}',
                          style: TextStyle(
                            color: isDark
                                ? AppColors.grey600
                                : const Color(0xFFBDBDBD),
                            decoration: TextDecoration.lineThrough,
                            fontSize: 11,
                          ),
                        ),
                      const SizedBox(height: 2),
                      Text(
                        '\$${product.finalPrice.toStringAsFixed(2)}',
                        style: TextStyle(
                          color: AppColors.primaryGreen,
                          fontWeight: FontWeight.w900,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
                // Rating
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFB300).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        IconlyBold.star,
                        color: Color(0xFFFFB300),
                        size: 12,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        product.rating.toString(),
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                          color: isDark
                              ? AppColors.darkTextPrimary
                              : const Color(0xFF424242),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0);
  }
}
