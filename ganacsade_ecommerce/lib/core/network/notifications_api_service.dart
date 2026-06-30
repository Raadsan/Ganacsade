import 'package:dio/dio.dart';
import 'package:ganacsade/core/network/http_client.dart';

class NotificationFeedResult {
  final List<Map<String, dynamic>> items;
  final int unreadCount;

  const NotificationFeedResult({
    required this.items,
    required this.unreadCount,
  });
}

class NotificationsApiService {
  final HttpClient _httpClient = HttpClient();

  Future<NotificationFeedResult> getNotifications() async {
    try {
      final response = await _httpClient.get('/customer/notifications');

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'];
        final unreadCount = response.data['meta']?['unreadCount'] is int
            ? response.data['meta']['unreadCount'] as int
            : 0;
        if (data is List) {
          return NotificationFeedResult(
            items: data.cast<Map<String, dynamic>>(),
            unreadCount: unreadCount,
          );
        }
      }
      return const NotificationFeedResult(items: [], unreadCount: 0);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return const NotificationFeedResult(items: [], unreadCount: 0);
      }
      throw Exception(e.response?.data['message'] ?? 'Failed to load notifications');
    }
  }

  Future<void> markAsRead(String notificationId) async {
    await _httpClient.patch('/customer/notifications/$notificationId/read');
  }

  Future<void> markAllAsRead() async {
    await _httpClient.patch('/customer/notifications/read-all');
  }
}
