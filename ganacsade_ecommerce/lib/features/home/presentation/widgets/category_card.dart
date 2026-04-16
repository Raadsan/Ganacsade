import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/models/category.dart';
import '../../../data_packages/models/static_data_packages_category.dart';
import '../../../data_packages/data_packages_constants.dart';

class CategoryCard extends StatelessWidget {
  final Category category;
  final VoidCallback onTap;

  const CategoryCard({
    super.key,
    required this.category,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
            // Category Image or Icon
            Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                color: category.color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: category.color.withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(19),
                child: _buildCategoryImage(),
              ),
            )
                .animate()
                .scale(duration: 300.ms, curve: Curves.elasticOut)
                .then(delay: 100.ms)
                .shimmer(duration: 1000.ms),
            
            const SizedBox(height: 8),
            
            // Category Name
            Text(
              category.nameEn,
              style: AppTextStyles.labelSmall.copyWith(
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            
            // Product Count
            Text(
              '${category.productCount} ${category.productCount == 1 ? 'item' : 'items'}',
              style: AppTextStyles.labelSmall.copyWith(
                color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                fontSize: 10,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
    );
  }

  Widget _buildCategoryImage() {
    // If category has an image URL, show the image
    if (category.imageUrl != null && category.imageUrl!.isNotEmpty) {
      return CachedNetworkImage(
        imageUrl: category.imageUrl!,
        fit: BoxFit.cover,
        width: 70,
        height: 70,
        placeholder: (context, url) => Center(
          child: SizedBox(
            width: 24,
            height: 24,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: category.color,
            ),
          ),
        ),
        errorWidget: (context, url, error) => Center(
          child: Icon(
            _getCategoryIcon(category.type),
            color: category.color,
            size: 32,
          ),
        ),
      );
    }
    
    // Fallback to icon
    return Center(
      child: Icon(
        _getCategoryIcon(category.type),
        color: category.color,
        size: 32,
      ),
    );
  }

  IconData _getCategoryIcon(CategoryType type) {
    // Check if this is the static Data Packages category
    if (StaticDataPackagesCategory.isDataPackagesCategory(category.id)) {
      return DataPackagesConstants.categoryIcon;
    }
    
    switch (type) {
      case CategoryType.internet:
        return Icons.wifi;
      case CategoryType.gifts:
        return Icons.card_giftcard;
      case CategoryType.electronics:
        return Icons.devices;
      case CategoryType.mens:
        return Icons.man;
      case CategoryType.womens:
        return Icons.woman;
      case CategoryType.kids:
        return Icons.child_care;
      case CategoryType.cosmetics:
        return Icons.face_retouching_natural;
      case CategoryType.goods:
        return Icons.shopping_basket;
    }
  }
}
