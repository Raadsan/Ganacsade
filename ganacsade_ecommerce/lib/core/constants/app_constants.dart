class AppConstants {
  // API Configuration
  //
  // Android emulator → local backend:
  //   http://10.0.2.2:5002/api
  //
  // Real phone on same WiFi → replace with your PC IP:
  //   http://192.168.x.x:5002/api
  //
  // Deployment server:
  //   http://178.18.241.5:5002/api';
  //
  // IMPORTANT: after changing server, logout/login so a fresh token is saved.
  // static const String baseUrl = 'http://192.168.100.64:5002/api';
  static const String baseUrl = 'http://178.18.241.5:5002/api';

  static const String apiVersion = 'v1';

  // App Configuration
  static const String appName = 'Ganacsade';
  static const String appVersion = '1.0.0';

  /// Web OAuth client ID from Firebase / Google Cloud Console.
  /// Required for Google Sign-In on Android (serverClientId).
  /// Example: 672314564532-xxxxxxxx.apps.googleusercontent.com
  static const String googleWebClientId = '672314564532-cdl48323a7ge73js4hhpfutu93lsqqps.apps.googleusercontent.com';

  // Storage Keys
  static const String authTokenKey = 'auth_token';
  static const String userDataKey = 'user_data';
  static const String cartDataKey = 'cart_data';
  static const String settingsKey = 'app_settings';

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // Cache Duration
  static const Duration cacheExpiration = Duration(hours: 1);

  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Validation
  static const int minPasswordLength = 6;
  static const int maxPasswordLength = 50;
  static const int maxNameLength = 100;

  // File Upload
  static const int maxImageSizeMB = 5;
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png', 'webp'];

  // Payment Methods (Somali)
  static const List<String> somalianPaymentMethods = [
    'WaafiPay',
    'E-dahab',
    'Premier Wallet',
    'Cash on Delivery',
  ];

  // Supported Languages
  static const List<Map<String, String>> supportedLanguages = [
    {'code': 'en', 'name': 'English', 'flag': '🇺🇸'},
    {'code': 'so', 'name': 'Somali', 'flag': '🇸🇴'},
    {'code': 'ar', 'name': 'Arabic', 'flag': '🇸🇦'},
  ];

  // Categories
  static const List<String> marketCategories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Health & Beauty',
    'Sports & Outdoors',
    'Books & Education',
    'Food & Beverages',
    'Automotive',
  ];
}
