import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import 'package:iconly/iconly.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/localization/language_controller.dart';
import '../controllers/profile_controller.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import 'edit_profile_screen.dart';
import 'addresses_screen.dart';
import 'notifications_screen.dart';
import 'language_screen.dart';
import 'help_support_screen.dart';
import 'about_screen.dart';
import 'theme_screen.dart';
import '../../../wishlist/presentation/pages/wishlist_screen.dart';
import '../../../../shared/widgets/skeleton_loader.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    final controller = Get.put(ProfileController());
    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.refreshUserData();
      Future.delayed(const Duration(milliseconds: 800), () {
        if (mounted) setState(() => _isLoading = false);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final ProfileController controller = Get.find<ProfileController>();

    if (_isLoading) {
      return const Scaffold(body: SafeArea(child: ProfileScreenSkeleton()));
    }

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(controller),
          SliverToBoxAdapter(
            child: Column(
              children: [
                const SizedBox(height: 20),
                _buildStatsSection(controller),
                const SizedBox(height: 24),
                _buildMenuSection(controller),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar(ProfileController controller) {
    return GetBuilder<ProfileController>(
      builder: (controller) => SliverAppBar(
        expandedHeight: 300,
        floating: false,
        pinned: true,
        backgroundColor: AppColors.primaryGreen,
        flexibleSpace: FlexibleSpaceBar(
          background: Stack(
            fit: StackFit.expand,
            children: [
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.primaryGreen,
                      const Color(0xFF5CB85C),
                      AppColors.primaryGreen.withOpacity(0.85),
                    ],
                  ),
                ),
              ),
              Positioned(
                top: -40,
                right: -30,
                child: Container(
                  width: 160,
                  height: 160,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.white.withOpacity(0.08),
                  ),
                ),
              ),
              Positioned(
                bottom: 20,
                left: -50,
                child: Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.white.withOpacity(0.06),
                  ),
                ),
              ),
              SafeArea(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 36),
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [
                            AppColors.white,
                            AppColors.white.withOpacity(0.6),
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.black.withOpacity(0.15),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Container(
                        width: 96,
                        height: 96,
                        decoration: const BoxDecoration(
                          color: AppColors.white,
                          shape: BoxShape.circle,
                        ),
                        child: controller.currentUser?.profileImage != null
                            ? ClipOval(
                                child: Image.network(
                                  controller.currentUser!.profileImage!,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) =>
                                      _buildDefaultAvatar(controller),
                                ),
                              )
                            : _buildDefaultAvatar(controller),
                      ),
                    )
                        .animate()
                        .scale(duration: 800.ms, curve: Curves.elasticOut),

                    const SizedBox(height: 14),

                    Text(
                      controller.currentUser?.name ?? 'User Name',
                      style: AppTextStyles.headlineSmall.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.3,
                      ),
                    ).animate().fadeIn(delay: 250.ms, duration: 600.ms),

                    const SizedBox(height: 4),

                    Text(
                      (controller.currentUser?.email != null &&
                              controller.currentUser!.email.isNotEmpty)
                          ? controller.currentUser!.email
                          : (controller.currentUser?.phone != null &&
                                  controller.currentUser!.phone.isNotEmpty)
                              ? controller.currentUser!.phone
                              : '',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.white.withOpacity(0.92),
                        fontWeight: FontWeight.w500,
                      ),
                    ).animate().fadeIn(delay: 400.ms, duration: 600.ms),

                    const SizedBox(height: 14),

                    Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () {
                          HapticFeedback.lightImpact();
                          _navigateToEditProfile();
                        },
                        borderRadius: BorderRadius.circular(24),
                        child: Ink(
                          decoration: BoxDecoration(
                            color: AppColors.white,
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.black.withOpacity(0.1),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 22,
                              vertical: 10,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  IconlyBold.edit,
                                  size: 16,
                                  color: AppColors.primaryGreen,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Edit Profile',
                                  style: AppTextStyles.labelLarge.copyWith(
                                    color: AppColors.primaryGreen,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    )
                        .animate()
                        .fadeIn(delay: 600.ms, duration: 600.ms)
                        .slideY(begin: 0.3, end: 0, curve: Curves.easeOutCubic),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: IconButton(
                icon: const Icon(
                  IconlyBold.setting,
                  color: AppColors.white,
                  size: 22,
                ),
                onPressed: () {
                  HapticFeedback.lightImpact();
                  _navigateToSettings();
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDefaultAvatar(ProfileController controller) {
    return Container(
      width: 96,
      height: 96,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primaryGreen,
            AppColors.primaryGreen.withOpacity(0.75),
          ],
        ),
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          controller.currentUser?.initials ?? 'U',
          style: AppTextStyles.headlineMedium.copyWith(
            color: AppColors.white,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }

  Widget _buildStatsSection(ProfileController controller) {
    return GetBuilder<ProfileController>(
      builder: (controller) {
        final isDark = Theme.of(Get.context!).brightness == Brightness.dark;
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCardBackground : AppColors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isDark
                  ? AppColors.darkBorderLight.withOpacity(0.3)
                  : AppColors.primaryGreen.withOpacity(0.08),
            ),
            boxShadow: [
              BoxShadow(
                color: isDark
                    ? Colors.black26
                    : AppColors.primaryGreen.withOpacity(0.06),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.primaryGreen.withOpacity(0.15),
                          AppColors.primaryGreen.withOpacity(0.05),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      IconlyBold.profile,
                      color: AppColors.primaryGreen,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Personal Information',
                    style: AppTextStyles.titleMedium.copyWith(
                      fontWeight: FontWeight.w800,
                      color: isDark
                          ? AppColors.darkTextPrimary
                          : AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              if (controller.currentUser?.email != null &&
                  controller.currentUser!.email.isNotEmpty) ...[
                _buildInfoRow(
                  icon: IconlyBold.message,
                  label: 'Email',
                  value: controller.currentUser!.email,
                  isDark: isDark,
                  index: 0,
                ),
                const SizedBox(height: 14),
              ],
              if (controller.currentUser?.phone != null &&
                  controller.currentUser!.phone.isNotEmpty) ...[
                _buildInfoRow(
                  icon: IconlyBold.call,
                  label: 'Phone',
                  value: controller.currentUser!.phone,
                  isDark: isDark,
                  index: 1,
                ),
                const SizedBox(height: 14),
              ],
              _buildInfoRow(
                icon: IconlyBold.calendar,
                label: 'Member Since',
                value: controller.getFormattedJoinDate(),
                isDark: isDark,
                index: 2,
              ),
            ],
          ),
        )
            .animate()
            .fadeIn(delay: 200.ms, duration: 600.ms)
            .slideY(begin: 0.15, end: 0, curve: Curves.easeOutCubic);
      },
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
    required bool isDark,
    int index = 0,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.primaryGreen.withOpacity(0.14),
                AppColors.primaryGreen.withOpacity(0.04),
              ],
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, size: 18, color: AppColors.primaryGreen),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppTextStyles.labelMedium.copyWith(
                  color: isDark
                      ? AppColors.darkTextSecondary
                      : AppColors.grey600,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                value,
                style: AppTextStyles.bodyLarge.copyWith(
                  fontWeight: FontWeight.w700,
                  color: isDark
                      ? AppColors.darkTextPrimary
                      : AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ],
    )
        .animate(delay: Duration(milliseconds: 150 * index + 300))
        .fadeIn(duration: 500.ms)
        .slideX(begin: 0.1, end: 0, curve: Curves.easeOutCubic);
  }


  Widget _buildMenuSection(ProfileController controller) {
    final menuItems = [
      {
        'icon': IconlyBold.bag_2,
        'title': 'profile_my_orders'.tr,
        'subtitle': 'order_tracking'.tr,
        'color': AppColors.primaryGreen,
        'onTap': () => _navigateToOrders(),
      },
      {
        'icon': IconlyBold.heart,
        'title': 'Wishlist',
        'subtitle': 'Your favorite items',
        'color': AppColors.error,
        'onTap': () => _navigateToWishlist(),
      },
      {
        'icon': IconlyBold.location,
        'title': 'profile_addresses'.tr,
        'subtitle': 'addresses_title'.tr,
        'color': AppColors.primaryBlue,
        'onTap': () => _navigateToAddresses(),
      },
      {
        'icon': IconlyBold.notification,
        'title': 'profile_notifications'.tr,
        'subtitle': 'notifications_enable'.tr,
        'color': AppColors.info,
        'onTap': () => _navigateToNotifications(),
      },
      {
        'icon': IconlyBold.discovery,
        'title': 'profile_language'.tr,
        'subtitle': Get.find<LanguageController>().currentLanguageName,
        'color': AppColors.success,
        'onTap': () => _navigateToLanguage(),
      },
      {
        'icon': IconlyBold.category,
        'title': 'profile_theme'.tr,
        'subtitle': 'theme_subtitle'.tr,
        'color': AppColors.primaryBlue,
        'onTap': () => _navigateToTheme(),
      },
      {
        'icon': IconlyBold.chat,
        'title': 'profile_help'.tr,
        'subtitle': 'help_contact'.tr,
        'color': AppColors.primaryGreen,
        'onTap': () => _navigateToHelpSupport(),
      },
      {
        'icon': IconlyBold.info_square,
        'title': 'profile_about'.tr,
        'subtitle': 'about_version'.tr,
        'color': AppColors.grey600,
        'onTap': () => _navigateToAbout(),
      },
      {
        'icon': IconlyBold.logout,
        'title': 'Logout',
        'subtitle': 'Exit account',
        'color': AppColors.error,
        'onTap': () => _showSignOutDialog(controller),
      },
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: menuItems.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;
          return _buildMenuItem(
            icon: item['icon'] as IconData,
            title: item['title'] as String,
            subtitle: item['subtitle'] as String,
            onTap: item['onTap'] as VoidCallback,
            color: item['color'] as Color,
            index: index,
          );
        }).toList(),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    required Color color,
    required int index,
  }) {
    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Container(
              margin: const EdgeInsets.only(bottom: 10),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkCardBackground : AppColors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                  color: isDark
                      ? AppColors.darkBorderLight.withOpacity(0.2)
                      : color.withOpacity(0.08),
                ),
                boxShadow: [
                  BoxShadow(
                    color: isDark
                        ? Colors.black12
                        : color.withOpacity(0.06),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    onTap();
                  },
                  borderRadius: BorderRadius.circular(18),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                color.withOpacity(0.18),
                                color.withOpacity(0.06),
                              ],
                            ),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(icon, color: color, size: 24),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                title,
                                style: AppTextStyles.titleSmall.copyWith(
                                  color: isDark
                                      ? AppColors.darkTextPrimary
                                      : AppColors.grey900,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                subtitle,
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: isDark
                                      ? AppColors.darkTextSecondary
                                      : AppColors.grey600,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: isDark
                                ? AppColors.darkElevatedSurface
                                : AppColors.grey100,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            IconlyLight.arrow_right_2,
                            size: 16,
                            color: isDark
                                ? AppColors.grey500
                                : AppColors.grey400,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            )
            .animate(delay: Duration(milliseconds: index * 80 + 400))
            .fadeIn(duration: 500.ms)
            .slideX(begin: 0.2, end: 0, curve: Curves.easeOutCubic);
      },
    );
  }

  // Navigation methods
  void _navigateToEditProfile() {
    Get.to(() => const EditProfileScreen());
  }

  void _navigateToOrders() {
    Get.toNamed('/orders');
  }

  void _navigateToWishlist() {
    Get.to(() => const WishlistScreen());
  }

  void _navigateToAddresses() {
    Get.to(() => const AddressesScreen());
  }

  void _navigateToNotifications() {
    Get.to(() => const NotificationsScreen());
  }

  void _navigateToLanguage() {
    Get.to(() => const LanguageScreen());
  }

  void _navigateToTheme() {
    Get.to(() => const ThemeScreen());
  }

  void _navigateToHelpSupport() {
    Get.to(() => const HelpSupportScreen());
  }

  void _navigateToAbout() {
    Get.to(() => const AboutScreen());
  }

  void _navigateToSettings() {
    Get.snackbar(
      'Coming Soon',
      'Settings will be available soon',
      backgroundColor: AppColors.primaryGreen.withOpacity(0.9),
      colorText: AppColors.white,
    );
  }

  void _showSignOutDialog(ProfileController controller) {
    Get.dialog(
      AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(IconlyBold.logout, color: AppColors.error, size: 24),
            const SizedBox(width: 12),
            const Text('Logout'),
          ],
        ),
        content: const Text(
          'Are you sure you want to logout of your account?',
          style: TextStyle(fontSize: 16),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: Text('Cancel', style: TextStyle(color: AppColors.grey600)),
          ),
          ElevatedButton(
            onPressed: () async {
              Get.back();
              final authController = Get.find<AuthController>();
              await authController.signOut();

              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Successfully logged out'),
                    backgroundColor: AppColors.primaryGreen,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                );
              }

              Get.offAllNamed('/register');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: AppColors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }
}
