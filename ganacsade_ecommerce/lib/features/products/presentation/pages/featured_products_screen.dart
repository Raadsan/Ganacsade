import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/network/products_api_service.dart';
import '../../../../core/network/api_config.dart';
import '../../../../shared/models/product.dart';
import '../../../home/presentation/widgets/featured_product_card.dart';
import 'product_detail_screen.dart';

class FeaturedProductsScreen extends StatefulWidget {
  const FeaturedProductsScreen({super.key});

  @override
  State<FeaturedProductsScreen> createState() => _FeaturedProductsScreenState();
}

class _FeaturedProductsScreenState extends State<FeaturedProductsScreen> {
  final ProductsApiService _productsApiService = ProductsApiService();
  List<Product> _products = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadFeaturedProducts();
  }

  Future<void> _loadFeaturedProducts() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _productsApiService.getFeaturedProducts(
        limit: 100,
      );
      final productsData = response['products'] as List;

      setState(() {
        _products = productsData.map((json) {
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

          // Update the json with processed images
          json['images'] = images;

          return Product.fromJson(json);
        }).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load featured products';
        _isLoading = false;
      });
    }
  }

  void _onProductTap(Product product) {
    HapticFeedback.lightImpact();
    Get.to(
      () => ProductDetailScreen(product: product),
      transition: Transition.rightToLeft,
      duration: const Duration(milliseconds: 300),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Featured Products'),
        centerTitle: true,
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(
                  AppColors.primaryGreen,
                ),
              ),
            )
          : _errorMessage != null
          ? _buildErrorState()
          : _buildProductsGrid(isDark),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 80, color: AppColors.grey400),
          const SizedBox(height: 16),
          Text(
            _errorMessage ?? 'Something went wrong',
            style: AppTextStyles.titleMedium.copyWith(color: AppColors.grey600),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _loadFeaturedProducts,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGreen,
              foregroundColor: AppColors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
            ),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildProductsGrid(bool isDark) {
    if (_products.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.shopping_bag_outlined,
              size: 80,
              color: AppColors.grey400,
            ),
            const SizedBox(height: 16),
            Text(
              'No featured products available',
              style: AppTextStyles.titleMedium.copyWith(
                color: AppColors.grey600,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadFeaturedProducts,
      color: AppColors.primaryGreen,
      child: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.63,
        ),
        itemCount: _products.length,
        itemBuilder: (context, index) {
          return FeaturedProductCard(
                product: _products[index],
                onTap: () => _onProductTap(_products[index]),
              )
              .animate()
              .fadeIn(
                duration: 400.ms,
                delay: Duration(milliseconds: 50 * index),
              )
              .scale(begin: const Offset(0.9, 0.9), end: const Offset(1, 1));
        },
      ),
    );
  }
}
