import 'package:flutter/material.dart';
import 'package:iconly/iconly.dart';
import '../pages/delivery_dashboard_screen.dart';
import '../pages/delivery_orders_history_screen.dart';
import '../pages/delivery_orders_screen.dart';
import '../../../profile/presentation/pages/profile_screen.dart';

class DeliveryNavItem {
  final String url;
  final String title;
  final IconData icon;
  final IconData activeIcon;
  final Widget screen;

  const DeliveryNavItem({
    required this.url,
    required this.title,
    required this.icon,
    required this.activeIcon,
    required this.screen,
  });
}

const _mobileMenuUrls = {
  '/delivery-dashboard',
  '/orders',
  '/orders/history',
  '/profile',
};

class DeliveryMenuRegistry {
  static List<DeliveryNavItem> fallbackItems() => [
        DeliveryNavItem(
          url: '/orders',
          title: 'Orders',
          icon: IconlyLight.buy,
          activeIcon: IconlyBold.buy,
          screen: const DeliveryOrdersScreen(),
        ),
        DeliveryNavItem(
          url: '/profile',
          title: 'Profile',
          icon: IconlyLight.profile,
          activeIcon: IconlyBold.profile,
          screen: const ProfileScreen(),
        ),
      ];

  static DeliveryNavItem? fromMenu(Map<String, dynamic> menu) {
    final url = menu['url']?.toString() ?? '';
    if (!_mobileMenuUrls.contains(url)) return null;
    if (menu['canView'] == false) return null;

    final title = menu['title']?.toString() ?? 'Menu';
    final iconName = menu['icon']?.toString() ?? '';

    return DeliveryNavItem(
      url: url,
      title: title,
      icon: _iconFor(iconName, bold: false),
      activeIcon: _iconFor(iconName, bold: true),
      screen: _screenFor(url),
    );
  }

  static Widget _screenFor(String url) {
    switch (url) {
      case '/delivery-dashboard':
        return const DeliveryDashboardScreen();
      case '/orders':
        return const DeliveryOrdersScreen();
      case '/orders/history':
        return const DeliveryOrdersHistoryScreen();
      case '/profile':
        return const ProfileScreen();
      default:
        return const DeliveryOrdersScreen();
    }
  }

  static IconData _iconFor(String iconName, {required bool bold}) {
    switch (iconName) {
      case 'LayoutDashboard':
        return bold ? IconlyBold.category : IconlyLight.category;
      case 'ShoppingCart':
      case 'Package':
        return bold ? IconlyBold.buy : IconlyLight.buy;
      case 'UserCog':
        return bold ? IconlyBold.profile : IconlyLight.profile;
      default:
        return bold ? IconlyBold.activity : IconlyLight.activity;
    }
  }
}
