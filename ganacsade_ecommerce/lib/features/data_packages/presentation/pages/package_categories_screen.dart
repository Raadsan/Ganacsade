import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/responsive.dart';
import '../../models/telecom_provider.dart';
import '../../models/package_category.dart';
import 'packages_list_screen.dart';

/// Screen displaying package categories for a selected telecom provider
class PackageCategoriesScreen extends StatefulWidget {
  final TelecomProvider provider;

  const PackageCategoriesScreen({
    super.key,
    required this.provider,
  });

  @override
  State<PackageCategoriesScreen> createState() => _PackageCategoriesScreenState();
}

class _PackageCategoriesScreenState extends State<PackageCategoriesScreen> {
  List<PackageCategory> categories = [];
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      // TODO: Replace with actual API call
      // final response = await _apiService.getPackageCategories(widget.provider.id);
      // categories = response;

      // Simulating API delay
      await Future.delayed(const Duration(milliseconds: 400));

      // Using placeholder data for now - convert int id to string
      categories = PackageCategory.getPlaceholderCategories(widget.provider.name.toLowerCase());
    } catch (e) {
      errorMessage = 'Failed to load categories: $e';
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  /// Use Ganacsade brand green for all cards
  Color get _brandColor => AppColors.primaryGreen;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final sizing = context.sizing;
    final isTablet = context.isTabletOrLarger;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkScaffoldBackground : AppColors.white,
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
        centerTitle: true,
        toolbarHeight: sizing.appBarHeight,
        title: Text(
          _getLocalizedTitle(),
          style: AppTextStyles.headlineSmall.copyWith(
            color: AppColors.white,
            fontWeight: FontWeight.w600,
            fontSize: isTablet ? 22 : 18,
          ),
        ),
      ),
      body: _buildBody(isDark, sizing, isTablet),
    );
  }

  String _getLocalizedTitle() {
    // Format: "Adeegyada [Provider Name]" (Somali for "Services of")
    final locale = Get.locale?.languageCode ?? 'en';
    switch (locale) {
      case 'so':
        return 'Adeegyada ${widget.provider.name}';
      case 'ar':
        return 'خدمات ${widget.provider.name}';
      default:
        return '${widget.provider.name} Services';
    }
  }

  Widget _buildBody(bool isDark, ResponsiveSizing sizing, bool isTablet) {
    if (isLoading) {
      return Center(
        child: CircularProgressIndicator(
          color: _brandColor,
        ),
      );
    }

    if (errorMessage != null) {
      return _buildErrorState(isDark);
    }

    return RefreshIndicator(
      onRefresh: _loadCategories,
      color: _brandColor,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.all(sizing.horizontalPadding),
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: isTablet ? 700 : double.infinity),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: isTablet ? 20 : 12,
                mainAxisSpacing: isTablet ? 20 : 12,
                childAspectRatio: isTablet ? 1.1 : 0.95,
              ),
              itemCount: categories.length,
              itemBuilder: (context, index) {
                return _buildCategoryCard(
                  categories[index],
                  index,
                  isDark,
                  isTablet,
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryCard(
    PackageCategory category,
    int index,
    bool isDark,
    bool isTablet,
  ) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        _onCategoryTap(category);
      },
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              _brandColor,
              _brandColor.withValues(alpha: 0.85),
            ],
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: _brandColor.withValues(alpha: 0.35),
              blurRadius: 16,
              offset: const Offset(0, 6),
              spreadRadius: 0,
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Stack(
            children: [
              // Subtle pattern overlay
              Positioned(
                top: -20,
                right: -20,
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withValues(alpha: 0.08),
                  ),
                ),
              ),
              
              // Provider logo badge (top center)
              Positioned(
                top: 12,
                left: 0,
                right: 0,
                child: Center(
                  child: Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.3),
                        width: 1,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        widget.provider.name.substring(0, 1).toUpperCase(),
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.9),
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              // Main content
              Padding(
                padding: EdgeInsets.fromLTRB(
                  isTablet ? 16 : 12,
                  isTablet ? 48 : 44,
                  isTablet ? 16 : 12,
                  isTablet ? 20 : 16,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Custom styled icon container
                    Container(
                      width: isTablet ? 64 : 52,
                      height: isTablet ? 64 : 52,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Center(
                        child: _buildCategoryIcon(category, isTablet),
                      ),
                    ),

                    SizedBox(height: isTablet ? 14 : 10),

                    // Category name
                    Text(
                      category.name,
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: isTablet ? 15 : 13,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.3,
                        height: 1.25,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    ).animate(delay: (60 * index).ms).fadeIn(duration: 350.ms).scale(
          begin: const Offset(0.92, 0.92),
          end: const Offset(1, 1),
          duration: 280.ms,
          curve: Curves.easeOutCubic,
        );
  }

  Widget _buildCategoryIcon(PackageCategory category, bool isTablet) {
    final iconSize = isTablet ? 32.0 : 26.0;
    
    // Custom icon rendering based on category type
    switch (category.iconName.toLowerCase()) {
      case 'router':
      case 'adsl':
      case 'wifi':
        return _buildRouterIcon(iconSize);
      case 'unlimited':
      case 'data':
      case 'mobile_data':
        return _buildDataIcon(iconSize);
      case 'bundle':
      case 'package':
        return _buildBundleIcon(iconSize);
      case 'voice':
      case 'call':
      case 'phone':
        return _buildVoiceIcon(iconSize);
      case 'iptv':
      case 'tv':
        return _buildTvIcon(iconSize);
      default:
        return Icon(
          category.icon,
          size: iconSize,
          color: Colors.white,
        );
    }
  }

  Widget _buildRouterIcon(double size) {
    return Icon(
      Icons.router_rounded,
      size: size,
      color: Colors.white,
    );
  }

  Widget _buildDataIcon(double size) {
    return Icon(
      Icons.swap_vert_rounded,
      size: size,
      color: Colors.white,
    );
  }

  Widget _buildBundleIcon(double size) {
    return Icon(
      Icons.all_inclusive_rounded,
      size: size,
      color: Colors.white,
    );
  }

  Widget _buildVoiceIcon(double size) {
    return Icon(
      Icons.phone_in_talk_rounded,
      size: size,
      color: Colors.white,
    );
  }

  Widget _buildTvIcon(double size) {
    return Icon(
      Icons.live_tv_rounded,
      size: size,
      color: Colors.white,
    );
  }

  void _onCategoryTap(PackageCategory category) {
    // PackagesListScreen no longer needs category - packages come from provider
    Get.to(
      () => PackagesListScreen(
        provider: widget.provider,
      ),
      transition: Transition.rightToLeft,
    );
  }

  Widget _buildErrorState(bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.error,
            ),
            const SizedBox(height: 16),
            Text(
              errorMessage ?? 'An error occurred',
              textAlign: TextAlign.center,
              style: AppTextStyles.bodyLarge.copyWith(
                color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _loadCategories,
              icon: const Icon(Icons.refresh),
              label: Text('retry'.tr),
              style: ElevatedButton.styleFrom(
                backgroundColor: _brandColor,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
