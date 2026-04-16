import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/responsive.dart';
import '../../features/home/presentation/pages/home_screen.dart';
import '../../features/orders/presentation/pages/orders_screen.dart';
import '../../features/products/presentation/pages/search_screen.dart';
import '../../features/cart/presentation/pages/cart_screen.dart';
import '../../features/profile/presentation/pages/profile_screen.dart';
import 'navigation_controller.dart';

class MainNavigation extends StatelessWidget {
  const MainNavigation({super.key});

  static const List<Widget> _screens = [
    HomeScreen(),
    OrdersScreen(),
    SearchScreen(),
    CartScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final isTablet = context.isTabletOrLarger;
    
    return GetBuilder<NavigationController>(
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
            }
            // If already on Home, do nothing (don't exit)
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
                  color: isDark ? AppColors.darkCardBackground : AppColors.white,
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
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildNavItem(
                      icon: Icons.home_outlined,
                      activeIcon: Icons.home,
                      label: 'nav_home'.tr,
                      index: 0,
                      controller: controller,
                    ),
                    _buildNavItem(
                      icon: Icons.receipt_long_outlined,
                      activeIcon: Icons.receipt_long,
                      label: 'nav_orders'.tr,
                      index: 1,
                      controller: controller,
                    ),
                    _buildNavItem(
                      icon: Icons.search_outlined,
                      activeIcon: Icons.search,
                      label: 'search'.tr,
                      index: 2,
                      controller: controller,
                    ),
                    _buildNavItem(
                      icon: Icons.shopping_cart_outlined,
                      activeIcon: Icons.shopping_cart,
                      label: 'nav_cart'.tr,
                      index: 3,
                      controller: controller,
                      badge: controller.cartItemCount > 0 ? controller.cartItemCount.toString() : null,
                    ),
                    _buildNavItem(
                      icon: Icons.person_outline,
                      activeIcon: Icons.person,
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
    );
  }

  Widget _buildNavigationRail(BuildContext context, NavigationController controller) {
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
          icon: const Icon(Icons.home_outlined),
          selectedIcon: const Icon(Icons.home),
          label: Text('nav_home'.tr),
        ),
        NavigationRailDestination(
          icon: const Icon(Icons.receipt_long_outlined),
          selectedIcon: const Icon(Icons.receipt_long),
          label: Text('nav_orders'.tr),
        ),
        NavigationRailDestination(
          icon: const Icon(Icons.search_outlined),
          selectedIcon: const Icon(Icons.search),
          label: Text('search'.tr),
        ),
        NavigationRailDestination(
          icon: Badge(
            isLabelVisible: controller.cartItemCount > 0,
            label: Text(controller.cartItemCount.toString()),
            child: const Icon(Icons.shopping_cart_outlined),
          ),
          selectedIcon: Badge(
            isLabelVisible: controller.cartItemCount > 0,
            label: Text(controller.cartItemCount.toString()),
            child: const Icon(Icons.shopping_cart),
          ),
          label: Text('nav_cart'.tr),
        ),
        NavigationRailDestination(
          icon: const Icon(Icons.person_outline),
          selectedIcon: const Icon(Icons.person),
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
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primaryGreen.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              children: [
                Icon(
                  isActive ? activeIcon : icon,
                  color: isActive ? AppColors.primaryGreen : AppColors.grey500,
                  size: 24,
                ),
                if (badge != null)
                  Positioned(
                    right: -6,
                    top: -6,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AppColors.error,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        badge,
                        style: const TextStyle(
                          color: AppColors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isActive ? AppColors.primaryGreen : AppColors.grey500,
                fontSize: 12,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
