import 'package:dio/dio.dart';
import 'package:hive/hive.dart';
import 'api_config.dart';

class HttpClient {
  static final HttpClient _instance = HttpClient._internal();
  late Dio _dio;
  Box? _storageBox;

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
          
          // Handle 401 Unauthorized - Token expired
          // IMPORTANT: Never attempt refresh if the failing request IS the refresh endpoint
          final isRefreshRequest = error.requestOptions.path.contains('refresh-token');
          if (error.response?.statusCode == 401 && !isRefreshRequest) {
            // Try to refresh token
            final refreshed = await _refreshToken();
            if (refreshed) {
              // Retry the original request
              final options = error.requestOptions;
              final token = _storageBox?.get(ApiConfig.accessTokenKey);
              if (token != null) {
                options.headers['Authorization'] = 'Bearer $token';
              }
              
              try {
                final response = await _dio.fetch(options);
                return handler.resolve(response);
              } catch (e) {
                return handler.reject(error);
              }
            }
          }
          
          return handler.next(error);
        },
      ),
    );
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

  // Get access token
  String? getAccessToken() {
    return _storageBox?.get(ApiConfig.accessTokenKey);
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
