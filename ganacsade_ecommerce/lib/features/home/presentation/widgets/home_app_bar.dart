import 'package:flutter/material.dart';
import 'package:ganacsade/features/products/presentation/pages/search_screen.dart';
import 'package:get/get.dart';
import 'package:iconly/iconly.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../../../notifications/presentation/controllers/app_notifications_controller.dart';
import '../../../profile/presentation/pages/notifications_screen.dart';

class HomeAppBar extends StatelessWidget {
  const HomeAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final authController = Get.find<AuthController>();

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 20),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Dynamic User Info
              Expanded(
                child: Obx(() {
                  final user = authController.user;
                  final displayName = (user?.phoneNumber != null && user!.phoneNumber.isNotEmpty)
                      ? user.phoneNumber
                      : (user?.email != null && user!.email.isNotEmpty)
                          ? user.email
                          : 'Guest';

                  // Get location from default address or fallback
                  String location = 'Mogadishu - Somalia';
                  if (user != null && user.addresses.isNotEmpty) {
                    final defaultAddress = user.addresses.firstWhere(
                      (a) => a.isDefault,
                      orElse: () => user.addresses.first,
                    );
                    location =
                        '${defaultAddress.city} - ${defaultAddress.country}';
                  }

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        displayName,
                        style: AppTextStyles.headlineSmall.copyWith(
                          color: isDark
                              ? AppColors.darkTextPrimary
                              : AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                          fontSize: 20,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        location,
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: isDark
                              ? AppColors.darkTextSecondary
                              : AppColors.grey600,
                          fontWeight: FontWeight.w400,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  );
                }),
              ),

              // Notifications
              GestureDetector(
                onTap: () => Get.to(() => const NotificationsScreen()),
                child: Obx(() {
                  final unreadCount =
                      Get.find<AppNotificationsController>().unreadCount.value;

                  return Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: isDark
                                ? [
                                    AppColors.darkCardBackground,
                                    AppColors.grey400.withOpacity(0.3),
                                  ]
                                : [
                                    const Color(0xFFF8F9FA),
                                    AppColors.grey200,
                                  ],
                          ),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isDark
                                ? AppColors.grey400.withOpacity(0.4)
                                : AppColors.grey200,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primaryGreen.withOpacity(0.12),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Icon(
                          IconlyBold.notification,
                          color: isDark
                              ? AppColors.darkTextPrimary
                              : AppColors.textPrimary,
                          size: 24,
                        ),
                      ),
                      if (unreadCount > 0)
                        Positioned(
                          top: -2,
                          right: -2,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 5,
                              vertical: 2,
                            ),
                            constraints: const BoxConstraints(minWidth: 18),
                            decoration: BoxDecoration(
                              color: AppColors.error,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: isDark
                                    ? AppColors.darkCardBackground
                                    : AppColors.white,
                                width: 1.5,
                              ),
                            ),
                            child: Text(
                              unreadCount > 99 ? '99+' : '$unreadCount',
                              textAlign: TextAlign.center,
                              style: AppTextStyles.labelSmall.copyWith(
                                color: AppColors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ),
                    ],
                  );
                }),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Search Bar Row
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => SearchScreen.showBottomSheet(context),
                  child: Container(
                    height: 50,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: isDark
                          ? AppColors.darkCardBackground
                          : const Color(0xFFF5F5F5),
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          IconlyLight.search,
                          color: isDark ? AppColors.grey400 : AppColors.grey500,
                          size: 22,
                        ),
                        const SizedBox(width: 12),
                        Text(
                          'Search products',
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: isDark
                                ? AppColors.darkTextSecondary
                                : AppColors.grey500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Filter Button
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.grey400 : AppColors.grey200,
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  onPressed: () {
                    SearchScreen.showBottomSheet(context);
                  },
                  icon: Icon(
                    IconlyBold.filter,
                    color: AppColors.grey500,
                    size: 22,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
