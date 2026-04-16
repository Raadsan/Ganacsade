import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_config.dart';
import '../../shared/models/product.dart';

class WishlistApiService {
  final String baseUrl = ApiConfig.getBaseUrl();

  /// Get user's wishlist items
  Future<List<Product>> getWishlist(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/customer/wishlist'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          final List<dynamic> items = data['data'];
          return items.map((item) => Product.fromJson(item)).toList();
        }
      }
      throw Exception('Failed to load wishlist');
    } catch (e) {
      print('Error fetching wishlist: $e');
      rethrow;
    }
  }

  /// Add product to wishlist
  Future<Map<String, dynamic>> addToWishlist(String token, String productId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/customer/wishlist'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'product_id': productId,
        }),
      );

      final data = jsonDecode(response.body);
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        return data;
      } else if (response.statusCode == 400 && data['message'] == 'Product already in wishlist') {
        return data;
      }
      
      throw Exception(data['message'] ?? 'Failed to add to wishlist');
    } catch (e) {
      print('Error adding to wishlist: $e');
      rethrow;
    }
  }

  /// Remove product from wishlist
  Future<Map<String, dynamic>> removeFromWishlist(String token, String productId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/customer/wishlist/$productId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final data = jsonDecode(response.body);
      
      if (response.statusCode == 200) {
        return data;
      }
      
      throw Exception(data['message'] ?? 'Failed to remove from wishlist');
    } catch (e) {
      print('Error removing from wishlist: $e');
      rethrow;
    }
  }

  /// Clear entire wishlist
  Future<Map<String, dynamic>> clearWishlist(String token) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/customer/wishlist'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final data = jsonDecode(response.body);
      
      if (response.statusCode == 200) {
        return data;
      }
      
      throw Exception(data['message'] ?? 'Failed to clear wishlist');
    } catch (e) {
      print('Error clearing wishlist: $e');
      rethrow;
    }
  }

  /// Check if product is in wishlist
  Future<bool> isInWishlist(String token, String productId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/customer/wishlist/check/$productId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['inWishlist'] ?? false;
      }
      
      return false;
    } catch (e) {
      print('Error checking wishlist: $e');
      return false;
    }
  }
}
