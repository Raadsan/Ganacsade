import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import 'login_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingPage> _pages = [
    OnboardingPage(
      title: 'Welcome to GANACSADE',
      titleAr: 'مرحباً بك في GANACSADE',
      titleSo: 'Ku soo dhawoow GANACSADE',
      description: 'Discover authentic Somali products and traditional crafts from trusted sellers.',
      descriptionAr: 'اكتشف المنتجات الصومالية الأصيلة والحرف التقليدية من البائعين الموثوقين.',
      descriptionSo: 'Baaro alaabta Soomaaliyeed ee asalka ah iyo farshaxanka dhaqameed ee ka yimid iibiyayaasha la aaminsan karo.',
      imagePath: 'assets/images/onboarding_1.png',
      color: AppColors.primaryGreen,
    ),
    OnboardingPage(
      title: '8 Market Categories',
      titleAr: '8 فئات السوق',
      titleSo: '8 Qaybood oo Suuq ah',
      description: 'From electronics to traditional gifts, find everything you need in our specialized markets.',
      descriptionAr: 'من الإلكترونيات إلى الهدايا التقليدية، اعثر على كل ما تحتاجه في أسواقنا المتخصصة.',
      descriptionSo: 'Laga bilaabo qalabka elektarooniga ah ilaa hadiyadaha dhaqameed, ka hel wax walba oo aad u baahan tahay suuqyadeena takhasuska ah.',
      imagePath: 'assets/images/onboarding_2.png',
      color: AppColors.primaryBlue,
    ),
    OnboardingPage(
      title: 'Secure Payments',
      titleAr: 'مدفوعات آمنة',
      titleSo: 'Bixinno Ammaan ah',
      description: 'Pay safely with WaafiPay, E-dahab, Premier Wallet, or cash on delivery.',
      descriptionAr: 'ادفع بأمان باستخدام WaafiPay أو E-dahab أو Premier Wallet أو الدفع عند الاستلام.',
      descriptionSo: 'Si ammaan ah ugu bixiso WaafiPay, E-dahab, Premier Wallet, ama lacag marka la keeno.',
      imagePath: 'assets/images/onboarding_3.png',
      color: AppColors.islamicGreen,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() {
                  _currentPage = index;
                });
              },
              itemCount: _pages.length,
              itemBuilder: (context, index) {
                return _buildPage(_pages[index]);
              },
            ),
          ),
          _buildBottomSection(),
        ],
      ),
    );
  }

  Widget _buildPage(OnboardingPage page) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [page.color, page.color.withOpacity(0.8)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Image placeholder (would be replaced with actual images)
              Container(
                width: 280,
                height: 280,
                decoration: BoxDecoration(
                  color: AppColors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Icon(
                  Icons.shopping_bag_outlined,
                  size: 120,
                  color: AppColors.white,
                ),
              )
                  .animate()
                  .scale(duration: 800.ms, curve: Curves.elasticOut)
                  .then(delay: 200.ms)
                  .shimmer(duration: 1500.ms),
              
              const SizedBox(height: 40),
              
              // Title
              Text(
                page.title,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppColors.white,
                  fontFamily: AppTextStyles.primaryFontFamily,
                ),
                textAlign: TextAlign.center,
              )
                  .animate()
                  .fadeIn(delay: 300.ms, duration: 600.ms)
                  .slideY(begin: 0.3, end: 0),
              
              const SizedBox(height: 10),
              
              // Arabic Title
              Text(
                page.titleAr,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w600,
                  color: AppColors.white,
                  fontFamily: AppTextStyles.arabicFontFamily,
                ),
                textAlign: TextAlign.center,
              )
                  .animate()
                  .fadeIn(delay: 500.ms, duration: 600.ms)
                  .slideY(begin: 0.2, end: 0),
              
              const SizedBox(height: 5),
              
              // Somali Title
              Text(
                page.titleSo,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w500,
                  color: AppColors.white,
                  fontFamily: AppTextStyles.primaryFontFamily,
                ),
                textAlign: TextAlign.center,
              )
                  .animate()
                  .fadeIn(delay: 700.ms, duration: 600.ms)
                  .slideY(begin: 0.2, end: 0),
              
              const SizedBox(height: 30),
              
              // Description
              Text(
                page.description,
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.white,
                  fontFamily: AppTextStyles.primaryFontFamily,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              )
                  .animate()
                  .fadeIn(delay: 900.ms, duration: 600.ms),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomSection() {
    return Container(
      color: AppColors.white,
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          // Page Indicators
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              _pages.length,
              (index) => Container(
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: _currentPage == index ? 24 : 8,
                height: 8,
                decoration: BoxDecoration(
                  color: _currentPage == index
                      ? AppColors.primaryGreen
                      : AppColors.grey300,
                  borderRadius: BorderRadius.circular(4),
                ),
              )
                  .animate()
                  .scale(duration: 300.ms),
            ),
          ),
          
          const SizedBox(height: 30),
          
          // Buttons
          Row(
            children: [
              if (_currentPage > 0)
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      _pageController.previousPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    },
                    child: const Text('Previous'),
                  ),
                ),
              
              if (_currentPage > 0) const SizedBox(width: 16),
              
              Expanded(
                flex: _currentPage == 0 ? 1 : 2,
                child: ElevatedButton(
                  onPressed: () {
                    if (_currentPage == _pages.length - 1) {
                      Get.off(() => const LoginScreen());
                    } else {
                      _pageController.nextPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    }
                  },
                  child: Text(
                    _currentPage == _pages.length - 1 ? 'Get Started' : 'Next',
                  ),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Skip Button
          if (_currentPage < _pages.length - 1)
            TextButton(
              onPressed: () {
                Get.off(() => const LoginScreen());
              },
              child: const Text(
                'Skip',
                style: TextStyle(color: AppColors.grey600),
              ),
            ),
        ],
      ),
    );
  }
}

class OnboardingPage {
  final String title;
  final String titleAr;
  final String titleSo;
  final String description;
  final String descriptionAr;
  final String descriptionSo;
  final String imagePath;
  final Color color;

  OnboardingPage({
    required this.title,
    required this.titleAr,
    required this.titleSo,
    required this.description,
    required this.descriptionAr,
    required this.descriptionSo,
    required this.imagePath,
    required this.color,
  });
}
