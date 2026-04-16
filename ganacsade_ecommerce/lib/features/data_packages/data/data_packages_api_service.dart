import 'package:dio/dio.dart';

/// API Service for Data Packages feature
class DataPackagesApiService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'https://daato.so/api',
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
  ));

  /// Reseller phone number - this should be configured
  static const String resellerPhone = '615775378';

  /// Find reseller and get all companies with packages
  Future<Map<String, dynamic>> findReseller() async {
    try {
      print('DataPackagesApiService: Calling findReseller with phone: $resellerPhone');
      final response = await _dio.post(
        '/findReseller',
        queryParameters: {
          'reseller_phone': resellerPhone,
        },
      );
      print('DataPackagesApiService: Response received: ${response.statusCode}');
      print('DataPackagesApiService: Response data type: ${response.data.runtimeType}');
      
      // Handle response - could be Map or need parsing
      if (response.data is Map<String, dynamic>) {
        return response.data;
      } else if (response.data is String) {
        // Try to parse if it's a string
        return {'status': 'Error', 'message': 'Unexpected string response'};
      }
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      print('DataPackagesApiService: DioException: ${e.type} - ${e.message}');
      print('DataPackagesApiService: Response: ${e.response?.data}');
      if (e.response != null && e.response!.data is Map) {
        return e.response!.data;
      }
      return {
        'status': 'Error',
        'message': e.message ?? 'Failed to fetch data',
      };
    } catch (e) {
      print('DataPackagesApiService: General error: $e');
      return {
        'status': 'Error',
        'message': 'Unexpected error: $e',
      };
    }
  }

  /// Add customer - process the data package purchase
  Future<Map<String, dynamic>> addCustomer({
    required int resellerId,
    required String fromPhone,
    required String toPhone,
    required int companyId,
    required int packageId,
    required double amount,
  }) async {
    try {
      print('📦 DataPackagesApiService: Calling addCustomer API');
      print('   URL: https://daato.so/api/addCustomer');
      print('   Parameters:');
      print('     - reseller_id: $resellerId');
      print('     - from: $fromPhone');
      print('     - to: $toPhone');
      print('     - company_id: $companyId');
      print('     - packages: $packageId');
      print('     - amount: $amount');
      
      final response = await _dio.post(
        '/addCustomer',
        queryParameters: {
          'reseller_id': resellerId,
          'from': fromPhone,
          'to': toPhone,
          'company_id': companyId,
          'packages': packageId,
          'amount': amount,
        },
      );
      
      print('✅ DataPackagesApiService: addCustomer Response:');
      print('   Status Code: ${response.statusCode}');
      print('   Data: ${response.data}');
      
      return response.data;
    } on DioException catch (e) {
      print('❌ DataPackagesApiService: addCustomer DioException');
      print('   Type: ${e.type}');
      print('   Message: ${e.message}');
      print('   Response Status: ${e.response?.statusCode}');
      print('   Response Data: ${e.response?.data}');
      
      if (e.response != null && e.response!.data is Map) {
        return e.response!.data;
      }
      return {
        'status': 'Error',
        'message': e.message ?? 'Failed to process purchase',
      };
    } catch (e) {
      print('❌ DataPackagesApiService: addCustomer General Error: $e');
      return {
        'status': 'Error',
        'message': 'Unexpected error: $e',
      };
    }
  }
}
