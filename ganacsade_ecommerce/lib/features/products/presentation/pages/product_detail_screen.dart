import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/network/api_config.dart';
import '../../../../shared/models/product.dart';
import '../../../../shared/widgets/advertisement_banner.dart';
import '../../../cart/presentation/controllers/cart_controller.dart';
import '../../../cart/presentation/pages/cart_screen.dart';
import '../../../../core/network/reviews_api_service.dart';
import '../../../../core/network/products_api_service.dart';
import '../../../wishlist/presentation/controllers/wishlist_controller.dart';
import 'reviews_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen>
    with TickerProviderStateMixin {
  final PageController _pageController = PageController();
  final CartController _cartController = Get.find<CartController>();
  final WishlistController _wishlistController = Get.put(WishlistController());
  final ReviewsApiService _reviewsApiService = ReviewsApiService();

  int _currentImageIndex = 0;
  int _selectedQuantity = 1;
  List<Map<String, dynamic>> _reviews = [];
  bool _isLoadingReviews = true;
  List<Product> _relatedProducts = [];
  bool _isLoadingRelatedProducts = true;

  @override
  void initState() {
    super.initState();
    _loadReviews();
    _loadRelatedProducts();

    // 🔍 DEBUG: Print product image URLs
    print('============================================');
    print('🖼️  PRODUCT: ${widget.product.name}');
    print('🆔  ID: ${widget.product.id}');
    print('📦  Images count: ${widget.product.images.length}');
    for (int i = 0; i < widget.product.images.length; i++) {
      print('   [$i] ${widget.product.images[i]}');
    }
    if (widget.product.images.isEmpty) {
      print('   ⚠️  NO IMAGES — will show placeholder');
    }
    print('============================================');
  }

  Future<void> _loadReviews() async {
    try {
      setState(() => _isLoadingReviews = true);
      final response = await _reviewsApiService.getProductReviews(
        productId: widget.product.id,
        limit: 2, // Only load 2 reviews for preview
      );

      if (mounted) {
        setState(() {
          _reviews =
              (response['reviews'] as List?)?.cast<Map<String, dynamic>>() ??
              [];
          _isLoadingReviews = false;
        });
      }
    } catch (e) {
      print('Error loading reviews: $e');
      if (mounted) {
        setState(() => _isLoadingReviews = false);
      }
    }
  }

  Future<void> _loadRelatedProducts() async {
    try {
      setState(() => _isLoadingRelatedProducts = true);

      final ProductsApiService productsApiService = ProductsApiService();
      final response = await productsApiService.getProducts(
        category: widget.product.categoryId,
        limit: 6,
        sortBy: 'created_at',
        sortOrder: 'DESC',
      );

      if (mounted) {
        final productsData = response['products'] as List? ?? [];
        setState(() {
          _relatedProducts = productsData
              .where(
                (json) => json['id'] != widget.product.id,
              ) // Exclude current product
              .take(6)
              .map((json) => Product.fromJson(json))
              .toList();
          _isLoadingRelatedProducts = false;
        });
      }
    } catch (e) {
      print('Error loading related products: $e');
      if (mounted) {
        setState(() => _isLoadingRelatedProducts = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark
          ? AppColors.darkScaffoldBackground
          : AppColors.scaffoldBackground,
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(isDark),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildProductInfo(isDark),
                _buildQuantitySelector(isDark),
                _buildActionButtons(isDark),
                // Product Page Advertisement Banner
                const AdvertisementBanner(
                  placement: 'product_page',
                  height: 80,
                  margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  showTitle: false,
                ),
                _buildProductDescription(isDark),
                _buildReviewsSection(isDark),
                _buildRelatedProducts(isDark),
                const SizedBox(height: 100), // Space for bottom bar
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomActionBar(isDark),
    );
  }

  Widget _buildSliverAppBar(bool isDark) {
    return SliverAppBar(
      expandedHeight: 400,
      pinned: true,
      backgroundColor: isDark
          ? AppColors.darkScaffoldBackground
          : AppColors.white,
      leading: IconButton(
        onPressed: () => Get.back(),

        icon: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.white.withOpacity(0.9),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(Icons.arrow_back, color: AppColors.primaryGreen),
        ),
      ),
      actions: [
        Obx(
          () => IconButton(
            onPressed: () async {
              await _wishlistController.toggleWishlist(widget.product);
              final isInWishlist = _wishlistController.isInWishlist(
                widget.product.id,
              );
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    isInWishlist
                        ? '${widget.product.name} added to wishlist'
                        : '${widget.product.name} removed from wishlist',
                  ),
                  backgroundColor: isInWishlist
                      ? AppColors.primaryGreen
                      : AppColors.error,
                  behavior: SnackBarBehavior.floating,
                  duration: const Duration(seconds: 2),
                ),
              );
            },
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.white.withOpacity(0.9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _wishlistController.isInWishlist(widget.product.id)
                    ? Icons.favorite
                    : Icons.favorite_border,
                color: _wishlistController.isInWishlist(widget.product.id)
                    ? AppColors.error
                    : AppColors.grey600,
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
      ],
      flexibleSpace: FlexibleSpaceBar(background: _buildImageGallery()),
    );
  }

  Widget _buildImageGallery() {
    // Use all images from the product, or show placeholder if empty
    final images = widget.product.images.isNotEmpty
        ? widget.product.images
        : ['placeholder'];

    return Stack(
      children: [
        PageView.builder(
          controller: _pageController,
          onPageChanged: (index) {
            setState(() {
              _currentImageIndex = index;
            });
          },
          itemCount: images.length,
          itemBuilder: (context, index) {
            return _buildProductImage(images[index]);
          },
        ),
        Positioned(
          bottom: 20,
          left: 0,
          right: 0,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: images.asMap().entries.map((entry) {
              return Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _currentImageIndex == entry.key
                      ? AppColors.white
                      : AppColors.white.withOpacity(0.5),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildProductInfo(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    widget.product.category,
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.primaryGreen,
                      fontWeight: FontWeight.w600,
                    ),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.star, color: AppColors.warning, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    '${widget.product.rating}',
                    style: AppTextStyles.labelMedium.copyWith(
                      fontWeight: FontWeight.w600,
                      color: isDark
                          ? AppColors.darkTextPrimary
                          : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '(${widget.product.reviewCount} reviews)',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: isDark
                          ? AppColors.darkTextSecondary
                          : AppColors.grey600,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            widget.product.name,
            style: AppTextStyles.headlineMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                '\$${widget.product.finalPrice.toStringAsFixed(2)}',
                style: AppTextStyles.headlineSmall.copyWith(
                  color: AppColors.primaryGreen,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (widget.product.hasDiscount) ...[
                const SizedBox(width: 8),
                Text(
                  '\$${widget.product.price.toStringAsFixed(2)}',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: isDark
                        ? AppColors.darkTextSecondary
                        : AppColors.grey600,
                    decoration: TextDecoration.lineThrough,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.error,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '${widget.product.discountPercentage.round()}% OFF',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.3, end: 0);
  }

  Widget _buildQuantitySelector(bool isDark) {
    return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Quantity',
                style: AppTextStyles.titleMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  color: isDark
                      ? AppColors.darkTextPrimary
                      : AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _buildQuantityButton(
                    icon: Icons.remove,
                    onTap: () {
                      if (_selectedQuantity > 1) {
                        setState(() {
                          _selectedQuantity--;
                        });
                      }
                    },
                  ),
                  Container(
                    width: 60,
                    height: 40,
                    margin: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: isDark
                            ? AppColors.darkBorderLight
                            : AppColors.grey300,
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(
                        '$_selectedQuantity',
                        style: AppTextStyles.titleMedium.copyWith(
                          fontWeight: FontWeight.w600,
                          color: isDark
                              ? AppColors.darkTextPrimary
                              : AppColors.textPrimary,
                        ),
                      ),
                    ),
                  ),
                  _buildQuantityButton(
                    icon: Icons.add,
                    onTap: () {
                      setState(() {
                        _selectedQuantity++;
                      });
                    },
                  ),
                ],
              ),
            ],
          ),
        )
        .animate()
        .fadeIn(delay: 200.ms, duration: 600.ms)
        .slideX(begin: -0.3, end: 0);
  }

  Widget _buildQuantityButton({
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: AppColors.primaryGreen,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: AppColors.white, size: 20),
      ),
    );
  }

  Widget _buildActionButtons(bool isDark) {
    return Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Expanded(
                child: Obx(
                  () => OutlinedButton.icon(
                    onPressed: () async {
                      await _wishlistController.toggleWishlist(widget.product);
                      final isInWishlist = _wishlistController.isInWishlist(
                        widget.product.id,
                      );
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            isInWishlist
                                ? '${widget.product.name} added to wishlist'
                                : '${widget.product.name} removed from wishlist',
                          ),
                          backgroundColor: isInWishlist
                              ? AppColors.primaryGreen
                              : AppColors.error,
                          behavior: SnackBarBehavior.floating,
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    },
                    icon: Icon(
                      _wishlistController.isInWishlist(widget.product.id)
                          ? Icons.favorite
                          : Icons.favorite_border,
                    ),
                    label: const Text('Wishlist'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor:
                          _wishlistController.isInWishlist(widget.product.id)
                          ? AppColors.error
                          : AppColors.primaryGreen,
                      side: BorderSide(
                        color:
                            _wishlistController.isInWishlist(widget.product.id)
                            ? AppColors.error
                            : AppColors.primaryGreen,
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: ElevatedButton.icon(
                  onPressed: () {
                    _cartController.addToCart(
                      widget.product,
                      _selectedQuantity,
                    );
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('${widget.product.name} added to cart'),
                        backgroundColor: AppColors.primaryGreen,
                        behavior: SnackBarBehavior.floating,
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                  icon: const Icon(Icons.shopping_cart),
                  label: const Text('Add to Cart'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                    foregroundColor: AppColors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],
          ),
        )
        .animate()
        .fadeIn(delay: 400.ms, duration: 600.ms)
        .slideY(begin: 0.3, end: 0);
  }

  Widget _buildProductDescription(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Description',
            style: AppTextStyles.titleLarge.copyWith(
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            widget.product.description,
            style: AppTextStyles.bodyLarge.copyWith(
              color: isDark ? AppColors.darkTextSecondary : AppColors.grey700,
              height: 1.6,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 600.ms, duration: 600.ms);
  }

  Widget _buildReviewsSection(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Reviews (${widget.product.reviewCount})',
                style: AppTextStyles.titleLarge.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isDark
                      ? AppColors.darkTextPrimary
                      : AppColors.textPrimary,
                ),
              ),
              TextButton(
                onPressed: () {
                  Get.to(() => ReviewsScreen(product: widget.product));
                },
                child: Text(
                  'See All',
                  style: TextStyle(
                    color: AppColors.primaryGreen,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Show loading or reviews from database
          if (_isLoadingReviews)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(20.0),
                child: CircularProgressIndicator(),
              ),
            )
          else if (_reviews.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    Icon(
                      Icons.rate_review_outlined,
                      size: 48,
                      color: isDark
                          ? AppColors.darkTextSecondary
                          : AppColors.grey400,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'No reviews yet',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: isDark
                            ? AppColors.darkTextPrimary
                            : AppColors.grey600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Be the first to review this product',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: isDark
                            ? AppColors.darkTextSecondary
                            : AppColors.grey500,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () {
                        Get.to(() => ReviewsScreen(product: widget.product));
                      },
                      icon: const Icon(Icons.edit),
                      label: const Text('Write a Review'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            ..._reviews.asMap().entries.map((entry) {
              final index = entry.key;
              final review = entry.value;
              return Padding(
                padding: EdgeInsets.only(
                  bottom: index < _reviews.length - 1 ? 12 : 0,
                ),
                child: _buildReviewItem(
                  userName:
                      '${review['first_name'] ?? ''} ${review['last_name'] ?? ''}'
                          .trim(),
                  userInitials: review['initials'] ?? 'U',
                  rating: review['rating'] ?? 0,
                  comment: review['comment'] ?? '',
                  timeAgo: _formatTimeAgo(review['created_at']),
                  isVerified: review['is_verified_purchase'] ?? false,
                  helpfulCount: review['helpful_count'] ?? 0,
                  isDark: isDark,
                ),
              );
            }),
        ],
      ),
    ).animate().fadeIn(delay: 800.ms, duration: 600.ms);
  }

  String _formatTimeAgo(dynamic createdAt) {
    if (createdAt == null) return 'Recently';

    try {
      final DateTime reviewDate = DateTime.parse(createdAt.toString());
      final Duration difference = DateTime.now().difference(reviewDate);

      if (difference.inDays > 365) {
        return '${(difference.inDays / 365).floor()} year${(difference.inDays / 365).floor() > 1 ? 's' : ''} ago';
      } else if (difference.inDays > 30) {
        return '${(difference.inDays / 30).floor()} month${(difference.inDays / 30).floor() > 1 ? 's' : ''} ago';
      } else if (difference.inDays > 0) {
        return '${difference.inDays} day${difference.inDays > 1 ? 's' : ''} ago';
      } else if (difference.inHours > 0) {
        return '${difference.inHours} hour${difference.inHours > 1 ? 's' : ''} ago';
      } else if (difference.inMinutes > 0) {
        return '${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''} ago';
      } else {
        return 'Just now';
      }
    } catch (e) {
      return 'Recently';
    }
  }

  Widget _buildReviewItem({
    String userName = 'John Doe',
    String userInitials = 'JD',
    int rating = 4,
    String comment =
        'Great product! Exactly as described and arrived quickly. Would definitely recommend to others.',
    String timeAgo = '2 days ago',
    bool isVerified = true,
    int helpfulCount = 0,
    bool isDark = false,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          HapticFeedback.lightImpact();
          Get.to(() => ReviewsScreen(product: widget.product));
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCardBackground : AppColors.grey50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isDark ? AppColors.darkBorderLight : AppColors.grey200,
              width: 1,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: AppColors.primaryGreen,
                    child: Text(
                      userInitials,
                      style: AppTextStyles.labelMedium.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              userName,
                              style: AppTextStyles.titleSmall.copyWith(
                                fontWeight: FontWeight.w600,
                                color: isDark
                                    ? AppColors.darkTextPrimary
                                    : AppColors.textPrimary,
                              ),
                            ),
                            if (isVerified) ...[
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 4,
                                  vertical: 1,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryGreen.withOpacity(
                                    0.1,
                                  ),
                                  borderRadius: BorderRadius.circular(3),
                                ),
                                child: Text(
                                  'Verified',
                                  style: AppTextStyles.labelSmall.copyWith(
                                    color: AppColors.primaryGreen,
                                    fontSize: 9,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            ...List.generate(5, (index) {
                              return Icon(
                                Icons.star,
                                size: 14,
                                color: index < rating
                                    ? AppColors.warning
                                    : AppColors.grey300,
                              );
                            }),
                            const SizedBox(width: 6),
                            Text(
                              timeAgo,
                              style: AppTextStyles.labelSmall.copyWith(
                                color: isDark
                                    ? AppColors.darkTextSecondary
                                    : AppColors.grey600,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.arrow_forward_ios,
                    size: 14,
                    color: isDark
                        ? AppColors.darkTextSecondary
                        : AppColors.grey400,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                comment,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: isDark
                      ? AppColors.darkTextSecondary
                      : AppColors.grey700,
                  height: 1.4,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.thumb_up_outlined,
                    size: 14,
                    color: isDark
                        ? AppColors.darkTextSecondary
                        : AppColors.grey500,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Helpful (12)',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: isDark
                          ? AppColors.darkTextSecondary
                          : AppColors.grey500,
                      fontSize: 11,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    'Tap to see all reviews',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.primaryGreen,
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRelatedProducts(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Related Products',
            style: AppTextStyles.titleLarge.copyWith(
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),

          // Show loading, empty state, or products
          if (_isLoadingRelatedProducts)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(40.0),
                child: CircularProgressIndicator(),
              ),
            )
          else if (_relatedProducts.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(40.0),
                child: Text(
                  'No related products found',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: isDark
                        ? AppColors.darkTextSecondary
                        : AppColors.grey600,
                  ),
                ),
              ),
            )
          else
            SizedBox(
              height: 220,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _relatedProducts.length,
                itemBuilder: (context, index) {
                  final product = _relatedProducts[index];
                  return _buildRelatedProductCard(product, isDark);
                },
              ),
            ),
        ],
      ),
    ).animate().fadeIn(delay: 1000.ms, duration: 600.ms);
  }

  Widget _buildBottomActionBar(bool isDark) {
    return Container(
      padding: const EdgeInsets.only(top: 20, bottom: 55, left: 20, right: 20),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardBackground : AppColors.white,
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black26 : AppColors.shadowLight,
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () {
                // Add to cart and navigate to checkout
                _cartController.addToCart(widget.product, _selectedQuantity);

                // Navigate to cart screen
                Get.to(() => const CartScreen());

                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${widget.product.name} added to cart'),
                    backgroundColor: AppColors.primaryGreen,
                    behavior: SnackBarBehavior.floating,
                    duration: const Duration(seconds: 2),
                  ),
                );
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primaryGreen,
                side: const BorderSide(color: AppColors.primaryGreen),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Buy Now'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton(
              onPressed: () {
                _cartController.addToCart(widget.product, _selectedQuantity);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${widget.product.name} added to cart'),
                    backgroundColor: AppColors.primaryGreen,
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                foregroundColor: AppColors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                'Add to Cart (\$${(widget.product.finalPrice * _selectedQuantity).toStringAsFixed(2)})',
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductImage(String imagePath) {
    // Check if it's a placeholder or invalid path
    if (imagePath == 'placeholder' || imagePath.isEmpty) {
      return _buildImagePlaceholder();
    }

    // Build full URL for backend images
    final imageUrl = imagePath.startsWith('http')
        ? imagePath
        : '${ApiConfig.getServerUrl()}$imagePath';

    return Image.network(
      imageUrl,
      width: double.infinity,
      height: double.infinity,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return _buildImagePlaceholder();
      },
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return Center(
          child: CircularProgressIndicator(
            value: loadingProgress.expectedTotalBytes != null
                ? loadingProgress.cumulativeBytesLoaded /
                      loadingProgress.expectedTotalBytes!
                : null,
            color: AppColors.primaryGreen,
          ),
        );
      },
    );
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
          const SizedBox(height: 6),
          Text(
            'GANACSADE',
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.primaryGreen,
              fontWeight: FontWeight.w600,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRelatedProductCard(Product product, bool isDark) {
    final hasDiscount = product.discountPrice < product.price;
    final isInStock = product.inStock;

    return Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: isInStock
                ? () {
                    // Add haptic feedback
                    HapticFeedback.lightImpact();

                    // Show loading feedback
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Opening ${product.name}...'),
                        backgroundColor: AppColors.primaryGreen,
                        behavior: SnackBarBehavior.floating,
                        duration: const Duration(milliseconds: 800),
                      ),
                    );

                    // Navigate after brief delay
                    Future.delayed(const Duration(milliseconds: 300), () {
                      Get.off(() => ProductDetailScreen(product: product));
                    });
                  }
                : () {
                    HapticFeedback.lightImpact();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          '${product.name} is currently unavailable',
                        ),
                        backgroundColor: AppColors.error,
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
            borderRadius: BorderRadius.circular(12),
            child: Container(
              width: 150,
              margin: const EdgeInsets.only(right: 12),
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.darkCardBackground
                    : (isInStock ? AppColors.white : AppColors.grey50),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: isDark ? Colors.black26 : AppColors.shadowLight,
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
                border: !isInStock
                    ? Border.all(color: AppColors.grey300, width: 1)
                    : null,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product Image
                  Stack(
                    children: [
                      Container(
                        height: 100,
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
                      if (hasDiscount)
                        Positioned(
                          top: 6,
                          right: 6,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 4,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.error,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '${(((product.price - product.discountPrice) / product.price) * 100).round()}%',
                              style: const TextStyle(
                                color: AppColors.white,
                                fontSize: 8,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),

                      // Out of Stock Badge
                      if (!isInStock)
                        Positioned(
                          top: 6,
                          left: 6,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 4,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.grey600,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'OUT OF STOCK',
                              style: TextStyle(
                                color: AppColors.white,
                                fontSize: 7,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),

                  // Product Details
                  Padding(
                    padding: const EdgeInsets.all(8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          product.name,
                          style: AppTextStyles.labelMedium.copyWith(
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? (isInStock
                                      ? AppColors.darkTextPrimary
                                      : AppColors.darkTextSecondary)
                                : (isInStock
                                      ? AppColors.grey900
                                      : AppColors.grey500),
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),

                        // Rating
                        Row(
                          children: [
                            Icon(
                              Icons.star,
                              size: 10,
                              color: AppColors.warning,
                            ),
                            const SizedBox(width: 2),
                            Text(
                              '${product.rating}',
                              style: AppTextStyles.labelSmall.copyWith(
                                fontSize: 9,
                                fontWeight: FontWeight.w600,
                                color: isDark
                                    ? AppColors.darkTextPrimary
                                    : AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(width: 2),
                            Text(
                              '(${product.reviewCount})',
                              style: AppTextStyles.labelSmall.copyWith(
                                color: isDark
                                    ? AppColors.darkTextSecondary
                                    : AppColors.grey600,
                                fontSize: 8,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 4),

                        // Price
                        if (hasDiscount)
                          Row(
                            children: [
                              Text(
                                '\$${product.discountPrice.toStringAsFixed(2)}',
                                style: AppTextStyles.labelMedium.copyWith(
                                  color: isInStock
                                      ? AppColors.primaryGreen
                                      : AppColors.grey500,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '\$${product.price.toStringAsFixed(2)}',
                                style: AppTextStyles.labelSmall.copyWith(
                                  color: AppColors.grey600,
                                  decoration: TextDecoration.lineThrough,
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          )
                        else
                          Text(
                            '\$${product.price.toStringAsFixed(2)}',
                            style: AppTextStyles.labelMedium.copyWith(
                              color: isInStock
                                  ? AppColors.primaryGreen
                                  : AppColors.grey500,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        )
        .animate()
        .fadeIn(
          duration: 600.ms,
          delay: Duration(milliseconds: 100 * (product.hashCode % 6)),
        )
        .slideX(begin: 0.3, end: 0);
  }
}
