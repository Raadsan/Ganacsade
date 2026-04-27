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
        expandedHeight: 280,
        floating: false,
        pinned: true,
        backgroundColor: AppColors.primaryGreen,
        flexibleSpace: FlexibleSpaceBar(
          background: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  AppColors.primaryGreen,
                  AppColors.primaryGreen.withOpacity(0.8),
                ],
              ),
            ),
            child: SafeArea(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 40),
                  // Profile Avatar
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.black.withOpacity(0.2),
                          blurRadius: 15,
                          offset: const Offset(0, 5),
                        ),
                      ],
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
                  ).animate().scale(duration: 800.ms, curve: Curves.elasticOut),

                  const SizedBox(height: 16),

                  // User Name
                  Text(
                    controller.currentUser?.name ?? 'User Name',
                    style: const TextStyle(
                      color: AppColors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ).animate().fadeIn(delay: 300.ms, duration: 600.ms),

                  const SizedBox(height: 4),

                  // User Email
                  Text(
                    controller.currentUser?.email ?? 'user@email.com',
                    style: TextStyle(
                      color: AppColors.white.withOpacity(0.9),
                      fontSize: 16,
                    ),
                  ).animate().fadeIn(delay: 500.ms, duration: 600.ms),

                  const SizedBox(height: 12),

                  // Edit Profile Button
                  ElevatedButton.icon(
                        onPressed: () {
                          HapticFeedback.lightImpact();
                          _navigateToEditProfile();
                        },
                        icon: const Icon(Icons.edit, size: 16),
                        label: const Text('Edit Profile'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.white,
                          foregroundColor: AppColors.primaryGreen,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 10,
                          ),
                        ),
                      )
                      .animate()
                      .fadeIn(delay: 700.ms, duration: 600.ms)
                      .slideY(begin: 0.3, end: 0),
                ],
              ),
            ),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings, color: AppColors.white),
            onPressed: () {
              HapticFeedback.lightImpact();
              _navigateToSettings();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDefaultAvatar(ProfileController controller) {
    return Container(
      width: 100,
      height: 100,
      decoration: const BoxDecoration(
        color: AppColors.primaryGreen,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          controller.currentUser?.initials ?? 'U',
          style: const TextStyle(
            color: AppColors.white,
            fontSize: 36,
            fontWeight: FontWeight.bold,
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
            borderRadius: BorderRadius.circular(16),
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
              Row(
                children: [
                  Icon(
                    IconlyBold.profile,
                    color: AppColors.primaryGreen,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Personal Information',
                    style: AppTextStyles.titleMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      color: isDark
                          ? AppColors.darkTextPrimary
                          : AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildInfoRow(
                icon: IconlyBold.message,
                label: 'Email',
                value: controller.currentUser?.email ?? 'Not provided',
                isDark: isDark,
              ),
              const SizedBox(height: 12),
              _buildInfoRow(
                icon: IconlyBold.call,
                label: 'Phone',
                value: controller.currentUser?.phone ?? 'Not provided',
                isDark: isDark,
              ),
              const SizedBox(height: 12),
              _buildInfoRow(
                icon: IconlyBold.calendar,
                label: 'Member Since',
                value: controller.getFormattedJoinDate(),
                isDark: isDark,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
    required bool isDark,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.primaryGreen.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 18, color: AppColors.primaryGreen),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppTextStyles.bodySmall.copyWith(
                  color: isDark
                      ? AppColors.darkTextSecondary
                      : AppColors.grey600,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: AppTextStyles.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  color: isDark
                      ? AppColors.darkTextPrimary
                      : AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem(
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Column(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: AppTextStyles.titleLarge.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.grey900,
          ),
        ),
        Text(
          title,
          style: AppTextStyles.bodySmall.copyWith(color: AppColors.grey600),
        ),
      ],
    );
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
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkCardBackground : AppColors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.shadowLight,
                    blurRadius: 8,
                    offset: const Offset(0, 2),
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
                  borderRadius: BorderRadius.circular(16),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: color.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
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
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                subtitle,
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: isDark
                                      ? AppColors.darkTextSecondary
                                      : AppColors.grey600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Icon(
                          Icons.arrow_forward_ios,
                          size: 16,
                          color: isDark ? AppColors.grey500 : AppColors.grey400,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            )
            .animate(delay: Duration(milliseconds: index * 100))
            .fadeIn(duration: 600.ms)
            .slideX(begin: 0.3, end: 0);
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
