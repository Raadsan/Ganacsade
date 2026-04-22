import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/models/category.dart';
import '../../../../shared/models/product.dart';
import 'product_detail_screen.dart';

class SubcategoryProductsScreen extends StatefulWidget {
  final CategoryType categoryType;
  final String subcategoryName;

  const SubcategoryProductsScreen({
    super.key,
    required this.categoryType,
    required this.subcategoryName,
  });

  @override
  State<SubcategoryProductsScreen> createState() => _SubcategoryProductsScreenState();
}

class _SubcategoryProductsScreenState extends State<SubcategoryProductsScreen> {
  String _selectedSort = 'Popular';
  String _selectedFilter = 'All';
  List<Product> _allProducts = [];
  
  final List<String> _sortOptions = ['Popular', 'Price: Low to High', 'Price: High to Low', 'Newest', 'Rating'];
  final List<String> _filterOptions = ['All', 'In Stock', 'On Sale', 'Free Shipping'];

  @override
  void initState() {
    super.initState();
    _allProducts = _generateSubcategoryProducts();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final products = _getFilteredAndSortedProducts();
    
    return Scaffold(
      backgroundColor: isDark ? AppColors.darkScaffoldBackground : AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(widget.subcategoryName),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: _showFilterBottomSheet,
            icon: const Icon(Icons.tune),
            tooltip: 'Filter & Sort',
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSubcategoryHeader(isDark),
          _buildSortAndFilterBar(isDark),
          Expanded(
            child: _buildProductsGrid(products, isDark),
          ),
        ],
      ),
    );
  }

  Widget _buildSubcategoryHeader(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDark 
            ? [AppColors.darkCardBackground, AppColors.darkElevatedSurface]
            : [AppColors.primaryGreen, AppColors.primaryGreen.withValues(alpha: 0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.subcategoryName,
            style: AppTextStyles.headlineMedium.copyWith(
              color: isDark ? AppColors.darkTextPrimary : AppColors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${_getFilteredAndSortedProducts().length} products available',
            style: AppTextStyles.bodyMedium.copyWith(
              color: isDark ? AppColors.darkTextSecondary : AppColors.white.withValues(alpha: 0.9),
            ),
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 600.ms)
        .slideY(begin: -0.3, end: 0);
  }

  Widget _buildSortAndFilterBar(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardBackground : AppColors.white,
        border: Border(
          bottom: BorderSide(
            color: AppColors.grey200,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Row(
              children: [
                Icon(
                  Icons.sort,
                  size: 16,
                  color: AppColors.grey600,
                ),
                const SizedBox(width: 4),
                Text(
                  'Sort: $_selectedSort',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.grey700,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: 1,
            height: 16,
            color: AppColors.grey300,
          ),
          const SizedBox(width: 12),
          Row(
            children: [
              Icon(
                Icons.filter_list,
                size: 16,
                color: AppColors.grey600,
              ),
              const SizedBox(width: 4),
              Text(
                'Filter: $_selectedFilter',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.grey700,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProductsGrid(List<Product> products, bool isDark) {
    if (products.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.inventory_2_outlined,
              size: 64,
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

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.63,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index];
        return _buildProductCard(product, index);
      },
    );
  }

  Widget _buildProductCard(Product product, int index) {
    final hasDiscount = product.discountPrice < product.price;
    final isInStock = product.inStock;
    
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: isInStock ? () {
          HapticFeedback.lightImpact();
          Get.to(() => ProductDetailScreen(product: product));
        } : () {
          HapticFeedback.lightImpact();
          Get.snackbar(
            'Out of Stock',
            '${product.name} is currently unavailable',
            backgroundColor: AppColors.error.withOpacity(0.8),
            colorText: AppColors.white,
            snackPosition: SnackPosition.BOTTOM,
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            color: isInStock ? AppColors.white : AppColors.grey50,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: AppColors.shadowLight,
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
            border: !isInStock ? Border.all(
              color: AppColors.grey300,
              width: 1,
            ) : null,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product Image
              Stack(
                children: [
                  Container(
                    height: 90,
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
                  
                  // Discount Badge
                  if (hasDiscount)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.error,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${(((product.price - product.discountPrice) / product.price) * 100).round()}% OFF',
                          style: TextStyle(
                            color: AppColors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  
                  // Out of Stock Badge
                  if (!isInStock)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.grey600,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'OUT OF STOCK',
                          style: TextStyle(
                            color: AppColors.white,
                            fontSize: 8,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              
              // Product Details
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(6),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product.name,
                        style: AppTextStyles.bodyMedium.copyWith(
                          fontWeight: FontWeight.w600,
                          fontSize: 11.5,
                          color: isInStock ? AppColors.grey900 : AppColors.grey500,
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
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '(${product.reviewCount})',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.grey600,
                              fontSize: 9,
                            ),
                          ),
                        ],
                      ),
                      
                      const Spacer(),
                      
                      // Price
                      if (hasDiscount)
                        Row(
                          children: [
                            Text(
                              '\$${product.discountPrice.toStringAsFixed(2)}',
                              style: AppTextStyles.titleSmall.copyWith(
                                color: isInStock ? AppColors.primaryGreen : AppColors.grey500,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              '\$${product.price.toStringAsFixed(2)}',
                              style: AppTextStyles.labelSmall.copyWith(
                                color: AppColors.grey600,
                                decoration: TextDecoration.lineThrough,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        )
                      else
                        Text(
                          '\$${product.price.toStringAsFixed(2)}',
                          style: AppTextStyles.titleSmall.copyWith(
                            color: isInStock ? AppColors.primaryGreen : AppColors.grey500,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    )
        .animate()
        .fadeIn(duration: 600.ms, delay: Duration(milliseconds: 100 * index))
        .slideY(begin: 0.3, end: 0);
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
            width: 50,
            height: 50,
            errorBuilder: (context, error, stackTrace) {
              return Icon(
                Icons.shopping_bag_outlined,
                size: 40,
                color: AppColors.grey400,
              );
            },
          ),
          const SizedBox(height: 6),
          Text(
            'GANACSADE',
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.primaryGreen,
              fontWeight: FontWeight.w600,
              fontSize: 9,
            ),
          ),
        ],
      ),
    );
  }

  List<Product> _generateSubcategoryProducts() {
    // Generate mock products for the subcategory
    return List.generate(12, (index) => Product(
      id: 'sub_${widget.categoryType.name}_${widget.subcategoryName}_$index',
      name: '${widget.subcategoryName} Product ${index + 1}',
      nameAr: 'منتج ${widget.subcategoryName} ${index + 1}',
      nameSo: 'Alaab ${widget.subcategoryName} ${index + 1}',
      description: 'High-quality ${widget.subcategoryName.toLowerCase()} product with excellent features and great value for money.',
      descriptionAr: 'منتج ${widget.subcategoryName} عالي الجودة مع ميزات ممتازة وقيمة رائعة مقابل المال.',
      descriptionSo: 'Alaab tayo sare leh oo ${widget.subcategoryName} ah oo leh sifooyiin fiican.',
      price: (25.0 + (index * 15) + (index % 5 * 10)).clamp(15.0, 300.0),
      discountPrice: index % 3 == 0 ? (20.0 + (index * 12) + (index % 4 * 8)).clamp(10.0, 250.0) : (25.0 + (index * 15) + (index % 5 * 10)).clamp(15.0, 300.0), // Some products without discount
      categoryId: widget.categoryType.name,
      images: [_getProductImageForSubcategory(index)],
      rating: (3.5 + (index % 3) + (index % 2 * 0.5)).clamp(3.0, 5.0),
      reviewCount: 25 + (index * 12) + (index % 7 * 15),
      inStock: index % 4 != 0, // Some products out of stock
      stockQuantity: 10 + (index * 3),
      brand: 'GANACSADE',
      sku: 'SUB-${widget.categoryType.name.toUpperCase()}-${index + 1}',
      tags: [widget.subcategoryName.toLowerCase(), widget.categoryType.name, 'quality'],
      isFeatured: index < 3,
      isHalal: true,
      createdAt: DateTime.now().subtract(Duration(days: index + 1)),
    ));
  }

  String _getProductImageForSubcategory(int index) {
    // Use specific images for each subcategory
    switch (widget.categoryType) {
      case CategoryType.gifts:
        if (widget.subcategoryName == 'Kids Gifts') {
          return 'assets/images/Gifts1.png';
        } else if (widget.subcategoryName == 'Gift Packages') {
          return 'assets/images/Gifts2.png';
        }
        break;
        
      case CategoryType.electronics:
        if (widget.subcategoryName == 'Laptops') {
          return 'assets/images/Electronics1.png';
        } else if (widget.subcategoryName == 'Phones') {
          return 'assets/images/Electronics2.png';
        }
        break;
        
      case CategoryType.mens:
        if (widget.subcategoryName == 'Men\'s Wear') {
          return 'assets/images/Men\'s-Market1.png';
        } else if (widget.subcategoryName == 'Formal Wear') {
          return 'assets/images/Men\'s-Market2.png';
        }
        break;
        
      case CategoryType.womens:
        if (widget.subcategoryName == 'Women\'s Wear') {
          return 'assets/images/Women\'s-Market1.png';
        } else if (widget.subcategoryName == 'Formal Wear') {
          return 'assets/images/Womwn\'s-Market2.png';
        }
        break;
        
      case CategoryType.kids:
        if (widget.subcategoryName == 'Kids Games') {
          return 'assets/images/Kids-Market1.png';
        } else if (widget.subcategoryName == 'Kids Toys') {
          return 'assets/images/Kids-Market2.png';
        }
        break;
        
      case CategoryType.goods:
        if (widget.subcategoryName == 'Household') {
          return 'assets/images/General-Goods1.png';
        } else if (widget.subcategoryName == 'Goods') {
          return 'assets/images/General-Goods2.png';
        }
        break;
        
      default:
        break;
    }
    
    // For other categories or unmatched subcategories, use placeholder
    return 'placeholder';
  }

  List<Product> _getFilteredAndSortedProducts() {
    List<Product> filteredProducts = List.from(_allProducts);
    
    // Apply filters
    switch (_selectedFilter) {
      case 'In Stock':
        filteredProducts = filteredProducts.where((product) => product.inStock).toList();
        break;
      case 'On Sale':
        filteredProducts = filteredProducts.where((product) => product.discountPrice < product.price).toList();
        break;
      case 'Free Shipping':
        // For demo purposes, assume products over $50 have free shipping
        filteredProducts = filteredProducts.where((product) => product.price >= 50.0).toList();
        break;
      case 'All':
      default:
        // No additional filtering
        break;
    }
    
    // Apply sorting
    switch (_selectedSort) {
      case 'Price: Low to High':
        filteredProducts.sort((a, b) => a.discountPrice.compareTo(b.discountPrice));
        break;
      case 'Price: High to Low':
        filteredProducts.sort((a, b) => b.discountPrice.compareTo(a.discountPrice));
        break;
      case 'Newest':
        filteredProducts.sort((a, b) => (b.createdAt ?? DateTime.now()).compareTo(a.createdAt ?? DateTime.now()));
        break;
      case 'Rating':
        filteredProducts.sort((a, b) => b.rating.compareTo(a.rating));
        break;
      case 'Popular':
      default:
        // Sort by review count for popularity
        filteredProducts.sort((a, b) => b.reviewCount.compareTo(a.reviewCount));
        break;
    }
    
    return filteredProducts;
  }

  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.6,
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Filter & Sort',
                    style: AppTextStyles.titleLarge.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Get.back(),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildFilterSection('Sort By', _sortOptions, _selectedSort, (value) {
                      setState(() {
                        _selectedSort = value;
                      });
                      Get.back();
                      // Show feedback
                      Get.snackbar(
                        'Sort Applied',
                        'Products sorted by $value',
                        backgroundColor: AppColors.primaryGreen.withOpacity(0.8),
                        colorText: AppColors.white,
                        duration: const Duration(seconds: 2),
                        snackPosition: SnackPosition.BOTTOM,
                      );
                    }),
                    const SizedBox(height: 24),
                    _buildFilterSection('Filter By', _filterOptions, _selectedFilter, (value) {
                      setState(() {
                        _selectedFilter = value;
                      });
                      Get.back();
                      // Show feedback
                      Get.snackbar(
                        'Filter Applied',
                        'Showing products: $value',
                        backgroundColor: AppColors.primaryGreen.withOpacity(0.8),
                        colorText: AppColors.white,
                        duration: const Duration(seconds: 2),
                        snackPosition: SnackPosition.BOTTOM,
                      );
                    }),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterSection(String title, List<String> options, String selected, Function(String) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTextStyles.titleMedium.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        ...options.map((option) => RadioListTile<String>(
          title: Text(option),
          value: option,
          groupValue: selected,
          onChanged: (value) => onChanged(value!),
          activeColor: AppColors.primaryGreen,
        )),
      ],
    );
  }
}
