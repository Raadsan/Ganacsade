import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/network/api_config.dart';
import '../../../../core/network/categories_api_service.dart';
import '../../../../shared/models/category.dart';
import '../../../../shared/widgets/advertisement_banner.dart';
import 'subcategory_products_screen.dart';

/// Dynamic Subcategories Screen - Shows subcategories grid, tap to see products
class DynamicSubcategoriesScreen extends StatefulWidget {
  final Category category;

  const DynamicSubcategoriesScreen({
    super.key,
    required this.category,
  });

  @override
  State<DynamicSubcategoriesScreen> createState() => _DynamicSubcategoriesScreenState();
}

class _DynamicSubcategoriesScreenState extends State<DynamicSubcategoriesScreen> {
  final CategoriesApiService _categoriesApi = CategoriesApiService();
  
  List<Subcategory> _subcategories = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadSubcategories();
  }

  Future<void> _loadSubcategories() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await _categoriesApi.getCategoryById(widget.category.id);
      if (!mounted) return;

      final categoryData = response['category'];
      
      if (categoryData == null) {
        throw Exception('Category not found');
      }
      
      final subcategoriesData = categoryData['subcategories'] as List? ?? [];
      final subcategories = subcategoriesData.map((json) => Subcategory.fromJson(json)).toList();
      
      if (!mounted) return;
      setState(() {
        _subcategories = subcategories;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading subcategories: $e');
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = 'Failed to load subcategories';
      });
    }
  }

  void _onSubcategoryTap(Subcategory subcategory) {
    HapticFeedback.lightImpact();
    Get.to(() => SubcategoryProductsScreen(
      subcategoryId: subcategory.id,
      subcategoryName: subcategory.nameEn,
      categoryColor: widget.category.color,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      backgroundColor: isDark ? AppColors.darkScaffoldBackground : AppColors.grey50,
      appBar: AppBar(
        title: Text(widget.category.nameEn),
        backgroundColor: isDark ? AppColors.darkScaffoldBackground : widget.category.color,
        foregroundColor: isDark ? AppColors.darkTextPrimary : AppColors.white,
        elevation: 0,
        leading: IconButton(
          onPressed: () {
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            }
          },
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
            onPressed: _loadSubcategories,
            style: ElevatedButton.styleFrom(
              backgroundColor: widget.category.color,
            ),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(bool isDark) {
    if (_subcategories.isEmpty) {
      return _buildEmptyState(isDark);
    }

    return Column(
      children: [
        // Category Header
        _buildCategoryHeader(isDark),
        
        // Advertisement Banner
        const AdvertisementBanner(
          placement: 'category_page',
          height: 100,
          margin: EdgeInsets.fromLTRB(16, 8, 16, 0),
          showTitle: false,
        ),
        
        // Section Title
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Row(
            children: [
              Text(
                'Choose a Subcategory',
                style: AppTextStyles.titleMedium.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
        
        // Subcategories Grid
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 1.2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: _subcategories.length,
            itemBuilder: (context, index) {
              return _buildSubcategoryCard(_subcategories[index], index, isDark);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryHeader(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDark
              ? [AppColors.darkCardBackground, AppColors.darkElevatedSurface]
              : [widget.category.color, widget.category.color.withValues(alpha: 0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: isDark ? AppColors.primaryGreen.withValues(alpha: 0.2) : AppColors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              _getCategoryIcon(widget.category.type),
              size: 28,
              color: isDark ? AppColors.primaryGreen : AppColors.white,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.category.nameEn,
                  style: AppTextStyles.titleLarge.copyWith(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${_subcategories.length} subcategories available',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.white.withValues(alpha: 0.9),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms);
  }

  Widget _buildSubcategoryCard(Subcategory subcategory, int index, bool isDark) {
    return GestureDetector(
      onTap: () => _onSubcategoryTap(subcategory),
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCardBackground : AppColors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black26 : AppColors.shadowLight,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Image or Icon Container
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: widget.category.color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: _buildSubcategoryImage(subcategory),
              ),
            ),
            const SizedBox(height: 12),
            
            // Subcategory Name
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Text(
                subcategory.nameEn,
                style: AppTextStyles.titleSmall.copyWith(
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(height: 4),
            
            // Product Count Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: widget.category.color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '${subcategory.productCount} products',
                style: AppTextStyles.labelSmall.copyWith(
                  color: widget.category.color,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    ).animate()
        .fadeIn(delay: Duration(milliseconds: 100 * index), duration: 400.ms)
        .scale(begin: const Offset(0.9, 0.9), end: const Offset(1.0, 1.0));
  }

  Widget _buildSubcategoryImage(Subcategory subcategory) {
    // If subcategory has an image URL, show the image
    if (subcategory.imageUrl != null && subcategory.imageUrl!.isNotEmpty) {
      return CachedNetworkImage(
        imageUrl: subcategory.imageUrl!,
        fit: BoxFit.cover,
        width: 56,
        height: 56,
        placeholder: (context, url) => Center(
          child: SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: widget.category.color,
            ),
          ),
        ),
        errorWidget: (context, url, error) => Center(
          child: Icon(
            Icons.category,
            size: 28,
            color: widget.category.color,
          ),
        ),
      );
    }
    
    // Fallback to icon
    return Center(
      child: Icon(
        Icons.category,
        size: 28,
        color: widget.category.color,
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.category_outlined, size: 64, color: isDark ? AppColors.darkTextSecondary : AppColors.grey400),
          const SizedBox(height: 16),
          Text(
            'No subcategories available',
            style: AppTextStyles.bodyLarge.copyWith(color: isDark ? AppColors.darkTextPrimary : AppColors.grey600),
          ),
          const SizedBox(height: 8),
          Text(
            'Check back later',
            style: AppTextStyles.bodyMedium.copyWith(color: isDark ? AppColors.darkTextSecondary : AppColors.grey500),
          ),
        ],
      ),
    );
  }

  IconData _getCategoryIcon(CategoryType type) {
    switch (type) {
      case CategoryType.internet:
        return Icons.wifi;
      case CategoryType.gifts:
        return Icons.card_giftcard;
      case CategoryType.electronics:
        return Icons.devices;
      case CategoryType.mens:
        return Icons.man;
      case CategoryType.womens:
        return Icons.woman;
      case CategoryType.kids:
        return Icons.child_care;
      case CategoryType.cosmetics:
        return Icons.face_retouching_natural;
      case CategoryType.goods:
        return Icons.shopping_cart;
    }
  }
}

/// Subcategory model for API response
class Subcategory {
  final String id;
  final String nameEn;
  final String nameSo;
  final String nameAr;
  final int productCount;
  final String? imageUrl;

  Subcategory({
    required this.id,
    required this.nameEn,
    required this.nameSo,
    required this.nameAr,
    required this.productCount,
    this.imageUrl,
  });

  factory Subcategory.fromJson(Map<String, dynamic> json) {
    int productCount = 0;
    if (json['product_count'] != null) {
      final pc = json['product_count'];
      if (pc is String) {
        productCount = int.tryParse(pc) ?? 0;
      } else if (pc is int) {
        productCount = pc;
      } else if (pc is num) {
        productCount = pc.toInt();
      }
    }
    
    // Parse image URL and prepend base URL if needed
    String? imageUrl;
    if (json['image_url'] != null && json['image_url'].toString().isNotEmpty) {
      final imgUrl = json['image_url'].toString();
      if (imgUrl.startsWith('/uploads')) {
        imageUrl = '${ApiConfig.getServerUrl()}$imgUrl';
      } else {
        imageUrl = imgUrl;
      }
    }
    
    return Subcategory(
      id: json['id']?.toString() ?? '',
      nameEn: json['name_en']?.toString() ?? '',
      nameSo: json['name_so']?.toString() ?? '',
      nameAr: json['name_ar']?.toString() ?? '',
      productCount: productCount,
      imageUrl: imageUrl,
    );
  }
}
