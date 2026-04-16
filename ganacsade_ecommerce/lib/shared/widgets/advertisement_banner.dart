import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/network/advertisements_api_service.dart';
import '../models/advertisement.dart';

/// A reusable advertisement banner widget that can be used across different screens
/// Supports different placements: home_slider, home_banner, category_page, product_page, checkout
class AdvertisementBanner extends StatefulWidget {
  final String placement;
  final double? height;
  final EdgeInsets? margin;
  final bool showTitle;

  const AdvertisementBanner({
    super.key,
    required this.placement,
    this.height,
    this.margin,
    this.showTitle = true,
  });

  @override
  State<AdvertisementBanner> createState() => _AdvertisementBannerState();
}

class _AdvertisementBannerState extends State<AdvertisementBanner> {
  final AdvertisementsApiService _apiService = AdvertisementsApiService();
  List<Advertisement> _advertisements = [];
  bool _isLoading = true;
  final Set<String> _viewedAdIds = {};

  @override
  void initState() {
    super.initState();
    _loadAdvertisements();
  }

  Future<void> _loadAdvertisements() async {
    try {
      final response = await _apiService.getAdvertisements(placement: widget.placement);
      if (mounted) {
        final List<dynamic> adsData = response['advertisements'] ?? [];
        final ads = adsData.map((ad) => Advertisement.fromJson(ad)).toList();
        
        setState(() {
          _advertisements = ads;
          _isLoading = false;
        });
        
        // Record view for the first ad
        if (_advertisements.isNotEmpty) {
          _recordView(_advertisements.first.id);
        }
      }
    } catch (e) {
      print('Error loading ${widget.placement} ads: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _recordView(String adId) {
    if (_viewedAdIds.contains(adId)) return;
    _viewedAdIds.add(adId);
    _apiService.recordView(adId);
  }

  Future<void> _onAdTap(Advertisement ad) async {
    // Record click
    _apiService.recordClick(ad.id);
    
    // Open URL if available
    if (ad.targetUrl != null && ad.targetUrl!.isNotEmpty) {
      try {
        final uri = Uri.parse(ad.targetUrl!);
        final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
        
        if (!launched) {
          await launchUrl(uri, mode: LaunchMode.platformDefault);
        }
      } catch (e) {
        print('Error launching URL: $e');
        Get.snackbar(
          'Error',
          'Could not open link',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.error,
          colorText: AppColors.white,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return _buildLoadingState();
    }

    if (_advertisements.isEmpty) {
      return const SizedBox.shrink();
    }

    // For single ad placements
    if (_advertisements.length == 1) {
      return _buildSingleBanner(_advertisements.first);
    }

    // For multiple ads, show a horizontal scroll
    return _buildMultipleBanners();
  }

  Widget _buildLoadingState() {
    final height = widget.height ?? _getDefaultHeight();
    return Container(
      height: height,
      margin: widget.margin ?? const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.grey100,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Center(
        child: SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      ),
    );
  }

  Widget _buildSingleBanner(Advertisement ad) {
    final height = widget.height ?? _getDefaultHeight();
    
    return GestureDetector(
      onTap: () => _onAdTap(ad),
      child: Container(
        height: height,
        margin: widget.margin ?? const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: AppColors.grey400.withOpacity(0.2),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Background Image
              Image.network(
                ad.imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return _buildFallbackBanner(ad);
                },
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return _buildFallbackBanner(ad, isLoading: true);
                },
              ),
              
              // Gradient overlay for text readability
              if (widget.showTitle)
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          Colors.black.withOpacity(0.7),
                          Colors.transparent,
                        ],
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          ad.title,
                          style: AppTextStyles.titleMedium.copyWith(
                            color: AppColors.white,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (ad.description != null && ad.description!.isNotEmpty)
                          Text(
                            ad.description!,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.white.withOpacity(0.9),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMultipleBanners() {
    final height = widget.height ?? _getDefaultHeight();
    
    return SizedBox(
      height: height,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: widget.margin ?? const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _advertisements.length,
        itemBuilder: (context, index) {
          final ad = _advertisements[index];
          return Container(
            width: MediaQuery.of(context).size.width * 0.8,
            margin: EdgeInsets.only(right: index < _advertisements.length - 1 ? 12 : 0),
            child: _buildSingleBanner(ad),
          );
        },
      ),
    );
  }

  Widget _buildFallbackBanner(Advertisement ad, {bool isLoading = false}) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            ad.backgroundColor,
            ad.backgroundColor.withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: isLoading
          ? const Center(
              child: CircularProgressIndicator(
                color: AppColors.white,
                strokeWidth: 2,
              ),
            )
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    ad.title,
                    style: AppTextStyles.titleLarge.copyWith(
                      color: AppColors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (ad.description != null)
                    Text(
                      ad.description!,
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.white.withOpacity(0.9),
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  double _getDefaultHeight() {
    switch (widget.placement) {
      case 'home_slider':
        return 180;
      case 'home_banner':
        return 120;
      case 'category_page':
        return 100;
      case 'product_page':
        return 80;
      case 'checkout':
        return 70;
      default:
        return 100;
    }
  }
}

/// Compact checkout banner widget
class CheckoutAdvertisementBanner extends StatefulWidget {
  const CheckoutAdvertisementBanner({super.key});

  @override
  State<CheckoutAdvertisementBanner> createState() => _CheckoutAdvertisementBannerState();
}

class _CheckoutAdvertisementBannerState extends State<CheckoutAdvertisementBanner> {
  final AdvertisementsApiService _apiService = AdvertisementsApiService();
  Advertisement? _advertisement;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAdvertisement();
  }

  Future<void> _loadAdvertisement() async {
    try {
      final response = await _apiService.getAdvertisements(placement: 'checkout');
      final List<dynamic> adsData = response['advertisements'] ?? [];
      
      if (mounted && adsData.isNotEmpty) {
        final ad = Advertisement.fromJson(adsData.first);
        setState(() {
          _advertisement = ad;
          _isLoading = false;
        });
        _apiService.recordView(ad.id);
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _onTap() async {
    if (_advertisement == null) return;
    
    _apiService.recordClick(_advertisement!.id);
    
    if (_advertisement!.targetUrl != null && _advertisement!.targetUrl!.isNotEmpty) {
      try {
        final uri = Uri.parse(_advertisement!.targetUrl!);
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } catch (e) {
        print('Error launching URL: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading || _advertisement == null) {
      return const SizedBox.shrink();
    }

    return GestureDetector(
      onTap: _onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.primaryGreen.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.primaryGreen.withOpacity(0.3),
          ),
        ),
        child: Row(
          children: [
            // Ad Image
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                _advertisement!.imageUrl,
                width: 50,
                height: 50,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: AppColors.primaryGreen.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.local_offer,
                      color: AppColors.primaryGreen,
                    ),
                  );
                },
              ),
            ),
            const SizedBox(width: 12),
            
            // Ad Text
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _advertisement!.title,
                    style: AppTextStyles.bodyMedium.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (_advertisement!.description != null)
                    Text(
                      _advertisement!.description!,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.grey600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
            
            const Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: AppColors.grey600,
            ),
          ],
        ),
      ),
    );
  }
}
