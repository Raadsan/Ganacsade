import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/network/api_config.dart';
import '../../../../core/network/products_api_service.dart';
import '../../../../shared/models/category.dart';
import '../../../../shared/models/product.dart';
import '../../../../shared/widgets/advertisement_banner.dart';
import '../../../products/presentation/pages/product_detail_screen.dart';

class CategoryProductsScreen extends StatefulWidget {
  final Category category;

  const CategoryProductsScreen({
    super.key,
    required this.category,
  });

  @override
  State<CategoryProductsScreen> createState() => _CategoryProductsScreenState();
}

class _CategoryProductsScreenState extends State<CategoryProductsScreen> {
  final ProductsApiService _productsApi = ProductsApiService();

  List<Product> _allProducts = [];
  bool _isLoading = true;
  String? _error;

  String _selectedSort = 'Popular';
  String _selectedFilter = 'All';

  final List<String> _sortOptions = [
    'Popular',
    'Price: Low to High',
    'Price: High to Low',
    'Newest',
    'Rating',
  ];
  final List<String> _filterOptions = ['All', 'In Stock', 'On Sale'];

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final response = await _productsApi.getProducts(
        category: widget.category.id,
        limit: 100,
      );
      final productsData = response['products'] as List? ?? [];
      final products = productsData.map((json) => _parseProduct(json)).toList();
      setState(() {
        _allProducts = products;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading category products: $e');
      setState(() {
        _isLoading = false;
        _error = 'Failed to load products';
      });
    }
  }

  Product _parseProduct(Map<String, dynamic> json) {
    double price = 0.0;
    if (json['price'] != null) {
      price = json['price'] is String
          ? double.tryParse(json['price']) ?? 0.0
          : (json['price'] as num).toDouble();
    }

    double discountPrice = 0.0;
    final isFlashSale = json['is_flash_sale'] == true;
    if (isFlashSale && json['flash_sale_price'] != null) {
      discountPrice = json['flash_sale_price'] is String
          ? double.tryParse(json['flash_sale_price']) ?? 0.0
          : (json['flash_sale_price'] as num).toDouble();
    } else if (json['discount_price'] != null) {
      discountPrice = json['discount_price'] is String
          ? double.tryParse(json['discount_price']) ?? 0.0
          : (json['discount_price'] as num).toDouble();
    }

    double rating = 0.0;
    if (json['rating'] != null) {
      rating = json['rating'] is String
          ? double.tryParse(json['rating']) ?? 0.0
          : (json['rating'] as num).toDouble();
    }

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

    // 🔍 DEBUG: Log raw API image data
    print('-------------------------------------------');
    print('📦 Product: ${json['name_en']}');
    print('   Raw images from API: ${json['images']}');
    print('   Parsed images (${images.length}):');
    for (int i = 0; i < images.length; i++) {
      print('   [$i] ${images[i]}');
    }

    if (images.isEmpty) images = ['placeholder'];


    return Product(
      id: json['id']?.toString() ?? '',
      name: json['name_en'] ?? '',
      nameAr: json['name_ar'] ?? '',
      nameSo: json['name_so'] ?? '',
      description: json['description_en'] ?? '',
      descriptionAr: json['description_ar'] ?? '',
      descriptionSo: json['description_so'] ?? '',
      price: price,
      discountPrice: discountPrice,
      categoryId: json['category_id']?.toString() ?? '',
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
  }

  List<Product> get _filteredProducts {
    List<Product> result = List.from(_allProducts);

    // Filter
    switch (_selectedFilter) {
      case 'In Stock':
        result = result.where((p) => p.inStock).toList();
        break;
      case 'On Sale':
        result = result.where((p) => p.hasDiscount).toList();
        break;
    }

    // Sort
    switch (_selectedSort) {
      case 'Price: Low to High':
        result.sort((a, b) => a.finalPrice.compareTo(b.finalPrice));
        break;
      case 'Price: High to Low':
        result.sort((a, b) => b.finalPrice.compareTo(a.finalPrice));
        break;
      case 'Newest':
        result.sort((a, b) =>
            (b.createdAt ?? DateTime(2000))
                .compareTo(a.createdAt ?? DateTime(2000)));
        break;
      case 'Rating':
        result.sort((a, b) => b.rating.compareTo(a.rating));
        break;
      case 'Popular':
      default:
        result.sort((a, b) => b.reviewCount.compareTo(a.reviewCount));
        break;
    }
    return result;
  }


  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          isDark ? AppColors.darkScaffoldBackground : AppColors.scaffoldBackground,
      appBar: _buildAppBar(isDark),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primaryGreen),
            )
          : _error != null
              ? _buildErrorState(isDark)
              : Column(
                  children: [
                    const AdvertisementBanner(
                      placement: 'category_page',
                      height: 100,
                      margin: EdgeInsets.fromLTRB(16, 8, 16, 0),
                      showTitle: false,
                    ),
                    _buildFilterBar(isDark),
                    Expanded(
                      child: _buildProductGrid(isDark),
                    ),
                  ],
                ),
    );
  }

  Widget _buildErrorState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.cloud_off,
            size: 72,
            color: isDark ? AppColors.darkTextSecondary : AppColors.grey400,
          ),
          const SizedBox(height: 16),
          Text(
            _error ?? 'Something went wrong',
            style: AppTextStyles.bodyLarge.copyWith(
              color: isDark ? AppColors.darkTextSecondary : AppColors.grey600,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _loadProducts,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGreen,
              foregroundColor: AppColors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
            ),
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(bool isDark) {
    return AppBar(
      title: Text(widget.category.nameEn),
      backgroundColor: isDark ? AppColors.darkScaffoldBackground : AppColors.white,
      foregroundColor: isDark ? AppColors.darkTextPrimary : AppColors.grey900,
      elevation: 0,
      leading: IconButton(
        onPressed: () => Get.back(),
        icon: const Icon(Icons.arrow_back),
      ),
      actions: [
        IconButton(
          onPressed: () {
            // Search functionality
          },
          icon: const Icon(Icons.search),
        ),
        IconButton(
          onPressed: () {
            // Cart functionality
          },
          icon: Stack(
            children: [
              const Icon(Icons.shopping_cart_outlined),
              Positioned(
                right: 0,
                top: 0,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: AppColors.error,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 12,
                    minHeight: 12,
                  ),
                  child: Text(
                    '0',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.white,
                      fontSize: 8,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFilterBar(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardBackground : AppColors.white,
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black26 : AppColors.shadowLight,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildFilterChip(
              'Sort: $_selectedSort',
              Icons.sort,
              () => _showSortOptions(),
              isDark,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildFilterChip(
              'Filter: $_selectedFilter',
              Icons.filter_list,
              () => _showFilterOptions(),
              isDark,
            ),
          ),
          const SizedBox(width: 12),
          _buildViewToggle(isDark),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, IconData icon, VoidCallback onTap, bool isDark) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: isDark ? AppColors.darkBorderLight : AppColors.grey300),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: isDark ? AppColors.darkTextSecondary : AppColors.grey600),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                label,
                style: AppTextStyles.labelMedium.copyWith(
                  color: isDark ? AppColors.darkTextPrimary : AppColors.grey700,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Icon(Icons.keyboard_arrow_down, size: 16, color: isDark ? AppColors.darkTextSecondary : AppColors.grey600),
          ],
        ),
      ),
    );
  }

  Widget _buildViewToggle(bool isDark) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: isDark ? AppColors.darkBorderLight : AppColors.grey300),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildViewButton(Icons.grid_view, true, isDark),
          _buildViewButton(Icons.view_list, false, isDark),
        ],
      ),
    );
  }

  Widget _buildViewButton(IconData icon, bool isSelected, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: isSelected ? AppColors.primaryGreen : Colors.transparent,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Icon(
        icon,
        size: 16,
        color: isSelected ? AppColors.white : (isDark ? AppColors.darkTextSecondary : AppColors.grey600),
      ),
    );
  }

  Widget _buildProductGrid(bool isDark) {
    final products = _filteredProducts;

    if (products.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.inventory_2_outlined,
              size: 72,
              color: isDark ? AppColors.darkTextSecondary : AppColors.grey400,
            ),
            const SizedBox(height: 16),
            Text(
              'No products found',
              style: AppTextStyles.titleMedium.copyWith(
                color: isDark ? AppColors.darkTextPrimary : AppColors.grey600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Try adjusting your filters',
              style: AppTextStyles.bodyMedium.copyWith(
                color: isDark ? AppColors.darkTextSecondary : AppColors.grey500,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadProducts,
      color: AppColors.primaryGreen,
      child: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.63,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        itemCount: products.length,
        itemBuilder: (context, index) {
          return _buildProductCard(products[index], index, isDark);
        },
      ),
    );
  }

  Widget _buildProductImage(String imagePath) {
    // Check if it's a placeholder or invalid path
    if (imagePath == 'placeholder' || imagePath.isEmpty) {
      return _buildImagePlaceholder();
    }
    
    // Check if it's a network URL or local asset
    if (imagePath.startsWith('http')) {
      return Image.network(
        imagePath,
        fit: BoxFit.cover,
        width: double.infinity,
        errorBuilder: (context, error, stackTrace) {
          return _buildImagePlaceholder();
        },
      );
    } else {
      return Image.asset(
        imagePath,
        fit: BoxFit.cover,
        width: double.infinity,
        errorBuilder: (context, error, stackTrace) {
          return _buildImagePlaceholder();
        },
      );
    }
  }

  Widget _buildImagePlaceholder() {
    return Container(
      width: double.infinity,
      height: double.infinity,
      color: AppColors.grey100,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            'assets/logos/GANACSADE LOGO-06.png',
            width: 60,
            height: 60,
            errorBuilder: (context, error, stackTrace) {
              return Icon(
                Icons.shopping_bag_outlined,
                size: 40,
                color: AppColors.grey400,
              );
            },
          ),
          const SizedBox(height: 8),
          Text(
            'GANACSADE',
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.primaryGreen,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductCard(Product product, int index, bool isDark) {
    return GestureDetector(
      onTap: () {
        Get.to(() => ProductDetailScreen(product: product));
      },
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCardBackground : AppColors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black26 : AppColors.shadowLight,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            SizedBox(
              height: 90,
              child: Stack(
                children: [
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.grey100,
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(12),
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(12),
                      ),
                      child: _buildProductImage(product.mainImage),
                    ),
                  ),
                  // Discount Badge
                  if (product.hasDiscount)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.error,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${product.discountPercentage.round()}% OFF',
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  // Favorite Button
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: AppColors.white.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Icon(
                        Icons.favorite_border,
                        size: 16,
                        color: AppColors.grey600,
                      ),
                    ),
                  ),
                  // Stock Status
                  if (!product.inStock)
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.black.withOpacity(0.6),
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(12),
                          ),
                        ),
                        child: const Center(
                          child: Text(
                            'Out of Stock',
                            style: TextStyle(
                              color: AppColors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // Product Details
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(6),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Brand
                    if (product.brand.isNotEmpty)
                      Text(
                        product.brand,
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.grey600,
                          fontSize: 9,
                        ),
                      ),
                    Text(
                      product.name,
                      style: AppTextStyles.bodyMedium.copyWith(
                        fontWeight: FontWeight.w600,
                        fontSize: 11.5,
                        color: isDark ? AppColors.darkTextPrimary : AppColors.grey900,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    // Rating
                    Row(
                      children: [
                        Icon(
                          Icons.star,
                          size: 12,
                          color: AppColors.warning,
                        ),
                        const SizedBox(width: 2),
                        Text(
                          '${product.rating}',
                          style: AppTextStyles.labelSmall.copyWith(
                            fontWeight: FontWeight.w600,
                            fontSize: 11,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            '(${product.reviewCount})',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.grey600,
                              fontSize: 10,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    // Price
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            '\$${product.finalPrice.toStringAsFixed(2)}',
                            style: AppTextStyles.titleSmall.copyWith(
                              color: AppColors.primaryGreen,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ),
                        if (product.hasDiscount)
                          Text(
                            '\$${product.price.toStringAsFixed(2)}',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.grey600,
                              decoration: TextDecoration.lineThrough,
                              fontSize: 10,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    )
        .animate()
        .fadeIn(delay: (index * 100).ms, duration: 600.ms)
        .slideY(begin: 0.3, end: 0);
  }

  void _showSortOptions() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sort by',
              style: AppTextStyles.titleLarge.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ..._sortOptions.map((option) {
              return ListTile(
                title: Text(option),
                trailing: _selectedSort == option
                    ? const Icon(Icons.check, color: AppColors.primaryGreen)
                    : null,
                onTap: () {
                  setState(() {
                    _selectedSort = option;
                  });
                  Get.back();
                },
              );
            }),
          ],
        ),
      ),
    );
  }

  void _showFilterOptions() {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Filter by',
              style: AppTextStyles.titleLarge.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ..._filterOptions.map((option) {
              return ListTile(
                title: Text(option),
                trailing: _selectedFilter == option
                    ? const Icon(Icons.check, color: AppColors.primaryGreen)
                    : null,
                onTap: () {
                  setState(() {
                    _selectedFilter = option;
                  });
                  Get.back();
                },
              );
            }),
          ],
        ),
      ),
    );
  }
}
