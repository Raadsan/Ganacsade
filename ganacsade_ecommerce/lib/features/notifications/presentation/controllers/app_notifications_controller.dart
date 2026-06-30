import 'package:flutter/widgets.dart';
import 'package:get/get.dart';
import 'package:ganacsade/core/network/http_client.dart';
import 'package:ganacsade/core/network/notifications_api_service.dart';
import 'package:ganacsade/core/services/local_notification_helper.dart';
import 'package:ganacsade/features/auth/presentation/controllers/auth_controller.dart';

class AppNotificationsController extends GetxController with WidgetsBindingObserver {
  final NotificationsApiService _api = NotificationsApiService();

  final RxBool isLoading = false.obs;
  final RxString errorMessage = ''.obs;
  final RxInt unreadCount = 0.obs;
  final RxList<Map<String, dynamic>> notifications = <Map<String, dynamic>>[].obs;

  final Set<String> _seenNotificationIds = {};
  bool _polling = false;

  @override
  void onInit() {
    super.onInit();
    WidgetsBinding.instance.addObserver(this);
    _initWhenReady();
  }

  Future<void> ensureStarted() async {
    if (_polling) {
      if (_canFetchNotifications()) {
        await refreshNotifications(showForegroundAlert: false);
      }
      return;
    }
    await _initWhenReady();
  }

  Future<void> _initWhenReady() async {
    if (Get.isRegistered<AuthController>()) {
      final auth = Get.find<AuthController>();
      await auth.storageReady;
      if (!auth.isLoggedIn) return;
    } else if (HttpClient().getAccessToken() == null) {
      return;
    }

    await refreshNotifications(showForegroundAlert: false);
      _startPolling();
  }

  @override
  void onClose() {
    WidgetsBinding.instance.removeObserver(this);
    _polling = false;
    super.onClose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _canFetchNotifications()) {
      refreshNotifications(showForegroundAlert: false);
    }
  }

  bool _canFetchNotifications() {
    if (!Get.isRegistered<AuthController>()) {
      return HttpClient().getAccessToken() != null;
    }
    return Get.find<AuthController>().isLoggedIn;
  }

  void _startPolling() {
    _polling = true;
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 45));
      if (!_polling) return false;
      if (!_canFetchNotifications()) return _polling;
      await refreshNotifications(showForegroundAlert: true);
      return _polling;
    });
  }

  Future<void> refreshNotifications({bool showForegroundAlert = true}) async {
    if (!_canFetchNotifications()) return;

    try {
      isLoading.value = true;
      errorMessage.value = '';
      final result = await _api.getNotifications();
      final items = result.items;
      unreadCount.value = result.unreadCount;
      notifications.value = items;

      if (showForegroundAlert) {
        for (final item in items) {
          final id = item['id']?.toString();
          final isRead = item['isRead'] == true;
          if (id == null || isRead || _seenNotificationIds.contains(id)) continue;
          _seenNotificationIds.add(id);
          final title = item['title']?.toString() ?? 'Notification';
          final body = item['body']?.toString() ?? '';
          await LocalNotificationHelper.show(
            id: id.hashCode,
            title: title,
            body: body,
          );
        }
      } else {
        for (final item in items) {
          final id = item['id']?.toString();
          if (id != null) _seenNotificationIds.add(id);
        }
      }
    } catch (e) {
      final message = e.toString().replaceAll('Exception: ', '');
      if (message.toLowerCase().contains('route not found') ||
          message.toLowerCase().contains('not found')) {
        notifications.value = [];
        unreadCount.value = 0;
        errorMessage.value = '';
      } else {
        errorMessage.value = message;
      }
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> markAsRead(String notificationId) async {
    await _api.markAsRead(notificationId);
    await refreshNotifications(showForegroundAlert: false);
  }
}
