import 'package:dio/dio.dart';
import 'http_client.dart';

class OrdersApiService {
  final Dio _dio = HttpClient().dio;

  /// Create a new order
  Future<Map<String, dynamic>> createOrder({
    required List<Map<String, dynamic>> items,
    required Map<String, dynamic> shippingAddress,
    required Map<String, dynamic> paymentMethod,
    required double subtotal,
    required double tax,
    required double shipping,
    required double discount,
    required double total,
    String? notes,
    String? transactionId,
  }) async {
    try {
      final response = await _dio.post(
        '/customer/orders',
        data: {
          'items': items,
          'shippingAddress': shippingAddress,
          'paymentMethod': paymentMethod,
          'subtotal': subtotal,
          'tax': tax,
          'shipping': shipping,
          'discount': discount,
          'total': total,
          'notes': notes,
          if (transactionId != null) 'transactionId': transactionId,
        },
      );
      return response.data;
    } on DioException catch (e) {
      if (e.response != null) {
        return e.response!.data;
      }
      return {
        'success': false,
        'message': e.message ?? 'Failed to create order',
      };
    }
  }

  /// Get user's orders
  Future<Map<String, dynamic>> getOrders({
    String? status,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _dio.get(
        '/customer/orders',
        queryParameters: {
          if (status != null) 'status': status,
          'page': page,
          'limit': limit,
        },
      );
      return response.data;
    } on DioException catch (e) {
      if (e.response != null) {
        return e.response!.data;
      }
      return {
        'success': false,
        'message': e.message ?? 'Failed to fetch orders',
      };
    }
  }

  /// Get order details
  Future<Map<String, dynamic>> getOrderDetails(String orderId) async {
    try {
      final response = await _dio.get('/customer/orders/$orderId');
      return response.data;
    } on DioException catch (e) {
      if (e.response != null) {
        return e.response!.data;
      }
      return {
        'success': false,
        'message': e.message ?? 'Failed to fetch order details',
      };
    }
  }
}
