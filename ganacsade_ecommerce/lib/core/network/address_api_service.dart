import 'package:dio/dio.dart';
import 'http_client.dart';

class AddressApiService {
  final Dio _dio = HttpClient().dio;

  /// Get all addresses for the authenticated user
  Future<Map<String, dynamic>> getAddresses() async {
    try {
      final response = await _dio.get('/customer/addresses');
      return response.data;
    } on DioException catch (e) {
      if (e.response != null) {
        return e.response!.data;
      }
      return {
        'success': false,
        'message': e.message ?? 'Failed to fetch addresses',
      };
    }
  }

  /// Get a specific address by ID
  Future<Map<String, dynamic>> getAddress(int id) async {
    try {
      final response = await _dio.get('/customer/addresses/$id');
      return response.data;
    } on DioException catch (e) {
      if (e.response != null) {
        return e.response!.data;
      }
      return {
        'success': false,
        'message': e.message ?? 'Failed to fetch address',
      };
    }
  }

  /// Create a new address
  Future<Map<String, dynamic>> createAddress({
    required String title,
    required String fullName,
    required String phoneNumber,
    required String street,
    required String city,
    String? state,
    required String country,
    String? postalCode,
    bool isDefault = false,
  }) async {
    try {
      final response = await _dio.post(
        '/customer/addresses',
        data: {
          'title': title,
          'fullName': fullName,
          'phoneNumber': phoneNumber,
          'street': street,
          'city': city,
          'state': state,
          'country': country,
          'postalCode': postalCode,
          'isDefault': isDefault,
        },
      );
      return response.data;
    } on DioException catch (e) {
      if (e.response != null) {
        return e.response!.data;
      }
      return {
        'success': false,
        'message': e.message ?? 'Failed to create address',
      };
    }
  }

  /// Update an existing address
  Future<Map<String, dynamic>> updateAddress({
    required int id,
    String? title,
    String? fullName,
    String? phoneNumber,
    String? street,
    String? city,
    String? state,
    String? country,
    String? postalCode,
    bool? isDefault,
  }) async {
    try {
      final response = await _dio.put(
        '/customer/addresses/$id',
        data: {
          if (title != null) 'title': title,
          if (fullName != null) 'fullName': fullName,
          if (phoneNumber != null) 'phoneNumber': phoneNumber,
          if (street != null) 'street': street,
          if (city != null) 'city': city,
          if (state != null) 'state': state,
          if (country != null) 'country': country,
          if (postalCode != null) 'postalCode': postalCode,
          if (isDefault != null) 'isDefault': isDefault,
        },
      );
      return response.data;
    } on DioException catch (e) {
      if (e.response != null) {
        return e.response!.data;
      }
      return {
        'success': false,
        'message': e.message ?? 'Failed to update address',
      };
    }
  }

  /// Delete an address
  Future<Map<String, dynamic>> deleteAddress(int id) async {
    try {
      final response = await _dio.delete('/customer/addresses/$id');
      return response.data;
    } on DioException catch (e) {
      if (e.response != null) {
        return e.response!.data;
      }
      return {
        'success': false,
        'message': e.message ?? 'Failed to delete address',
      };
    }
  }

  /// Set an address as default
  Future<Map<String, dynamic>> setDefaultAddress(int id) async {
    try {
      final response = await _dio.put('/customer/addresses/$id/set-default');
      return response.data;
    } on DioException catch (e) {
      if (e.response != null) {
        return e.response!.data;
      }
      return {
        'success': false,
        'message': e.message ?? 'Failed to set default address',
      };
    }
  }
}
