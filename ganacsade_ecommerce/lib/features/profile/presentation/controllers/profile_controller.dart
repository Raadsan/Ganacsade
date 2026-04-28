import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../shared/models/user_simple.dart';
import '../../../../shared/models/address.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/network/address_api_service.dart';
import '../../../../core/network/auth_api_service.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class ProfileController extends GetxController {
  final AddressApiService _addressApiService = AddressApiService();
  final Rx<User?> _currentUser = Rx<User?>(null);
  final RxList<Address> _addresses = <Address>[].obs;
  final RxBool _notificationsEnabled = true.obs;
  final RxBool _emailNotifications = true.obs;
  final RxBool _pushNotifications = true.obs;
  final RxBool _smsNotifications = false.obs;
  final RxBool _isLoadingAddresses = false.obs;

  // Getters
  User? get currentUser => _currentUser.value;
  RxList<Address> get addresses => _addresses;
  bool get notificationsEnabled => _notificationsEnabled.value;
  bool get emailNotifications => _emailNotifications.value;
  bool get pushNotifications => _pushNotifications.value;
  bool get smsNotifications => _smsNotifications.value;
  RxBool get isLoadingAddresses => _isLoadingAddresses;

  @override
  void onInit() {
    super.onInit();
    _loadUserData();
    _loadAddresses();
  }

  @override
  void onReady() {
    super.onReady();
    // Listen to auth changes after controller is ready
    final authController = Get.find<AuthController>();
    ever(authController.obs, (_) {
      print('🔄 Auth state changed, reloading user data...');
      _loadUserData();
    });
  }

  /// Manually refresh user data
  void refreshUserData() {
    print('🔄 Manual refresh triggered');
    _loadUserData();
  }

  void _loadUserData() {
    // Get user from AuthController
    final authController = Get.find<AuthController>();
    final authUser = authController.user;

    print('🔍 ProfileController loading user data...');
    print('🔍 AuthUser: ${authUser?.email}');

    if (authUser != null) {
      final name = authUser.displayName.isNotEmpty
          ? authUser.displayName
          : '${authUser.firstName} ${authUser.lastName}'.trim();

      final displayValue = name.isNotEmpty ? name : authUser.phoneNumber;

      print('🔍 Creating User with:');
      print('   - Name: $displayValue');
      print('   - Email: ${authUser.email}');
      print('   - Phone: ${authUser.phoneNumber}');

      _currentUser.value = User(
        id: authUser.id,
        name: displayValue,
        email: authUser.email,
        phone: authUser.phoneNumber,
        profileImage: authUser.profileImageUrl.isNotEmpty
            ? authUser.profileImageUrl
            : null,
        dateOfBirth: authUser.dateOfBirth,
        gender: authUser.gender.name,
        joinedDate: authUser.createdAt ?? DateTime.now(),
      );

      print('✅ User loaded: ${_currentUser.value?.name}');
    } else {
      print('❌ No auth user found');
      _currentUser.value = null;
    }
    update();
  }

  Future<void> _loadAddresses() async {
    _isLoadingAddresses.value = true;
    try {
      final response = await _addressApiService.getAddresses();

      print('📍 Address API Response: $response');

      if (response['success'] == true) {
        final addressesData = response['data']?['addresses'] as List? ?? [];
        print('📍 Found ${addressesData.length} addresses');
        _addresses.clear();
        _addresses.addAll(
          addressesData.map((json) => Address.fromJson(json)).toList(),
        );
        print('📍 Loaded ${_addresses.length} addresses into controller');
      } else {
        print('📍 API returned success=false: ${response['message']}');
      }
    } catch (e) {
      print('❌ Error loading addresses: $e');
    } finally {
      _isLoadingAddresses.value = false;
      update(); // Notify GetBuilder widgets
    }
  }

  /// Reload addresses from API
  Future<void> reloadAddresses() async {
    await _loadAddresses();
  }

  // User Profile Methods
  Future<void> updateProfile({
    required String name,
    required String email,
    required String phone,
    DateTime? dateOfBirth,
    String? gender,
  }) async {
    if (_currentUser.value != null) {
      try {
        print('💾 Updating profile via API...');

        final authApiService = AuthApiService();
        final nameParts = name.trim().split(' ');
        final firstName = nameParts.first;
        final lastName =
            nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';

        final response = await authApiService.updateProfile(
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phone,
          email: email,
          gender: gender,
          dateOfBirth: dateOfBirth,
        );

        if (response['success'] == true) {
          // Update local state
          _currentUser.value = _currentUser.value!.copyWith(
            name: name,
            email: email,
            phone: phone,
            dateOfBirth: dateOfBirth,
            gender: gender,
          );

          // Also update AuthController
          final authController = Get.find<AuthController>();
          authController.updateUserData(
            firstName: firstName,
            lastName: lastName,
            email: email,
            phoneNumber: phone,
          );

          update(); // Notify GetBuilder widgets

          ScaffoldMessenger.of(Get.context!).showSnackBar(
            SnackBar(
              content: const Text('Profile updated successfully'),
              backgroundColor: AppColors.primaryGreen,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      } catch (e) {
        print('❌ Error updating profile: $e');
        ScaffoldMessenger.of(Get.context!).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> updateProfileImage(String imagePath) async {
    if (_currentUser.value != null) {
      try {
        print('📸 Uploading profile image...');
        final authApiService = AuthApiService();
        final response = await authApiService.uploadProfileImage(imagePath);

        if (response['success'] == true) {
          final imageUrl = response['data']['profileImageUrl'];

          _currentUser.value = _currentUser.value!.copyWith(
            profileImage: imageUrl,
          );

          // Update AuthController too
          final authController = Get.find<AuthController>();
          if (authController.user != null) {
            authController.user = authController.user!.copyWith(
              profileImageUrl: imageUrl,
            );
          }

          update();

          ScaffoldMessenger.of(Get.context!).showSnackBar(
            SnackBar(
              content: const Text('Profile image updated'),
              backgroundColor: AppColors.primaryGreen,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      } catch (e) {
        print('❌ Error uploading image: $e');
        ScaffoldMessenger.of(Get.context!).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  // Address Methods
  Future<void> addAddress(Address address) async {
    try {
      final response = await _addressApiService.createAddress(
        title: address.title,
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.postalCode,
        isDefault: address.isDefault,
      );

      if (response['success'] == true) {
        await _loadAddresses();
        ScaffoldMessenger.of(Get.context!).showSnackBar(
          SnackBar(
            content: const Text('Address added successfully'),
            backgroundColor: AppColors.primaryGreen,
          ),
        );
      } else {
        ScaffoldMessenger.of(Get.context!).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Failed to add address'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(Get.context!).showSnackBar(
        SnackBar(
          content: const Text('Failed to add address. Please try again.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> updateAddress(Address updatedAddress) async {
    try {
      final response = await _addressApiService.updateAddress(
        id: int.parse(updatedAddress.id),
        title: updatedAddress.title,
        fullName: updatedAddress.fullName,
        phoneNumber: updatedAddress.phoneNumber,
        street: updatedAddress.street,
        city: updatedAddress.city,
        state: updatedAddress.state,
        country: updatedAddress.country,
        postalCode: updatedAddress.postalCode,
        isDefault: updatedAddress.isDefault,
      );

      if (response['success'] == true) {
        await _loadAddresses();
        ScaffoldMessenger.of(Get.context!).showSnackBar(
          SnackBar(
            content: const Text('Address updated successfully'),
            backgroundColor: AppColors.primaryGreen,
          ),
        );
      } else {
        ScaffoldMessenger.of(Get.context!).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Failed to update address'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(Get.context!).showSnackBar(
        SnackBar(
          content: const Text('Failed to update address. Please try again.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> deleteAddress(String addressId) async {
    try {
      final response = await _addressApiService.deleteAddress(
        int.parse(addressId),
      );

      if (response['success'] == true) {
        await _loadAddresses();
        ScaffoldMessenger.of(Get.context!).showSnackBar(
          SnackBar(
            content: const Text('Address deleted successfully'),
            backgroundColor: AppColors.primaryGreen,
          ),
        );
      } else {
        ScaffoldMessenger.of(Get.context!).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Failed to delete address'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(Get.context!).showSnackBar(
        SnackBar(
          content: const Text('Failed to delete address. Please try again.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> setDefaultAddress(String addressId) async {
    try {
      final response = await _addressApiService.setDefaultAddress(
        int.parse(addressId),
      );

      if (response['success'] == true) {
        await _loadAddresses();
      } else {
        ScaffoldMessenger.of(Get.context!).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? 'Failed to set default address'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(Get.context!).showSnackBar(
        SnackBar(
          content: const Text('Failed to set default address. Please try again.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  // Settings Methods - Language is now handled by LanguageController

  void toggleNotifications(bool enabled) {
    _notificationsEnabled.value = enabled;
  }

  void toggleEmailNotifications(bool enabled) {
    _emailNotifications.value = enabled;
  }

  void togglePushNotifications(bool enabled) {
    _pushNotifications.value = enabled;
  }

  void toggleSmsNotifications(bool enabled) {
    _smsNotifications.value = enabled;
  }

  // Utility Methods
  String getFormattedJoinDate() {
    if (_currentUser.value?.joinedDate != null) {
      final joinDate = _currentUser.value!.joinedDate;
      final months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      return '${months[joinDate.month - 1]} ${joinDate.year}';
    }
    return 'Unknown';
  }

  String getFormattedDateOfBirth() {
    if (_currentUser.value?.dateOfBirth != null) {
      final birthDate = _currentUser.value!.dateOfBirth!;
      return '${birthDate.day}/${birthDate.month}/${birthDate.year}';
    }
    return 'N/A';
  }

  int get userAge {
    if (_currentUser.value?.dateOfBirth != null) {
      final birthDate = _currentUser.value!.dateOfBirth!;
      final now = DateTime.now();
      int age = now.year - birthDate.year;
      if (now.month < birthDate.month ||
          (now.month == birthDate.month && now.day < birthDate.day)) {
        age--;
      }
      return age;
    }
    return 0;
  }

  void signOut() {
    // Clear user data
    _currentUser.value = null;
    _addresses.clear();

    // Reset settings to defaults
    _notificationsEnabled.value = true;
    _emailNotifications.value = true;
    _pushNotifications.value = true;
    _smsNotifications.value = false;

    // Navigate to register page
    Get.offAllNamed('/register');

    ScaffoldMessenger.of(Get.context!).showSnackBar(
      SnackBar(
        content: const Text('You have been successfully logged out'),
        backgroundColor: AppColors.primaryGreen,
      ),
    );
  }
}
