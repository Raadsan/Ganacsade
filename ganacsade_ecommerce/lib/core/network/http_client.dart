import 'package:dio/dio.dart';
import 'package:hive/hive.dart';
import 'api_config.dart';

class HttpClient {
  static final HttpClient _instance = HttpClient._internal();
  static Future<void> Function()? onSessionExpired;
  late Dio _dio;
  Box? _storageBox;
  bool _handlingSessionExpiry = false;

  factory HttpClient() {
    return _instance;
  }

  HttpClient._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.getBaseUrl(),
        connectTimeout: ApiConfig.connectTimeout,
        receiveTimeout: ApiConfig.receiveTimeout,
        sendTimeout: ApiConfig.sendTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _initializeInterceptors();
  }

  Future<void> initStorage() async {
    _storageBox = await Hive.openBox('auth_storage');
  }

  void _initializeInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token to requests
          if (_storageBox != null) {
            final token = _storageBox!.get(ApiConfig.accessTokenKey);
            if (token != null) {
              options.headers['Authorization'] = 'Bearer $token';
            }
          }
          
          print('🌐 REQUEST[${options.method}] => PATH: ${options.path}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          print('✅ RESPONSE[${response.statusCode}] => PATH: ${response.requestOptions.path}');
          return handler.next(response);
        },
        onError: (error, handler) async {
          print('❌ ERROR[${error.response?.statusCode}] => PATH: ${error.requestOptions.path}');
          print('❌ ERROR MESSAGE: ${error.message}');
          if (error.response?.data != null) {
            print('❌ ERROR DATA: ${error.response?.data}');
          }
          
          final isRefreshRequest = error.requestOptions.path.contains('refresh-token');
          final responseMessage = error.response?.data is Map
              ? error.response?.data['message']?.toString() ?? ''
              : '';
          final isInvalidated = responseMessage.toLowerCase().contains('invalidated');

          if (error.response?.statusCode == 401 && !isRefreshRequest) {
            final accessToken = _storageBox?.get(ApiConfig.accessTokenKey);
            final refreshToken = _storageBox?.get(ApiConfig.refreshTokenKey);
            final hadSession = accessToken != null || refreshToken != null;
            final isMissingToken = responseMessage.toLowerCase().contains('no token provided');

            // Not logged in yet — don't treat as session expiry.
            if (!hadSession && isMissingToken) {
              return handler.next(error);
            }

            final refreshed = isInvalidated ? false : await _refreshToken();
            if (refreshed) {
              final options = error.requestOptions;
              final token = _storageBox?.get(ApiConfig.accessTokenKey);
              if (token != null) {
                options.headers['Authorization'] = 'Bearer $token';
              }

              try {
                final response = await _dio.fetch(options);
                return handler.resolve(response);
              } catch (e) {
                await _handleSessionExpired();
                return handler.reject(error);
              }
            }

            await _handleSessionExpired();
          }
          
          return handler.next(error);
        },
      ),
    );
  }

  Future<void> _handleSessionExpired() async {
    if (_handlingSessionExpiry) return;
    _handlingSessionExpiry = true;

    try {
      await clearTokens();
      try {
        final userBox = await Hive.openBox('user_data');
        await userBox.delete('current_user');
        await userBox.delete('user_role');
      } catch (e) {
        print('Error clearing saved user: $e');
      }

      if (onSessionExpired != null) {
        await onSessionExpired!();
      }
    } finally {
      _handlingSessionExpiry = false;
    }
  }

  Future<bool> _refreshToken() async {
    try {
      if (_storageBox == null) return false;
      
      final refreshToken = _storageBox!.get(ApiConfig.refreshTokenKey);
      if (refreshToken == null) return false;

      // Use a SEPARATE Dio instance (no interceptors) to avoid re-entering
      // the onError handler if the refresh endpoint itself returns 401
      final plainDio = Dio(
        BaseOptions(
          baseUrl: ApiConfig.getBaseUrl(),
          connectTimeout: ApiConfig.connectTimeout,
          receiveTimeout: ApiConfig.receiveTimeout,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        ),
      );

      final response = await plainDio.post(
        ApiConfig.refreshTokenEndpoint,
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final newToken = response.data['data']['token'];
        final newRefreshToken = response.data['data']['refreshToken'];
        
        await _storageBox!.put(ApiConfig.accessTokenKey, newToken);
        await _storageBox!.put(ApiConfig.refreshTokenKey, newRefreshToken);
        
        return true;
      }
      
      // Refresh failed — clear stale tokens so we stop retrying
      await _storageBox!.delete(ApiConfig.accessTokenKey);
      await _storageBox!.delete(ApiConfig.refreshTokenKey);
      return false;
    } catch (e) {
      print('Error refreshing token: $e');
      // Clear stale tokens on error too
      await _storageBox?.delete(ApiConfig.accessTokenKey);
      await _storageBox?.delete(ApiConfig.refreshTokenKey);
      return false;
    }
  }

  // Save authentication tokens
  Future<void> saveTokens(String accessToken, String refreshToken) async {
    if (_storageBox != null) {
      await _storageBox!.put(ApiConfig.accessTokenKey, accessToken);
      await _storageBox!.put(ApiConfig.refreshTokenKey, refreshToken);
    }
  }

  // Clear authentication tokens
  Future<void> clearTokens() async {
    if (_storageBox != null) {
      await _storageBox!.delete(ApiConfig.accessTokenKey);
      await _storageBox!.delete(ApiConfig.refreshTokenKey);
    }
  }

  // Restore session on startup using saved tokens.
  Future<bool> tryRestoreSession() async {
    if (_storageBox == null) return false;
    final accessToken = _storageBox!.get(ApiConfig.accessTokenKey);
    if (accessToken != null) return true;
    return _refreshToken();
  }

  String? getAccessToken() {
    return _storageBox?.get(ApiConfig.accessTokenKey);
  }

  bool get hasStoredSession {
    if (_storageBox == null) return false;
    return _storageBox!.get(ApiConfig.accessTokenKey) != null
        || _storageBox!.get(ApiConfig.refreshTokenKey) != null;
  }

  // HTTP Methods
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.get(
      path,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.post(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.put(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.patch(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.delete(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // Get Dio instance for advanced usage
  Dio get dio => _dio;
}
