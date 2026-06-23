import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class LocalNotificationHelper {
  LocalNotificationHelper._();

  static final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel androidChannel =
      AndroidNotificationChannel(
    'ganacsade_alerts',
    'GANACSADE Alerts',
    description: 'Order updates and delivery notifications',
    importance: Importance.max,
  );

  static bool _initialized = false;

  static Future<void> ensureInitialized() async {
    if (_initialized) return;

    const androidInit = AndroidInitializationSettings('@mipmap/launcher_icon');
    const initSettings = InitializationSettings(android: androidInit);

    await _plugin.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (_) {},
    );

    final androidPlugin = _plugin.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();

    await androidPlugin?.createNotificationChannel(androidChannel);
    await androidPlugin?.requestNotificationsPermission();

    _initialized = true;
  }

  static Future<void> show({
    required int id,
    required String title,
    required String body,
  }) async {
    await ensureInitialized();

    await _plugin.show(
      id,
      title,
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          androidChannel.id,
          androidChannel.name,
          channelDescription: androidChannel.description,
          importance: Importance.max,
          priority: Priority.high,
          visibility: NotificationVisibility.public,
          playSound: true,
          enableVibration: true,
          icon: '@mipmap/launcher_icon',
        ),
      ),
    );
  }

  static Future<void> showFromRemoteMessage(RemoteMessage message) async {
    final title = message.notification?.title
        ?? message.data['title']
        ?? 'GANACSADE';
    final body = message.notification?.body
        ?? message.data['body']
        ?? '';

    if (body.isEmpty && title == 'GANACSADE') return;

    await show(
      id: message.hashCode,
      title: title,
      body: body,
    );
  }
}
