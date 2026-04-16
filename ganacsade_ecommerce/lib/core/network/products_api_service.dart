import 'package:dio/dio.dart';
import 'http_client.dart';

class ProductsApiService {
  final HttpClient _httpClient = HttpClient();

  /// Get all products with optional filters
  /// 
  /// Parameters:
  /// - search: Search query
  /// - category: Category type filter
  /// - subcategory: Subcategory ID filter
  /// - minPrice: Minimum price filter
  /// - maxPrice: Maximum price filter
  /// - page: Page number (default: 1)
  /// - limit: Items per page (default: 20)
  /// - sortBy: Sort field (default: 'created_at')
  /// - sortOrder: Sort order 'ASC' or 'DESC' (default: 'DESC')
  /// 
  /// Returns: Map containing products array and pagination info
  Future<Map<String, dynamic>> getProducts({
    String? search,
    String? category,
    String? subcategory,
    double? minPrice,
    double? maxPrice,
    int page = 1,
    int limit = 20,
    String sortBy = 'created_at',
    String sortOrder = 'DESC',
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
        'sortBy': sortBy,
        'sortOrder': sortOrder,
      };

      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      if (category != null && category.isNotEmpty) {
        queryParams['category'] = category;
      }
      if (subcategory != null && subcategory.isNotEmpty) {
        queryParams['subcategory'] = subcategory;
      }
      if (minPrice != null) {
        queryParams['minPrice'] = minPrice;
      }
      if (maxPrice != null) {
        queryParams['maxPrice'] = maxPrice;
      }

      final response = await _httpClient.get(
        '/customer/products',
        queryParameters: queryParams,
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: response.data['message'] ?? 'Failed to fetch products',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to fetch products');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    } catch (e) {
      throw Exception('Failed to fetch products: ${e.toString()}');
    }
  }

  /// Get featured products
  /// 
  /// Parameters:
  /// - limit: Number of products to fetch (default: 10)
  /// 
  /// Returns: Map containing products array
  Future<Map<String, dynamic>> getFeaturedProducts({int limit = 10}) async {
    try {
      final response = await _httpClient.get(
        '/customer/products/featured',
        queryParameters: {'limit': limit},
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: response.data['message'] ?? 'Failed to fetch featured products',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to fetch featured products');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    } catch (e) {
      throw Exception('Failed to fetch featured products: ${e.toString()}');
    }
  }

  /// Get flash sale products
  /// 
  /// Parameters:
  /// - limit: Number of products to fetch (default: 10)
  /// 
  /// Returns: Map containing products array
  Future<Map<String, dynamic>> getFlashSaleProducts({int limit = 10}) async {
    try {
      final response = await _httpClient.get(
        '/customer/products/flash-sales',
        queryParameters: {'limit': limit},
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: response.data['message'] ?? 'Failed to fetch flash sale products',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to fetch flash sale products');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    } catch (e) {
      throw Exception('Failed to fetch flash sale products: ${e.toString()}');
    }
  }

  /// Get single product by ID
  /// 
  /// Parameters:
  /// - id: Product ID
  /// 
  /// Returns: Map containing product data
  Future<Map<String, dynamic>> getProductById(String id) async {
    try {
      final response = await _httpClient.get('/customer/products/$id');

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: response.data['message'] ?? 'Failed to fetch product',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to fetch product');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    } catch (e) {
      throw Exception('Failed to fetch product: ${e.toString()}');
    }
  }
}
