import 'package:dio/dio.dart';
import 'http_client.dart';

class CategoriesApiService {
  final HttpClient _httpClient = HttpClient();

  /// Get all categories with product count
  /// 
  /// Returns: Map containing categories array
  Future<Map<String, dynamic>> getCategories() async {
    try {
      final response = await _httpClient.get('/customer/categories');

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: response.data['message'] ?? 'Failed to fetch categories',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to fetch categories');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    } catch (e) {
      throw Exception('Failed to fetch categories: ${e.toString()}');
    }
  }

  /// Get single category by ID with subcategories
  /// 
  /// Parameters:
  /// - id: Category ID
  /// 
  /// Returns: Map containing category data with subcategories
  Future<Map<String, dynamic>> getCategoryById(String id) async {
    try {
      print('📡 Fetching category by ID: $id');
      final response = await _httpClient.get('/customer/categories/$id');
      print('📡 Response status: ${response.statusCode}');
      print('📡 Response data: ${response.data}');

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: response.data['message'] ?? 'Failed to fetch category',
        );
      }
    } on DioException catch (e) {
      print('📡 DioException: ${e.message}');
      print('📡 DioException response: ${e.response?.data}');
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to fetch category');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    } catch (e) {
      print('📡 General exception: $e');
      throw Exception('Failed to fetch category: ${e.toString()}');
    }
  }

  /// Get category by type
  /// 
  /// Parameters:
  /// - type: Category type (e.g., 'internet', 'gifts', 'electronics')
  /// 
  /// Returns: Map containing category data
  Future<Map<String, dynamic>> getCategoryByType(String type) async {
    try {
      final response = await _httpClient.get('/customer/categories/type/$type');

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: response.data['message'] ?? 'Failed to fetch category',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to fetch category');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    } catch (e) {
      throw Exception('Failed to fetch category: ${e.toString()}');
    }
  }
}
