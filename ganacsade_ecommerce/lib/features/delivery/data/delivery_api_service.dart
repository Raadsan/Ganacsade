import 'package:dio/dio.dart';
import 'package:ganacsade/core/network/http_client.dart';

class DeliveryDashboardData {
  final Map<String, dynamic> stats;
  final List<Map<String, dynamic>> recentActive;
  final List<Map<String, dynamic>> recentDelivered;

  const DeliveryDashboardData({
    required this.stats,
    required this.recentActive,
    required this.recentDelivered,
  });
}

class DeliveryApiService {
  final HttpClient _httpClient = HttpClient();

  Future<DeliveryDashboardData> getDashboard() async {
    try {
      final response = await _httpClient.get('/auth/delivery/dashboard');

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'] as Map<String, dynamic>? ?? {};
        return DeliveryDashboardData(
          stats: Map<String, dynamic>.from(data['stats'] as Map? ?? {}),
          recentActive: (data['recentActive'] as List? ?? [])
              .cast<Map<String, dynamic>>(),
          recentDelivered: (data['recentDelivered'] as List? ?? [])
              .cast<Map<String, dynamic>>(),
        );
      }

      throw Exception('Failed to load delivery dashboard');
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Failed to load delivery dashboard');
    }
  }

  Future<List<Map<String, dynamic>>> getMyAssignedOrders({
    String? status,
    String? excludeStatus,
    String? search,
    String? dateFrom,
    String? dateTo,
  }) async {
    try {
      final response = await _httpClient.get(
        '/auth/delivery/orders',
        queryParameters: {
          if (status != null) 'status': status,
          if (excludeStatus != null) 'excludeStatus': excludeStatus,
          if (search != null && search.isNotEmpty) 'search': search,
          if (dateFrom != null && dateFrom.isNotEmpty) 'dateFrom': dateFrom,
          if (dateTo != null && dateTo.isNotEmpty) 'dateTo': dateTo,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'];
        if (data is List) {
          return data.cast<Map<String, dynamic>>();
        }
      }
      return [];
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Failed to load assigned orders');
    }
  }

  Future<void> markDelivered(String orderId, {String? notes}) async {
    final response = await _httpClient.patch(
      '/auth/delivery/orders/$orderId/delivered',
      data: {if (notes != null) 'notes': notes},
    );

    if (response.statusCode != 200 || response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Failed to mark order delivered');
    }
  }
}
