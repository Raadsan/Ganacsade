import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  static const String privacyPolicyUrl =
      'https://doc-hosting.flycricket.io/ganacsade/bf6dc4b9-f4e2-49c3-bc17-62b09581b207/privacy';

  static const String supportEmail = 'ganacsadesakariye@gmail.com';

  Future<void> _openOnlinePolicy() async {
    final uri = Uri.parse(privacyPolicyUrl);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      Get.snackbar(
        'Error',
        'Could not open Privacy Policy link',
        snackPosition: SnackPosition.TOP,
        backgroundColor: AppColors.error,
        colorText: AppColors.white,
      );
    }
  }

  Future<void> _emailDeletionRequest() async {
    final uri = Uri(
      scheme: 'mailto',
      path: supportEmail,
      query: 'subject=Account Deletion Request',
    );
    if (!await launchUrl(uri)) {
      Get.snackbar(
        'Error',
        'Could not open email app',
        snackPosition: SnackPosition.TOP,
        backgroundColor: AppColors.error,
        colorText: AppColors.white,
      );
    }
  }

  void _showDeleteAccountDialog(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor:
            isDark ? AppColors.darkCardBackground : AppColors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(
              Icons.delete_forever_outlined,
              color: AppColors.error,
              size: 24,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'profile_delete_account_confirm_title'.tr,
                style: TextStyle(
                  color: isDark
                      ? AppColors.darkTextPrimary
                      : AppColors.textPrimary,
                ),
              ),
            ),
          ],
        ),
        content: Text(
          'profile_delete_account_confirm_message'.tr,
          style: TextStyle(
            fontSize: 16,
            color: isDark
                ? AppColors.darkTextSecondary
                : AppColors.textSecondary,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: Text(
              'cancel'.tr,
              style: TextStyle(
                color: isDark ? AppColors.darkTextSecondary : AppColors.grey600,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(dialogContext).pop();
              try {
                await Get.find<AuthController>().deleteAccount();
                Get.key.currentState?.pushNamedAndRemoveUntil(
                  '/login',
                  (route) => false,
                );
              } catch (error) {
                Get.snackbar(
                  'profile_delete_account_error'.tr,
                  error.toString().replaceFirst('Exception: ', ''),
                  snackPosition: SnackPosition.TOP,
                  backgroundColor: AppColors.error,
                  colorText: AppColors.white,
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: AppColors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text('profile_delete_account'.tr),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? AppColors.darkTextPrimary : AppColors.grey900;
    final bodyColor = isDark ? AppColors.darkTextSecondary : AppColors.grey700;
    final cardColor = isDark ? AppColors.darkCardBackground : AppColors.white;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacy Policy'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
        actions: [
          IconButton(
            tooltip: 'Open online',
            onPressed: _openOnlinePolicy,
            icon: const Icon(Icons.open_in_browser),
          ),
        ],
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
                  'Privacy Policy for Ganacsade',
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
                  'At Ganacsade, we are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and protect your data when you use our mobile application.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('1. Information We Collect', textColor),
                Text(
                  'We collect the following types of information to provide and improve our services:\n\n'
                  '• Personal Information: Name, email address, phone number, and delivery address when you create an account or place an order.\n'
                  '• Transaction Information: Details of the products or services you purchase from us.\n'
                  '• Device Information: Basic device information such as model and operating system for app performance and security.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('2. How We Use Your Information', textColor),
                Text(
                  'We use the collected data for:\n\n'
                  '• Processing and delivering your orders.\n'
                  '• Managing your account and providing customer support.\n'
                  '• Sending important updates regarding your services (e.g., internet data recharge confirmation).\n'
                  '• Improving the app\'s functionality and user experience.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('3. Data Encryption and Security', textColor),
                Text(
                  'All user data collected by Ganacsade is encrypted in transit using industry-standard security protocols (HTTPS). We take reasonable measures to protect your information from unauthorized access.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('4. Data Sharing', textColor),
                Text(
                  'We do not sell your personal data to third parties. We only share information with trusted partners (e.g., delivery services or payment providers) to the extent necessary to fulfill your requests.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle(
                  '5. Account Deletion and Data Retention',
                  textColor,
                ),
                Text(
                  'We respect your right to control your data. You can request the deletion of your account and all associated data at any time.\n\n'
                  'How to Request Account Deletion:\n\n'
                  '• Inside the App: Go to Profile/Settings and select "Delete Account", or use the button below.\n'
                  '• Via Email: Send an email to $supportEmail with the subject "Account Deletion Request".\n\n'
                  'Process: Once a request is received, we will delete your personal information and account credentials from our active databases within 30 days, unless retention is required by law. Order records needed for business/legal reasons may be retained without your personal contact details.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('6. Children\'s Privacy', textColor),
                Text(
                  'Our services are not intended for children under the age of 13, and we do not knowingly collect data from them.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
                const SizedBox(height: 20),
                _sectionTitle('7. Contact Us', textColor),
                Text(
                  'If you have any questions about this Privacy Policy or our data practices, please contact us at:\nEmail: $supportEmail',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: bodyColor,
                    height: 1.55,
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(duration: 400.ms),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: _openOnlinePolicy,
            icon: const Icon(Icons.link),
            label: const Text('Open full Privacy Policy online'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primaryGreen,
              side: const BorderSide(color: AppColors.primaryGreen),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: () => _showDeleteAccountDialog(context),
            icon: const Icon(Icons.delete_forever_outlined),
            label: const Text('Delete my account'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: AppColors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: _emailDeletionRequest,
            child: Text(
              'Or email deletion request to $supportEmail',
              textAlign: TextAlign.center,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.primaryGreen,
              ),
            ),
          ),
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
