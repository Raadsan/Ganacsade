import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconly/iconly.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/responsive.dart';
import '../../../../shared/models/product.dart';
import '../../../../shared/models/category.dart';
import '../../presentation/pages/product_detail_screen.dart';
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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark
          ? AppColors.darkScaffoldBackground
          : const Color(0xFFFBFBFB),
      appBar: AppBar(
        
        title: const Text('Online Market'),
        centerTitle: true,
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: Obx(() {
          final categoriesToShow = controller.adminCategories;
          final featuredProducts = controller.featuredProducts;

          if (categoriesToShow.isEmpty && controller.isLoading.value) {
            return const Center(child: CircularProgressIndicator());
          }

          return CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              // EXPLORE Categories Header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'EXPLORE',
                        style: TextStyle(
                          color: AppColors.grey600,
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Categories',
                        style: AppTextStyles.headlineMedium.copyWith(
                          color: isDark
                              ? AppColors.white
                              : Colors.grey.shade500,
                          fontWeight: FontWeight.w500,
                          fontSize: 32,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Categories Grid
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 2.1,
                  ),
                  delegate: SliverChildBuilderDelegate((context, index) {
                    final category = categoriesToShow[index];
                    return _buildCategoryCard(category, index);
                  }, childCount: categoriesToShow.length),
                ),
              ),

              // CURATED Featured Services Header
              if (featuredProducts.isNotEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 40, 20, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'CURATED',
                          style: TextStyle(
                            color: AppColors.grey600,
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.5,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Featured Services',
                          style: AppTextStyles.headlineSmall.copyWith(
                            color: isDark
                                ? AppColors.white
                                : const Color(0xFF1A1A1A),
                            fontWeight: FontWeight.w900,
                            fontSize: 26,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

              // Featured Products List
              if (featuredProducts.isNotEmpty)
                SliverPadding(
                  padding: const EdgeInsets.only(bottom: 30),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final product = featuredProducts[index];
                      return _buildFeaturedServiceCard(product, isDark);
                    }, childCount: featuredProducts.length),
                  ),
                ),

              if (featuredProducts.isEmpty && !controller.isLoading.value)
                const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
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
                if (StaticDataPackagesCategory.isDataPackagesCategory(
                  category.id,
                )) {
                  Get.to(() => const DataPackagesScreen());
                  return;
                }
                Get.to(() => DynamicSubcategoriesScreen(category: category));
              },
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isDark
                      ? AppColors.darkCardBackground
                      : AppColors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: (isDark ? Colors.white24 : AppColors.grey300)
                        .withOpacity(0.5),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.white10
                            : const Color(0xFFF5F5F7),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child:
                          category.imageUrl != null &&
                              category.imageUrl!.isNotEmpty
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: Image.network(
                                category.imageUrl!,
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) =>
                                    Icon(
                                      _getCategoryIcon(
                                        category.type,
                                        categoryId: category.id,
                                      ),
                                      size: 24,
                                      color: category.color,
                                    ),
                              ),
                            )
                          : Icon(
                              _getCategoryIcon(
                                category.type,
                                categoryId: category.id,
                              ),
                              size: 24,
                              color: category.color,
                            ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        category.nameEn,
                        style: AppTextStyles.titleSmall.copyWith(
                          color: isDark
                              ? AppColors.white
                              : const Color(0xFF1A1A1A),
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            )
            .animate(delay: Duration(milliseconds: index * 50))
            .fadeIn(duration: 400.ms)
            .slideX(begin: 0.1, end: 0);
      },
    );
  }

  Widget _buildFeaturedServiceCard(Product product, bool isDark) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      height: 220,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardBackground : AppColors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: (isDark ? Colors.white10 : AppColors.grey200),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Row(
          children: [
            // Left content
            Expanded(
              flex: 5,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF8CC63F),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'PREMIUM',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      product.name,
                      style: AppTextStyles.headlineSmall.copyWith(
                        color: const Color(0xFF1A237E),
                        fontWeight: FontWeight.w900,
                        fontSize: 20,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      product.description,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.grey600,
                        fontSize: 12,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () =>
                          Get.to(() => ProductDetailScreen(product: product)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1A237E),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 12,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Explore Now',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Right image
            Expanded(
              flex: 4,
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFFE8F5E9), Color(0xFFC8E6C9)],
                  ),
                ),
                child:
                    product.images.isNotEmpty &&
                        product.images[0] != 'placeholder'
                    ? Image.network(
                        product.images[0],
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Center(
                          child: Icon(
                            Icons.image_outlined,
                            size: 60,
                            color: AppColors.primaryGreen.withOpacity(0.3),
                          ),
                        ),
                      )
                    : Center(
                        child: Icon(
                          Icons.image_outlined,
                          size: 60,
                          color: AppColors.primaryGreen.withOpacity(0.3),
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.1, end: 0);
  }

  IconData _getCategoryIcon(CategoryType type, {String? categoryId}) {
    if (categoryId != null &&
        StaticDataPackagesCategory.isDataPackagesCategory(categoryId)) {
      return DataPackagesConstants.categoryIcon;
    }
    switch (type) {
      case CategoryType.internet:
        return IconlyBold.discovery;
      case CategoryType.gifts:
        return IconlyBold.bag_2;
      case CategoryType.electronics:
        return IconlyBold.game;
      case CategoryType.mens:
        return IconlyBold.profile;
      case CategoryType.womens:
        return IconlyBold.user_3;
      case CategoryType.kids:
        return IconlyBold.heart;
      case CategoryType.cosmetics:
        return IconlyBold.star;
      case CategoryType.goods:
        return IconlyBold.bag;
    }
  }
}
