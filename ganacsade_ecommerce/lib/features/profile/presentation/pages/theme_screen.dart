import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/theme/theme_controller.dart';

class ThemeScreen extends StatelessWidget {
  const ThemeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('theme_title'.tr),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: GetBuilder<ThemeController>(
        builder: (controller) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Theme Preview
                _buildThemePreview(context, controller),
                const SizedBox(height: 24),
                
                // Theme Options
                Text(
                  'theme_select'.tr,
                  style: AppTextStyles.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).textTheme.bodyLarge?.color,
                  ),
                ),
                const SizedBox(height: 16),
                
                // Light Mode Option
                _buildThemeOption(
                  context: context,
                  controller: controller,
                  title: 'theme_light'.tr,
                  subtitle: 'theme_light_desc'.tr,
                  icon: Icons.light_mode,
                  themeMode: ThemeMode.light,
                  index: 0,
                ),
                
                // Dark Mode Option
                _buildThemeOption(
                  context: context,
                  controller: controller,
                  title: 'theme_dark'.tr,
                  subtitle: 'theme_dark_desc'.tr,
                  icon: Icons.dark_mode,
                  themeMode: ThemeMode.dark,
                  index: 1,
                ),
                
                // System Default Option
                _buildThemeOption(
                  context: context,
                  controller: controller,
                  title: 'theme_system'.tr,
                  subtitle: 'theme_system_desc'.tr,
                  icon: Icons.settings_suggest,
                  themeMode: ThemeMode.system,
                  index: 2,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildThemePreview(BuildContext context, ThemeController controller) {
    final isDark = controller.isDarkMode;
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDark
              ? [const Color(0xFF1E1E1E), const Color(0xFF2C2C2C)]
              : [AppColors.primaryGreen.withOpacity(0.1), AppColors.primaryBlue.withOpacity(0.1)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? AppColors.darkBorderLight : AppColors.borderLight,
        ),
      ),
      child: Column(
        children: [
          // Preview Icon
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkElevatedSurface : AppColors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.shadowLight,
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(
              isDark ? Icons.dark_mode : Icons.light_mode,
              size: 40,
              color: isDark ? AppColors.primaryGreen : AppColors.primaryGreen,
            ),
          )
              .animate()
              .scale(duration: 400.ms, curve: Curves.elasticOut),
          const SizedBox(height: 16),
          
          // Current Theme Label
          Text(
            isDark ? 'theme_dark'.tr : 'theme_light'.tr,
            style: AppTextStyles.titleLarge.copyWith(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).textTheme.bodyLarge?.color,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'theme_current'.tr,
            style: AppTextStyles.bodyMedium.copyWith(
              color: Theme.of(context).textTheme.bodySmall?.color,
            ),
          ),
          
          // Quick Toggle
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.light_mode,
                color: !isDark ? AppColors.primaryGreen : AppColors.grey500,
                size: 20,
              ),
              const SizedBox(width: 8),
              Switch(
                value: isDark,
                onChanged: (value) {
                  HapticFeedback.lightImpact();
                  if (value) {
                    controller.setDarkMode();
                  } else {
                    controller.setLightMode();
                  }
                },
                activeColor: AppColors.primaryGreen,
              ),
              const SizedBox(width: 8),
              Icon(
                Icons.dark_mode,
                color: isDark ? AppColors.primaryGreen : AppColors.grey500,
                size: 20,
              ),
            ],
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 400.ms)
        .slideY(begin: 0.2, end: 0);
  }

  Widget _buildThemeOption({
    required BuildContext context,
    required ThemeController controller,
    required String title,
    required String subtitle,
    required IconData icon,
    required ThemeMode themeMode,
    required int index,
  }) {
    final isSelected = controller.themeMode == themeMode;
    
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        controller.setThemeMode(themeMode);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primaryGreen.withOpacity(0.1)
              : Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.primaryGreen : AppColors.adaptiveBorder,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.shadowLight,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            // Icon
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primaryGreen
                    : Theme.of(context).scaffoldBackgroundColor,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: isSelected
                    ? AppColors.white
                    : Theme.of(context).textTheme.bodyLarge?.color,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            
            // Text
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTextStyles.titleMedium.copyWith(
                      fontWeight: FontWeight.w600,
                      color: isSelected
                          ? AppColors.primaryGreen
                          : Theme.of(context).textTheme.bodyLarge?.color,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Theme.of(context).textTheme.bodySmall?.color,
                    ),
                  ),
                ],
              ),
            ),
            
            // Checkmark
            if (isSelected)
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check,
                  color: AppColors.white,
                  size: 18,
                ),
              )
                  .animate()
                  .scale(duration: 200.ms, curve: Curves.elasticOut),
          ],
        ),
      ),
    )
        .animate()
        .fadeIn(duration: 400.ms, delay: Duration(milliseconds: 100 * index))
        .slideX(begin: 0.2, end: 0);
  }
}
