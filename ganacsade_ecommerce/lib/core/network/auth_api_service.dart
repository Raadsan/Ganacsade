import 'package:dio/dio.dart';
import 'http_client.dart';
import 'api_config.dart';

class AuthApiService {
  final HttpClient _httpClient = HttpClient();

  /// Register a new user
  /// 
  /// Parameters:
  /// - email: User's email address
  /// - password: User's password (min 6 characters)
  /// - firstName: User's first name
  /// - lastName: User's last name
  /// - phoneNumber: User's phone number
  /// 
  /// Returns: Map containing user data, access token, and refresh token
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String phoneNumber,
  }) async {
    try {
      final response = await _httpClient.post(
        ApiConfig.registerEndpoint,
        data: {
          'email': email,
          'password': password,
          'firstName': firstName,
          'lastName': lastName,
          'phoneNumber': phoneNumber,
          'role': 'customer', // Default role for mobile app users
        },
      );

      if (response.statusCode == 201 && response.data['success'] == true) {
        // Save tokens
        final token = response.data['data']['token'];
        final refreshToken = response.data['data']['refreshToken'];
        await _httpClient.saveTokens(token, refreshToken);

        return response.data;
      } else {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: response.data['message'] ?? 'Registration failed',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Registration failed');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    } catch (e) {
      throw Exception('Registration failed: ${e.toString()}');
    }
  }

  /// Login user
  /// 
  /// Parameters:
  /// - email: User's email address
  /// - password: User's password
  /// 
  /// Returns: Map containing user data, access token, and refresh token
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _httpClient.post(
        ApiConfig.loginEndpoint,
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        // Save tokens
        final token = response.data['data']['token'];
        final refreshToken = response.data['data']['refreshToken'];
        await _httpClient.saveTokens(token, refreshToken);

        return response.data;
      } else {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: response.data['message'] ?? 'Login failed',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final message = e.response!.data['message'] ?? 'Login failed';
        throw Exception(message);
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    } catch (e) {
      throw Exception('Login failed: ${e.toString()}');
    }
  }

  /// Get user profile
  /// 
  /// Returns: Map containing user profile data
  Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await _httpClient.get(ApiConfig.profileEndpoint);

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data;
      } else {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: response.data['message'] ?? 'Failed to fetch profile',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to fetch profile');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    } catch (e) {
      throw Exception('Failed to fetch profile: ${e.toString()}');
    }
  }

  /// Update user profile
  /// 
  /// Parameters:
  /// - firstName: User's first name (optional)
  /// - lastName: User's last name (optional)
  /// - phoneNumber: User's phone number (optional)
  /// 
  /// Returns: Map containing updated user data
  Future<Map<String, dynamic>> updateProfile({
    String? firstName,
    String? lastName,
    String? phoneNumber,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (firstName != null) data['firstName'] = firstName;
      if (lastName != null) data['lastName'] = lastName;
      if (phoneNumber != null) data['phoneNumber'] = phoneNumber;

      final response = await _httpClient.put(
        ApiConfig.profileEndpoint,
        data: data,
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data;
      } else {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: response.data['message'] ?? 'Failed to update profile',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to update profile');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    } catch (e) {
      throw Exception('Failed to update profile: ${e.toString()}');
    }
  }

  /// Logout user
  /// 
  /// Returns: Success message
  Future<void> logout() async {
    try {
      await _httpClient.post(ApiConfig.logoutEndpoint);
      // Clear tokens regardless of response
      await _httpClient.clearTokens();
    } catch (e) {
      // Clear tokens even if API call fails
      await _httpClient.clearTokens();
      print('Logout error: $e');
    }
  }

  /// Change password
  /// 
  /// Parameters:
  /// - currentPassword: User's current password
  /// - newPassword: User's new password
  /// 
  /// Returns: Success message
  Future<Map<String, dynamic>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final response = await _httpClient.post(
        '${ApiConfig.authEndpoint}/change-password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data;
      } else {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: response.data['message'] ?? 'Failed to change password',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to change password');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    } catch (e) {
      throw Exception('Failed to change password: ${e.toString()}');
    }
  }
}
