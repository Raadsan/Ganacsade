import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../notifications/presentation/controllers/app_notifications_controller.dart';
import '../controllers/profile_controller.dart';
import '../widgets/app_notifications_list.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key, this.deliveryMode = false});

  final bool deliveryMode;

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    if (Get.isRegistered<AppNotificationsController>()) {
      Get.find<AppNotificationsController>().refreshNotifications(showForegroundAlert: false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
        actions: [
          if (Get.isRegistered<AppNotificationsController>())
            IconButton(
              onPressed: () => Get.find<AppNotificationsController>()
                  .refreshNotifications(showForegroundAlert: false),
              icon: const Icon(Icons.refresh),
            ),
        ],
      ),
      body: widget.deliveryMode ? _buildDeliveryFeed() : _buildFullScreen(),
    );
  }

  Widget _buildDeliveryFeed() {
    return const AppNotificationsList(deliveryMode: true);
  }

  Widget _buildFullScreen() {
    return GetBuilder<ProfileController>(
      builder: (controller) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.primaryGreen.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.primaryGreen,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.notifications_outlined,
                        color: AppColors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Stay Updated',
                            style: AppTextStyles.titleMedium.copyWith(
                              color: AppColors.primaryGreen,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Get notified about orders, offers, and updates',
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
                  .animate()
                  .fadeIn(duration: 600.ms)
                  .slideY(begin: -0.2, end: 0),

              const SizedBox(height: 24),
              const AppNotificationsList(),
              const SizedBox(height: 24),
              Text(
                'Preferences',
                style: AppTextStyles.titleMedium.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.grey900,
                ),
              ),
              const SizedBox(height: 16),
              _buildNotificationCard(
                icon: Icons.notifications_active,
                title: 'All Notifications',
                subtitle: 'Enable or disable all notifications',
                value: controller.notificationsEnabled,
                onChanged: (value) {
                  HapticFeedback.lightImpact();
                  controller.toggleNotifications(value);
                },
                index: 0,
              ),
              _buildNotificationCard(
                icon: Icons.email_outlined,
                title: 'Email Notifications',
                subtitle: 'Receive notifications via email',
                value: controller.emailNotifications,
                onChanged: controller.notificationsEnabled
                    ? (value) {
                        HapticFeedback.lightImpact();
                        controller.toggleEmailNotifications(value);
                      }
                    : null,
                index: 1,
              ),
              _buildNotificationCard(
                icon: Icons.phone_android,
                title: 'Push Notifications',
                subtitle: 'Receive notifications on your device',
                value: controller.pushNotifications,
                onChanged: controller.notificationsEnabled
                    ? (value) {
                        HapticFeedback.lightImpact();
                        controller.togglePushNotifications(value);
                      }
                    : null,
                index: 2,
              ),
              _buildNotificationCard(
                icon: Icons.sms_outlined,
                title: 'SMS Notifications',
                subtitle: 'Receive notifications via SMS',
                value: controller.smsNotifications,
                onChanged: controller.notificationsEnabled
                    ? (value) {
                        HapticFeedback.lightImpact();
                        controller.toggleSmsNotifications(value);
                      }
                    : null,
                index: 3,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildNotificationCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool>? onChanged,
    required int index,
  }) {
    final isEnabled = onChanged != null;

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
          onTap: isEnabled ? () => onChanged(value) : null,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: (isEnabled ? AppColors.primaryGreen : AppColors.grey400)
                        .withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    icon,
                    color: isEnabled ? AppColors.primaryGreen : AppColors.grey400,
                    size: 24,
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
                          color: isEnabled ? AppColors.grey900 : AppColors.grey400,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: isEnabled ? AppColors.grey600 : AppColors.grey400,
                        ),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: value,
                  onChanged: onChanged,
                  activeColor: AppColors.primaryGreen,
                  inactiveThumbColor: AppColors.grey400,
                  inactiveTrackColor: AppColors.grey200,
                ),
              ],
            ),
          ),
        ),
      ),
    )
        .animate(delay: Duration(milliseconds: index * 100))
        .fadeIn(duration: 600.ms)
        .slideX(begin: 0.3, end: 0);
  }
}
