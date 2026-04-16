import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/responsive.dart';
import '../../../../shared/models/product.dart';
import '../../../../shared/widgets/advertisement_banner.dart';
import '../widgets/category_card.dart';
import '../widgets/featured_product_card.dart';
import '../widgets/home_app_bar.dart';
import '../widgets/promotional_banner.dart';
import '../controllers/home_controller.dart';
import '../../../products/presentation/pages/main_categories_screen.dart';
import '../../../../shared/widgets/skeleton_loader.dart';
import '../../../products/presentation/pages/product_detail_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final HomeController controller = Get.put(HomeController());

    return Scaffold(
      body: SafeArea(
        child: Obx(() {
          // Show skeleton while initially loading
          if (controller.isLoading.value &&
              controller.categories.isEmpty &&
              controller.featuredProducts.isEmpty) {
            return const HomeScreenSkeleton();
          }

          // Show connection error with retry button
          if (controller.hasConnectionError.value && 
              controller.categories.isEmpty && 
              controller.featuredProducts.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.cloud_off,
                      size: 80,
                      color: AppColors.grey400,
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Cannot connect to server',
                      style: AppTextStyles.titleLarge.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Please make sure the backend server is running',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.grey600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: controller.isLoading.value 
                          ? null 
                          : controller.retryConnection,
                      icon: controller.isLoading.value
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.refresh),
                      label: Text(
                        controller.isLoading.value ? 'Connecting...' : 'Retry Connection'
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 32,
                          vertical: 16,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }
          
          // Show normal content
          return RefreshIndicator(
            onRefresh: controller.refreshData,
            child: CustomScrollView(
              slivers: [
                // Custom App Bar
                const SliverToBoxAdapter(
                  child: HomeAppBar(),
                ),
              
              // Promotional Banners
              SliverToBoxAdapter(
                child: _buildPromotionalSection(controller),
              ),
              
              // Categories Section
              SliverToBoxAdapter(
                child: _buildCategoriesSection(controller),
              ),
              
              // Home Banner Advertisement (between categories and featured products)
              const SliverToBoxAdapter(
                child: AdvertisementBanner(
                  placement: 'home_banner',
                  height: 120,
                  margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                ),
              ),
              
              // Featured Products Section
              SliverToBoxAdapter(
                child: _buildFeaturedProductsSection(controller),
              ),
              
              // Flash Sales Section (only show if there are active flash sale products)
              SliverToBoxAdapter(
                child: Obx(() => controller.flashSaleProducts.isNotEmpty
                    ? _buildFlashSalesSection(controller)
                    : const SizedBox.shrink()),
              ),
              
              // Recently Viewed Section
              SliverToBoxAdapter(
                child: _buildRecentlyViewedSection(controller),
              ),
              
              // Bottom Padding
              const SliverToBoxAdapter(
                child: SizedBox(height: 100),
              ),
            ],
          ),
        );
        }),
      ),
    );
  }

  Widget _buildPromotionalSection(HomeController controller) {
    return Builder(
      builder: (context) {
        final sizing = context.sizing;
        return Container(
          height: sizing.bannerHeight,
          margin: EdgeInsets.symmetric(vertical: sizing.verticalPadding),
          child: Obx(() => PageView.builder(
            controller: controller.bannerPageController,
            itemCount: controller.promotionalBanners.length,
            onPageChanged: controller.onBannerPageChanged,
            itemBuilder: (context, index) {
              final banner = controller.promotionalBanners[index];
              return Padding(
                padding: EdgeInsets.symmetric(horizontal: sizing.horizontalPadding),
                child: PromotionalBannerWidget(
                  banner: banner,
                  onTap: () => controller.onBannerTap(banner),
                ),
              );
            },
          ))
              .animate()
              .fadeIn(delay: 200.ms, duration: 600.ms)
              .slideY(begin: 0.3, end: 0),
        );
      },
    );
  }

  Widget _buildCategoriesSection(HomeController controller) {
    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        final sizing = context.sizing;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.symmetric(horizontal: sizing.horizontalPadding),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'home_categories'.tr,
                    style: AppTextStyles.headlineSmall.copyWith(
                      color: isDark ? AppColors.darkTextPrimary : null,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      Get.to(() => const MainCategoriesScreen());
                    },
                    child: Text('home_see_all'.tr),
                  ),
                ],
              ),
            )
                .animate()
                .fadeIn(delay: 400.ms, duration: 600.ms)
                .slideX(begin: -0.2, end: 0),
            
            SizedBox(height: sizing.verticalPadding),
            
            // Center the 2 main categories in a row
            Padding(
              padding: EdgeInsets.symmetric(horizontal: sizing.horizontalPadding),
              child: Obx(() => Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: controller.categories.map((category) {
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      child: CategoryCard(
                        category: category,
                        onTap: () => controller.onCategoryTap(category),
                      ),
                    ),
                  );
                }).toList(),
              ))
                  .animate()
                  .fadeIn(delay: 600.ms, duration: 600.ms),
            ),
          ],
        );
      },
    );
  }

  Widget _buildFeaturedProductsSection(HomeController controller) {
    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        final sizing = context.sizing;
        final isTablet = context.isTabletOrLarger;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: sizing.verticalPadding * 2),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: sizing.horizontalPadding),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'home_featured'.tr,
                    style: AppTextStyles.headlineSmall.copyWith(
                      color: isDark ? AppColors.darkTextPrimary : null,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      controller.onSeeAllFeaturedProducts();
                    },
                    child: Text('home_see_all'.tr),
                  ),
                ],
              ),
            )
                .animate()
                .fadeIn(delay: 800.ms, duration: 600.ms)
                .slideX(begin: -0.2, end: 0),
            
            SizedBox(height: sizing.verticalPadding),
            
            // Use grid for tablets, horizontal list for phones
            isTablet
                ? Padding(
                    padding: EdgeInsets.symmetric(horizontal: sizing.horizontalPadding),
                    child: Obx(() => GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: sizing.productGridCount,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 0.68,
                      ),
                      itemCount: controller.featuredProducts.length,
                      itemBuilder: (context, index) {
                        return FeaturedProductCard(
                          product: controller.featuredProducts[index],
                          onTap: () => controller.onProductTap(controller.featuredProducts[index]),
                        );
                      },
                    ))
                        .animate()
                        .fadeIn(delay: 1000.ms, duration: 600.ms),
                  )
                : SizedBox(
                    height: 230,
                    child: Obx(() => ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: EdgeInsets.symmetric(horizontal: sizing.horizontalPadding),
                      itemCount: controller.featuredProducts.length,
                      itemBuilder: (context, index) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 10),
                          child: FeaturedProductCard(
                            product: controller.featuredProducts[index],
                            onTap: () => controller.onProductTap(controller.featuredProducts[index]),
                          ),
                        );
                      },
                    ))
                  .animate()
                  .fadeIn(delay: 1000.ms, duration: 600.ms),
            ),
          ],
        );
      },
    );
  }

  Widget _buildFlashSalesSection(HomeController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 32),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [AppColors.error.withOpacity(0.1), AppColors.warning.withOpacity(0.1)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.error.withOpacity(0.3)),
          ),
          child: Row(
            children: [
              Icon(
                Icons.flash_on,
                color: AppColors.error,
                size: 24,
              ),
              const SizedBox(width: 8),
              const Text(
                'Flash Sale',
                style: AppTextStyles.titleMedium,
              ),
              const Spacer(),
              Obx(() => Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.error,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  controller.flashSaleTimeLeft.value,
                  style: const TextStyle(
                    color: AppColors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              )),
            ],
          ),
        )
            .animate()
            .fadeIn(delay: 1200.ms, duration: 600.ms)
            .slideY(begin: 0.3, end: 0),
        
        const SizedBox(height: 16),
        
        SizedBox(
          height: 200,
          child: Obx(() => ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: controller.flashSaleProducts.length,
            itemBuilder: (context, index) {
              return Padding(
                padding: const EdgeInsets.only(right: 16),
                child: _buildFlashSaleCard(controller.flashSaleProducts[index]),
              );
            },
          ))
              .animate()
              .fadeIn(delay: 1400.ms, duration: 600.ms),
        ),
      ],
    );
  }

  Widget _buildFlashSaleCard(Product product) {
    final discountPercentage = ((product.price - product.discountPrice) / product.price * 100).round();
    
    return GestureDetector(
      onTap: () {
        Get.to(() => ProductDetailScreen(product: product));
      },
      child: Container(
        width: 160,
        height: 200,
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: AppColors.shadowLight,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Product Image with Flash Sale Badge
            Stack(
              children: [
                Container(
                  height: 100,
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
                
                // Flash Sale Badge
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.error,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.flash_on,
                          color: AppColors.white,
                          size: 12,
                        ),
                        const SizedBox(width: 2),
                        Text(
                          'FLASH',
                          style: TextStyle(
                            color: AppColors.white,
                            fontSize: 8,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Discount Badge
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.warning,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '$discountPercentage% OFF',
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
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    product.name,
                    style: AppTextStyles.bodyMedium.copyWith(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                    
                    // Rating
                    Row(
                      children: [
                        Icon(
                          Icons.star,
                          size: 12,
                          color: AppColors.warning,
                        ),
                        const SizedBox(width: 2),
                        Text(
                          '${product.rating}',
                          style: AppTextStyles.labelSmall.copyWith(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '(${product.reviewCount})',
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.grey600,
                            fontSize: 9,
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 6),
                    
                    // Price
                    Row(
                      children: [
                        Text(
                          '\$${product.discountPrice.toStringAsFixed(2)}',
                          style: AppTextStyles.titleSmall.copyWith(
                            color: AppColors.error,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '\$${product.price.toStringAsFixed(2)}',
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.grey600,
                            decoration: TextDecoration.lineThrough,
                            fontSize: 11,
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
    )
        .animate()
        .fadeIn(duration: 600.ms)
        .slideX(begin: 0.3, end: 0)
        .then()
        .shimmer(delay: 1000.ms, duration: 1500.ms);
  }

  Widget _buildProductImage(String imagePath) {
    // Check if it's a placeholder or invalid path
    if (imagePath == 'placeholder' || imagePath.isEmpty || imagePath.startsWith('assets/images/flash_')) {
      return _buildImagePlaceholder();
    }
    
    // Check if it's a network URL or local asset
    if (imagePath.startsWith('http')) {
      return Image.network(
        imagePath,
        fit: BoxFit.cover,
        width: double.infinity,
        errorBuilder: (context, error, stackTrace) {
          return _buildImagePlaceholder();
        },
      );
    } else {
      return Image.asset(
        imagePath,
        fit: BoxFit.cover,
        width: double.infinity,
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
            width: 40,
            height: 40,
            errorBuilder: (context, error, stackTrace) {
              return Icon(
                Icons.shopping_bag_outlined,
                size: 30,
                color: AppColors.grey400,
              );
            },
          ),
          const SizedBox(height: 4),
          Text(
            'GANACSADE',
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.primaryGreen,
              fontWeight: FontWeight.w600,
              fontSize: 8,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentlyViewedSection(HomeController controller) {
    return Obx(() {
      if (controller.recentlyViewedProducts.isEmpty) {
        return const SizedBox.shrink();
      }
      
      return Builder(builder: (context) {
          final isDark = Theme.of(context).brightness == Brightness.dark;
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 32),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  'Recently Viewed',
                  style: AppTextStyles.headlineSmall.copyWith(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  ),
                ),
              ),
              
              const SizedBox(height: 16),
              
              SizedBox(
                height: 200,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: controller.recentlyViewedProducts.length,
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: const EdgeInsets.only(right: 16),
                      child: _buildRecentlyViewedCard(controller.recentlyViewedProducts[index], isDark),
                    );
                  },
                ),
              ),
            ],
          );
        });
    })
        .animate()
        .fadeIn(delay: 1600.ms, duration: 600.ms);
  }

  Widget _buildRecentlyViewedCard(Product product, bool isDark) {
    final hasDiscount = product.discountPrice < product.price;
    
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          HapticFeedback.lightImpact();
          Get.to(() => ProductDetailScreen(product: product));
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: 140,
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCardBackground : AppColors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: isDark ? Colors.black26 : AppColors.shadowLight,
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product Image with Recently Viewed Badge
              Stack(
                children: [
                  Container(
                    height: 100,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkElevatedSurface : AppColors.grey100,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                    ),
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                      child: _buildProductImage(product.mainImage),
                    ),
                  ),
                  
                  // Recently Viewed Badge
                  Positioned(
                    top: 6,
                    left: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primaryGreen.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.history,
                            color: AppColors.white,
                            size: 10,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            'RECENT',
                            style: TextStyle(
                              color: AppColors.white,
                              fontSize: 7,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  // Discount Badge
                  if (hasDiscount)
                    Positioned(
                      top: 6,
                      right: 6,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.error,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '${(((product.price - product.discountPrice) / product.price) * 100).round()}%',
                          style: TextStyle(
                            color: AppColors.white,
                            fontSize: 7,
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
                  padding: const EdgeInsets.all(10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        product.name,
                        style: AppTextStyles.bodySmall.copyWith(
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      
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
                              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(width: 2),
                          Text(
                            '(${product.reviewCount})',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: isDark ? AppColors.darkTextSecondary : AppColors.grey600,
                              fontSize: 8,
                            ),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 4),
                      
                      // Price
                      if (hasDiscount)
                        Row(
                          children: [
                            Text(
                              '\$${product.discountPrice.toStringAsFixed(2)}',
                              style: AppTextStyles.priceText.copyWith(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '\$${product.price.toStringAsFixed(2)}',
                              style: AppTextStyles.labelSmall.copyWith(
                                color: isDark ? AppColors.darkTextSecondary : AppColors.grey600,
                                decoration: TextDecoration.lineThrough,
                                decorationColor: isDark ? AppColors.darkTextSecondary : AppColors.grey600,
                                fontSize: 10,
                              ),
                            ),
                          ],
                        )
                      else
                        Text(
                          '\$${product.price.toStringAsFixed(2)}',
                          style: AppTextStyles.priceText.copyWith(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
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
        .slideX(begin: 0.3, end: 0)
        .then()
        .shimmer(delay: 800.ms, duration: 1200.ms);
  }
}
