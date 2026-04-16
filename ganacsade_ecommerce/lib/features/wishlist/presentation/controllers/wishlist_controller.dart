import 'package:get/get.dart';
import 'package:hive/hive.dart';
import '../../../../shared/models/product.dart';
import '../../../../core/network/wishlist_api_service.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/network/api_config.dart';

class WishlistController extends GetxController {
  final WishlistApiService _wishlistApiService = WishlistApiService();
  final AuthController _authController = Get.find<AuthController>();
  Box? _storageBox;
  
  final RxList<Product> wishlistItems = <Product>[].obs;
  final RxBool isLoading = false.obs;
  final RxString errorMessage = ''.obs;

  @override
  void onInit() {
    super.onInit();
    _initStorage();
  }

  Future<void> _initStorage() async {
    _storageBox = await Hive.openBox('auth_storage');
    await loadWishlist();
  }

  String? _getToken() {
    return _storageBox?.get(ApiConfig.accessTokenKey);
  }

  Future<void> loadWishlist() async {
    if (_authController.user == null) {
      wishlistItems.clear();
      return;
    }

    final token = _getToken();
    if (token == null) {
      wishlistItems.clear();
      return;
    }

    try {
      isLoading.value = true;
      errorMessage.value = '';
      
      final items = await _wishlistApiService.getWishlist(token);
      wishlistItems.value = items;
    } catch (e) {
      errorMessage.value = 'Failed to load wishlist';
      print('Error loading wishlist: $e');
    } finally {
      isLoading.value = false;
    }
  }

  bool isInWishlist(String productId) {
    return wishlistItems.any((item) => item.id == productId);
  }

  void toggleWishlist(Product product) {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }

  Future<void> addToWishlist(Product product) async {
    if (_authController.user == null) {
      Get.snackbar(
        'auth_signin'.tr,
        'Please sign in to add items to wishlist',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.error,
        colorText: AppColors.white,
      );
      return;
    }

    if (isInWishlist(product.id)) {
      return;
    }

    final token = _getToken();
    if (token == null) return;

    try {
      await _wishlistApiService.addToWishlist(token, product.id);
      
      wishlistItems.add(product);
      
      Get.snackbar(
        'wishlist_added'.tr,
        '${product.name} ${'wishlist_added_desc'.tr}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.success,
        colorText: AppColors.white,
        duration: const Duration(seconds: 2),
      );
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        'Failed to add to wishlist',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.error,
        colorText: AppColors.white,
      );
      print('Error adding to wishlist: $e');
    }
  }

  Future<void> removeFromWishlist(String productId) async {
    if (_authController.user == null) {
      return;
    }

    final token = _getToken();
    if (token == null) return;

    try {
      await _wishlistApiService.removeFromWishlist(token, productId);
      
      wishlistItems.removeWhere((item) => item.id == productId);
      
      Get.snackbar(
        'wishlist_removed'.tr,
        'wishlist_removed_desc'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.info,
        colorText: AppColors.white,
        duration: const Duration(seconds: 2),
      );
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        'Failed to remove from wishlist',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.error,
        colorText: AppColors.white,
      );
      print('Error removing from wishlist: $e');
    }
  }

  Future<void> clearWishlist() async {
    if (_authController.user == null) {
      return;
    }

    final token = _getToken();
    if (token == null) return;

    try {
      await _wishlistApiService.clearWishlist(token);
      
      wishlistItems.clear();
      
      Get.snackbar(
        'wishlist_cleared'.tr,
        'wishlist_cleared_desc'.tr,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.info,
        colorText: AppColors.white,
      );
    } catch (e) {
      Get.snackbar(
        'error'.tr,
        'Failed to clear wishlist',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.error,
        colorText: AppColors.white,
      );
      print('Error clearing wishlist: $e');
    }
  }

  int get itemCount => wishlistItems.length;
}
