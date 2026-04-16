import 'package:dio/dio.dart';
import 'http_client.dart';

class PaymentApiService {
  final Dio _dio = HttpClient().dio;

  /// Process payment for an order using WaafiPay
  Future<Map<String, dynamic>> processPayment({
    required String orderId,
    required String phoneNumber,
  }) async {
    try {
      print('PaymentApiService: Processing payment for order $orderId, phone: $phoneNumber');
      final response = await _dio.post(
        '/customer/payments/process',
        data: {
          'orderId': orderId,
          'phoneNumber': phoneNumber,
        },
        options: Options(
          receiveTimeout: const Duration(seconds: 90), // Extended timeout for user to enter PIN
        ),
      );
      print('PaymentApiService: Response: ${response.data}');
      return response.data;
    } on DioException catch (e) {
      print('PaymentApiService: Error: ${e.message}');
      if (e.response != null) {
        print('PaymentApiService: Error response: ${e.response!.data}');
        return e.response!.data;
      }
      return {
        'success': false,
        'message': e.message ?? 'Payment processing failed',
      };
    }
  }

  /// Process payment directly without creating order first
  /// Payment first, order creation after success
  /// Supports providers: waafipay, edahab
  Future<Map<String, dynamic>> processPaymentDirect({
    required String phoneNumber,
    required double amount,
    required String description,
    String provider = 'waafipay',
  }) async {
    try {
      print('PaymentApiService: Processing direct payment via $provider, phone: $phoneNumber, amount: $amount');
      final response = await _dio.post(
        '/customer/payments/process-direct',
        data: {
          'phoneNumber': phoneNumber,
          'amount': amount,
          'description': description,
          'provider': provider,
        },
        options: Options(
          receiveTimeout: const Duration(seconds: 160), // Must exceed backend max (120s preAuth + 30s commit)
        ),
      );
      print('PaymentApiService: Direct payment response: ${response.data}');
      return response.data;
    } on DioException catch (e) {
      print('PaymentApiService: Direct payment error: ${e.message}');
      if (e.response != null) {
        print('PaymentApiService: Error response: ${e.response!.data}');
        return e.response!.data;
      }
      return {
        'success': false,
        'message': e.message ?? 'Payment processing failed',
      };
    }
  }

  /// Get payment status for an order
  Future<Map<String, dynamic>> getPaymentStatus(String orderId) async {
    try {
      final response = await _dio.get('/customer/payments/status/$orderId');
      return response.data;
    } on DioException catch (e) {
      if (e.response != null) {
        return e.response!.data;
      }
      return {
        'success': false,
        'message': e.message ?? 'Failed to get payment status',
      };
    }
  }

  /// Initiate HPP (Hosted Payment Page) - opens WaafiPay's secure page
  /// This bypasses the pre-balance check issue
  Future<Map<String, dynamic>> initiateHPP({
    required String orderId,
    required String phoneNumber,
  }) async {
    try {
      print('PaymentApiService: Initiating HPP for order $orderId, phone: $phoneNumber');
      final response = await _dio.post(
        '/customer/payments/hpp/initiate',
        data: {
          'orderId': orderId,
          'phoneNumber': phoneNumber,
        },
      );
      print('PaymentApiService: HPP Response: ${response.data}');
      return response.data;
    } on DioException catch (e) {
      print('PaymentApiService: HPP Error: ${e.message}');
      if (e.response != null) {
        print('PaymentApiService: HPP Error response: ${e.response!.data}');
        return e.response!.data;
      }
      return {
        'success': false,
        'message': e.message ?? 'Failed to initiate payment page',
      };
    }
  }
}
