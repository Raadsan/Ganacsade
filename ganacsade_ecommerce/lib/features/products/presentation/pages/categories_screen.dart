import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/responsive.dart';
import '../../../../shared/models/category.dart';
import '../../../home/presentation/controllers/home_controller.dart';
import '../../../categories/presentation/pages/dynamic_subcategories_screen.dart';
import '../../../data_packages/models/static_data_packages_category.dart';
import '../../../data_packages/data_packages_constants.dart';
import '../../../data_packages/presentation/pages/data_packages_screen.dart';

class CategoriesScreen extends StatelessWidget {
  const CategoriesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final HomeController controller = Get.find<HomeController>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Online Market'),
        centerTitle: true,
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: Obx(() {
          // Show admin categories instead of main categories
          final categoriesToShow = controller.adminCategories;
          
          if (categoriesToShow.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          return Builder(
            builder: (context) {
              final sizing = context.sizing;
              return Padding(
                padding: EdgeInsets.all(sizing.horizontalPadding),
                child: GridView.builder(
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: sizing.categoryGridCount,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 0.85,
                  ),
                  itemCount: categoriesToShow.length,
                  itemBuilder: (context, index) {
                    final category = categoriesToShow[index];
                    return _buildCategoryCard(category, index);
                  },
                ),
              );
            },
          );
        }),
      ),
    );
  }

  Widget _buildCategoryCard(Category category, int index) {
    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return GestureDetector(
          onTap: () {
            // Check if this is the static Data Packages category
            if (StaticDataPackagesCategory.isDataPackagesCategory(category.id)) {
              Get.to(() => const DataPackagesScreen());
              return;
            }
            Get.to(() => DynamicSubcategoriesScreen(category: category));
          },
          child: Container(
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkCardBackground : AppColors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppColors.shadowLight,
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: category.color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: category.imageUrl != null && category.imageUrl!.isNotEmpty
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(20),
                          child: Image.network(
                            category.imageUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Icon(
                                _getCategoryIcon(category.type, categoryId: category.id),
                                size: 40,
                                color: category.color,
                              );
                            },
                          ),
                        )
                      : Icon(
                          _getCategoryIcon(category.type, categoryId: category.id),
                          size: 40,
                          color: category.color,
                        ),
                ),
                const SizedBox(height: 16),
                Text(
                  category.nameEn,
                  style: AppTextStyles.titleSmall.copyWith(
                    color: isDark ? AppColors.darkTextPrimary : null,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                Text(
                  '${category.productCount} items',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        )
            .animate(delay: Duration(milliseconds: index * 100))
            .fadeIn(duration: 600.ms)
            .slideY(begin: 0.3, end: 0);
      },
    );
  }

  IconData _getCategoryIcon(CategoryType type, {String? categoryId}) {
    // Check if this is the static Data Packages category
    if (categoryId != null && StaticDataPackagesCategory.isDataPackagesCategory(categoryId)) {
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
