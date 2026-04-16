import 'dart:async';
import 'package:get/get.dart';
import '../../../../shared/models/product.dart';
import '../../../../core/network/products_api_service.dart';

/// Search Controller - loads all products once and searches locally
class SearchController extends GetxController {
  final ProductsApiService _api = ProductsApiService();

  // All products cache
  final _allProducts = <Product>[].obs;
  final _isProductsLoaded = false.obs;
  
  // State
  final searchResults = <Product>[].obs;
  final recentSearches = <String>[].obs;
  final isLoading = false.obs;
  final currentQuery = ''.obs;
  final errorMessage = ''.obs;

  // Debounce timer for auto-search
  Timer? _debounceTimer;

  // Computed
  bool get hasResults => searchResults.isNotEmpty;
  bool get hasQuery => currentQuery.value.trim().isNotEmpty;
  bool get hasError => errorMessage.value.isNotEmpty;
  bool get isProductsLoaded => _isProductsLoaded.value;

  @override
  void onInit() {
    super.onInit();
    recentSearches.value = ['Phone', 'Laptop', 'Watch', 'Dress', 'Perfume'];
    loadAllProducts();
  }

  @override
  void onClose() {
    _debounceTimer?.cancel();
    super.onClose();
  }

  /// Load all products once from API
  Future<void> loadAllProducts() async {
    if (_isProductsLoaded.value || isLoading.value) return;

    isLoading.value = true;
    errorMessage.value = '';

    try {
      final response = await _api.getProducts(
        limit: 500,
        sortBy: 'created_at',
        sortOrder: 'DESC',
      );

      final data = response['products'] as List? ?? [];
      
      final products = <Product>[];
      for (final json in data) {
        try {
          products.add(Product.fromJson(json));
        } catch (e) {
          print('❌ Failed to parse product: $e');
        }
      }

      _allProducts.value = products;
      _isProductsLoaded.value = true;
      print('✅ Loaded ${products.length} products for search');
    } catch (e) {
      errorMessage.value = 'Failed to load products';
      print('❌ Error loading products: $e');
    } finally {
      isLoading.value = false;
    }
  }

  /// Search products locally from cached products
  void search(String query) {
    final trimmed = query.trim();
    if (trimmed.isEmpty) {
      clearSearch();
      return;
    }

    currentQuery.value = trimmed;
    
    // Search locally
    final queryLower = trimmed.toLowerCase();
    final results = _allProducts.where((product) {
      return product.name.toLowerCase().contains(queryLower) ||
             product.nameAr.toLowerCase().contains(queryLower) ||
             product.nameSo.toLowerCase().contains(queryLower) ||
             product.description.toLowerCase().contains(queryLower) ||
             product.brand.toLowerCase().contains(queryLower);
    }).toList();

    searchResults.value = results;
    
    if (results.isNotEmpty) {
      _addToRecent(trimmed);
    } else {
      errorMessage.value = 'No products found for "$trimmed"';
    }
  }

  void _addToRecent(String query) {
    recentSearches.remove(query);
    recentSearches.insert(0, query);
    if (recentSearches.length > 8) {
      recentSearches.removeLast();
    }
  }

  void clearSearch() {
    currentQuery.value = '';
    searchResults.clear();
    errorMessage.value = '';
    isLoading.value = false;
  }

  void clearRecent() {
    recentSearches.clear();
  }

  /// Auto-search as user types (debounced)
  void onSearchChanged(String query) {
    _debounceTimer?.cancel();
    
    if (query.trim().isEmpty) {
      clearSearch();
      return;
    }

    // Debounce for 500ms - search after user stops typing
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      search(query);
    });
  }
}
