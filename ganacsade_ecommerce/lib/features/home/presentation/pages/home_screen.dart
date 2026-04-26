import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:ganacsade/features/data_packages/presentation/pages/data_packages_screen.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/responsive.dart';
import '../../../../shared/models/product.dart';
import '../../../../shared/widgets/advertisement_banner.dart';
import '../widgets/category_card.dart';
import 'package:iconly/iconly.dart';
import '../widgets/featured_product_card.dart';
import '../widgets/home_app_bar.dart';
import '../widgets/promotional_banner.dart';
import '../controllers/home_controller.dart';
import '../../../products/presentation/pages/main_categories_screen.dart';
import '../../../../shared/widgets/skeleton_loader.dart';
import '../../../wishlist/presentation/controllers/wishlist_controller.dart';
import '../../../products/presentation/pages/product_detail_screen.dart';
import '../../../products/presentation/pages/categories_screen.dart';

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
                    Icon(Icons.cloud_off, size: 80, color: AppColors.grey400),
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
                          : const Icon(IconlyLight.arrow_right_circle),
                      label: Text(
                        controller.isLoading.value
                            ? 'Connecting...'
                            : 'Retry Connection',
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryBlue,
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
                const SliverToBoxAdapter(child: HomeAppBar()),

                // Categories Section
                SliverToBoxAdapter(child: _buildCategoriesSection(controller)),

                // Promotional Banners
                SliverToBoxAdapter(child: _buildPromotionalSection(controller)),

                // Home Banner Advertisement (between categories and featured products)
                const SliverToBoxAdapter(
                  child: AdvertisementBanner(
                    placement: 'home_banner',
                    height: 140,
                    margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                ),

                // Flash Sales Section (only show if there are active flash sale products)
                SliverToBoxAdapter(
                  child: Obx(
                    () => controller.flashSaleProducts.isNotEmpty
                        ? _buildFlashSalesSection(controller)
                        : const SizedBox.shrink(),
                  ),
                ),

                // Featured Products Section
                SliverToBoxAdapter(
                  child: _buildFeaturedProductsSection(controller),
                ),

                // Recently Viewed Section
                SliverToBoxAdapter(
                  child: _buildRecentlyViewedSection(context, controller),
                ),

                // Bottom Padding
                const SliverToBoxAdapter(child: SizedBox(height: 100)),
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
          child:
              Obx(
                    () => PageView.builder(
                      controller: controller.bannerPageController,
                      itemCount: controller.promotionalBanners.length,
                      onPageChanged: controller.onBannerPageChanged,
                      itemBuilder: (context, index) {
                        final banner = controller.promotionalBanners[index];
                        return Padding(
                          padding: EdgeInsets.symmetric(
                            horizontal: sizing.horizontalPadding,
                          ),
                          child: PromotionalBannerWidget(
                            banner: banner,
                            onTap: () => controller.onBannerTap(banner),
                          ),
                        );
                      },
                    ),
                  )
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
                  padding: EdgeInsets.symmetric(
                    horizontal: sizing.horizontalPadding,
                  ),
                  child: Text(
                    'Our Services',
                    style: AppTextStyles.headlineSmall.copyWith(
                      fontWeight: FontWeight.bold,
                      fontSize: 22,
                      color: isDark
                          ? AppColors.darkTextPrimary
                          : AppColors.textPrimary,
                    ),
                  ),
                )
                .animate()
                .fadeIn(delay: 400.ms, duration: 600.ms)
                .slideX(begin: -0.2, end: 0),

            SizedBox(height: sizing.verticalPadding),

            Padding(
              padding: EdgeInsets.symmetric(
                horizontal: sizing.horizontalPadding,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _buildCategoryPill(
                      label: 'Internet Services',
                      icon: Icons.wifi,
                      color: Colors.green.withOpacity(0.1),
                      textColor: Colors.green.shade700,
                      onTap: () => Get.to(() => const DataPackagesScreen()),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildCategoryPill(
                      label: 'Online Market',
                      icon: IconlyBold.bag,
                      color: Colors.blue.withOpacity(0.1),
                      textColor: Colors.blue.shade700,
                      onTap: () => Get.to(() => const CategoriesScreen()),
                    ),
                  ),
                ],
              ),
            ).animate().fadeIn(delay: 600.ms, duration: 600.ms),
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
                  padding: EdgeInsets.symmetric(
                    horizontal: sizing.horizontalPadding,
                  ),
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
                    padding: EdgeInsets.symmetric(
                      horizontal: sizing.horizontalPadding,
                    ),
                    child: Obx(
                      () => GridView.builder(
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
                            onTap: () => controller.onProductTap(
                              controller.featuredProducts[index],
                            ),
                          );
                        },
                      ),
                    ).animate().fadeIn(delay: 1000.ms, duration: 600.ms),
                  )
                : SizedBox(
                    height: 280,
                    child: Obx(
                      () => ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: EdgeInsets.symmetric(
                          horizontal: sizing.horizontalPadding,
                        ),
                        itemCount: controller.featuredProducts.length,
                        itemBuilder: (context, index) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 10),
                            child: FeaturedProductCard(
                              product: controller.featuredProducts[index],
                              onTap: () => controller.onProductTap(
                                controller.featuredProducts[index],
                              ),
                            ),
                          );
                        },
                      ),
                    ).animate().fadeIn(delay: 1000.ms, duration: 600.ms),
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
        const SizedBox(height: 12),
        Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Text(
                    'Flash Sale',
                    style: AppTextStyles.headlineSmall.copyWith(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Obx(
                    () => Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFF9800), // More vibrant orange
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFFF9800).withOpacity(0.2),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.bolt, color: Colors.white, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            controller.flashSaleTimeLeft.value,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: () {},
                    child: Text(
                      'home_see_all'.tr,
                      style: const TextStyle(
                        color: Color.fromARGB(255, 233, 98, 91),
                      ),
                    ),
                  ),
                ],
              ),
            )
            .animate()
            .fadeIn(delay: 1200.ms, duration: 600.ms)
            .slideY(begin: 0.3, end: 0),

        const SizedBox(height: 16),

        SizedBox(
          height: 250,
          child: Obx(
            () => ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: controller.flashSaleProducts.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.only(right: 16),
                  child: _buildFlashSaleCard(
                    context,
                    controller.flashSaleProducts[index],
                  ),
                );
              },
            ),
          ).animate().fadeIn(delay: 1400.ms, duration: 600.ms),
        ),
      ],
    );
  }

  Widget _buildCategoryPill({
    required String label,
    required Color color,
    required Color textColor,
    required VoidCallback onTap,
    required IconData icon,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 100, // Fixed height for balance
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color,
          border: Border.all(color: textColor.withOpacity(0.3), width: 1.5),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: textColor, size: 32),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color: textColor,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFlashSaleCard(BuildContext context, Product product) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
          onTap: () {
            Get.to(() => ProductDetailScreen(product: product));
          },
          child: Container(
            width: 170,
            margin: const EdgeInsets.only(bottom: 16, right: 4),
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: isDark
                  ? AppColors.darkCardBackground
                  : Colors.grey.shade200,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: isDark ? Colors.black26 : AppColors.shadowLight,
                  blurRadius: 10,
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
                            : const Color(0xFFF9FAFB),
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
                        final wishlistController =
                            Get.find<WishlistController>();
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
                                  ? Colors.black38
                                  : Colors.white.withOpacity(0.9),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              isInWishlist
                                  ? IconlyBold.heart
                                  : IconlyLight.heart,
                              size: 18,
                              color: isInWishlist
                                  ? AppColors.error
                                  : const Color(0xFF9E9E9E),
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
                          Text(
                            '\$${product.price.toStringAsFixed(2)}',
                            style: const TextStyle(
                              color: Color(0xFFBDBDBD),
                              decoration: TextDecoration.lineThrough,
                              fontSize: 11,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '\$${product.discountPrice.toStringAsFixed(2)}',
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
                            '${product.rating}',
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
        )
        .animate()
        .fadeIn(duration: 600.ms)
        .slideX(begin: 0.3, end: 0)
        .then()
        .shimmer(delay: 1000.ms, duration: 1500.ms);
  }

  Widget _buildProductImage(String imagePath) {
    // Check if it's a placeholder or invalid path
    if (imagePath == 'placeholder' ||
        imagePath.isEmpty ||
        imagePath.startsWith('assets/images/flash_')) {
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

  Widget _buildRecentlyViewedSection(
    BuildContext context,
    HomeController controller,
  ) {
    return Obx(() {
      if (controller.recentlyViewedProducts.isEmpty) {
        return const SizedBox.shrink();
      }

      return Builder(
        builder: (context) {
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
                    color: isDark
                        ? AppColors.darkTextPrimary
                        : AppColors.textPrimary,
                  ),
                ),
              ),

              const SizedBox(height: 16),

              SizedBox(
                height: 280,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: controller.recentlyViewedProducts.length,
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: const EdgeInsets.only(right: 16),
                      child: _buildRecentlyViewedCard(
                        context,
                        controller.recentlyViewedProducts[index],
                        isDark,
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      );
    }).animate().fadeIn(delay: 1600.ms, duration: 600.ms);
  }

  Widget _buildRecentlyViewedCard(
    BuildContext context,
    Product product,
    bool isDark,
  ) {
    final hasDiscount = product.hasDiscount;

    return GestureDetector(
          onTap: () {
            HapticFeedback.lightImpact();
            Get.to(() => ProductDetailScreen(product: product));
          },
          child: Container(
            width: 170,
            margin: const EdgeInsets.only(bottom: 16, right: 4),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark
                  ? AppColors.darkCardBackground
                  : Colors.grey.shade200,
              borderRadius: BorderRadius.circular(5),
              boxShadow: [
                BoxShadow(
                  color: isDark ? Colors.black26 : AppColors.shadowLight,
                  blurRadius: 10,
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
                            : const Color(0xFFF9FAFB),
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
                    // Recent Badge
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primaryGreen.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'RECENT',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 8,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    // Wishlist Toggle
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Obx(() {
                        final wishlistController =
                            Get.find<WishlistController>();
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
                                  ? Colors.black38
                                  : Colors.white.withOpacity(0.9),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              isInWishlist
                                  ? IconlyBold.heart
                                  : IconlyLight.heart,
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
        )
        .animate()
        .fadeIn(duration: 600.ms)
        .slideX(begin: 0.3, end: 0)
        .then()
        .shimmer(delay: 800.ms, duration: 1200.ms);
  }
}
