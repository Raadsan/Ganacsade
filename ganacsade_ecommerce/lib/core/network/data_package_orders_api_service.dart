import 'package:dio/dio.dart';
import 'http_client.dart';

class DataPackageOrdersApiService {
  final Dio _dio = HttpClient().dio;

  /// Create a data package order after successful payment
  Future<Map<String, dynamic>> createDataPackageOrder({
    required int packageId,
    required String packageName,
    required int providerId,
    required String providerName,
    required double amount,
    required String recipientPhone,
    String? paymentPhone,
    required Map<String, dynamic> paymentMethod,
    String? transactionId,
    String? packageDuration,
    String? packageData,
  }) async {
    try {
      print('DataPackageOrdersApiService: Creating data package order...');
      print('  - Package: $packageName');
      print('  - Provider: $providerName');
      print('  - Recipient: $recipientPhone');
      print('  - Amount: \$$amount');
      
      final response = await _dio.post(
        '/customer/data-package-orders',
        data: {
          'packageId': packageId,
          'packageName': packageName,
          'providerId': providerId,
          'providerName': providerName,
          'amount': amount,
          'recipientPhone': recipientPhone,
          'paymentPhone': paymentPhone,
          'paymentMethod': paymentMethod,
          'transactionId': transactionId,
          'packageDuration': packageDuration,
          'packageData': packageData,
        },
      );
      
      print('DataPackageOrdersApiService: Order created successfully');
      print('  - Order Number: ${response.data['data']?['orderNumber']}');
      
      return response.data;
    } on DioException catch (e) {
      print('DataPackageOrdersApiService: Error creating order: ${e.message}');
      if (e.response != null) {
        print('DataPackageOrdersApiService: Error response: ${e.response!.data}');
        return e.response!.data;
      }
      return {
        'success': false,
        'message': e.message ?? 'Failed to create data package order',
      };
    }
  }
}
