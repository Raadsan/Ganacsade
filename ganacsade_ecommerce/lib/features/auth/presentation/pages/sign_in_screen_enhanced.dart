import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../controllers/auth_controller.dart';
import 'sign_up_screen.dart';

class SignInScreenEnhanced extends StatefulWidget {
  const SignInScreenEnhanced({super.key});

  @override
  State<SignInScreenEnhanced> createState() => _SignInScreenEnhancedState();
}

class _SignInScreenEnhancedState extends State<SignInScreenEnhanced> {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  final AuthController _authController = Get.find<AuthController>();
  
  bool _obscurePassword = true;
  bool _isEmailFocused = false;
  bool _isPasswordFocused = false;

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 40),
                
                // Logo and Welcome
                Center(
                  child: Column(
                    children: [
                      Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          color: AppColors.primaryGreen.withOpacity(0.1),
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
                            errorBuilder: (context, error, stackTrace) => Icon(
                              Icons.store,
                              size: 60,
                              color: AppColors.primaryGreen,
                            ),
                          ),
                        ),
                      )
                          .animate()
                          .scale(duration: 800.ms, curve: Curves.elasticOut)
                          .then(delay: 200.ms)
                          .shimmer(duration: 1000.ms),
                      const SizedBox(height: 24),
                      Text(
                        'auth_welcome_back'.tr,
                        style: AppTextStyles.headlineLarge.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      )
                          .animate()
                          .fadeIn(delay: 300.ms, duration: 600.ms)
                          .slideY(begin: 0.3, end: 0),
                      const SizedBox(height: 8),
                      Text(
                        'auth_signin_subtitle'.tr,
                        style: AppTextStyles.bodyLarge.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      )
                          .animate()
                          .fadeIn(delay: 400.ms, duration: 600.ms),
                    ],
                  ),
                ),
                
                const SizedBox(height: 32),
                
                // Email/Phone Field
                Text(
                  'auth_phone_or_email'.tr,
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                )
                    .animate()
                    .fadeIn(delay: 600.ms, duration: 600.ms),
                const SizedBox(height: 8),
                Focus(
                  onFocusChange: (hasFocus) {
                    setState(() {
                      _isEmailFocused = hasFocus;
                    });
                  },
                  child: TextFormField(
                    controller: _identifierController,
                    keyboardType: TextInputType.emailAddress,
                    style: AppTextStyles.bodyLarge,
                    decoration: InputDecoration(
                      hintText: 'auth_phone_or_email_hint'.tr,
                      hintStyle: AppTextStyles.bodyLarge.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      prefixIcon: Icon(
                        Icons.person_outline,
                        color: _isEmailFocused ? AppColors.primaryGreen : AppColors.textSecondary,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.borderLight),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.primaryGreen, width: 2),
                      ),
                      errorBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.error, width: 2),
                      ),
                      filled: true,
                      fillColor: _isEmailFocused ? AppColors.primaryGreen.withOpacity(0.05) : AppColors.grey50,
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'auth_phone_or_email_hint'.tr;
                      }
                      
                      bool isEmail = GetUtils.isEmail(value);
                      bool isPhone = GetUtils.isPhoneNumber(value);

                      if (!isEmail && !isPhone && value.length < 3) {
                        return 'auth_phone_or_email_error'.tr;
                      }
                      return null;
                    },
                    onChanged: (value) {
                      _authController.clearError();
                    },
                  ),
                )
                    .animate()
                    .fadeIn(delay: 700.ms, duration: 600.ms)
                    .slideX(begin: -0.2, end: 0),
                
                const SizedBox(height: 20),
                
                // Password Field
                Text(
                  'auth_password'.tr,
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                )
                    .animate()
                    .fadeIn(delay: 800.ms, duration: 600.ms),
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
                    style: AppTextStyles.bodyLarge,
                    decoration: InputDecoration(
                      hintText: 'auth_password_hint'.tr,
                      hintStyle: AppTextStyles.bodyLarge.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      prefixIcon: Icon(
                        Icons.lock_outline,
                        color: _isPasswordFocused ? AppColors.primaryGreen : AppColors.textSecondary,
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          color: AppColors.textSecondary,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.borderLight),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.primaryGreen, width: 2),
                      ),
                      errorBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.error, width: 2),
                      ),
                      filled: true,
                      fillColor: _isPasswordFocused ? AppColors.primaryGreen.withOpacity(0.05) : AppColors.grey50,
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'auth_password_hint'.tr;
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
                )
                    .animate()
                    .fadeIn(delay: 900.ms, duration: 600.ms)
                    .slideX(begin: -0.2, end: 0),
                
                const SizedBox(height: 16),
                
                // Remember Me and Forgot Password
                Row(
                    children: [
                      Obx(() => Checkbox(
                        value: _authController.rememberMe.value,
                        onChanged: (value) {
                          _authController.toggleRememberMe();
                        },
                        activeColor: AppColors.primaryGreen,
                      )),
                      Text(
                        'auth_remember_me'.tr,
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const Spacer(),
                      TextButton(
                        onPressed: () {
                          Get.snackbar(
                            'Coming Soon',
                            'Forgot password feature will be available soon',
                            backgroundColor: AppColors.primaryGreen,
                            colorText: AppColors.white,
                          );
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
                        border: Border.all(color: AppColors.error.withOpacity(0.3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(
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
                Obx(() => SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _authController.isLoading.value ? null : _signIn,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryGreen,
                      foregroundColor: AppColors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 2,
                      shadowColor: AppColors.primaryGreen.withOpacity(0.4),
                    ),
                    child: _authController.isLoading.value
                        ? const SizedBox(
                            height: 24,
                            width: 24,
                            child: CircularProgressIndicator(
                              color: AppColors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'auth_signin'.tr,
                                style: AppTextStyles.bodyLarge.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.white,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(Icons.arrow_forward, size: 20),
                            ],
                          ),
                  ),
                ))
                    .animate()
                    .fadeIn(delay: 1000.ms, duration: 600.ms)
                    .slideY(begin: 0.2, end: 0),
                
                const SizedBox(height: 24),
                
                // Sign Up Link
                Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "auth_no_account".tr,
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            Get.to(() => const SignUpScreen());
                          },
                          child: Text(
                            'auth_signup'.tr,
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.primaryGreen,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 1100.ms, duration: 600.ms),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _signIn() async {
    if (_formKey.currentState!.validate()) {
      HapticFeedback.lightImpact();
      
      final identifier = _identifierController.text.trim();
      final success = await _authController.signIn(
        identifier: identifier,
        password: _passwordController.text,
      );
      
      if (success) {
        Get.offAllNamed('/main');
      }
    }
  }
}
