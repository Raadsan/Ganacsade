import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class TermsOfServiceScreen extends StatelessWidget {
  const TermsOfServiceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? AppColors.darkTextPrimary : AppColors.grey900;
    final bodyColor = isDark ? AppColors.darkTextSecondary : AppColors.grey700;
    final cardColor = isDark ? AppColors.darkCardBackground : AppColors.white;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Terms of Service'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: cardColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.grey200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Terms of Service for Ganacsade',
                  style: AppTextStyles.titleLarge.copyWith(
                    fontWeight: FontWeight.bold,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Last Updated: May 03, 2026',
                  style: AppTextStyles.bodySmall.copyWith(color: bodyColor),
                ),
                const SizedBox(height: 16),
                Text(
                  'Welcome to Ganacsade. By downloading, accessing, or using our mobile application and related services, you agree to these Terms of Service. If you do not agree, please do not use the app.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('1. About Ganacsade', textColor),
                Text(
                  'Ganacsade is an e-commerce platform that connects customers with products and services in Somalia and the region. We provide tools to browse products, place orders, manage deliveries, and access related services offered through the app.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('2. Eligibility and Accounts', textColor),
                Text(
                  'You must provide accurate registration information and keep your login details secure. You are responsible for all activity under your account. You may delete your account at any time from Profile → Delete Account, or by emailing ganacsadesakariye@gmail.com with the subject "Account Deletion Request".',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('3. Orders, Payments, and Delivery', textColor),
                Text(
                  'When you place an order, you agree to pay the displayed price and any applicable delivery or service fees using the payment methods available in the app (such as mobile money or cash on delivery). Order confirmation, delivery timing, and availability may vary. If an item is unavailable, we may cancel or adjust the order and notify you.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('4. Product Information', textColor),
                Text(
                  'We aim to display accurate product descriptions, prices, and images. Occasional errors may occur. If a material error is found, we may correct it and contact you before completing the order.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('5. Acceptable Use', textColor),
                Text(
                  'You agree not to misuse the app, including attempting unauthorized access, interfering with other users, submitting false information, or using the service for unlawful purposes. We may suspend or terminate accounts that violate these Terms.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('6. Intellectual Property', textColor),
                Text(
                  'The Ganacsade name, logos, app design, and content are owned by Ganacsade / Raadsan Tech or its licensors. You may not copy, modify, or redistribute our materials without written permission.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('7. Limitation of Liability', textColor),
                Text(
                  'To the fullest extent permitted by law, Ganacsade is not liable for indirect, incidental, or consequential damages arising from your use of the app, including delivery delays caused by third parties or network issues outside our reasonable control.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('8. Privacy', textColor),
                Text(
                  'Your use of Ganacsade is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('9. Changes to These Terms', textColor),
                Text(
                  'We may update these Terms from time to time. Continued use of the app after changes means you accept the updated Terms. The "Last Updated" date at the top will reflect the latest revision.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('10. Contact', textColor),
                Text(
                  'Questions about these Terms of Service:\n'
                  'Email: ganacsadesakariye@gmail.com\n'
                  'Location: Mogadishu, Somalia',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(duration: 400.ms),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: AppTextStyles.titleSmall.copyWith(
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }
}
