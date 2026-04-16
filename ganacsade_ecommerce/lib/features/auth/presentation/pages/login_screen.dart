import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/custom_text_field.dart';
import '../../../../shared/widgets/custom_button.dart';
import 'register_screen.dart';
import '../../presentation/controllers/auth_controller.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authController = Get.put(AuthController());
  
  bool _obscurePassword = true;
  bool _rememberMe = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 40),
                
                // Logo and Welcome
                _buildHeader(),
                
                const SizedBox(height: 50),
                
                // Login Form
                _buildLoginForm(),
                
                const SizedBox(height: 30),
                
                // Social Login Options
                _buildSocialLogin(),
                
                const SizedBox(height: 30),
                
                // Register Link
                _buildRegisterLink(),
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
        // Logo
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            gradient: AppColors.primaryGradient,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryGreen.withOpacity(0.3),
                blurRadius: 15,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: const Center(
            child: Text(
              'G',
              style: TextStyle(
                fontSize: 40,
                fontWeight: FontWeight.bold,
                color: AppColors.white,
                fontFamily: AppTextStyles.primaryFontFamily,
              ),
            ),
          ),
        )
            .animate()
            .scale(duration: 600.ms, curve: Curves.elasticOut),
        
        const SizedBox(height: 20),
        
        // Welcome Text
        const Text(
          'Welcome Back!',
          style: AppTextStyles.headlineLarge,
          textAlign: TextAlign.center,
        )
            .animate()
            .fadeIn(delay: 200.ms, duration: 600.ms)
            .slideY(begin: 0.3, end: 0),
        
        const SizedBox(height: 8),
        
        const Text(
          'Sign in to continue to G-Store',
          style: AppTextStyles.bodyLarge,
          textAlign: TextAlign.center,
        )
            .animate()
            .fadeIn(delay: 400.ms, duration: 600.ms),
      ],
    );
  }

  Widget _buildLoginForm() {
    return Column(
      children: [
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
            .fadeIn(delay: 600.ms, duration: 500.ms)
            .slideX(begin: -0.2, end: 0),
        
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
        
        const SizedBox(height: 16),
        
        // Remember Me & Forgot Password
        Row(
          children: [
            Checkbox(
              value: _rememberMe,
              onChanged: (value) {
                setState(() {
                  _rememberMe = value ?? false;
                });
              },
            ),
            const Text('Remember me', style: AppTextStyles.bodyMedium),
            const Spacer(),
            TextButton(
              onPressed: () {
                // TODO: Navigate to forgot password
              },
              child: const Text('Forgot Password?'),
            ),
          ],
        )
            .animate()
            .fadeIn(delay: 800.ms, duration: 500.ms),
        
        const SizedBox(height: 30),
        
        // Login Button
        Obx(() => CustomButton(
          text: 'Sign In',
          onPressed: _authController.isLoading.value ? null : _handleLogin,
          isLoading: _authController.isLoading.value,
        ))
            .animate()
            .fadeIn(delay: 900.ms, duration: 500.ms)
            .slideY(begin: 0.3, end: 0),
      ],
    );
  }

  Widget _buildSocialLogin() {
    return Column(
      children: [
        const Row(
          children: [
            Expanded(child: Divider()),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Text('Or continue with', style: AppTextStyles.bodyMedium),
            ),
            Expanded(child: Divider()),
          ],
        ),
        
        const SizedBox(height: 20),
        
        // Social Login Buttons
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  // TODO: Google Sign In
                },
                icon: const Icon(Icons.g_mobiledata, size: 24),
                label: const Text('Google'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  // TODO: Phone Sign In
                },
                icon: const Icon(Icons.phone, size: 20),
                label: const Text('Phone'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ],
        ),
      ],
    )
        .animate()
        .fadeIn(delay: 1000.ms, duration: 500.ms);
  }

  Widget _buildRegisterLink() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text(
          "Don't have an account? ",
          style: AppTextStyles.bodyMedium,
        ),
        TextButton(
          onPressed: () {
            Get.to(() => const RegisterScreen());
          },
          child: const Text(
            'Sign Up',
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

  void _handleLogin() {
    if (_formKey.currentState!.validate()) {
      _authController.signInWithEmail(
        _emailController.text.trim(),
        _passwordController.text,
      );
    }
  }
}
