import 'package:flutter/material.dart';
import 'package:ganacsade/features/products/presentation/pages/search_screen.dart';
import 'package:get/get.dart';
import 'package:iconly/iconly.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../navigation/navigation_controller.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

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
                  final firstName = user?.firstName ?? 'Guest';

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
                        firstName.capitalizeFirst!,
                        style: AppTextStyles.headlineSmall.copyWith(
                          color: isDark
                              ? AppColors.darkTextPrimary
                              : AppColors.textPrimary,
                          fontWeight: FontWeight.w500,
                          fontSize: 22,
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

              // Profile Avatar
              GestureDetector(
                onTap: () {
                  Get.find<NavigationController>().changeIndex(4);
                },
                child: Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: AppColors.grey200,
                    shape: BoxShape.circle,

                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipOval(
                    child: Obx(() {
                      final profileUrl = authController.user?.profileImageUrl;
                      if (profileUrl != null && profileUrl.isNotEmpty) {
                        return Image.network(
                          profileUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(
                                Icons.person,
                                color: Colors.white,
                                size: 30,
                              ),
                        );
                      }
                      return const Icon(
                        Icons.person,
                        color: Colors.white,
                        size: 30,
                      );
                    }),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Search Bar Row
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => Get.to(() => const SearchScreen()),
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
                    Get.to(() => const SearchScreen());
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
