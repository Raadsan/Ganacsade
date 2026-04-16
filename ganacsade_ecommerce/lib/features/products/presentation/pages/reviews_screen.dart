import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/models/product.dart';
import '../../../../core/network/reviews_api_service.dart';

class ReviewsScreen extends StatefulWidget {
  final Product product;

  const ReviewsScreen({
    super.key,
    required this.product,
  });

  @override
  State<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends State<ReviewsScreen> {
  final ReviewsApiService _reviewsApiService = ReviewsApiService();
  List<Review> _reviews = [];
  bool _isLoading = true;
  int _selectedRatingFilter = 0; // 0 = All, 1-5 = specific rating
  Map<String, dynamic>? _ratingDistribution;

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    try {
      setState(() => _isLoading = true);
      
      final response = await _reviewsApiService.getProductReviews(
        productId: widget.product.id,
        limit: 100, // Load all reviews
      );
      
      if (mounted) {
        final reviewsData = response['reviews'] as List? ?? [];
        final ratingDist = response['ratingDistribution'] as List? ?? [];
        
        setState(() {
          _reviews = reviewsData.map((json) => Review(
            id: json['id']?.toString() ?? '',
            userName: '${json['first_name'] ?? ''} ${json['last_name'] ?? ''}'.trim(),
            userInitials: json['initials'] ?? 'U',
            rating: json['rating'] ?? 0,
            comment: json['comment'] ?? '',
            date: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
            isVerifiedPurchase: json['is_verified_purchase'] ?? false,
            helpfulCount: json['helpful_count'] ?? 0,
          )).toList();
          
          // Convert rating distribution to map
          _ratingDistribution = {};
          for (var item in ratingDist) {
            _ratingDistribution![item['rating'].toString()] = int.parse(item['count'].toString());
          }
          
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error loading reviews: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  List<Review> get _filteredReviews {
    if (_selectedRatingFilter == 0) return _reviews;
    return _reviews.where((review) => review.rating == _selectedRatingFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Reviews (${_reviews.length})'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Get.back(),
          icon: const Icon(Icons.arrow_back),
        ),
        actions: [
          IconButton(
            onPressed: _showWriteReviewDialog,
            icon: const Icon(Icons.edit),
            tooltip: 'Write Review',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                _buildRatingsSummary(),
                _buildRatingFilters(),
                Expanded(
                  child: _buildReviewsList(),
                ),
              ],
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showWriteReviewDialog,
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        icon: const Icon(Icons.edit),
        label: const Text('Write Review'),
      ),
    );
  }

  Widget _buildRatingsSummary() {
    final averageRating = _reviews.isEmpty 
        ? 0.0 
        : _reviews.map((r) => r.rating).reduce((a, b) => a + b) / _reviews.length;
    
    return Container(
      padding: const EdgeInsets.all(20),
      color: AppColors.primaryGreen.withOpacity(0.1),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                averageRating.toStringAsFixed(1),
                style: AppTextStyles.headlineLarge.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryGreen,
                ),
              ),
              Row(
                children: List.generate(5, (index) {
                  return Icon(
                    Icons.star,
                    size: 20,
                    color: index < averageRating.floor() 
                        ? AppColors.warning 
                        : AppColors.grey300,
                  );
                }),
              ),
              const SizedBox(height: 4),
              Text(
                '${_reviews.length} reviews',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.grey600,
                ),
              ),
            ],
          ),
          const SizedBox(width: 24),
          Expanded(
            child: Column(
              children: List.generate(5, (index) {
                final rating = 5 - index;
                final count = _ratingDistribution?[rating.toString()] ?? 0;
                final percentage = _reviews.isEmpty ? 0.0 : count / _reviews.length;
                
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: Row(
                    children: [
                      Text(
                        '$rating',
                        style: AppTextStyles.labelSmall,
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        Icons.star,
                        size: 12,
                        color: AppColors.warning,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: LinearProgressIndicator(
                          value: percentage,
                          backgroundColor: AppColors.grey200,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            AppColors.primaryGreen,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '$count',
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.grey600,
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 600.ms)
        .slideY(begin: -0.3, end: 0);
  }

  Widget _buildRatingFilters() {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _buildFilterChip('All', 0),
          const SizedBox(width: 8),
          ...List.generate(5, (index) {
            final rating = 5 - index;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: _buildFilterChip('$rating ⭐', rating),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, int rating) {
    final isSelected = _selectedRatingFilter == rating;
    
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _selectedRatingFilter = rating;
        });
      },
      selectedColor: AppColors.primaryGreen.withOpacity(0.2),
      checkmarkColor: AppColors.primaryGreen,
      labelStyle: AppTextStyles.labelMedium.copyWith(
        color: isSelected ? AppColors.primaryGreen : AppColors.grey700,
        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
      ),
    );
  }

  Widget _buildReviewsList() {
    final filteredReviews = _filteredReviews;
    
    if (filteredReviews.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.rate_review_outlined,
              size: 64,
              color: AppColors.grey400,
            ),
            const SizedBox(height: 16),
            Text(
              'No reviews found',
              style: AppTextStyles.titleMedium.copyWith(
                color: AppColors.grey600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Be the first to write a review!',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.grey500,
              ),
            ),
          ],
        ),
      );
    }
    
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: filteredReviews.length,
      itemBuilder: (context, index) {
        final review = filteredReviews[index];
        return _buildReviewCard(review, index);
      },
    );
  }

  Widget _buildReviewCard(Review review, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
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
                  review.userInitials,
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
                          review.userName,
                          style: AppTextStyles.titleSmall.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        if (review.isVerifiedPurchase) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primaryGreen.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'Verified',
                              style: AppTextStyles.labelSmall.copyWith(
                                color: AppColors.primaryGreen,
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        ...List.generate(5, (starIndex) {
                          return Icon(
                            Icons.star,
                            size: 14,
                            color: starIndex < review.rating
                                ? AppColors.warning
                                : AppColors.grey300,
                          );
                        }),
                        const SizedBox(width: 8),
                        Text(
                          _formatDate(review.date),
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.grey600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                onSelected: (value) => _handleReviewAction(value, review),
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'helpful',
                    child: Row(
                      children: [
                        Icon(Icons.thumb_up_outlined, size: 16),
                        SizedBox(width: 8),
                        Text('Helpful'),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'report',
                    child: Row(
                      children: [
                        Icon(Icons.flag_outlined, size: 16),
                        SizedBox(width: 8),
                        Text('Report'),
                      ],
                    ),
                  ),
                ],
                child: Icon(
                  Icons.more_vert,
                  color: AppColors.grey500,
                  size: 20,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            review.comment,
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.grey700,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              TextButton.icon(
                onPressed: () => _toggleHelpful(review),
                icon: Icon(
                  Icons.thumb_up_outlined,
                  size: 16,
                  color: AppColors.grey600,
                ),
                label: Text(
                  'Helpful (${review.helpfulCount})',
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.grey600,
                  ),
                ),
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ),
              const SizedBox(width: 16),
              TextButton.icon(
                onPressed: () => _replyToReview(review),
                icon: Icon(
                  Icons.reply_outlined,
                  size: 16,
                  color: AppColors.grey600,
                ),
                label: Text(
                  'Reply',
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.grey600,
                  ),
                ),
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ),
            ],
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 600.ms, delay: Duration(milliseconds: 100 * index))
        .slideX(begin: 0.3, end: 0);
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays == 0) {
      return 'Today';
    } else if (difference.inDays == 1) {
      return '1 day ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return weeks == 1 ? '1 week ago' : '$weeks weeks ago';
    } else {
      final months = (difference.inDays / 30).floor();
      return months == 1 ? '1 month ago' : '$months months ago';
    }
  }

  void _handleReviewAction(String action, Review review) {
    switch (action) {
      case 'helpful':
        _toggleHelpful(review);
        break;
      case 'report':
        _reportReview(review);
        break;
    }
  }

  void _toggleHelpful(Review review) {
    HapticFeedback.lightImpact();
    setState(() {
      review.helpfulCount++;
    });
    
    Get.snackbar(
      'Thank you!',
      'Your feedback helps other customers',
      backgroundColor: AppColors.primaryGreen.withOpacity(0.8),
      colorText: AppColors.white,
      duration: const Duration(seconds: 2),
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  void _replyToReview(Review review) {
    // Show reply dialog or navigate to reply screen
    Get.snackbar(
      'Reply Feature',
      'Reply functionality coming soon!',
      backgroundColor: AppColors.primaryGreen.withOpacity(0.8),
      colorText: AppColors.white,
      duration: const Duration(seconds: 2),
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  void _reportReview(Review review) {
    Get.dialog(
      AlertDialog(
        title: const Text('Report Review'),
        content: const Text('Are you sure you want to report this review?'),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Get.back();
              Get.snackbar(
                'Reported',
                'Review has been reported for moderation',
                backgroundColor: AppColors.error.withOpacity(0.8),
                colorText: AppColors.white,
                duration: const Duration(seconds: 2),
                snackPosition: SnackPosition.BOTTOM,
              );
            },
            child: const Text('Report'),
          ),
        ],
      ),
    );
  }

  void _showWriteReviewDialog() {
    int selectedRating = 5;
    final titleController = TextEditingController();
    final commentController = TextEditingController();
    bool isSubmitting = false;

    Get.dialog(
      StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            title: const Text('Write a Review'),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Rate this product',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            selectedRating = index + 1;
                          });
                        },
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: Icon(
                            Icons.star,
                            size: 40,
                            color: index < selectedRating
                                ? AppColors.warning
                                : AppColors.grey300,
                          ),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: titleController,
                    decoration: const InputDecoration(
                      labelText: 'Review Title (Optional)',
                      border: OutlineInputBorder(),
                      hintText: 'Summarize your experience',
                    ),
                    maxLength: 100,
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: commentController,
                    decoration: const InputDecoration(
                      labelText: 'Your Review',
                      border: OutlineInputBorder(),
                      hintText: 'Share your thoughts about this product',
                    ),
                    maxLines: 5,
                    maxLength: 500,
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: isSubmitting ? null : () => Get.back(),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: isSubmitting
                    ? null
                    : () async {
                        if (commentController.text.trim().isEmpty) {
                          Get.snackbar(
                            'Required',
                            'Please write a review comment',
                            backgroundColor: AppColors.error.withOpacity(0.8),
                            colorText: AppColors.white,
                            snackPosition: SnackPosition.BOTTOM,
                          );
                          return;
                        }

                        setState(() {
                          isSubmitting = true;
                        });

                        try {
                          await _reviewsApiService.createReview(
                            productId: widget.product.id,
                            rating: selectedRating,
                            title: titleController.text.trim().isEmpty
                                ? null
                                : titleController.text.trim(),
                            comment: commentController.text.trim(),
                          );

                          Get.back();
                          
                          Get.snackbar(
                            'Success',
                            'Your review has been submitted and is pending approval',
                            backgroundColor: AppColors.primaryGreen.withOpacity(0.8),
                            colorText: AppColors.white,
                            duration: const Duration(seconds: 3),
                            snackPosition: SnackPosition.BOTTOM,
                          );

                          // Reload reviews
                          _loadReviews();
                        } catch (e) {
                          setState(() {
                            isSubmitting = false;
                          });
                          
                          Get.snackbar(
                            'Error',
                            e.toString().replaceAll('Exception: ', ''),
                            backgroundColor: AppColors.error.withOpacity(0.8),
                            colorText: AppColors.white,
                            duration: const Duration(seconds: 3),
                            snackPosition: SnackPosition.BOTTOM,
                          );
                        }
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: AppColors.white,
                ),
                child: isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text('Submit Review'),
              ),
            ],
          );
        },
      ),
    );
  }
}

class Review {
  final String id;
  final String userName;
  final String userInitials;
  final int rating;
  final String comment;
  final DateTime date;
  final bool isVerifiedPurchase;
  int helpfulCount;

  Review({
    required this.id,
    required this.userName,
    required this.userInitials,
    required this.rating,
    required this.comment,
    required this.date,
    required this.isVerifiedPurchase,
    this.helpfulCount = 0,
  });
}
