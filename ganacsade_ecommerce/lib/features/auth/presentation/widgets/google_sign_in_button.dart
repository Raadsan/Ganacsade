import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../controllers/auth_controller.dart';

class GoogleSignInButton extends StatelessWidget {
  const GoogleSignInButton({super.key});

  @override
  Widget build(BuildContext context) {
    final authController = Get.find<AuthController>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Obx(() {
      final isLoading = authController.isLoading.value;

      return SizedBox(
        width: double.infinity,
        height: 52,
        child: OutlinedButton(
          onPressed: isLoading
              ? null
              : () async {
                  HapticFeedback.lightImpact();
                  final success = await authController.signInWithGoogle();
                  if (success && context.mounted) {
                    Get.offAllNamed(authController.mainRoute);
                  }
                },
          style: OutlinedButton.styleFrom(
            backgroundColor: isDark ? AppColors.darkCardBackground : AppColors.white,
            foregroundColor: isDark
                ? AppColors.darkTextPrimary
                : AppColors.textPrimary,
            side: BorderSide(
              color: isDark ? AppColors.darkBorderLight : AppColors.grey300,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.network(
                'https://developers.google.com/identity/images/g-logo.png',
                height: 20,
                width: 20,
                errorBuilder: (_, __, ___) => const Icon(
                  Icons.g_mobiledata_rounded,
                  size: 24,
                  color: Colors.red,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Continue with Google',
                style: AppTextStyles.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      );
    });
  }
}

class AuthDivider extends StatelessWidget {
  const AuthDivider({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Row(
      children: [
        Expanded(
          child: Divider(
            color: isDark ? AppColors.darkBorderLight : AppColors.grey300,
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            'OR',
            style: AppTextStyles.labelMedium.copyWith(
              color: isDark ? AppColors.darkTextSecondary : AppColors.grey500,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        Expanded(
          child: Divider(
            color: isDark ? AppColors.darkBorderLight : AppColors.grey300,
          ),
        ),
      ],
    );
  }
}
