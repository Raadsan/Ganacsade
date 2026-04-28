import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:ganacsade/features/navigation/navigation_controller.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/responsive.dart';
import '../controllers/auth_controller.dart';
import 'sign_up_screen.dart';
import 'forgot_password_screen.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final AuthController _authController = Get.find<AuthController>();

  bool _obscurePassword = true;
  bool _isPhoneFocused = false;
  bool _isPasswordFocused = false;

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final sizing = context.sizing;
    final isTablet = context.isTabletOrLarger;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        // Dismiss keyboard when tapping outside
        FocusScope.of(context).unfocus();
      },
      child: Scaffold(
        backgroundColor: isDark
            ? AppColors.darkScaffoldBackground
            : AppColors.white,
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: sizing.dialogWidth),
              child: SingleChildScrollView(
                padding: EdgeInsets.all(sizing.horizontalPadding),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(height: isTablet ? 60 : 40),

                      // Logo and Welcome
                      Center(
                        child: Column(
                          children: [
                            Container(
                                  width: 120,
                                  height: 120,
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryGreen.withOpacity(
                                      0.1,
                                    ),
                                    borderRadius: BorderRadius.circular(60),
                                    boxShadow: [
                                      BoxShadow(
                                        color: AppColors.shadowLight,
                                        blurRadius: 20,
                                        offset: const Offset(0, 10),
                                      ),
                                    ],
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(60),
                                    child: Image.asset(
                                      'assets/logos/GANACSADE LOGO-06.png',
                                      width: 80,
                                      height: 80,
                                      errorBuilder:
                                          (context, error, stackTrace) => Icon(
                                            Icons.store,
                                            size: 60,
                                            color: AppColors.primaryGreen,
                                          ),
                                    ),
                                  ),
                                )
                                .animate()
                                .scale(
                                  duration: 800.ms,
                                  curve: Curves.elasticOut,
                                )
                                .then(delay: 200.ms)
                                .shimmer(duration: 1000.ms),
                            const SizedBox(height: 24),
                            Text(
                                  'auth_welcome_back'.tr,
                                  style: AppTextStyles.headlineLarge.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: isDark
                                        ? AppColors.darkTextPrimary
                                        : AppColors.textPrimary,
                                  ),
                                )
                                .animate()
                                .fadeIn(delay: 300.ms, duration: 600.ms)
                                .slideY(begin: 0.3, end: 0),
                            const SizedBox(height: 8),
                            Text(
                                  'auth_signin_subtitle'.tr,
                                  style: AppTextStyles.bodyLarge.copyWith(
                                    color: isDark
                                        ? AppColors.darkTextSecondary
                                        : AppColors.textSecondary,
                                  ),
                                )
                                .animate()
                                .fadeIn(delay: 500.ms, duration: 600.ms)
                                .slideY(begin: 0.2, end: 0),
                          ],
                        ),
                      ),

                      const SizedBox(height: 48),

                      Text(
                            'Phone Number',
                            style: AppTextStyles.titleSmall.copyWith(
                              fontWeight: FontWeight.w600,
                              color: isDark
                                  ? AppColors.darkTextPrimary
                                  : AppColors.textPrimary,
                            ),
                          )
                          .animate()
                          .fadeIn(delay: 700.ms, duration: 500.ms)
                          .slideX(begin: -0.2, end: 0),
                      const SizedBox(height: 8),
                      Focus(
                        onFocusChange: (hasFocus) {
                          setState(() {
                            _isPhoneFocused = hasFocus;
                          });
                        },
                        child: TextFormField(
                          controller: _phoneController,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          autofocus: false,
                          decoration: InputDecoration(
                            hintText: 'Enter your phone number',
                            prefixIcon: Icon(
                              Icons.phone_outlined,
                              color: _isPhoneFocused
                                  ? AppColors.primaryGreen
                                  : AppColors.grey500,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: AppColors.borderLight,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: AppColors.primaryGreen,
                                width: 2,
                              ),
                            ),
                            errorBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: AppColors.error,
                                width: 2,
                              ),
                            ),
                            filled: true,
                            fillColor: _isPhoneFocused
                                ? AppColors.primaryGreen.withOpacity(0.05)
                                : (isDark
                                      ? AppColors.darkElevatedSurface
                                      : AppColors.grey50),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter your phone number';
                            }

                            if (!GetUtils.isPhoneNumber(value)) {
                              return 'Please enter a valid phone number';
                            }
                            return null;
                          },
                          onChanged: (value) {
                            _authController.clearError();
                          },
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Password Field
                      Text(
                        'auth_password'.tr,
                        style: AppTextStyles.titleSmall.copyWith(
                          fontWeight: FontWeight.w600,
                          color: isDark
                              ? AppColors.darkTextPrimary
                              : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Focus(
                        onFocusChange: (hasFocus) {
                          setState(() {
                            _isPasswordFocused = hasFocus;
                          });
                        },
                        child: TextFormField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          textInputAction: TextInputAction.done,
                          decoration: InputDecoration(
                            hintText: 'auth_password_hint'.tr,
                            prefixIcon: Icon(
                              Icons.lock_outline,
                              color: _isPasswordFocused
                                  ? AppColors.primaryGreen
                                  : AppColors.grey500,
                            ),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility_off
                                    : Icons.visibility,
                                color: AppColors.grey500,
                              ),
                              onPressed: () {
                                setState(() {
                                  _obscurePassword = !_obscurePassword;
                                });
                              },
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: AppColors.borderLight,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: AppColors.primaryGreen,
                                width: 2,
                              ),
                            ),
                            errorBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: AppColors.error,
                                width: 2,
                              ),
                            ),
                            filled: true,
                            fillColor: _isPasswordFocused
                                ? AppColors.primaryGreen.withOpacity(0.05)
                                : (isDark
                                      ? AppColors.darkElevatedSurface
                                      : AppColors.grey50),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter your password';
                            }
                            return null;
                          },
                          onChanged: (value) {
                            _authController.clearError();
                          },
                          onFieldSubmitted: (value) {
                            _signIn();
                          },
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Remember Me and Forgot Password
                      Row(
                        children: [
                          Obx(
                            () => Checkbox(
                              value: _authController.rememberMe.value,
                              onChanged: (value) {
                                _authController.toggleRememberMe();
                              },
                              activeColor: AppColors.primaryGreen,
                            ),
                          ),
                          Text(
                            'auth_remember_me'.tr,
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: isDark
                                  ? AppColors.darkTextSecondary
                                  : AppColors.textSecondary,
                            ),
                          ),
                          const Spacer(),
                          TextButton(
                            onPressed: () {
                              Get.to(() => const ForgotPasswordScreen());
                            },
                            child: Text(
                              'auth_forgot_password'.tr,
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: AppColors.primaryGreen,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 32),

                      // Error Message
                      Obx(() {
                        if (_authController.errorMessage.value.isNotEmpty) {
                          return Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(12),
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              color: AppColors.error.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: AppColors.error.withOpacity(0.3),
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.error_outline,
                                  color: AppColors.error,
                                  size: 20,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _authController.errorMessage.value,
                                    style: AppTextStyles.bodyMedium.copyWith(
                                      color: AppColors.error,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }
                        return const SizedBox.shrink();
                      }),

                      // Sign In Button
                      Obx(
                        () => SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: _authController.isLoading.value
                                ? null
                                : _signIn,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryGreen,
                              foregroundColor: AppColors.white,
                              elevation: 2,
                              shadowColor: AppColors.primaryGreen.withOpacity(
                                0.3,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: _authController.isLoading.value
                                ? const SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        AppColors.white,
                                      ),
                                    ),
                                  )
                                : Text(
                                    'auth_signin'.tr,
                                    style: AppTextStyles.titleMedium.copyWith(
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.white,
                                    ),
                                  ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 32),

                      // Sign Up Link
                      Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'auth_no_account'.tr,
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: isDark
                                    ? AppColors.darkTextSecondary
                                    : AppColors.textSecondary,
                              ),
                            ),
                            TextButton(
                              onPressed: () {
                                Get.toNamed('/register');
                              },
                              child: Text(
                                'auth_signup'.tr,
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.primaryGreen,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _signIn() async {
    if (_formKey.currentState!.validate()) {
      HapticFeedback.lightImpact();

      final phoneNumber = _phoneController.text.trim();

      final success = await _authController.signIn(
        phoneNumber: phoneNumber,
        password: _passwordController.text,
      );

      if (success && mounted) {
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'auth signin success'.tr,
              style: const TextStyle(color: Colors.white),
            ),
            backgroundColor: AppColors.primaryGreen,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            duration: const Duration(seconds: 2),
          ),
        );

        // Reset navigation to home tab
        Get.find<NavigationController>().resetToHome();
        // Navigate to main app
        Get.offAllNamed('/main');
      }
    }
  }
}
