import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../shared/models/category.dart';
import '../../../../shared/models/product.dart';
import '../../../../shared/models/advertisement.dart';
import '../../../products/presentation/pages/product_detail_screen.dart';
import '../../../products/presentation/pages/featured_products_screen.dart';
import '../../../products/presentation/pages/categories_screen.dart';
import '../../../categories/presentation/pages/dynamic_subcategories_screen.dart';
import '../../../data_packages/models/static_data_packages_category.dart';
import '../../../data_packages/presentation/pages/data_packages_screen.dart';
import '../../../../core/network/products_api_service.dart';
import '../../../../core/network/categories_api_service.dart';
import '../../../../core/network/advertisements_api_service.dart';
import '../../../../core/network/api_config.dart';
import '../../../data_packages/data/data_packages_api_service.dart';

class HomeController extends GetxController {
  final PageController bannerPageController = PageController();

  // API Services
  final ProductsApiService _productsApiService = ProductsApiService();
  final CategoriesApiService _categoriesApiService = CategoriesApiService();
  final AdvertisementsApiService _advertisementsApiService =
      AdvertisementsApiService();
  final DataPackagesApiService _dataPackagesApiService =
      DataPackagesApiService();

  // Observable variables
  final RxList<PromotionalBanner> promotionalBanners =
      <PromotionalBanner>[].obs;
  final RxList<Category> categories = <Category>[].obs;
  final RxList<Product> featuredProducts = <Product>[].obs;
  final RxList<Product> flashSaleProducts = <Product>[].obs;
  final RxList<Product> recentlyViewedProducts = <Product>[].obs;
  final RxInt currentBannerIndex = 0.obs;
  final RxString flashSaleTimeLeft = '23:59:45'.obs;
  final Rx<DateTime?> flashSaleEndTime = Rx<DateTime?>(null);
  final RxBool isLoading = false.obs;
  final RxString errorMessage = ''.obs;
  final RxBool hasConnectionError = false.obs;

  // Track viewed ads to avoid duplicate view counts (per session)
  final Set<String> _viewedAdIds = {};

  Timer? _bannerTimer;
  Timer? _flashSaleTimer;
  Timer? _retryTimer;
  int _retryCount = 0;
  static const int _maxRetries = 5;

  @override
  void onInit() {
    super.onInit();
    _initializeData();
    _startBannerAutoScroll();
    _startFlashSaleTimer();
  }

  @override
  void onClose() {
    _bannerTimer?.cancel();
    _flashSaleTimer?.cancel();
    _retryTimer?.cancel();
    bannerPageController.dispose();
    super.onClose();
  }

  Future<void> _initializeData() async {
    isLoading.value = true;
    hasConnectionError.value = false;

    try {
      await Future.wait([
        _loadPromotionalBanners(),
        _loadCategories(),
        _loadFeaturedProducts(),
        _loadFlashSaleProducts(),
      ]);
      _loadRecentlyViewedProducts();

      // Reset retry count on success
      _retryCount = 0;
      hasConnectionError.value = false;
    } catch (e) {
      print('❌ Error initializing data: $e');
      hasConnectionError.value = true;

      // Retry with exponential backoff if connection failed
      if (_retryCount < _maxRetries && e.toString().contains('Connection')) {
        _retryCount++;
        final retryDelay = Duration(seconds: 2 * _retryCount);
        print(
          '🔄 Retrying in ${retryDelay.inSeconds} seconds... (Attempt $_retryCount/$_maxRetries)',
        );

        _retryTimer = Timer(retryDelay, () {
          _initializeData();
        });
      }
    } finally {
      isLoading.value = false;
    }
  }

  // Manual retry method that can be called from UI
  Future<void> retryConnection() async {
    _retryCount = 0;
    await _initializeData();
  }

  Future<void> _loadPromotionalBanners() async {
    try {
      print('🔄 Loading promotional banners from API...');
      final response = await _advertisementsApiService.getHomeSliderAds();
      final adsData = response['advertisements'] as List? ?? [];
      print('✅ Received ${adsData.length} advertisements from API');

      if (adsData.isNotEmpty) {
        // Convert API advertisements to PromotionalBanner
        promotionalBanners.value = adsData.map((json) {
          final ad = Advertisement.fromJson(json);

          // Build full image URL if it's a relative path
          String imageUrl = ad.imageUrl;
          if (imageUrl.startsWith('/uploads')) {
            imageUrl =
                '${ApiConfig.getBaseUrl().replaceAll('/api', '')}$imageUrl';
          }

          return PromotionalBanner(
            id: ad.id,
            title: ad.title,
            subtitle: ad.description ?? '',
            imageUrl: imageUrl,
            backgroundColor: ad.backgroundColor,
            actionUrl: ad.targetUrl,
          );
        }).toList();

        print('✅ Loaded ${promotionalBanners.length} promotional banners');

        // Record view for the first banner (only once per session)
        if (promotionalBanners.isNotEmpty) {
          _recordAdView(promotionalBanners[0].id);
        }
      } else {
        // Fallback to default banners if no ads from API
        _loadDefaultBanners();
      }
    } catch (e) {
      print('⚠️ Error loading banners from API: $e');
      // Fallback to default banners on error
      _loadDefaultBanners();
    }
  }

  void _loadDefaultBanners() {
    // Default banners as fallback
    promotionalBanners.value = [
      PromotionalBanner(
        id: '1',
        title: 'Welcome to G-Store',
        subtitle: 'Discover authentic Somali products',
        imageUrl: 'assets/images/banner_1.png',
        backgroundColor: const Color(0xFF7EB725),
      ),
      PromotionalBanner(
        id: '2',
        title: 'Flash Sale 50% OFF',
        subtitle: 'Limited time offer on electronics',
        imageUrl: 'assets/images/banner_2.png',
        backgroundColor: const Color(0xFF133191),
      ),
      PromotionalBanner(
        id: '3',
        title: 'Free Shipping',
        subtitle: 'On orders above \$50',
        imageUrl: 'assets/images/banner_3.png',
        backgroundColor: const Color(0xFF7EB725),
      ),
    ];
  }

  // Store all admin categories separately for the Categories meta-category
  final RxList<Category> _adminCategories = <Category>[].obs;

  Future<void> _loadCategories() async {
    try {
      print('🔄 Loading categories...');
      final response = await _categoriesApiService.getCategories();
      final categoriesData = response['categories'] as List;
      print('✅ Received ${categoriesData.length} categories from API');

      // Get data packages count
      int dataPackagesCount = await _getDataPackagesCount();
      print('✅ Data Packages count: $dataPackagesCount');

      // Parse all admin categories
      final List<Category> adminCats = categoriesData.map((json) {
        // Determine category type from name since DB doesn't have type column
        final categoryType = _getCategoryTypeFromName(json['name_en'] ?? '');

        // Parse product_count (might be string or int from database)
        int productCount = 0;
        if (json['product_count'] != null) {
          if (json['product_count'] is String) {
            productCount = int.tryParse(json['product_count']) ?? 0;
          } else {
            productCount = json['product_count'] as int;
          }
        }

        // Parse image URL and prepend base URL if needed
        String? imageUrl;
        if (json['image_url'] != null &&
            json['image_url'].toString().isNotEmpty) {
          final imgUrl = json['image_url'].toString();
          if (imgUrl.startsWith('/uploads')) {
            imageUrl = '${ApiConfig.getServerUrl()}$imgUrl';
          } else {
            imageUrl = imgUrl;
          }
        }

        return Category(
          id: json['id']?.toString() ?? '',
          nameEn: json['name_en'] ?? '',
          nameSo: json['name_so'] ?? '',
          nameAr: json['name_ar'] ?? '',
          descriptionEn: json['description_en'] ?? '',
          descriptionSo: json['description_so'] ?? '',
          descriptionAr: json['description_ar'] ?? '',
          iconPath: json['icon_path'] ?? 'assets/icons/default.svg',
          color: _parseColor(json['color']) ?? categoryType.color,
          type: categoryType,
          productCount: productCount,
          imageUrl: imageUrl,
        );
      }).toList();

      // Store admin categories for later use
      _adminCategories.value = adminCats;

      // Calculate total product count across all admin categories
      final totalAdminProducts = adminCats.fold<int>(
        0,
        (sum, cat) => sum + cat.productCount,
      );

      // Create meta-category for all admin categories
      final categoriesMetaCategory = Category(
        id: 'categories_meta',
        nameEn: 'Online Market',
        nameSo: 'Suuqa Online',
        nameAr: 'السوق الإلكتروني',
        descriptionEn: 'Browse all product categories',
        descriptionSo: 'Baadh dhammaan qaybaha alaabta',
        descriptionAr: 'تصفح جميع فئات المنتجات',
        iconPath: 'category',
        color: const Color(0xFF133191),
        type: CategoryType.electronics,
        productCount: totalAdminProducts,
        imageUrl: null,
      );

      // Show only 2 categories on home: Internet Services + Categories meta-category
      categories.value = [
        StaticDataPackagesCategory.getCategory().copyWith(
          productCount: dataPackagesCount,
        ),
        categoriesMetaCategory,
      ];

      print(
        '✅ Loaded 2 main categories: Internet Services + Categories (${adminCats.length} subcategories)',
      );
    } catch (e) {
      print('Error loading categories: $e');
      errorMessage.value = 'Failed to load categories';
      // Even on error, show the static Data Packages category
      int dataPackagesCount = 0;
      try {
        dataPackagesCount = await _getDataPackagesCount();
      } catch (_) {}
      categories.value = [
        StaticDataPackagesCategory.getCategory().copyWith(
          productCount: dataPackagesCount,
        ),
      ];
    }
  }

  Future<void> _loadFeaturedProducts() async {
    try {
      print('🔄 Loading featured products...');
      final response = await _productsApiService.getFeaturedProducts(limit: 10);
      final productsData = response['products'] as List;
      print('✅ Received ${productsData.length} featured products from API');

      featuredProducts.value = productsData.map((json) {
        // Parse price (might be string or number from database)
        double price = 0.0;
        if (json['price'] != null) {
          if (json['price'] is String) {
            price = double.tryParse(json['price']) ?? 0.0;
          } else {
            price = (json['price'] as num).toDouble();
          }
        }

        // Parse discount_price - prefer flash sale price if product is in active flash sale
        double? discountPrice;
        final isFlashSale = json['is_flash_sale'] == true;
        if (isFlashSale && json['flash_sale_price'] != null) {
          // Use flash sale price
          if (json['flash_sale_price'] is String) {
            discountPrice = double.tryParse(json['flash_sale_price']);
          } else {
            discountPrice = (json['flash_sale_price'] as num).toDouble();
          }
        } else if (json['discount_price'] != null) {
          // Use regular discount price
          if (json['discount_price'] is String) {
            discountPrice = double.tryParse(json['discount_price']);
          } else {
            discountPrice = (json['discount_price'] as num).toDouble();
          }
        }

        // Parse rating
        double rating = 0.0;
        if (json['rating'] != null) {
          if (json['rating'] is String) {
            rating = double.tryParse(json['rating']) ?? 0.0;
          } else {
            rating = (json['rating'] as num).toDouble();
          }
        }

        // Parse images array and prepend base URL for local uploads
        List<String> images = [];
        if (json['images'] != null && json['images'] is List) {
          images = (json['images'] as List).map((e) {
            final imgPath = e.toString();
            // If it starts with /uploads, prepend the base URL
            if (imgPath.startsWith('/uploads')) {
              return '${ApiConfig.getServerUrl()}$imgPath';
            }
            return imgPath;
          }).toList();
        }

        // If no images, add placeholder
        if (images.isEmpty) {
          images = ['placeholder'];
        }

        return Product(
          id: json['id'],
          name: json['name_en'] ?? '',
          nameAr: json['name_ar'] ?? '',
          nameSo: json['name_so'] ?? '',
          description: json['description_en'] ?? '',
          descriptionAr: json['description_ar'] ?? '',
          descriptionSo: json['description_so'] ?? '',
          price: price,
          categoryId: json['category_id'] ?? '',
          discountPrice: discountPrice ?? 0.0,
          images: images,
          rating: rating,
          reviewCount: json['review_count'] ?? 0,
          inStock: json['in_stock'] ?? false,
          brand: json['brand'] ?? '',
          isFeatured: json['is_featured'] ?? false,
          isHalal: json['is_halal'] ?? false,
        );
      }).toList();

      print('✅ Loaded ${featuredProducts.length} featured products');
    } catch (e) {
      print('Error loading featured products: $e');
      errorMessage.value = 'Failed to load featured products';
      featuredProducts.value = [];
    }
  }

  Future<void> _loadFlashSaleProducts() async {
    try {
      print('🔄 Loading flash sale products...');
      final response = await _productsApiService.getFlashSaleProducts(limit: 8);
      final productsData = response['products'] as List;
      print('✅ Received ${productsData.length} flash sale products from API');

      // Parse flash sale end time from the first product (all products in same flash sale)
      if (productsData.isNotEmpty &&
          productsData[0]['flash_end_time'] != null) {
        try {
          flashSaleEndTime.value = DateTime.parse(
            productsData[0]['flash_end_time'],
          );
          print('⏰ Flash sale ends at: ${flashSaleEndTime.value}');
        } catch (e) {
          print('⚠️ Error parsing flash sale end time: $e');
          flashSaleEndTime.value = null;
        }
      } else {
        flashSaleEndTime.value = null;
      }

      flashSaleProducts.value = productsData.map((json) {
        // Parse original price
        double price = 0.0;
        if (json['flash_original_price'] != null) {
          if (json['flash_original_price'] is String) {
            price = double.tryParse(json['flash_original_price']) ?? 0.0;
          } else {
            price = (json['flash_original_price'] as num).toDouble();
          }
        } else if (json['price'] != null) {
          if (json['price'] is String) {
            price = double.tryParse(json['price']) ?? 0.0;
          } else {
            price = (json['price'] as num).toDouble();
          }
        }

        // Parse flash sale price
        double discountPrice = 0.0;
        if (json['flash_sale_price'] != null) {
          if (json['flash_sale_price'] is String) {
            discountPrice = double.tryParse(json['flash_sale_price']) ?? 0.0;
          } else {
            discountPrice = (json['flash_sale_price'] as num).toDouble();
          }
        } else if (json['discount_price'] != null) {
          if (json['discount_price'] is String) {
            discountPrice = double.tryParse(json['discount_price']) ?? 0.0;
          } else {
            discountPrice = (json['discount_price'] as num).toDouble();
          }
        }

        // Parse rating
        double rating = 0.0;
        if (json['rating'] != null) {
          if (json['rating'] is String) {
            rating = double.tryParse(json['rating']) ?? 0.0;
          } else {
            rating = (json['rating'] as num).toDouble();
          }
        }

        // Parse images array and prepend base URL for local uploads
        List<String> images = [];
        if (json['images'] != null && json['images'] is List) {
          images = (json['images'] as List).map((e) {
            final imgPath = e.toString();
            if (imgPath.startsWith('/uploads')) {
              return '${ApiConfig.getServerUrl()}$imgPath';
            }
            return imgPath;
          }).toList();
        }

        // If no images, add placeholder
        if (images.isEmpty) {
          images = ['placeholder'];
        }

        return Product(
          id: json['id'],
          name: json['name_en'] ?? '',
          nameAr: json['name_ar'] ?? '',
          nameSo: json['name_so'] ?? '',
          description: json['description_en'] ?? '',
          descriptionAr: json['description_ar'] ?? '',
          descriptionSo: json['description_so'] ?? '',
          price: price,
          discountPrice: discountPrice,
          categoryId: json['category_id'] ?? '',
          images: images,
          rating: rating,
          reviewCount: json['review_count'] ?? 0,
          inStock: json['in_stock'] ?? true,
          stockQuantity: json['stock_quantity'] ?? 0,
          brand: json['brand'] ?? '',
          sku: json['sku'] ?? '',
          isFeatured: json['is_featured'] ?? false,
          isHalal: json['is_halal'] ?? false,
        );
      }).toList();

      print('✅ Loaded ${flashSaleProducts.length} flash sale products');
    } catch (e) {
      print('Error loading flash sale products: $e');
      errorMessage.value = 'Failed to load flash sale products';
      flashSaleProducts.value = [];
      flashSaleEndTime.value = null;
    }
  }

  void _loadRecentlyViewedProducts() {
    // Load from local storage (Hive) - recently viewed products are stored locally
    // For now, keep empty until user views products
    recentlyViewedProducts.value = [];
  }

  // Method to add a product to recently viewed
  void addToRecentlyViewed(Product product) {
    // Remove if already exists to avoid duplicates
    recentlyViewedProducts.removeWhere((p) => p.id == product.id);

    // Add to the beginning of the list
    recentlyViewedProducts.insert(0, product);

    // Keep only the last 10 items
    if (recentlyViewedProducts.length > 10) {
      recentlyViewedProducts.removeRange(10, recentlyViewedProducts.length);
    }
  }

  void _startBannerAutoScroll() {
    _bannerTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (promotionalBanners.isNotEmpty) {
        final nextIndex =
            (currentBannerIndex.value + 1) % promotionalBanners.length;
        bannerPageController.animateToPage(
          nextIndex,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  void _startFlashSaleTimer() {
    _flashSaleTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      final now = DateTime.now();

      // Use real flash sale end time if available, otherwise use end of day
      final endTime =
          flashSaleEndTime.value ?? DateTime(now.year, now.month, now.day + 1);
      final difference = endTime.difference(now);

      if (difference.isNegative) {
        flashSaleTimeLeft.value = '00:00:00';
        // Flash sale has ended, reload products to clear expired sales
        if (flashSaleEndTime.value != null) {
          _loadFlashSaleProducts();
        }
      } else {
        final hours = difference.inHours.toString().padLeft(2, '0');
        final minutes = (difference.inMinutes % 60).toString().padLeft(2, '0');
        final seconds = (difference.inSeconds % 60).toString().padLeft(2, '0');
        flashSaleTimeLeft.value = '$hours:$minutes:$seconds';
      }
    });
  }

  void onBannerPageChanged(int index) {
    currentBannerIndex.value = index;

    // Record view for the banner that's now visible (only once per session)
    if (index < promotionalBanners.length) {
      final banner = promotionalBanners[index];
      _recordAdView(banner.id);
    }
  }

  /// Check if ID is a valid UUID format (not a fallback ID like '1', '2', '3')
  bool _isValidUuid(String id) {
    // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 chars with dashes)
    // or 32 hex chars without dashes
    return id.length >= 32 && RegExp(r'^[a-fA-F0-9-]+$').hasMatch(id);
  }

  /// Record ad view only once per session per ad
  void _recordAdView(String adId) {
    // Skip fallback/default banner IDs (not real UUIDs)
    if (!_isValidUuid(adId)) {
      return;
    }

    // Skip if already viewed in this session
    if (_viewedAdIds.contains(adId)) {
      return;
    }

    // Mark as viewed and record in backend
    _viewedAdIds.add(adId);
    _advertisementsApiService.recordView(adId);
    print('👁️ Recorded view for ad: $adId');
  }

  /// Handle banner tap - record click and navigate to target URL
  void onBannerTap(PromotionalBanner banner) async {
    print('🖱️ Banner tapped: ${banner.title}');

    // Record click in the backend (only for real ads with valid UUIDs)
    if (_isValidUuid(banner.id)) {
      _advertisementsApiService.recordClick(banner.id);
    }

    // Navigate to target URL if available
    if (banner.actionUrl != null && banner.actionUrl!.isNotEmpty) {
      final url = banner.actionUrl!;

      try {
        final uri = Uri.parse(url);

        // Try external browser first, then platform default
        final launched = await launchUrl(
          uri,
          mode: LaunchMode.externalApplication,
        );
        if (!launched) {
          await launchUrl(uri, mode: LaunchMode.platformDefault);
        }
      } catch (e) {
        // Silently log — avoid Get.snackbar which crashes without Overlay
        print('❌ Error launching URL: $e');
      }
    }
  }

  void onCategoryTap(Category category) {
    // Check if this is the static Data Packages category
    if (StaticDataPackagesCategory.isDataPackagesCategory(category.id)) {
      // Navigate to Data Packages screen (separate from main e-commerce flow)
      Get.to(() => const DataPackagesScreen());
      return;
    }

    // Check if this is the Categories meta-category
    if (category.id == 'categories_meta') {
      // Navigate to all categories screen showing all admin categories
      Get.to(() => const CategoriesScreen());
      return;
    }

    // Navigate to dynamic subcategories screen with real data from API
    Get.to(() => DynamicSubcategoriesScreen(category: category));
  }

  // Getter to access admin categories for the categories screen
  List<Category> get adminCategories => _adminCategories;

  void onProductTap(Product product) {
    // Add to recently viewed and navigate to product details
    _addToRecentlyViewed(product);
    Get.to(() => ProductDetailScreen(product: product));
  }

  void onSeeAllFeaturedProducts() {
    // Navigate to featured products screen
    Get.to(
      () => const FeaturedProductsScreen(),
      transition: Transition.rightToLeft,
      duration: const Duration(milliseconds: 300),
    );
  }

  void _addToRecentlyViewed(Product product) {
    // Remove if already exists
    recentlyViewedProducts.removeWhere((p) => p.id == product.id);

    // Add to beginning
    recentlyViewedProducts.insert(0, product);

    // Keep only last 10 items
    if (recentlyViewedProducts.length > 10) {
      recentlyViewedProducts.removeRange(10, recentlyViewedProducts.length);
    }
  }

  Future<void> refreshData() async {
    isLoading.value = true;
    errorMessage.value = '';

    try {
      await _initializeData();
      print('✅ Home data refreshed successfully');
      // RefreshIndicator spinner provides visual feedback — no snackbar needed
    } catch (e) {
      print('❌ Error refreshing data: $e');
      errorMessage.value = 'Failed to refresh data';
      // Avoid Get.snackbar here: it crashes with "No Overlay widget found"
      // when called from within a RefreshIndicator callback
    } finally {
      isLoading.value = false;
    }
  }

  // Helper method to parse hex color string
  Color? _parseColor(String? colorHex) {
    if (colorHex == null || colorHex.isEmpty) return null;
    try {
      // Remove # if present
      final hex = colorHex.replaceAll('#', '');
      // Add FF for opacity if not present
      final hexColor = hex.length == 6 ? 'FF$hex' : hex;
      return Color(int.parse(hexColor, radix: 16));
    } catch (e) {
      return null;
    }
  }

  // Get total count of data packages across all providers
  Future<int> _getDataPackagesCount() async {
    try {
      print('🔄 Fetching data packages count...');
      final response = await _dataPackagesApiService.findReseller();

      print('📦 Data Packages API Response:');
      print('   Status: ${response['status']}');
      print('   Has data: ${response['data'] != null}');

      if (response['status'] == 'Success' && response['data'] != null) {
        final data = response['data'];
        final companies = data['companies'] as List<dynamic>? ?? [];

        print('   Number of companies: ${companies.length}');
        for (var company in companies) {
          final companyName = company['name'] ?? 'Unknown';
          final packageCount = (company['packages'] as List? ?? []).length;
          print('   - $companyName: $packageCount packages');
        }

        print('✅ Total providers count: ${companies.length}');
        return companies.length;
      }

      print('⚠️ No data packages found or API error');
      return 0;
    } catch (e) {
      print('❌ Error getting data packages count: $e');
      return 0;
    }
  }

  // Helper method to determine category type from name
  CategoryType _getCategoryTypeFromName(String name) {
    final nameLower = name.toLowerCase();

    if (nameLower.contains('internet') || nameLower.contains('adeegyada')) {
      return CategoryType.internet;
    } else if (nameLower.contains('gift') || nameLower.contains('hadiyad')) {
      return CategoryType.gifts;
    } else if (nameLower.contains('electronic') ||
        nameLower.contains('elektaroon')) {
      return CategoryType.electronics;
    } else if (nameLower.contains('men') || nameLower.contains('ragga')) {
      return CategoryType.mens;
    } else if (nameLower.contains('women') ||
        nameLower.contains('haweenka') ||
        nameLower.contains('dumarka')) {
      return CategoryType.womens;
    } else if (nameLower.contains('kid') || nameLower.contains('carruur')) {
      return CategoryType.kids;
    } else if (nameLower.contains('cosmetic') || nameLower.contains('qurux')) {
      return CategoryType.cosmetics;
    } else if (nameLower.contains('good') ||
        nameLower.contains('alaabta') ||
        nameLower.contains('general')) {
      return CategoryType.goods;
    }

    return CategoryType.goods; // Default
  }
}

// Promotional Banner Model
class PromotionalBanner {
  final String id;
  final String title;
  final String subtitle;
  final String imageUrl;
  final Color backgroundColor;
  final String? actionUrl;

  PromotionalBanner({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    required this.backgroundColor,
    this.actionUrl,
  });
}
