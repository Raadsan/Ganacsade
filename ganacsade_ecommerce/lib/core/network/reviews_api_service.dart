import 'package:dio/dio.dart';
import 'http_client.dart';

class ReviewsApiService {
  final HttpClient _httpClient = HttpClient();

  /// Get reviews for a product
  Future<Map<String, dynamic>> getProductReviews({
    required String productId,
    int page = 1,
    int limit = 10,
    String sortBy = 'created_at',
    String sortOrder = 'DESC',
    int? rating,
  }) async {
    try {
      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        'sortBy': sortBy,
        'sortOrder': sortOrder,
      };
      
      if (rating != null) {
        queryParams['rating'] = rating.toString();
      }

      final response = await _httpClient.get(
        '/customer/reviews/product/$productId',
        queryParameters: queryParams,
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw Exception(response.data['message'] ?? 'Failed to fetch reviews');
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to fetch reviews');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    }
  }

  /// Create a new review
  Future<Map<String, dynamic>> createReview({
    required String productId,
    required int rating,
    String? title,
    String? comment,
    String? orderId,
  }) async {
    try {
      final response = await _httpClient.post(
        '/customer/reviews',
        data: {
          'productId': productId,
          'rating': rating,
          if (title != null) 'title': title,
          if (comment != null) 'comment': comment,
          if (orderId != null) 'orderId': orderId,
        },
      );

      if (response.statusCode == 201 && response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw Exception(response.data['message'] ?? 'Failed to create review');
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to create review');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    }
  }

  /// Update a review
  Future<Map<String, dynamic>> updateReview({
    required String reviewId,
    int? rating,
    String? title,
    String? comment,
  }) async {
    try {
      final response = await _httpClient.put(
        '/customer/reviews/$reviewId',
        data: {
          if (rating != null) 'rating': rating,
          if (title != null) 'title': title,
          if (comment != null) 'comment': comment,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw Exception(response.data['message'] ?? 'Failed to update review');
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to update review');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    }
  }

  /// Delete a review
  Future<void> deleteReview(String reviewId) async {
    try {
      final response = await _httpClient.delete(
        '/customer/reviews/$reviewId',
      );

      if (response.statusCode != 200 || response.data['success'] != true) {
        throw Exception(response.data['message'] ?? 'Failed to delete review');
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to delete review');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    }
  }

  /// Mark a review as helpful or not helpful
  Future<Map<String, dynamic>> voteReview({
    required String reviewId,
    required bool isHelpful,
  }) async {
    try {
      final response = await _httpClient.post(
        '/customer/reviews/$reviewId/helpful',
        data: {
          'isHelpful': isHelpful,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw Exception(response.data['message'] ?? 'Failed to vote on review');
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to vote on review');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    }
  }
}
