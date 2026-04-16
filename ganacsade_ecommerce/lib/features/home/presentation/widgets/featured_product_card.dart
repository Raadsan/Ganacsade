import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/models/product.dart';

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
    final isInStock = product.inStock;
    final isTablet = MediaQuery.of(context).size.width >= 600;
    
    // Responsive dimensions - more compact
    final imageHeight = isTablet ? 95.0 : 85.0;
    final cardWidth = isTablet ? 155.0 : 140.0;
    
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: isInStock ? () {
          HapticFeedback.lightImpact();
          onTap();
        } : () {
          HapticFeedback.lightImpact();
          Get.snackbar(
            'Out of Stock',
            '${product.name} is currently unavailable',
            backgroundColor: AppColors.error.withOpacity(0.8),
            colorText: AppColors.white,
            snackPosition: SnackPosition.BOTTOM,
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: cardWidth,
          decoration: BoxDecoration(
            color: isInStock ? (isDark ? AppColors.darkCardBackground : AppColors.white) : AppColors.grey50,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: AppColors.shadowLight,
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
            border: !isInStock ? Border.all(
              color: AppColors.grey300,
              width: 1,
            ) : null,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product Image
              Stack(
                children: [
                  Container(
                    height: imageHeight,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.grey100,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                    ),
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                      child: _buildProductImage(product.mainImage),
                    ),
                  ),
                  
                  // Discount Badge
                  if (hasDiscount)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.error,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${product.discountPercentage.round()}% OFF',
                          style: const TextStyle(
                            color: AppColors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  
                  // Out of Stock Badge
                  if (!isInStock)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.grey600,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'OUT OF STOCK',
                          style: TextStyle(
                            color: AppColors.white,
                            fontSize: 8,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              
              // Product Details
              Expanded(
                child: Padding(
                  padding: EdgeInsets.all(isTablet ? 8 : 6),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product.name,
                        style: AppTextStyles.bodyMedium.copyWith(
                          fontWeight: FontWeight.w600,
                          fontSize: isTablet ? 12.5 : 11.5,
                          color: isInStock ? (isDark ? AppColors.darkTextPrimary : AppColors.grey900) : AppColors.grey500,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      
                      // Rating
                      Row(
                        children: [
                          Icon(
                            Icons.star,
                            size: 10,
                            color: AppColors.warning,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            '${product.rating}',
                            style: AppTextStyles.labelSmall.copyWith(
                              fontSize: 9,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 2),
                          Text(
                            '(${product.reviewCount})',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.grey600,
                              fontSize: 8,
                            ),
                          ),
                        ],
                      ),
                      
                      const Spacer(),
                      
                      // Price
                      if (hasDiscount)
                        Row(
                          children: [
                            Text(
                              '\$${product.finalPrice.toStringAsFixed(2)}',
                              style: AppTextStyles.titleSmall.copyWith(
                                color: isInStock ? AppColors.primaryGreen : AppColors.grey500,
                                fontWeight: FontWeight.bold,
                                fontSize: isTablet ? 13 : 12.5,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '\$${product.price.toStringAsFixed(2)}',
                              style: AppTextStyles.labelSmall.copyWith(
                                color: AppColors.grey600,
                                decoration: TextDecoration.lineThrough,
                                fontSize: isTablet ? 10 : 9.5,
                              ),
                            ),
                          ],
                        )
                      else
                        Text(
                          '\$${product.price.toStringAsFixed(2)}',
                          style: AppTextStyles.titleSmall.copyWith(
                            color: isInStock ? AppColors.primaryGreen : AppColors.grey500,
                            fontWeight: FontWeight.bold,
                            fontSize: isTablet ? 13 : 12.5,
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    )
        .animate()
        .fadeIn(duration: 600.ms)
        .slideY(begin: 0.3, end: 0);
  }
}
