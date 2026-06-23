import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:ganacsade/core/network/http_client.dart';
import 'package:ganacsade/core/services/local_notification_helper.dart';
import 'package:ganacsade/features/notifications/presentation/controllers/app_notifications_controller.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  await LocalNotificationHelper.showFromRemoteMessage(message);
}

class PushNotificationService {
  PushNotificationService._();
  static final PushNotificationService _instance = PushNotificationService._();
  factory PushNotificationService() => _instance;

  final HttpClient _httpClient = HttpClient();
  String? _cachedDeviceToken;
  bool _initialized = false;

  Future<void> initialize() async {
    if (kIsWeb || _initialized) return;

    try {
      await Firebase.initializeApp();
      await LocalNotificationHelper.ensureInitialized();

      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission(alert: true, badge: true, sound: true);

      _cachedDeviceToken = await messaging.getToken();
      await _registerTokenIfLoggedIn(_cachedDeviceToken);

      messaging.onTokenRefresh.listen((token) async {
        _cachedDeviceToken = token;
        await _registerTokenIfLoggedIn(token);
      });

      FirebaseMessaging.onMessage.listen((message) async {
        await LocalNotificationHelper.showFromRemoteMessage(message);
        _refreshInAppFeed();
      });

      FirebaseMessaging.onMessageOpenedApp.listen((_) => _refreshInAppFeed());

      final initialMessage = await messaging.getInitialMessage();
      if (initialMessage != null) {
        _refreshInAppFeed();
      }

      _initialized = true;
    } catch (e) {
      debugPrint('FCM init skipped: $e');
    }
  }

  Future<void> syncTokenWithServer() async {
    if (kIsWeb) return;

    try {
      final messaging = FirebaseMessaging.instance;
      _cachedDeviceToken ??= await messaging.getToken();
      await _registerTokenIfLoggedIn(_cachedDeviceToken);
    } catch (e) {
      debugPrint('Failed to sync FCM token: $e');
    }
  }

  Future<void> _registerTokenIfLoggedIn(String? token) async {
    if (token == null || token.isEmpty) return;
    if (_httpClient.getAccessToken() == null) return;

    try {
      await _httpClient.post(
        '/auth/fcm-token',
        data: {
          'token': token,
          'platform': defaultTargetPlatform.name,
        },
      );
    } catch (e) {
      debugPrint('Failed to register FCM token: $e');
    }
  }

  void _refreshInAppFeed() {
    if (Get.isRegistered<AppNotificationsController>()) {
      Get.find<AppNotificationsController>()
          .refreshNotifications(showForegroundAlert: false);
    }
  }
}
