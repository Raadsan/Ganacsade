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
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _authController = Get.find<AuthController>();
  
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _identifierController.dispose();
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
          'Register',
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

        
        // Identifier Field (Email or Phone)
        CustomTextField(
          controller: _identifierController,
          labelText: 'auth_phone_or_email'.tr,
          hintText: 'auth_phone_or_email_hint'.tr,
          keyboardType: TextInputType.emailAddress,
          prefixIcon: Icons.person_outline,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter your email or phone number';
            }
            // Check if it's either a valid email or a valid phone number
            bool isEmail = GetUtils.isEmail(value);
            bool isPhone = GetUtils.isPhoneNumber(value);
            
            if (!isEmail && !isPhone && value.length < 3) {
              return 'auth_phone_or_email_error'.tr;
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
        
        const SizedBox(height: 30),
        
        // Register Button
        Obx(() => CustomButton(
          text: 'Register',
          onPressed: _authController.isLoading.value ? null : _handleRegister,
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
            Get.toNamed('/login');
          },
          child: const Text(
            'Login',
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
    if (_formKey.currentState!.validate()) {
      final identifier = _identifierController.text.trim();
      final isEmail = GetUtils.isEmail(identifier);
      
      final success = await _authController.signUp(
        email: isEmail ? identifier : null,
        phoneNumber: !isEmail ? identifier : null,
        password: _passwordController.text,
      );
      
      if (success) {
        Get.offAllNamed(_authController.mainRoute);
      }
    }
  }
}
