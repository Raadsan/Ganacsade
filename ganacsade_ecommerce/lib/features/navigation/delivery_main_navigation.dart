import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:iconly/iconly.dart';
import '../../core/constants/app_colors.dart';
import '../../features/notifications/presentation/controllers/app_notifications_controller.dart';
import '../delivery/presentation/controllers/delivery_menu_controller.dart';
import '../delivery/presentation/config/delivery_menu_registry.dart';
import '../profile/presentation/pages/notifications_screen.dart';
import 'navigation_controller.dart';

class DeliveryMainNavigation extends StatefulWidget {
  const DeliveryMainNavigation({super.key});

  @override
  State<DeliveryMainNavigation> createState() => _DeliveryMainNavigationState();
}

class _DeliveryMainNavigationState extends State<DeliveryMainNavigation> {
  late final DeliveryMenuController _menuController;

  @override
  void initState() {
    super.initState();
    _menuController = Get.put(DeliveryMenuController());
    if (!Get.isRegistered<AppNotificationsController>()) {
      Get.put(AppNotificationsController());
    }
  }

  List<DeliveryNavItem> _buildNavItems() {
    final items = List<DeliveryNavItem>.from(_menuController.navItems);
    final hasAlerts = items.any((item) => item.url == '__notifications__');
    if (!hasAlerts) {
      final insertAt = items.isEmpty ? 0 : 1;
      items.insert(
        insertAt,
        DeliveryNavItem(
          url: '__notifications__',
          title: 'Alerts',
          icon: IconlyLight.notification,
          activeIcon: IconlyBold.notification,
          screen: const NotificationsScreen(deliveryMode: true),
        ),
      );
    }
    return items;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final notificationsController = Get.find<AppNotificationsController>();

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        systemNavigationBarColor: isDark ? const Color(0xFF1E1E1E) : AppColors.white,
        systemNavigationBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      ),
      child: Obx(() {
        if (_menuController.isLoading.value) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }

        final navItems = _buildNavItems();
        final screens = navItems.map((item) => item.screen).toList();

        return GetBuilder<NavigationController>(
          builder: (navController) {
            final currentIndex = navController.currentIndex.clamp(0, screens.length - 1);

            return PopScope(
              canPop: false,
              onPopInvokedWithResult: (didPop, result) {
                if (didPop) return;
                if (navController.currentIndex != 0) {
                  navController.changeIndex(0);
                }
              },
              child: Scaffold(
                body: IndexedStack(index: currentIndex, children: screens),
                bottomNavigationBar: Container(
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
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: List.generate(navItems.length, (index) {
                          final item = navItems[index];
                          final isActive = currentIndex == index;
                          final showBadge = item.url == '__notifications__'
                              && notificationsController.unreadCount.value > 0;

                          return GestureDetector(
                            onTap: () => navController.changeIndex(index),
                            behavior: HitTestBehavior.opaque,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
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
                                        isActive ? item.activeIcon : item.icon,
                                        color: isActive
                                            ? AppColors.primaryGreen
                                            : AppColors.grey600,
                                        size: 24,
                                      ),
                                      if (showBadge)
                                        Positioned(
                                          right: -6,
                                          top: -4,
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
                                              notificationsController.unreadCount.value > 9
                                                  ? '9+'
                                                  : '${notificationsController.unreadCount.value}',
                                              textAlign: TextAlign.center,
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 9,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                  if (isActive) ...[
                                    const SizedBox(width: 6),
                                    Text(
                                      item.title,
                                      style: const TextStyle(
                                        color: AppColors.primaryGreen,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          );
                        }),
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        );
      }),
    );
  }
}
