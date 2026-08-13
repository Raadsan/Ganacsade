import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:iconly/iconly.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/responsive.dart';
import '../../features/home/presentation/pages/home_screen.dart';
import '../../features/orders/presentation/pages/orders_screen.dart';
import '../../features/wishlist/presentation/pages/wishlist_screen.dart';
import '../../features/cart/presentation/pages/cart_screen.dart';
import '../../features/profile/presentation/pages/profile_screen.dart';
import 'navigation_controller.dart';

class MainNavigation extends StatelessWidget {
  const MainNavigation({super.key});

  static const List<Widget> _screens = [
    HomeScreen(),
    OrdersScreen(),
    WishlistScreen(),
    CartScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final isTablet = context.isTabletOrLarger;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        systemNavigationBarColor: isDark ? const Color(0xFF1E1E1E) : AppColors.white,
        systemNavigationBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      ),
      child: GetBuilder<NavigationController>(
      init: NavigationController(),
      builder: (controller) {
        // Use NavigationRail for tablets, BottomNavigationBar for phones
        if (isTablet) {
          return Scaffold(
            body: Row(
              children: [
                _buildNavigationRail(context, controller),
                const VerticalDivider(thickness: 1, width: 1),
                Expanded(
                  child: IndexedStack(
                    index: controller.currentIndex,
                    children: _screens,
                  ),
                ),
              ],
            ),
          );
        }

        return PopScope(
          canPop: false,
          onPopInvokedWithResult: (didPop, result) {
            if (didPop) return;
            if (controller.currentIndex != 0) {
              // Go back to Home tab instead of exiting
              controller.changeIndex(0);
            } else {
              // Already on Home — exit the app
              SystemNavigator.pop();
            }
          },
          child: Scaffold(
            body: IndexedStack(
              index: controller.currentIndex,
              children: _screens,
            ),
            bottomNavigationBar: Builder(
              builder: (context) {
                final isDark = Theme.of(context).brightness == Brightness.dark;
                return Container(
                  decoration: BoxDecoration(
                    color: isDark
                        ? AppColors.darkCardBackground
                        : AppColors.white,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.shadowLight,
                        blurRadius: 10,
                        offset: const Offset(0, -2),
                      ),
                    ],
                  ),
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildNavItem(
                            icon: IconlyLight.home,
                            activeIcon: IconlyBold.home,
                            label: 'nav_home'.tr,
                            index: 0,
                            controller: controller,
                          ),
                          _buildNavItem(
                            icon: IconlyLight.buy,
                            activeIcon: IconlyBold.buy,
                            label: 'nav_orders'.tr,
                            index: 1,
                            controller: controller,
                          ),
                          _buildNavItem(
                            icon: IconlyLight.heart,
                            activeIcon: IconlyBold.heart,
                            label: 'nav_wishlist'.tr,
                            index: 2,
                            controller: controller,
                          ),
                          _buildNavItem(
                            icon: IconlyLight.bag,
                            activeIcon: IconlyBold.bag,
                            label: 'nav_cart'.tr,
                            index: 3,
                            controller: controller,
                            badge: controller.cartItemCount > 0
                                ? controller.cartItemCount.toString()
                                : null,
                          ),
                          _buildNavItem(
                            icon: IconlyLight.profile,
                            activeIcon: IconlyBold.profile,
                            label: 'nav_profile'.tr,
                            index: 4,
                            controller: controller,
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        );
      },
      ),
    );
  }

  Widget _buildNavigationRail(
    BuildContext context,
    NavigationController controller,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isDesktop = context.isDesktop;

    return NavigationRail(
      selectedIndex: controller.currentIndex,
      onDestinationSelected: (index) => controller.changeIndex(index),
      extended: isDesktop,
      minWidth: 72,
      minExtendedWidth: 200,
      backgroundColor: isDark ? AppColors.darkCardBackground : AppColors.white,
      selectedIconTheme: const IconThemeData(color: AppColors.primaryGreen),
      unselectedIconTheme: IconThemeData(color: AppColors.grey500),
      selectedLabelTextStyle: const TextStyle(
        color: AppColors.primaryGreen,
        fontWeight: FontWeight.w600,
      ),
      unselectedLabelTextStyle: TextStyle(color: AppColors.grey500),
      leading: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Text(
          'GANACSADE',
          style: TextStyle(
            color: AppColors.primaryGreen,
            fontWeight: FontWeight.bold,
            fontSize: isDesktop ? 16 : 13,
            letterSpacing: 1.2,
          ),
        ),
      ),
      destinations: [
        NavigationRailDestination(
          icon: const Icon(IconlyLight.home),
          selectedIcon: const Icon(IconlyBold.home),
          label: Text('nav_home'.tr),
        ),
        NavigationRailDestination(
          icon: const Icon(IconlyLight.buy),
          selectedIcon: const Icon(IconlyBold.buy),
          label: Text('nav_orders'.tr),
        ),
        NavigationRailDestination(
          icon: const Icon(IconlyLight.heart),
          selectedIcon: const Icon(IconlyBold.heart),
          label: Text('nav_wishlist'.tr),
        ),
        NavigationRailDestination(
          icon: Badge(
            isLabelVisible: controller.cartItemCount > 0,
            label: Text(controller.cartItemCount.toString()),
            child: const Icon(IconlyLight.bag),
          ),
          selectedIcon: Badge(
            isLabelVisible: controller.cartItemCount > 0,
            label: Text(controller.cartItemCount.toString()),
            child: const Icon(IconlyBold.bag),
          ),
          label: Text('nav_cart'.tr),
        ),
        NavigationRailDestination(
          icon: const Icon(IconlyLight.profile),
          selectedIcon: const Icon(IconlyBold.profile),
          label: Text('nav_profile'.tr),
        ),
      ],
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required IconData activeIcon,
    required String label,
    required int index,
    required NavigationController controller,
    String? badge,
  }) {
    final isActive = controller.currentIndex == index;

    return GestureDetector(
      onTap: () => controller.changeIndex(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
        decoration: BoxDecoration(
          color: isActive
              ? AppColors.primaryGreen.withOpacity(0.12)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(25),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  isActive ? activeIcon : icon,
                  color: isActive ? AppColors.primaryGreen : AppColors.grey600,
                  size: 24,
                ),
                if (!isActive && badge != null)
                  Positioned(
                    right: -4,
                    top: -4,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: const BoxDecoration(
                        color: AppColors.error,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 14,
                        minHeight: 14,
                      ),
                      child: Text(
                        badge,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: AppColors.white,
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            if (isActive) ...[
              const SizedBox(width: 4),
              Text(
                label,
                style: const TextStyle(
                  color: AppColors.primaryGreen,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
