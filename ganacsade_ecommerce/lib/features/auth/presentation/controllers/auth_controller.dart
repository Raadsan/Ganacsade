import 'dart:async';
import 'package:flutter/scheduler.dart';
import 'package:get/get.dart';
import 'package:hive/hive.dart';
import '../../../../shared/models/user.dart' as app_user;
import '../../../../core/network/auth_api_service.dart';
import '../../../../core/network/http_client.dart';
import '../../../../core/services/push_notification_service.dart';
import '../../../../core/services/google_sign_in_service.dart';
import '../../../notifications/presentation/controllers/app_notifications_controller.dart';

class AuthController extends GetxController {
  // Observable variables
  final Rx<app_user.User?> _user = Rx<app_user.User?>(null);
  final RxBool isLoading = false.obs;
  final RxString errorMessage = ''.obs;
  final RxBool rememberMe = false.obs;
  final RxString _userRole = 'customer'.obs;
  
  // API Service
  final AuthApiService _authApiService = AuthApiService();
  final HttpClient _httpClient = HttpClient();
  
  // Local storage
  late Box _userBox;
  
  // Completer to signal when storage init is done
  final Completer<void> _storageReady = Completer<void>();
  Future<void> get storageReady => _storageReady.future;
  bool _pendingLoginRedirect = false;
  
  // Getters
  app_user.User? get user => _user.value;
  bool get isLoggedIn => _user.value != null;
  String get userRole => _userRole.value;
  bool get isDeliveryUser => _isDeliveryRole(_userRole.value);
  String get mainRoute => isDeliveryUser ? '/delivery-main' : '/main';

  static bool _isDeliveryRole(String role) {
    final normalized = role.trim().toLowerCase();
    return normalized.contains('delivery') || normalized == 'delivery_person';
  }

  String _resolveRoleFromUserData(Map<String, dynamic> userData) {
    final roleModel = userData['roleModel'];
    if (roleModel is Map && roleModel['name'] != null) {
      final name = roleModel['name'].toString().trim();
      if (name.isNotEmpty) return name;
    }
    return userData['role']?.toString() ?? 'customer';
  }

  Future<void> _persistUserRole(String role) async {
    _userRole.value = role;
    await _userBox.put('user_role', role);
  }

  /// Refresh role from server so delivery users are routed correctly after restart.
  Future<void> refreshSessionRole() async {
    if (!isLoggedIn) return;

    try {
      final response = await _authApiService.getProfile();
      final userData = response['data'];
      if (userData is! Map) return;

      final role = userData['role']?.toString() ?? _resolveRoleFromUserData(Map<String, dynamic>.from(userData));
      if (role != _userRole.value) {
        await _persistUserRole(role);
      }
    } catch (e) {
      print('Could not refresh session role: $e');
    }
  }
  
  @override
  void onInit() {
    super.onInit();
    HttpClient.onSessionExpired = handleSessionExpired;
    _initializeStorage();
  }
  
  Future<void> _initializeStorage() async {
    try {
      _userBox = await Hive.openBox('user_data');
      await _httpClient.initStorage();
      
      // Check if user is already logged in
      await _checkSavedUser();
    } catch (e) {
      print('Error initializing storage: $e');
    } finally {
      if (!_storageReady.isCompleted) _storageReady.complete();
    }
  }
  
  Future<void> _checkSavedUser() async {
    try {
      final savedUserData = _userBox.get('current_user');
      if (savedUserData == null) return;

      final hasSession = _httpClient.hasStoredSession
          || await _httpClient.tryRestoreSession();
      if (!hasSession) {
        await _userBox.delete('current_user');
        await _userBox.delete('user_role');
        return;
      }

      _user.value = app_user.User.fromJson(Map<String, dynamic>.from(savedUserData));
      _userRole.value = _userBox.get('user_role', defaultValue: 'customer')?.toString() ?? 'customer';
    } catch (e) {
      print('Error loading saved user: $e');
    }
  }
  
  Future<bool> signIn({String? email, String? phoneNumber, String? identifier, required String password}) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      
      // Validate inputs
      if ((email == null || email.isEmpty) && 
          (phoneNumber == null || phoneNumber.isEmpty) && 
          (identifier == null || identifier.isEmpty)) {
        errorMessage.value = 'Please enter your phone number or email';
        return false;
      }

      if (password.isEmpty) {
        errorMessage.value = 'Please enter your password';
        return false;
      }
      
      // Call API to login
      final response = await _authApiService.login(
        email: email,
        phoneNumber: phoneNumber,
        identifier: identifier,
        password: password,
      );
      
      // Extract user data from response
      final userData = response['data']['user'];
      final role = _resolveRoleFromUserData(Map<String, dynamic>.from(userData));
      
      // Create user object
      final user = app_user.User(
        id: userData['id'],
        email: userData['email'] ?? '',
        phoneNumber: userData['phoneNumber'] ?? '',
        firstName: userData['firstName'] ?? '',
        lastName: userData['lastName'] ?? '',
        displayName: userData['firstName'] != null 
            ? '${userData['firstName']} ${userData['lastName'] ?? ''}'
            : (userData['phoneNumber'] ?? 'User'),
        profileImageUrl: '',
        isEmailVerified: userData['isEmailVerified'] ?? false,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        lastLoginAt: DateTime.now(),
      );
      
      _user.value = user;
      await _persistUserRole(role);
      
      // Always save user data locally after sign in
      await _userBox.put('current_user', user.toJson());

      if (!Get.isRegistered<AppNotificationsController>()) {
        Get.put(AppNotificationsController());
      } else {
        await Get.find<AppNotificationsController>().ensureStarted();
      }
      await PushNotificationService().syncTokenWithServer();
      
      print('✅ User signed in and saved:');
      print('   - Email: ${user.email}');
      print('   - Phone: ${user.phoneNumber}');
      
      return true;
    } catch (e) {
      errorMessage.value = e.toString().replaceAll('Exception: ', '');
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  Future<bool> signUp({
    String? email,
    String? phoneNumber,
    required String password,
    String? firstName,
    String? lastName,
  }) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      
      // Validate inputs
      if ((phoneNumber == null || phoneNumber.isEmpty) && (email == null || email.isEmpty)) {
        errorMessage.value = 'Please enter phone number or email';
        return false;
      }

      if (password.isEmpty) {
        errorMessage.value = 'Please enter a password';
        return false;
      }
      
      if (password.length < 6) {
        errorMessage.value = 'Password must be at least 6 characters';
        return false;
      }
      
      // Call API to register
      final response = await _authApiService.register(
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
      );
      
      // Extract user data from response
      final userData = response['data']['user'];
      
      // Create user object
      final user = app_user.User(
        id: userData['id'],
        email: userData['email'] ?? '',
        phoneNumber: userData['phoneNumber'] ?? '',
        firstName: userData['firstName'] ?? '',
        lastName: userData['lastName'] ?? '',
        displayName: userData['firstName'] != null 
            ? '${userData['firstName']} ${userData['lastName'] ?? ''}'
            : (userData['phoneNumber'] ?? 'User'),
        profileImageUrl: '',
        isEmailVerified: userData['isEmailVerified'] ?? false,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        lastLoginAt: DateTime.now(),
      );
      
      _user.value = user;
      _userRole.value = 'customer';
      
      // Always save user data locally after sign up
      await _userBox.put('current_user', user.toJson());
      await _userBox.put('user_role', 'customer');
      
      print('✅ User signed up and saved:');
      print('   - Phone: ${user.phoneNumber}');
      
      return true;
    } catch (e) {
      errorMessage.value = e.toString().replaceAll('Exception: ', '');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> signInWithGoogle() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      if (!GoogleSignInService.instance.isConfigured) {
        errorMessage.value =
            'Google Sign-In is not configured. Add googleWebClientId in app settings.';
        return false;
      }

      final idToken = await GoogleSignInService.instance.signInAndGetIdToken();
      if (idToken == null) {
        return false;
      }

      final response = await _authApiService.signInWithGoogle(idToken: idToken);
      final userData = response['data']['user'];
      final role = _resolveRoleFromUserData(Map<String, dynamic>.from(userData));

      final user = app_user.User(
        id: userData['id'],
        email: userData['email'] ?? '',
        phoneNumber: userData['phoneNumber'] ?? '',
        firstName: userData['firstName'] ?? '',
        lastName: userData['lastName'] ?? '',
        displayName: userData['displayName']
            ?? (userData['firstName'] != null
                ? '${userData['firstName']} ${userData['lastName'] ?? ''}'.trim()
                : (userData['email'] ?? userData['phoneNumber'] ?? 'User')),
        profileImageUrl: '',
        isEmailVerified: true,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        lastLoginAt: DateTime.now(),
      );

      _user.value = user;
      await _persistUserRole(role);
      await _userBox.put('current_user', user.toJson());

      if (!Get.isRegistered<AppNotificationsController>()) {
        Get.put(AppNotificationsController());
      } else {
        await Get.find<AppNotificationsController>().ensureStarted();
      }
      await PushNotificationService().syncTokenWithServer();

      return true;
    } catch (e) {
      errorMessage.value = e.toString().replaceAll('Exception: ', '');
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  Future<void> signOut() async {
    try {
      // Call API to logout
      await _authApiService.logout();
    } catch (e) {
      print('Error signing out: $e');
    } finally {
      await GoogleSignInService.instance.signOut();
      await clearLocalSession();
    }
  }

  Future<void> clearLocalSession() async {
    await _httpClient.clearTokens();

    try {
      if (!_storageReady.isCompleted) {
        await storageReady;
      }
      await _userBox.delete('current_user');
      await _userBox.delete('user_role');
    } catch (e) {
      print('Error clearing local session: $e');
    }

    _user.value = null;
    _userRole.value = 'customer';
    errorMessage.value = '';
  }

  Future<void> handleSessionExpired() async {
    await clearLocalSession();
    _pendingLoginRedirect = true;
    _redirectToLoginIfReady();
  }

  bool completePendingLoginRedirect() {
    if (!_pendingLoginRedirect) return false;
    _redirectToLoginIfReady();
    if (_pendingLoginRedirect) return false;
    return true;
  }

  void _redirectToLoginIfReady() {
    if (!_pendingLoginRedirect) return;
    if (Get.key.currentContext == null) return;

    _pendingLoginRedirect = false;
    final route = Get.currentRoute;
    if (route == '/login' || route == '/register') return;

    SchedulerBinding.instance.addPostFrameCallback((_) {
      if (Get.key.currentContext == null) return;
      Get.offAllNamed('/login');
      Get.snackbar(
        'Session expired',
        'Please sign in again to continue.',
        snackPosition: SnackPosition.TOP,
        duration: const Duration(seconds: 4),
      );
    });
  }
  
  // Toggle remember me
  void toggleRememberMe() {
    rememberMe.value = !rememberMe.value;
  }
  
  // Clear error message
  void clearError() {
    errorMessage.value = '';
  }
  
  // Update user data locally
  void updateUserData({
    String? firstName,
    String? lastName,
    String? email,
    String? phoneNumber,
    String? profileImageUrl,
  }) {
    if (_user.value != null) {
      final updatedUser = _user.value!.copyWith(
        email: email ?? _user.value!.email,
        phoneNumber: phoneNumber ?? _user.value!.phoneNumber,
        firstName: firstName ?? _user.value!.firstName,
        lastName: lastName ?? _user.value!.lastName,
        displayName: firstName != null || lastName != null
            ? '${firstName ?? _user.value!.firstName} ${lastName ?? _user.value!.lastName}'
            : _user.value!.displayName,
        profileImageUrl: profileImageUrl ?? _user.value!.profileImageUrl,
        updatedAt: DateTime.now(),
      );
      
      _user.value = updatedUser;
      
      // Save to local storage
      _userBox.put('current_user', updatedUser.toJson());
      
      print('✅ AuthController user data updated and saved');
    }
  }

  set user(app_user.User? value) {
    _user.value = value;
    if (value != null) {
      _userBox.put('current_user', value.toJson());
    }
  }

  // Forgot Password logic
  Future<bool> forgotPassword(String email) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      await _authApiService.forgotPassword(email);
      return true;
    } catch (e) {
      errorMessage.value = e.toString().replaceAll('Exception: ', '');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // Verify OTP logic
  Future<bool> verifyOTP(String email, String otp) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      await _authApiService.verifyOTP(email, otp);
      return true;
    } catch (e) {
      errorMessage.value = e.toString().replaceAll('Exception: ', '');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // Reset Password logic
  Future<bool> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      await _authApiService.resetPassword(
        email: email,
        otp: otp,
        newPassword: newPassword,
      );
      return true;
    } catch (e) {
      errorMessage.value = e.toString().replaceAll('Exception: ', '');
      return false;
    } finally {
      isLoading.value = false;
    }
  }
}
