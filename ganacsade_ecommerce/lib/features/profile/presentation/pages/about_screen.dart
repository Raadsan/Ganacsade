import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('About'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // App Logo and Info
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.primaryGreen.withOpacity(0.2)),
              ),
              child: Column(
                children: [
                  // GANACSADE Logo
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.shadowLight,
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: Image.asset(
                        'assets/logos/GANACSADE LOGO-02.png',
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) => Container(
                          decoration: BoxDecoration(
                            color: AppColors.primaryGreen,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Icon(
                            Icons.store,
                            color: AppColors.white,
                            size: 60,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'GANACSADE',
                    style: AppTextStyles.headlineMedium.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryGreen,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Your Market, Anytime',
                    style: AppTextStyles.titleMedium.copyWith(
                      color: AppColors.grey600,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.primaryGreen,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'Version 1.0.0',
                      style: AppTextStyles.labelMedium.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            )
                .animate()
                .fadeIn(duration: 800.ms)
                .slideY(begin: -0.3, end: 0),
            
            const SizedBox(height: 32),
            
            // About Section
            Text(
              'About GANACSADE',
              style: AppTextStyles.titleLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.grey900,
              ),
            ),
            const SizedBox(height: 16),
            
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.grey200),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.shadowLight,
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Text(
                'GANACSADE is Somalia\'s premier e-commerce platform, connecting buyers and sellers across the Horn of Africa. We provide a secure, convenient, and culturally-appropriate marketplace for traditional and modern products.\n\nOur mission is to empower Somali entrepreneurs and provide customers with access to quality products while supporting local businesses and economic growth.',
                style: AppTextStyles.bodyLarge.copyWith(
                  color: AppColors.grey700,
                  height: 1.6,
                ),
              ),
            )
                .animate(delay: 200.ms)
                .fadeIn(duration: 600.ms)
                .slideX(begin: -0.3, end: 0),
            
            const SizedBox(height: 24),
            
            // Features Section
            Text(
              'Key Features',
              style: AppTextStyles.titleLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.grey900,
              ),
            ),
            const SizedBox(height: 16),
            
            ..._buildFeatureCards(),
            
            const SizedBox(height: 24),
            
            // Company Info
            Text(
              'Company Information',
              style: AppTextStyles.titleLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.grey900,
              ),
            ),
            const SizedBox(height: 16),
            
            _buildInfoCard(
              icon: Icons.business,
              title: 'Company',
              content: 'GANACSADE Technologies Ltd.',
              index: 0,
            ),
            
            _buildInfoCard(
              icon: Icons.location_on,
              title: 'Headquarters',
              content: 'Mogadishu, Somalia',
              index: 1,
            ),
            
            _buildInfoCard(
              icon: Icons.calendar_today,
              title: 'Founded',
              content: '2024',
              index: 2,
            ),
            
            _buildInfoCard(
              icon: Icons.email,
              title: 'Contact',
              content: 'info@ganacsade.com',
              onTap: () => _copyToClipboard('info@ganacsade.com', 'Email copied to clipboard'),
              index: 3,
            ),
            
            const SizedBox(height: 24),
            
            // Legal Section
            Text(
              'Legal & Privacy',
              style: AppTextStyles.titleLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.grey900,
              ),
            ),
            const SizedBox(height: 16),
            
            _buildLegalCard(
              icon: Icons.privacy_tip_outlined,
              title: 'Privacy Policy',
              description: 'How we protect your personal information',
              onTap: () => _showComingSoonDialog('Privacy Policy'),
              index: 0,
            ),
            
            _buildLegalCard(
              icon: Icons.description_outlined,
              title: 'Terms of Service',
              description: 'Terms and conditions for using GANACSADE',
              onTap: () => _showComingSoonDialog('Terms of Service'),
              index: 1,
            ),
            
            _buildLegalCard(
              icon: Icons.security_outlined,
              title: 'Data Security',
              description: 'How we keep your data safe and secure',
              onTap: () => _showComingSoonDialog('Data Security'),
              index: 2,
            ),
            
            const SizedBox(height: 24),
            
            // Developed By Section
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.primaryGreen.withOpacity(0.05),
                    AppColors.primaryGreen.withOpacity(0.1),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.primaryGreen.withOpacity(0.2)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.primaryGreen.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.code_rounded,
                          color: AppColors.primaryGreen,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'about_developed_by'.tr,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.grey600,
                              letterSpacing: 1.2,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            'Raadsan Tech',
                            style: AppTextStyles.headlineSmall.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryGreen,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Innovation • Quality • Excellence',
                    style: AppTextStyles.labelMedium.copyWith(
                      color: AppColors.primaryGreen.withOpacity(0.7),
                      letterSpacing: 2,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Divider(height: 1, thickness: 0.5),
                  const SizedBox(height: 16),
                  Text(
                    'Built with passion for the Somali community, providing state-of-the-art digital solutions for modern businesses.',
                    textAlign: TextAlign.center,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.grey700,
                      height: 1.6,
                    ),
                  ),
                ],
              ),
            )
                .animate(delay: 800.ms)
                .fadeIn(duration: 800.ms)
                .slideY(begin: 0.2, end: 0),
            
            const SizedBox(height: 24),
            
            // Copyright
            Center(
              child: Text(
                '© 2024 GANACSADE Technologies Ltd.\nAll rights reserved.',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.grey500,
                ),
              ),
            )
                .animate(delay: 1000.ms)
                .fadeIn(duration: 600.ms),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildFeatureCards() {
    final features = [
      {
        'icon': Icons.shopping_bag_outlined,
        'title': 'Wide Product Range',
        'description': 'Traditional and modern products for every need',
        'color': AppColors.primaryGreen,
      },
      {
        'icon': Icons.payment,
        'title': 'Secure Payments',
        'description': 'Mobile money integration with Somali telecom providers',
        'color': AppColors.info,
      },
      {
        'icon': Icons.local_shipping,
        'title': 'Fast Delivery',
        'description': 'Quick and reliable delivery across Somalia',
        'color': AppColors.warning,
      },
      {
        'icon': Icons.support_agent,
        'title': '24/7 Support',
        'description': 'Customer support in Somali, Arabic, and English',
        'color': AppColors.success,
      },
    ];

    return features.asMap().entries.map((entry) {
      final index = entry.key;
      final feature = entry.value;
      
      return Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.grey200),
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
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: (feature['color'] as Color).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                feature['icon'] as IconData,
                color: feature['color'] as Color,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    feature['title'] as String,
                    style: AppTextStyles.titleSmall.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.grey900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    feature['description'] as String,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.grey600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      )
          .animate(delay: Duration(milliseconds: (index + 3) * 100))
          .fadeIn(duration: 600.ms)
          .slideX(begin: 0.3, end: 0);
    }).toList();
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String content,
    VoidCallback? onTap,
    required int index,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.grey200),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap != null ? () {
            HapticFeedback.lightImpact();
            onTap();
          } : null,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(
                  icon,
                  color: AppColors.primaryGreen,
                  size: 20,
                ),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: AppTextStyles.titleSmall.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.grey700,
                  ),
                ),
                const Spacer(),
                Flexible(
                  child: Text(
                    content,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: onTap != null ? AppColors.primaryGreen : AppColors.grey900,
                      fontWeight: FontWeight.w500,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (onTap != null) ...[
                  const SizedBox(width: 8),
                  Icon(
                    Icons.copy,
                    color: AppColors.grey400,
                    size: 16,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    )
        .animate(delay: Duration(milliseconds: (index + 7) * 100))
        .fadeIn(duration: 600.ms)
        .slideX(begin: 0.3, end: 0);
  }

  Widget _buildLegalCard({
    required IconData icon,
    required String title,
    required String description,
    required VoidCallback onTap,
    required int index,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.grey200),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 4,
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
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    icon,
                    color: AppColors.primaryGreen,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: AppTextStyles.titleSmall.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.grey900,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        description,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.grey600,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios,
                  color: AppColors.grey400,
                  size: 16,
                ),
              ],
            ),
          ),
        ),
      ),
    )
        .animate(delay: Duration(milliseconds: (index + 11) * 100))
        .fadeIn(duration: 600.ms)
        .slideX(begin: 0.3, end: 0);
  }

  void _showComingSoonDialog(String feature) {
    Get.dialog(
      AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.info,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.schedule,
                color: AppColors.white,
                size: 40,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Coming Soon',
              style: AppTextStyles.titleLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.grey900,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '$feature will be available in a future update.',
              textAlign: TextAlign.center,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.grey600,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Get.back(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.info,
                  foregroundColor: AppColors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('Got it'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _copyToClipboard(String text, String message) {
    Clipboard.setData(ClipboardData(text: text));
    Get.snackbar(
      'Copied',
      message,
      backgroundColor: AppColors.primaryGreen.withOpacity(0.9),
      colorText: AppColors.white,
      duration: const Duration(seconds: 2),
    );
  }
}
