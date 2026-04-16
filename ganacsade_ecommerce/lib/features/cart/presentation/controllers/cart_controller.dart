import 'package:get/get.dart';
import '../../../../shared/models/product.dart';
import '../../../../shared/models/cart_item.dart';
import '../../../navigation/navigation_controller.dart';
import '../../../../core/network/settings_api_service.dart';

class CartController extends GetxController {
  final RxList<CartItem> _cartItems = <CartItem>[].obs;
  final SettingsApiService _settingsApiService = SettingsApiService();
  
  // Dynamic settings from backend
  final RxDouble _shippingFlatRate = 5.99.obs;
  final RxDouble _shippingFreeThreshold = 50.0.obs;
  final RxDouble _taxRate = 0.08.obs;
  final RxBool _taxEnabled = true.obs;
  
  List<CartItem> get cartItems => _cartItems;
  
  int get itemCount => _cartItems.fold(0, (sum, item) => sum + item.quantity);
  
  double get totalPrice => _cartItems.fold(0.0, (sum, item) => sum + (item.product.finalPrice * item.quantity));
  
  double get subtotal => totalPrice;
  
  double get shipping => totalPrice >= _shippingFreeThreshold.value ? 0.0 : _shippingFlatRate.value;
  
  double get tax => _taxEnabled.value ? (totalPrice * _taxRate.value) : 0.0;
  
  double get finalTotal => subtotal + shipping + tax;
  
  @override
  void onInit() {
    super.onInit();
    _loadSettings();
  }
  
  Future<void> _loadSettings() async {
    try {
      print('🔄 CartController: Loading settings...');
      final settings = await _settingsApiService.getPublicSettings();
      
      print('📋 CartController: Received settings: $settings');
      
      if (settings['shipping_flat_rate'] != null) {
        final newRate = settings['shipping_flat_rate'].toDouble();
        print('💰 Updating shipping rate: ${_shippingFlatRate.value} -> $newRate');
        _shippingFlatRate.value = newRate;
      }
      if (settings['shipping_free_threshold'] != null) {
        final newThreshold = settings['shipping_free_threshold'].toDouble();
        print('🚚 Updating free shipping threshold: ${_shippingFreeThreshold.value} -> $newThreshold');
        _shippingFreeThreshold.value = newThreshold;
      }
      if (settings['tax_rate'] != null) {
        final newTaxRate = settings['tax_rate'].toDouble();
        print('📊 Updating tax rate: ${_taxRate.value} -> $newTaxRate');
        _taxRate.value = newTaxRate;
      }
      if (settings['tax_enabled'] != null) {
        final newTaxEnabled = settings['tax_enabled'] == true;
        print('✅ Updating tax enabled: ${_taxEnabled.value} -> $newTaxEnabled');
        _taxEnabled.value = newTaxEnabled;
      }
      
      print('✅ CartController: Settings updated successfully');
      print('   Shipping: \$${_shippingFlatRate.value} (free at \$${_shippingFreeThreshold.value})');
      print('   Tax: ${(_taxRate.value * 100).toStringAsFixed(1)}% (enabled: ${_taxEnabled.value})');
      
      update(); // Notify listeners of changes
    } catch (e) {
      print('❌ Error loading cart settings: $e');
      // Keep default values if settings fail to load
    }
  }

  /// Reload settings from backend (call this to refresh rates)
  Future<void> refreshSettings() async {
    await _loadSettings();
  }

  void _updateNavigationBadge() {
    try {
      final navController = Get.find<NavigationController>();
      navController.updateCartCount(itemCount);
    } catch (e) {
      // NavigationController not found, ignore
    }
  }

  void addToCart(Product product, int quantity) {
    final existingIndex = _cartItems.indexWhere((item) => item.product.id == product.id);
    
    if (existingIndex != -1) {
      _cartItems[existingIndex] = _cartItems[existingIndex].copyWith(
        quantity: _cartItems[existingIndex].quantity + quantity,
      );
    } else {
      _cartItems.add(CartItem(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        product: product,
        quantity: quantity,
      ));
    }
    
    update();
    _updateNavigationBadge();
  }

  void removeFromCart(String cartItemId) {
    _cartItems.removeWhere((item) => item.id == cartItemId);
    update();
    _updateNavigationBadge();
  }

  void updateQuantity(String cartItemId, int newQuantity) {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    
    final index = _cartItems.indexWhere((item) => item.id == cartItemId);
    if (index != -1) {
      _cartItems[index] = _cartItems[index].copyWith(quantity: newQuantity);
      update();
      _updateNavigationBadge();
    }
  }

  void clearCart() {
    _cartItems.clear();
    update();
    _updateNavigationBadge();
  }

  bool isInCart(String productId) {
    return _cartItems.any((item) => item.product.id == productId);
  }

  int getProductQuantity(String productId) {
    final item = _cartItems.firstWhereOrNull((item) => item.product.id == productId);
    return item?.quantity ?? 0;
  }
}
