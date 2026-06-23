import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../notifications/presentation/controllers/app_notifications_controller.dart';

class AppNotificationsList extends StatelessWidget {
  const AppNotificationsList({super.key, this.deliveryMode = false});

  final bool deliveryMode;

  void _showNotificationDetails(
    BuildContext context,
    AppNotificationsController controller,
    Map<String, dynamic> item,
  ) {
    final id = item['id']?.toString();
    final title = item['title']?.toString() ?? 'Notification';
    final body = item['body']?.toString() ?? '';
    final isRead = item['isRead'] == true;

    if (!isRead && id != null) {
      controller.markAsRead(id);
    }

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(title),
        content: SingleChildScrollView(
          child: Text(body),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  String _formatTime(dynamic value) {
    if (value == null) return '';
    final date = DateTime.tryParse(value.toString());
    if (date == null) return '';
    return DateFormat('dd MMM, HH:mm').format(date.toLocal());
  }

  IconData _iconForType(String? type) {
    switch (type) {
      case 'order_assigned':
      case 'order_status':
        return Icons.local_shipping_outlined;
      default:
        return Icons.notifications_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<AppNotificationsController>();

    return Obx(() {
      if (controller.isLoading.value && controller.notifications.isEmpty) {
        return deliveryMode
            ? const Center(child: CircularProgressIndicator())
            : const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(child: CircularProgressIndicator()),
              );
      }

      if (controller.errorMessage.value.isNotEmpty && controller.notifications.isEmpty) {
        return _buildMessageCard(
          icon: Icons.error_outline,
          color: AppColors.error,
          title: 'Could not load notifications',
          body: controller.errorMessage.value,
          action: TextButton(
            onPressed: () => controller.refreshNotifications(showForegroundAlert: false),
            child: const Text('Try again'),
          ),
        );
      }

      if (controller.notifications.isEmpty) {
        return _buildMessageCard(
          icon: Icons.notifications_none_outlined,
          color: AppColors.grey500,
          title: 'No notifications yet',
          body: deliveryMode
              ? 'Marka dalab laguu xilsaaro, ogeysiisyada halkan ayay ka muuqan doonaan.'
              : 'Wax ogeysiis ah ma jiro hadda.',
        );
      }

      final listView = ListView.separated(
        shrinkWrap: !deliveryMode,
        physics: deliveryMode ? const AlwaysScrollableScrollPhysics() : const NeverScrollableScrollPhysics(),
        padding: deliveryMode ? const EdgeInsets.all(16) : EdgeInsets.zero,
        itemCount: controller.notifications.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final item = controller.notifications[index];
          final title = item['title']?.toString() ?? 'Notification';
          final body = item['body']?.toString() ?? '';
          final isRead = item['isRead'] == true;
          final type = item['type']?.toString();
          final createdAt = _formatTime(item['createdAt']);

          return Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () => _showNotificationDetails(context, controller, item),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isRead ? AppColors.white : AppColors.primaryGreen.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isRead ? AppColors.grey200 : AppColors.primaryGreen.withOpacity(0.25),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.shadowLight,
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.primaryGreen.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        _iconForType(type),
                        color: AppColors.primaryGreen,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  title,
                                  style: AppTextStyles.titleSmall.copyWith(
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              if (!isRead)
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: AppColors.error,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                            ],
                          ),
                          if (createdAt.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              createdAt,
                              style: AppTextStyles.bodySmall.copyWith(color: AppColors.grey500),
                            ),
                          ],
                          const SizedBox(height: 8),
                          Text(
                            body,
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.grey700,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      );

      if (deliveryMode) {
        return RefreshIndicator(
          onRefresh: () => controller.refreshNotifications(showForegroundAlert: false),
          child: listView,
        );
      }

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Recent Alerts',
                style: AppTextStyles.titleMedium.copyWith(fontWeight: FontWeight.bold),
              ),
              if (controller.unreadCount.value > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.error.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${controller.unreadCount.value} unread',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.error,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          listView,
          const SizedBox(height: 8),
        ],
      );
    });
  }

  Widget _buildMessageCard({
    required IconData icon,
    required Color color,
    required String title,
    required String body,
    Widget? action,
  }) {
    final content = Container(
      width: double.infinity,
      margin: deliveryMode ? const EdgeInsets.all(16) : EdgeInsets.zero,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.grey200),
      ),
      child: Column(
        children: [
          Icon(icon, size: 48, color: color),
          const SizedBox(height: 16),
          Text(
            title,
            textAlign: TextAlign.center,
            style: AppTextStyles.titleMedium.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.grey600),
          ),
          if (action != null) ...[
            const SizedBox(height: 12),
            action,
          ],
        ],
      ),
    );

    if (deliveryMode) {
      return Center(child: content);
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: content,
    );
  }
}
