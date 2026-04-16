import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/responsive.dart';
import '../../../../shared/models/category.dart';
import '../../../home/presentation/controllers/home_controller.dart';
import '../../../home/presentation/widgets/category_card.dart';
import '../../../categories/presentation/pages/dynamic_subcategories_screen.dart';
import '../../../data_packages/models/static_data_packages_category.dart';
import '../../../data_packages/presentation/pages/data_packages_screen.dart';
import 'categories_screen.dart';

/// Screen showing the 2 main categories: Internet Services and Categories
class MainCategoriesScreen extends StatelessWidget {
  const MainCategoriesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final HomeController controller = Get.find<HomeController>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('All Categories'),
        centerTitle: true,
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: Obx(() {
          if (controller.categories.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          return Builder(
            builder: (context) {
              final sizing = context.sizing;
              final isTablet = context.isTabletOrLarger;
              
              return Center(
                child: Padding(
                  padding: EdgeInsets.all(sizing.horizontalPadding),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'home_categories'.tr,
                        style: AppTextStyles.headlineMedium.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 32),
                      // Show the 2 main categories centered
                      Wrap(
                        alignment: WrapAlignment.center,
                        spacing: 16,
                        runSpacing: 16,
                        children: controller.categories.map((category) {
                          return SizedBox(
                            width: isTablet ? 200 : 160,
                            child: CategoryCard(
                              category: category,
                              onTap: () => _onCategoryTap(category),
                            ),
                          );
                        }).toList(),
                      )
                          .animate()
                          .fadeIn(delay: 200.ms, duration: 600.ms)
                          .scale(begin: const Offset(0.8, 0.8), end: const Offset(1, 1)),
                    ],
                  ),
                ),
              );
            },
          );
        }),
      ),
    );
  }

  void _onCategoryTap(Category category) {
    // Check if this is the static Data Packages category
    if (StaticDataPackagesCategory.isDataPackagesCategory(category.id)) {
      Get.to(() => const DataPackagesScreen());
      return;
    }
    
    // Check if this is the Categories meta-category
    if (category.id == 'categories_meta') {
      // Navigate to all categories screen showing all admin categories
      Get.to(() => const CategoriesScreen());
      return;
    }
    
    // Navigate to dynamic subcategories screen
    Get.to(() => DynamicSubcategoriesScreen(category: category));
  }
}
