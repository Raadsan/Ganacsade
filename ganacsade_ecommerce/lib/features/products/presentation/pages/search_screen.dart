import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import 'package:iconly/iconly.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/network/api_config.dart';
import '../../../../shared/models/product.dart';
import '../controllers/search_controller.dart' as search_ctrl;
import 'product_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key, this.isBottomSheet = false});

  final bool isBottomSheet;

  static Future<void> showBottomSheet(BuildContext context) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black54,
      builder: (ctx) {
        final height = MediaQuery.of(ctx).size.height * 0.92;
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
          ),
          child: Container(
            height: height,
            decoration: BoxDecoration(
              color: Theme.of(ctx).brightness == Brightness.dark
                  ? AppColors.darkScaffoldBackground
                  : AppColors.scaffoldBackground,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(28),
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryGreen.withOpacity(0.15),
                  blurRadius: 24,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            clipBehavior: Clip.antiAlias,
            child: const SearchScreen(isBottomSheet: true),
          ),
        );
      },
    );
  }

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _textController = TextEditingController();
  final _focusNode = FocusNode();
  late final search_ctrl.SearchController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = Get.find<search_ctrl.SearchController>();
    if (widget.isBottomSheet) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _focusNode.requestFocus();
      });
    }
  }

  @override
  void dispose() {
    _textController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _doSearch(String query) {
    if (query.trim().isEmpty) return;
    HapticFeedback.lightImpact();
    _focusNode.unfocus();
    _ctrl.search(query);
  }

  void _clearSearch() {
    _textController.clear();
    _ctrl.clearSearch();
    setState(() {});
  }

  void _resetFilters() {
    HapticFeedback.lightImpact();
    _textController.clear();
    _ctrl.clearSearch();
    _focusNode.unfocus();
    setState(() {});
  }

  Widget _buildResetFilterButton(bool isDark, {bool compact = false}) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: _resetFilters,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: compact ? 10 : 14,
            vertical: compact ? 6 : 8,
          ),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppColors.primaryGreen.withOpacity(0.14),
                AppColors.primaryGreen.withOpacity(0.06),
              ],
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: AppColors.primaryGreen.withOpacity(0.35),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                IconlyBold.delete,
                size: compact ? 14 : 16,
                color: AppColors.primaryGreen,
              ),
              const SizedBox(width: 6),
              Text(
                compact ? 'Reset' : 'Reset Filter',
                style: AppTextStyles.labelMedium.copyWith(
                  color: AppColors.primaryGreen,
                  fontWeight: FontWeight.w700,
                  fontSize: compact ? 12 : 13,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final content = Column(
      children: [
        if (widget.isBottomSheet) _buildSheetHandle(isDark),
        _buildSearchHeader(isDark),
        Expanded(child: Obx(() => _buildBody(isDark))),
      ],
    );

    if (widget.isBottomSheet) return content;

    return Scaffold(
      backgroundColor: isDark
          ? AppColors.darkScaffoldBackground
          : AppColors.scaffoldBackground,
      body: SafeArea(child: content),
    );
  }

  Widget _buildSheetHandle(bool isDark) {
    return Column(
      children: [
        const SizedBox(height: 10),
        Container(
          width: 40,
          height: 4,
          decoration: BoxDecoration(
            color: isDark ? AppColors.grey500 : AppColors.grey300,
            borderRadius: BorderRadius.circular(2),
          ),
        ).animate().fadeIn(duration: 300.ms).scale(
              begin: const Offset(0.5, 1),
              end: const Offset(1, 1),
            ),
        const SizedBox(height: 4),
      ],
    );
  }

  Widget _buildSearchHeader(bool isDark) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        16,
        widget.isBottomSheet ? 8 : 12,
        16,
        16,
      ),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardBackground : AppColors.white,
        boxShadow: widget.isBottomSheet
            ? null
            : [
                BoxShadow(
                  color: isDark ? Colors.black26 : AppColors.shadowLight,
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Row(
        children: [
          if (widget.isBottomSheet) ...[
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.primaryGreen.withOpacity(0.15),
                    AppColors.primaryGreen.withOpacity(0.05),
                  ],
                ),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(
                IconlyBold.search,
                color: AppColors.primaryGreen,
                size: 22,
              ),
            ),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Container(
              height: 48,
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.darkElevatedSurface
                    : AppColors.grey100,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: _focusNode.hasFocus
                      ? AppColors.primaryGreen.withOpacity(0.4)
                      : Colors.transparent,
                  width: 1.5,
                ),
              ),
              child: TextField(
                controller: _textController,
                focusNode: _focusNode,
                style: AppTextStyles.bodyLarge.copyWith(
                  color: isDark
                      ? AppColors.darkTextPrimary
                      : AppColors.textPrimary,
                  fontSize: 15,
                ),
                decoration: InputDecoration(
                  hintText: 'Search for products...',
                  hintStyle: AppTextStyles.bodyMedium.copyWith(
                    color: isDark
                        ? AppColors.darkTextSecondary
                        : AppColors.grey500,
                  ),
                  prefixIcon: widget.isBottomSheet
                      ? null
                      : Icon(
                          IconlyLight.search,
                          color: AppColors.primaryGreen,
                          size: 22,
                        ),
                  suffixIcon: _textController.text.isNotEmpty
                      ? IconButton(
                          icon: Icon(
                            Icons.close_rounded,
                            color: isDark
                                ? AppColors.darkTextSecondary
                                : AppColors.grey500,
                            size: 20,
                          ),
                          onPressed: _clearSearch,
                        )
                      : null,
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                ),
                textInputAction: TextInputAction.search,
                onChanged: (v) {
                  setState(() {});
                  _ctrl.onSearchChanged(v);
                },
                onSubmitted: _doSearch,
              ),
            ),
          ),
          if (widget.isBottomSheet) ...[
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () => Navigator.of(context).pop(),
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isDark
                      ? AppColors.darkElevatedSurface
                      : AppColors.grey100,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  Icons.close_rounded,
                  color: isDark
                      ? AppColors.darkTextSecondary
                      : AppColors.grey600,
                  size: 22,
                ),
              ),
            ),
          ],
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.1, end: 0);
  }

  Widget _buildBody(bool isDark) {
    if (_ctrl.isLoading.value) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(
              color: AppColors.primaryGreen,
              strokeWidth: 3,
            ),
            const SizedBox(height: 16),
            Text(
              'Loading products...',
              style: TextStyle(
                color: isDark ? AppColors.darkTextSecondary : AppColors.grey600,
                fontSize: 14,
              ),
            ),
          ],
        ),
      );
    }

    if (_ctrl.hasResults) {
      return _buildResults(isDark);
    }

    if (_ctrl.hasError) {
      return _buildError(isDark);
    }

    return _buildHome(isDark);
  }

  Widget _buildHome(bool isDark) {
    return RefreshIndicator(
      onRefresh: () async {
        // Refresh by clearing and showing home
        _ctrl.clearSearch();
      },
      color: AppColors.primaryGreen,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Recent Searches
            if (_ctrl.recentSearches.isNotEmpty) ...[
              _sectionHeader(
                'Recent Searches',
                Icons.history,
                isDark,
                onClear: _ctrl.clearRecent,
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _ctrl.recentSearches
                    .asMap()
                    .entries
                    .map((e) => _chip(e.value, isDark, index: e.key))
                    .toList(),
              ),
              const SizedBox(height: 24),
            ],

            // Trending
            _sectionHeader('Trending', Icons.trending_up, isDark),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                'Phone',
                'Laptop',
                'Watch',
                'Keyboard',
                'Camera',
                'Headphones',
              ]
                  .asMap()
                  .entries
                  .map((e) => _chip(
                        e.value,
                        isDark,
                        index: e.key + _ctrl.recentSearches.length,
                      ))
                  .toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(
    String title,
    IconData icon,
    bool isDark, {
    VoidCallback? onClear,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: AppColors.primaryGreen.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 18, color: AppColors.primaryGreen),
          ),
          const SizedBox(width: 12),
          Text(
            title,
            style: AppTextStyles.bodyLarge.copyWith(
              fontWeight: FontWeight.w700,
              fontSize: 16,
              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
            ),
          ),
          const Spacer(),
          if (onClear != null)
            TextButton(
              onPressed: onClear,
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
              ),
              child: Text(
                'Clear All',
                style: TextStyle(
                  color: AppColors.primaryGreen,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _chip(String label, bool isDark, {int index = 0}) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        _textController.text = label;
        _ctrl.search(label);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 11),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.primaryGreen.withOpacity(0.12),
              AppColors.primaryGreen.withOpacity(0.04),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: AppColors.primaryGreen.withOpacity(0.25),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.primaryGreen.withOpacity(0.08),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              IconlyBold.search,
              size: 14,
              color: AppColors.primaryGreen,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: AppTextStyles.labelLarge.copyWith(
                color: isDark
                    ? AppColors.darkTextPrimary
                    : AppColors.textPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    )
        .animate(delay: Duration(milliseconds: 60 * index))
        .fadeIn(duration: 400.ms)
        .slideX(begin: 0.15, end: 0, curve: Curves.easeOutCubic)
        .scale(
          begin: const Offset(0.9, 0.9),
          end: const Offset(1, 1),
          duration: 350.ms,
        );
  }

  Widget _buildError(bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                IconlyBold.search,
                size: 40,
                color: AppColors.primaryGreen.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'No results found',
              style: AppTextStyles.titleMedium.copyWith(
                fontWeight: FontWeight.w800,
                color: isDark
                    ? AppColors.darkTextPrimary
                    : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _ctrl.errorMessage.value,
              style: AppTextStyles.bodyMedium.copyWith(
                color: isDark ? AppColors.darkTextSecondary : AppColors.grey600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            _buildResetFilterButton(isDark),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 400.ms);
  }

  Widget _buildResultsHeader(bool isDark) {
    final query = _ctrl.currentQuery.value;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? [
                  AppColors.darkCardBackground,
                  AppColors.primaryGreen.withOpacity(0.08),
                ]
              : [
                  AppColors.white,
                  AppColors.primaryGreen.withOpacity(0.06),
                ],
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: AppColors.primaryGreen.withOpacity(0.15),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGreen.withOpacity(0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.primaryGreen,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  IconlyBold.tick_square,
                  size: 14,
                  color: AppColors.white,
                ),
                const SizedBox(width: 6),
                Text(
                  '${_ctrl.searchResults.length}',
                  style: AppTextStyles.labelMedium.copyWith(
                    color: AppColors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Results found',
                  style: AppTextStyles.labelSmall.copyWith(
                    color: isDark
                        ? AppColors.darkTextSecondary
                        : AppColors.grey600,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  '"$query"',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w700,
                    color: isDark
                        ? AppColors.darkTextPrimary
                        : AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
          _buildResetFilterButton(isDark, compact: true),
        ],
      ),
    ).animate().fadeIn(duration: 350.ms).slideY(begin: -0.08, end: 0);
  }

  Widget _buildResults(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildResultsHeader(isDark),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () async {
              await _ctrl.loadAllProducts();
              if (_ctrl.currentQuery.value.isNotEmpty) {
                _ctrl.search(_ctrl.currentQuery.value);
              }
            },
            color: AppColors.primaryGreen,
            child: GridView.builder(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
              physics: const AlwaysScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 14,
                mainAxisSpacing: 14,
                childAspectRatio: 0.68,
              ),
              itemCount: _ctrl.searchResults.length,
              itemBuilder: (context, index) {
                return _productCard(
                  _ctrl.searchResults[index],
                  isDark,
                  index: index,
                );
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _productCard(Product product, bool isDark, {int index = 0}) {
    final hasDiscount =
        product.discountPrice > 0 && product.discountPrice < product.price;
    final price = hasDiscount ? product.discountPrice : product.price;
    final imageUrl = product.images.isNotEmpty ? product.images.first : '';

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        if (widget.isBottomSheet) {
          Navigator.of(context).pop();
        }
        Get.to(() => ProductDetailScreen(product: product));
      },
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCardBackground : AppColors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isDark
                ? AppColors.darkBorderLight.withOpacity(0.25)
                : AppColors.grey200,
          ),
          boxShadow: [
            BoxShadow(
              color: isDark
                  ? Colors.black26
                  : AppColors.primaryGreen.withOpacity(0.05),
              blurRadius: 14,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                Container(
                  height: 130,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: isDark
                        ? Colors.white.withOpacity(0.04)
                        : const Color(0xFFF8FAF8),
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(18),
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(18),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(10),
                      child: product.mainImage.startsWith('http')
                          ? Image.network(
                              product.mainImage,
                              width: double.infinity,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) {
                                return Icon(
                                  Icons.image_not_supported_rounded,
                                  size: 40,
                                  color: isDark
                                      ? AppColors.darkTextSecondary
                                      : AppColors.grey400,
                                );
                              },
                              loadingBuilder:
                                  (context, child, loadingProgress) {
                                if (loadingProgress == null) return child;
                                return Center(
                                  child: SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: AppColors.primaryGreen,
                                    ),
                                  ),
                                );
                              },
                            )
                          : imageUrl.isNotEmpty
                              ? Image.network(
                                  '${ApiConfig.getServerUrl()}$imageUrl',
                                  width: double.infinity,
                                  fit: BoxFit.contain,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Icon(
                                      Icons.image_not_supported_rounded,
                                      size: 40,
                                      color: AppColors.grey400,
                                    );
                                  },
                                )
                              : Icon(
                                  IconlyBold.bag_2,
                                  size: 40,
                                  color: isDark
                                      ? AppColors.darkTextSecondary
                                      : AppColors.grey400,
                                ),
                    ),
                  ),
                ),
                if (hasDiscount)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.error,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.error.withOpacity(0.25),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Text(
                        '-${((1 - price / product.price) * 100).toStringAsFixed(0)}%',
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 10,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.bodySmall.copyWith(
                        fontWeight: FontWeight.w700,
                        height: 1.25,
                        color: isDark
                            ? AppColors.darkTextPrimary
                            : AppColors.textPrimary,
                      ),
                    ),
                    const Spacer(),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '\$${price.toStringAsFixed(2)}',
                          style: AppTextStyles.titleSmall.copyWith(
                            fontWeight: FontWeight.w800,
                            color: AppColors.primaryGreen,
                          ),
                        ),
                        if (hasDiscount) ...[
                          const SizedBox(width: 4),
                          Text(
                            '\$${product.price.toStringAsFixed(2)}',
                            style: AppTextStyles.labelSmall.copyWith(
                              decoration: TextDecoration.lineThrough,
                              color: isDark
                                  ? AppColors.darkTextSecondary
                                  : AppColors.grey500,
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.star_rounded,
                          size: 14,
                          color: Colors.amber.shade600,
                        ),
                        const SizedBox(width: 3),
                        Text(
                          product.rating > 0
                              ? product.rating.toStringAsFixed(1)
                              : 'New',
                          style: AppTextStyles.labelSmall.copyWith(
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? AppColors.darkTextSecondary
                                : AppColors.grey600,
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
        .animate(delay: Duration(milliseconds: 40 * index))
        .fadeIn(duration: 350.ms)
        .slideY(begin: 0.08, end: 0, curve: Curves.easeOutCubic)
        .scale(
          begin: const Offset(0.96, 0.96),
          end: const Offset(1, 1),
          duration: 300.ms,
        );
  }
}
