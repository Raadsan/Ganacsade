import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../controllers/auth_controller.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final AuthController _authController = Get.find<AuthController>();

  @override
  void initState() {
    super.initState();
    _navigateToNext();
  }

  void _navigateToNext() async {
    // Wait for both the splash delay AND storage initialization to complete
    await Future.wait([
      Future.delayed(const Duration(seconds: 3)),
      _authController.storageReady,
    ]);
    // Check if user is already logged in (session persists across app restarts)
    if (_authController.isLoggedIn) {
      Get.offAllNamed('/main');
    } else {
      Get.offAllNamed('/register');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppColors.primaryGradient,
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // GANACSADE Logo with Animation
              Container(
                width: 180,
                height: 180,
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(45),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.shadowMedium,
                      blurRadius: 25,
                      offset: const Offset(0, 12),
                    ),
                  ],
                ),
                child: Center(
                  child: Image.asset(
                    'assets/logos/GANACSADE LOGO-02.png',
                    width: 140,
                    height: 140,
                    errorBuilder: (context, error, stackTrace) {
                      return const Text(
                        'G',
                        style: TextStyle(
                          fontSize: 80,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryGreen,
                          fontFamily: AppTextStyles.primaryFontFamily,
                        ),
                      );
                    },
                  ),
                ),
              )
                  .animate()
                  .scale(duration: 800.ms, curve: Curves.elasticOut)
                  .then(delay: 200.ms)
                  .shimmer(duration: 1000.ms),
              
              const SizedBox(height: 30),
              
              // App Name
              const Text(
                'GANACSADE',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                  color: AppColors.white,
                  fontFamily: AppTextStyles.primaryFontFamily,
                ),
              )
                  .animate()
                  .fadeIn(delay: 500.ms, duration: 800.ms)
                  .slideY(begin: 0.3, end: 0),
              
              const SizedBox(height: 10),
              
              // Tagline in multiple languages
              Column(
                children: [
                  const Text(
                    'Premium Somali E-commerce Platform',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.white,
                      fontFamily: AppTextStyles.primaryFontFamily,
                    ),
                  ),
                  const SizedBox(height: 5),
                  const Text(
                    'سوق صومالي متميز',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.white,
                      fontFamily: AppTextStyles.arabicFontFamily,
                    ),
                  ),
                  const SizedBox(height: 5),
                  const Text(
                    'Suuq Soomaali oo heer sare ah',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.white,
                      fontFamily: AppTextStyles.primaryFontFamily,
                    ),
                  ),
                ]
                    .animate(interval: 200.ms)
                    .fadeIn(delay: 1000.ms, duration: 600.ms)
                    .slideY(begin: 0.2, end: 0),
              ),
              
              const SizedBox(height: 60),
              
              // Loading Indicator
              const SizedBox(
                width: 40,
                height: 40,
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.white),
                  strokeWidth: 3,
                ),
              )
                  .animate()
                  .fadeIn(delay: 1500.ms, duration: 500.ms),
              
              const SizedBox(height: 20),
              
              const Text(
                'Loading...',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.white,
                  fontFamily: AppTextStyles.primaryFontFamily,
                ),
              )
                  .animate()
                  .fadeIn(delay: 1700.ms, duration: 500.ms),
            ],
          ),
        ),
      ),
    );
  }
}
