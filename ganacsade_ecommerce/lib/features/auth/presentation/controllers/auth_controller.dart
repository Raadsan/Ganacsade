import 'dart:async';
import 'package:get/get.dart';
import 'package:hive/hive.dart';
import '../../../../shared/models/user.dart' as app_user;
import '../../../../core/network/auth_api_service.dart';
import '../../../../core/network/http_client.dart';

class AuthController extends GetxController {
  // Observable variables
  final Rx<app_user.User?> _user = Rx<app_user.User?>(null);
  final RxBool isLoading = false.obs;
  final RxString errorMessage = ''.obs;
  final RxBool rememberMe = false.obs;
  
  // API Service
  final AuthApiService _authApiService = AuthApiService();
  final HttpClient _httpClient = HttpClient();
  
  // Local storage
  late Box _userBox;
  
  // Completer to signal when storage init is done
  final Completer<void> _storageReady = Completer<void>();
  Future<void> get storageReady => _storageReady.future;
  
  // Getters
  app_user.User? get user => _user.value;
  bool get isLoggedIn => _user.value != null;
  
  @override
  void onInit() {
    super.onInit();
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
      if (savedUserData != null) {
        _user.value = app_user.User.fromJson(Map<String, dynamic>.from(savedUserData));
      }
    } catch (e) {
      print('Error loading saved user: $e');
    }
  }
  
  Future<bool> signInWithEmail(String email, String password) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      
      // Validate inputs
      if (email.isEmpty || password.isEmpty) {
        errorMessage.value = 'Please fill in all fields';
        return false;
      }
      
      if (!GetUtils.isEmail(email)) {
        errorMessage.value = 'Please enter a valid email address';
        return false;
      }
      
      // Call API to login
      final response = await _authApiService.login(
        email: email,
        password: password,
      );
      
      // Extract user data from response
      final userData = response['data']['user'];
      
      // Create user object
      final user = app_user.User(
        id: userData['id'],
        email: userData['email'],
        phoneNumber: userData['phoneNumber'] ?? '',
        firstName: userData['firstName'],
        lastName: userData['lastName'],
        displayName: '${userData['firstName']} ${userData['lastName']}',
        profileImageUrl: '',
        isEmailVerified: true,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        lastLoginAt: DateTime.now(),
      );
      
      _user.value = user;
      
      // Always save user data locally after sign in
      await _userBox.put('current_user', user.toJson());
      
      print('✅ User signed in and saved:');
      print('   - Email: ${user.email}');
      print('   - Phone: ${user.phoneNumber}');
      
      Get.snackbar(
        'Welcome Back!',
        'Successfully signed in to GANACSADE',
        backgroundColor: Get.theme.colorScheme.primary,
        colorText: Get.theme.colorScheme.onPrimary,
        duration: const Duration(seconds: 2),
      );
      
      return true;
    } catch (e) {
      errorMessage.value = e.toString().replaceAll('Exception: ', '');
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  Future<bool> signUpWithEmail({
    required String email,
    required String password,
    required String name,
    String? phoneNumber,
  }) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      
      // Validate inputs
      if (email.isEmpty || password.isEmpty || name.isEmpty) {
        errorMessage.value = 'Please fill in all required fields';
        return false;
      }
      
      if (!GetUtils.isEmail(email)) {
        errorMessage.value = 'Please enter a valid email address';
        return false;
      }
      
      if (password.length < 6) {
        errorMessage.value = 'Password must be at least 6 characters';
        return false;
      }
      
      if (phoneNumber == null || phoneNumber.isEmpty) {
        errorMessage.value = 'Phone number is required';
        return false;
      }
      
      // Split name into first and last name
      final nameParts = name.trim().split(' ');
      final firstName = nameParts.first;
      final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';
      
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
        email: userData['email'],
        phoneNumber: userData['phoneNumber'] ?? '',
        firstName: userData['firstName'],
        lastName: userData['lastName'],
        displayName: '${userData['firstName']} ${userData['lastName']}',
        profileImageUrl: '',
        isEmailVerified: true,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        lastLoginAt: DateTime.now(),
      );
      
      _user.value = user;
      
      // Always save user data locally after sign up
      await _userBox.put('current_user', user.toJson());
      
      print('✅ User signed up and saved:');
      print('   - Email: ${user.email}');
      print('   - Phone: ${user.phoneNumber}');
      print('   - Name: ${user.firstName} ${user.lastName}');
      
      Get.snackbar(
        'Account Created!',
        'Welcome to GANACSADE, $firstName!',
        backgroundColor: Get.theme.colorScheme.primary,
        colorText: Get.theme.colorScheme.onPrimary,
        duration: const Duration(seconds: 2),
      );
      
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
      
      // Clear current user from storage
      await _userBox.delete('current_user');
      
      // Clear user from memory
      _user.value = null;
      
      // Clear any error messages
      errorMessage.value = '';
      
      Get.snackbar(
        'Signed Out',
        'You have been successfully signed out',
        backgroundColor: Get.theme.colorScheme.secondary,
        colorText: Get.theme.colorScheme.onSecondary,
        duration: const Duration(seconds: 2),
      );
    } catch (e) {
      print('Error signing out: $e');
    }
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
  }) {
    if (_user.value != null) {
      final updatedUser = app_user.User(
        id: _user.value!.id,
        email: email ?? _user.value!.email,
        phoneNumber: phoneNumber ?? _user.value!.phoneNumber,
        firstName: firstName ?? _user.value!.firstName,
        lastName: lastName ?? _user.value!.lastName,
        displayName: '${firstName ?? _user.value!.firstName} ${lastName ?? _user.value!.lastName}',
        profileImageUrl: _user.value!.profileImageUrl,
        gender: _user.value!.gender,
        dateOfBirth: _user.value!.dateOfBirth,
        isEmailVerified: _user.value!.isEmailVerified,
        status: _user.value!.status,
        createdAt: _user.value!.createdAt,
        updatedAt: DateTime.now(),
        lastLoginAt: _user.value!.lastLoginAt,
      );
      
      _user.value = updatedUser;
      
      // Save to local storage
      _userBox.put('current_user', updatedUser.toJson());
      
      print('✅ AuthController user data updated and saved');
    }
  }
}
