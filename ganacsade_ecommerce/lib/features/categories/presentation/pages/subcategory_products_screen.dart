import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/network/api_config.dart';
import '../../../../core/network/products_api_service.dart';
import '../../../../shared/models/product.dart';
import '../../../../shared/widgets/advertisement_banner.dart';
import '../../../products/presentation/pages/product_detail_screen.dart';

/// Screen to display products for a specific subcategory
class SubcategoryProductsScreen extends StatefulWidget {
  final String subcategoryId;
  final String subcategoryName;
  final Color categoryColor;

  const SubcategoryProductsScreen({
    super.key,
    required this.subcategoryId,
    required this.subcategoryName,
    required this.categoryColor,
  });

  @override
  State<SubcategoryProductsScreen> createState() => _SubcategoryProductsScreenState();
}

class _SubcategoryProductsScreenState extends State<SubcategoryProductsScreen> {
  final ProductsApiService _productsApi = ProductsApiService();
  
  List<Product> _products = [];
  bool _isLoading = true;
  String? _error;

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
      final response = await _productsApi.getProducts(subcategory: widget.subcategoryId);
      final productsData = response['products'] as List? ?? [];
      
      final products = productsData.map((json) => _parseProduct(json)).toList();
      
      setState(() {
        _products = products;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading products: $e');
      setState(() {
        _isLoading = false;
        _error = 'Failed to load products';
      });
    }
  }

  Product _parseProduct(Map<String, dynamic> json) {
    // Parse price
    double price = 0.0;
    if (json['price'] != null) {
      if (json['price'] is String) {
        price = double.tryParse(json['price']) ?? 0.0;
      } else {
        price = (json['price'] as num).toDouble();
      }
    }
    
    // Parse discount price - prefer flash sale price if product is in active flash sale
    double discountPrice = 0.0;
    final isFlashSale = json['is_flash_sale'] == true;
    if (isFlashSale && json['flash_sale_price'] != null) {
      // Use flash sale price
      if (json['flash_sale_price'] is String) {
        discountPrice = double.tryParse(json['flash_sale_price']) ?? 0.0;
      } else {
        discountPrice = (json['flash_sale_price'] as num).toDouble();
      }
    } else if (json['discount_price'] != null) {
      // Use regular discount price
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
    
    // Parse images array
    List<String> images = [];
    if (json['images'] != null && json['images'] is List) {
      images = (json['images'] as List).map((e) {
        final imageUrl = e.toString();
        if (imageUrl.startsWith('/uploads')) {
          return '${ApiConfig.getServerUrl()}$imageUrl';
        }
        return imageUrl;
      }).toList();
    }
    
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

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      backgroundColor: isDark ? AppColors.darkScaffoldBackground : AppColors.grey50,
      appBar: AppBar(
        title: Text(widget.subcategoryName),
        backgroundColor: isDark ? AppColors.darkScaffoldBackground : widget.categoryColor,
        foregroundColor: isDark ? AppColors.darkTextPrimary : AppColors.white,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Get.back(),
          icon: const Icon(Icons.arrow_back),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen))
          : _error != null
              ? _buildErrorState(isDark)
              : _buildContent(isDark),
    );
  }

  Widget _buildErrorState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: isDark ? AppColors.darkTextSecondary : AppColors.grey400),
          const SizedBox(height: 16),
          Text(
            _error ?? 'Something went wrong',
            style: AppTextStyles.bodyLarge.copyWith(color: isDark ? AppColors.darkTextSecondary : AppColors.grey600),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _loadProducts,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(bool isDark) {
    if (_products.isEmpty) {
      return _buildEmptyState(isDark);
    }

    return Column(
      children: [
        // Product Page Advertisement
        const AdvertisementBanner(
          placement: 'category_page',
          height: 100,
          margin: EdgeInsets.fromLTRB(16, 8, 16, 0),
          showTitle: false,
        ),
        
        // Products Grid
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.63,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: _products.length,
            itemBuilder: (context, index) {
              return _buildProductCard(_products[index], index, isDark);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inventory_2_outlined, size: 64, color: isDark ? AppColors.darkTextSecondary : AppColors.grey400),
          const SizedBox(height: 16),
          Text(
            'No products available',
            style: AppTextStyles.bodyLarge.copyWith(color: isDark ? AppColors.darkTextPrimary : AppColors.grey600),
          ),
          const SizedBox(height: 8),
          Text(
            'Check back later for new arrivals',
            style: AppTextStyles.bodyMedium.copyWith(color: isDark ? AppColors.darkTextSecondary : AppColors.grey500),
          ),
        ],
      ),
    );
  }

  Widget _buildProductCard(Product product, int index, bool isDark) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
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
            Expanded(
              flex: 3,
              child: Stack(
                children: [
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.grey100,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                    ),
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                      child: _buildProductImage(product.mainImage),
                    ),
                  ),
                  if (product.hasDiscount)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.error,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${product.discountPercentage.round()}% OFF',
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 10,
                          ),
                        ),
                      ),
                    ),
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
                  if (!product.inStock)
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.black.withOpacity(0.6),
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                        ),
                        child: const Center(
                          child: Text(
                            'Out of Stock',
                            style: TextStyle(color: AppColors.white, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // Product Details
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (product.brand.isNotEmpty)
                      Text(
                        product.brand,
                        style: AppTextStyles.labelSmall.copyWith(color: isDark ? AppColors.darkTextSecondary : AppColors.grey600, fontSize: 10),
                      ),
                    Flexible(
                      child: Text(
                        product.name,
                        style: AppTextStyles.bodyMedium.copyWith(
                          fontWeight: FontWeight.w600, 
                          fontSize: 12,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Icon(Icons.star, size: 12, color: AppColors.warning),
                        const SizedBox(width: 2),
                        Text(
                          '${product.rating}',
                          style: AppTextStyles.labelSmall.copyWith(
                            fontWeight: FontWeight.w600, 
                            fontSize: 10,
                            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            '(${product.reviewCount})',
                            style: AppTextStyles.labelSmall.copyWith(color: isDark ? AppColors.darkTextSecondary : AppColors.grey600, fontSize: 10),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            '\$${product.finalPrice.toStringAsFixed(2)}',
                            style: AppTextStyles.titleSmall.copyWith(
                              color: AppColors.primaryGreen,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        if (product.hasDiscount)
                          Text(
                            '\$${product.price.toStringAsFixed(2)}',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: isDark ? AppColors.darkTextSecondary : AppColors.grey600,
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
    ).animate()
        .fadeIn(delay: Duration(milliseconds: 50 * index), duration: 400.ms)
        .slideY(begin: 0.2, end: 0);
  }

  Widget _buildProductImage(String imagePath) {
    if (imagePath.isEmpty || imagePath == 'placeholder') {
      return _buildImagePlaceholder();
    }

    if (imagePath.startsWith('http')) {
      return Image.network(
        imagePath,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        errorBuilder: (context, error, stackTrace) => _buildImagePlaceholder(),
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Center(
            child: CircularProgressIndicator(
              value: loadingProgress.expectedTotalBytes != null
                  ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                  : null,
              strokeWidth: 2,
            ),
          );
        },
      );
    }

    return Image.asset(
      imagePath,
      fit: BoxFit.cover,
      width: double.infinity,
      height: double.infinity,
      errorBuilder: (context, error, stackTrace) => _buildImagePlaceholder(),
    );
  }

  Widget _buildImagePlaceholder() {
    return Container(
      color: AppColors.grey100,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_bag_outlined, size: 32, color: AppColors.grey400),
          const SizedBox(height: 4),
          Text(
            'GANACSADE',
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.primaryGreen,
              fontWeight: FontWeight.w600,
              fontSize: 8,
            ),
          ),
        ],
      ),
    );
  }
}
