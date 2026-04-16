import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
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
  String _selectedSort = 'Popular';
  String _selectedFilter = 'All';
  
  final List<String> _sortOptions = ['Popular', 'Price: Low to High', 'Price: High to Low', 'Newest', 'Rating'];
  final List<String> _filterOptions = ['All', 'In Stock', 'On Sale', 'Free Shipping'];

  // Mock products for demonstration
  List<Product> get _mockProducts => [
    Product(
      id: '1',
      name: 'Samsung Galaxy S24',
      nameAr: 'سامسونج جالاكسي S24',
      nameSo: 'Samsung Galaxy S24',
      description: 'Latest flagship smartphone with advanced camera system and AI features.',
      descriptionAr: 'أحدث هاتف ذكي رائد مع نظام كاميرا متقدم وميزات الذكاء الاصطناعي.',
      descriptionSo: 'Taleefanka ugu cusub ee horumarsan oo leh nidaamka kamaradda horumarsan iyo astaamaha AI.',
      price: 899.99,
      discountPrice: 799.99,
      categoryId: widget.category.id,
      images: ['placeholder'],
      rating: 4.8,
      reviewCount: 1250,
      inStock: true,
      stockQuantity: 50,
      brand: 'Samsung',
      isFeatured: true,
    ),
    Product(
      id: '2',
      name: 'iPhone 15 Pro',
      nameAr: 'آيفون 15 برو',
      nameSo: 'iPhone 15 Pro',
      description: 'Premium iPhone with titanium design and professional camera system.',
      descriptionAr: 'آيفون متميز بتصميم التيتانيوم ونظام كاميرا احترافي.',
      descriptionSo: 'iPhone heer sare ah oo leh naqshad titanium ah iyo nidaam kameradda xirfadeed.',
      price: 1199.99,
      categoryId: widget.category.id,
      images: ['placeholder'],
      rating: 4.9,
      reviewCount: 2100,
      inStock: true,
      stockQuantity: 30,
      brand: 'Apple',
      isFeatured: true,
    ),
    Product(
      id: '3',
      name: 'MacBook Air M3',
      nameAr: 'ماك بوك إير M3',
      nameSo: 'MacBook Air M3',
      description: 'Ultra-thin laptop with M3 chip for exceptional performance and battery life.',
      descriptionAr: 'لابتوب رفيع جداً مع شريحة M3 للأداء الاستثنائي وعمر البطارية.',
      descriptionSo: 'Laptop aad u dhuuban oo leh chip M3 waxqabad gaar ah iyo nolol baytari.',
      price: 1299.99,
      discountPrice: 1199.99,
      categoryId: widget.category.id,
      images: ['placeholder'],
      rating: 4.7,
      reviewCount: 890,
      inStock: true,
      stockQuantity: 25,
      brand: 'Apple',
    ),
    Product(
      id: '4',
      name: 'Sony WH-1000XM5',
      nameAr: 'سوني WH-1000XM5',
      nameSo: 'Sony WH-1000XM5',
      description: 'Premium noise-canceling headphones with industry-leading sound quality.',
      descriptionAr: 'سماعات رأس متميزة بإلغاء الضوضاء مع جودة صوت رائدة في الصناعة.',
      descriptionSo: 'Dhegaysiga madaxa heer sare ah oo joojiya buuqa oo leh tayada codka ugu fiican.',
      price: 399.99,
      discountPrice: 349.99,
      categoryId: widget.category.id,
      images: ['placeholder'],
      rating: 4.6,
      reviewCount: 1580,
      inStock: true,
      stockQuantity: 75,
      brand: 'Sony',
    ),
    Product(
      id: '5',
      name: 'Dell XPS 13',
      nameAr: 'ديل XPS 13',
      nameSo: 'Dell XPS 13',
      description: 'Compact premium laptop with stunning InfinityEdge display.',
      descriptionAr: 'لابتوب متميز مدمج مع شاشة InfinityEdge المذهلة.',
      descriptionSo: 'Laptop heer sare ah oo is-dhex-gal ah oo leh shaashadda InfinityEdge oo cajiib ah.',
      price: 999.99,
      categoryId: widget.category.id,
      images: ['placeholder'],
      rating: 4.5,
      reviewCount: 720,
      inStock: false,
      stockQuantity: 0,
      brand: 'Dell',
    ),
    Product(
      id: '6',
      name: 'iPad Pro 12.9"',
      nameAr: 'آيباد برو 12.9"',
      nameSo: 'iPad Pro 12.9"',
      description: 'Professional tablet with M2 chip and Liquid Retina XDR display.',
      descriptionAr: 'جهاز لوحي احترافي مع شريحة M2 وشاشة Liquid Retina XDR.',
      descriptionSo: 'Tablet xirfadeed ah oo leh chip M2 iyo shaashadda Liquid Retina XDR.',
      price: 1099.99,
      discountPrice: 999.99,
      categoryId: widget.category.id,
      images: ['placeholder'],
      rating: 4.8,
      reviewCount: 950,
      inStock: true,
      stockQuantity: 40,
      brand: 'Apple',
      isFeatured: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      backgroundColor: isDark ? AppColors.darkScaffoldBackground : AppColors.scaffoldBackground,
      appBar: _buildAppBar(isDark),
      body: Column(
        children: [
          // Category Page Advertisement Banner
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
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.68,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: _mockProducts.length,
      itemBuilder: (context, index) {
        final product = _mockProducts[index];
        return _buildProductCard(product, index, isDark);
      },
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
