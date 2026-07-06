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
    String? email,
    required String password,
    String? firstName,
    String? lastName,
    String? phoneNumber,
  }) async {
    try {
      final response = await _httpClient.post(
        ApiConfig.registerEndpoint,
        data: {
          if (email != null) 'email': email,
          'password': password,
          if (firstName != null) 'firstName': firstName,
          if (lastName != null) 'lastName': lastName,
          if (phoneNumber != null) 'phoneNumber': phoneNumber,
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
    String? email,
    String? phoneNumber,
    String? identifier,
    required String password,
  }) async {
    try {
      final response = await _httpClient.post(
        ApiConfig.loginEndpoint,
        data: {
          if (identifier != null) 'identifier': identifier,
          if (email != null) 'email': email,
          if (phoneNumber != null) 'phoneNumber': phoneNumber,
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

  /// Google Sign-In / Sign-Up (customer)
  Future<Map<String, dynamic>> signInWithGoogle({required String idToken}) async {
    try {
      final response = await _httpClient.post(
        ApiConfig.googleSignInEndpoint,
        data: {'idToken': idToken},
        options: Options(
          sendTimeout: const Duration(seconds: 45),
          receiveTimeout: const Duration(seconds: 45),
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final token = response.data['data']['token'];
        final refreshToken = response.data['data']['refreshToken'];
        await _httpClient.saveTokens(token, refreshToken);
        return response.data;
      }

      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        type: DioExceptionType.badResponse,
        error: response.data['message'] ?? 'Google sign-in failed',
      );
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Google sign-in failed');
      }
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        throw Exception(
          'Server not responding. Start backend (npm run dev) on port 5002, then try again.',
        );
      }
      throw Exception('Network error. Please check your connection and API URL.');
    } catch (e) {
      throw Exception('Google sign-in failed: ${e.toString()}');
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
    String? email,
    String? gender,
    DateTime? dateOfBirth,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (firstName != null) data['firstName'] = firstName;
      if (lastName != null) data['lastName'] = lastName;
      if (phoneNumber != null) data['phoneNumber'] = phoneNumber;
      if (email != null) data['email'] = email;
      if (gender != null) data['gender'] = gender;
      if (dateOfBirth != null) {
        data['dateOfBirth'] =
            '${dateOfBirth.year}-${dateOfBirth.month.toString().padLeft(2, '0')}-${dateOfBirth.day.toString().padLeft(2, '0')}';
      }

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
        throw Exception(
          e.response!.data['message'] ?? 'Failed to update profile',
        );
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    } catch (e) {
      throw Exception('Failed to update profile: ${e.toString()}');
    }
  }

  /// Upload profile image
  Future<Map<String, dynamic>> uploadProfileImage(String imagePath) async {
    try {
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          imagePath,
          filename: imagePath.split('/').last,
        ),
      });

      final response = await _httpClient.post(
        '${ApiConfig.authEndpoint}/profile-image',
        data: formData,
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data;
      } else {
        throw Exception(
          response.data['message'] ?? 'Failed to upload profile image',
        );
      }
    } catch (e) {
      throw Exception('Failed to upload profile image: ${e.toString()}');
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

  /// Request password reset OTP
  Future<Map<String, dynamic>> forgotPassword(String email) async {
    try {
      final response = await _httpClient.post(
        ApiConfig.forgotPasswordEndpoint,
        data: {'email': email},
      );

      if (response.data['success'] == true) {
        return response.data;
      } else {
        throw Exception(response.data['message'] ?? 'Failed to request OTP');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  /// Verify OTP code
  Future<Map<String, dynamic>> verifyOTP(String email, String otp) async {
    try {
      final response = await _httpClient.post(
        ApiConfig.verifyOTPEndpoint,
        data: {'email': email, 'otp': otp},
      );

      if (response.data['success'] == true) {
        return response.data;
      } else {
        throw Exception(response.data['message'] ?? 'Invalid OTP code');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  /// Reset password
  Future<Map<String, dynamic>> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    try {
      final response = await _httpClient.post(
        ApiConfig.resetPasswordEndpoint,
        data: {
          'email': email,
          'otp': otp,
          'newPassword': newPassword,
        },
      );

      if (response.data['success'] == true) {
        return response.data;
      } else {
        throw Exception(response.data['message'] ?? 'Failed to reset password');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }
}
