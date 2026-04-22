import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/custom_text_field.dart';
import '../../../../shared/widgets/custom_button.dart';
import '../../presentation/controllers/auth_controller.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _authController = Get.find<AuthController>();
  
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _agreeToTerms = false;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Get.back(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildHeader(),
                const SizedBox(height: 40),
                _buildRegistrationForm(),
                const SizedBox(height: 30),
                _buildLoginLink(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Text(
          'Create Account',
          style: AppTextStyles.headlineLarge,
          textAlign: TextAlign.center,
        )
            .animate()
            .fadeIn(delay: 100.ms, duration: 600.ms)
            .slideY(begin: 0.3, end: 0),
        
        const SizedBox(height: 8),
        
        Text(
          'Join G-Store community today',
          style: AppTextStyles.bodyLarge,
          textAlign: TextAlign.center,
        )
            .animate()
            .fadeIn(delay: 200.ms, duration: 600.ms),
      ],
    );
  }

  Widget _buildRegistrationForm() {
    return Column(
      children: [
        // Name Fields
        Row(
          children: [
            Expanded(
              child: CustomTextField(
                controller: _firstNameController,
                labelText: 'First Name',
                hintText: 'Enter first name',
                prefixIcon: Icons.person_outlined,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your first name';
                  }
                  return null;
                },
              )
                  .animate()
                  .fadeIn(delay: 300.ms, duration: 500.ms)
                  .slideX(begin: -0.2, end: 0),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: CustomTextField(
                controller: _lastNameController,
                labelText: 'Last Name',
                hintText: 'Enter last name',
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your last name';
                  }
                  return null;
                },
              )
                  .animate()
                  .fadeIn(delay: 400.ms, duration: 500.ms)
                  .slideX(begin: 0.2, end: 0),
            ),
          ],
        ),
        
        const SizedBox(height: 20),
        
        // Email Field
        CustomTextField(
          controller: _emailController,
          labelText: 'Email',
          hintText: 'Enter your email',
          keyboardType: TextInputType.emailAddress,
          prefixIcon: Icons.email_outlined,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter your email';
            }
            if (!GetUtils.isEmail(value)) {
              return 'Please enter a valid email';
            }
            return null;
          },
        )
            .animate()
            .fadeIn(delay: 500.ms, duration: 500.ms)
            .slideX(begin: -0.2, end: 0),
        
        const SizedBox(height: 20),
        
        // Phone Field
        CustomTextField(
          controller: _phoneController,
          labelText: 'Phone Number',
          hintText: 'Enter your phone number',
          keyboardType: TextInputType.phone,
          prefixIcon: Icons.phone_outlined,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter your phone number';
            }
            if (!GetUtils.isPhoneNumber(value)) {
              return 'Please enter a valid phone number';
            }
            return null;
          },
        )
            .animate()
            .fadeIn(delay: 600.ms, duration: 500.ms)
            .slideX(begin: 0.2, end: 0),
        
        const SizedBox(height: 20),
        
        // Password Field
        CustomTextField(
          controller: _passwordController,
          labelText: 'Password',
          hintText: 'Enter your password',
          obscureText: _obscurePassword,
          prefixIcon: Icons.lock_outlined,
          suffixIcon: IconButton(
            icon: Icon(
              _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
            ),
            onPressed: () {
              setState(() {
                _obscurePassword = !_obscurePassword;
              });
            },
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter your password';
            }
            if (value.length < 6) {
              return 'Password must be at least 6 characters';
            }
            return null;
          },
        )
            .animate()
            .fadeIn(delay: 700.ms, duration: 500.ms)
            .slideX(begin: -0.2, end: 0),
        
        const SizedBox(height: 20),
        
        // Confirm Password Field
        CustomTextField(
          controller: _confirmPasswordController,
          labelText: 'Confirm Password',
          hintText: 'Confirm your password',
          obscureText: _obscureConfirmPassword,
          prefixIcon: Icons.lock_outlined,
          suffixIcon: IconButton(
            icon: Icon(
              _obscureConfirmPassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
            ),
            onPressed: () {
              setState(() {
                _obscureConfirmPassword = !_obscureConfirmPassword;
              });
            },
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please confirm your password';
            }
            if (value != _passwordController.text) {
              return 'Passwords do not match';
            }
            return null;
          },
        )
            .animate()
            .fadeIn(delay: 800.ms, duration: 500.ms)
            .slideX(begin: 0.2, end: 0),
        
        const SizedBox(height: 20),
        
        // Terms and Conditions
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Checkbox(
              value: _agreeToTerms,
              onChanged: (value) {
                setState(() {
                  _agreeToTerms = value ?? false;
                });
              },
            ),
            Expanded(
              child: RichText(
                text: TextSpan(
                  style: AppTextStyles.bodyMedium,
                  children: [
                    TextSpan(text: 'I agree to the '),
                    TextSpan(
                      text: 'Terms & Conditions',
                      style: TextStyle(
                        color: AppColors.primaryGreen,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    TextSpan(text: ' and '),
                    TextSpan(
                      text: 'Privacy Policy',
                      style: TextStyle(
                        color: AppColors.primaryGreen,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        )
            .animate()
            .fadeIn(delay: 900.ms, duration: 500.ms),
        
        const SizedBox(height: 30),
        
        // Register Button
        Obx(() => CustomButton(
          text: 'Create Account',
          onPressed: (_authController.isLoading.value || !_agreeToTerms) ? null : _handleRegister,
          isLoading: _authController.isLoading.value,
        ))
            .animate()
            .fadeIn(delay: 1000.ms, duration: 500.ms)
            .slideY(begin: 0.3, end: 0),
      ],
    );
  }

  Widget _buildLoginLink() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          'Already have an account? ',
          style: AppTextStyles.bodyMedium,
        ),
        TextButton(
          onPressed: () {
            Get.back();
          },
          child: const Text(
            'Sign In',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: AppColors.primaryGreen,
            ),
          ),
        ),
      ],
    )
        .animate()
        .fadeIn(delay: 1100.ms, duration: 500.ms);
  }

  Future<void> _handleRegister() async {
    if (_formKey.currentState!.validate() && _agreeToTerms) {
      final success = await _authController.signUpWithEmail(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        name: '${_firstNameController.text.trim()} ${_lastNameController.text.trim()}',
        phoneNumber: _phoneController.text.trim(),
      );
      
      if (success) {
        Get.offAllNamed('/home');
      }
    }
  }
}
