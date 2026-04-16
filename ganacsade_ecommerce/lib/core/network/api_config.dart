class ApiConfig {
  // Base URL for the API
  static const String baseUrl = 'http://localhost:5000/api';
  
  // For Android emulator, use 10.0.2.2 instead of localhost
  static const String androidEmulatorBaseUrl = 'http://192.168.8.157:5000/api';
  
  // For iOS simulator, localhost works fine
  static const String iosSimulatorBaseUrl = 'http://localhost:5000/api';
  
  // For real device on same network, use your computer's IP
  // Your computer's IP: 172.20.10.6
  static const String deviceBaseUrl = 'http://192.168.8.157:5000/api';
  
  // API Endpoints
  static const String authEndpoint = '/auth';
  static const String productsEndpoint = '/products';
  static const String categoriesEndpoint = '/categories';
  static const String cartEndpoint = '/cart';
  static const String ordersEndpoint = '/orders';
  static const String usersEndpoint = '/users';
  
  // Auth specific endpoints
  static const String loginEndpoint = '$authEndpoint/login';
  static const String registerEndpoint = '$authEndpoint/register';
  static const String logoutEndpoint = '$authEndpoint/logout';
  static const String profileEndpoint = '$authEndpoint/profile';
  static const String refreshTokenEndpoint = '$authEndpoint/refresh-token';
  
  // Timeout durations
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 90); // Extended for payment processing
  static const Duration sendTimeout = Duration(seconds: 30);
  
  // Storage keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  
  // Get the appropriate base URL based on platform
  static String getBaseUrl() {
    // For real device on same WiFi network
    return deviceBaseUrl;
    
    // Uncomment the appropriate line for your setup:
    // return androidEmulatorBaseUrl;  // For Android emulator
    // return iosSimulatorBaseUrl;     // For iOS simulator
    // return baseUrl;                 // For web or desktop
  }
  
  // Get the server base URL (without /api) for images and uploads
  static String getServerUrl() {
    return getBaseUrl().replaceAll('/api', '');
  }
}
