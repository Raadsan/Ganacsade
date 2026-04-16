import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/responsive.dart';
import '../../../../core/services/audio_service.dart';
import '../../models/telecom_provider.dart';
import 'phone_entry_screen.dart';

/// Screen displaying available packages for a selected provider
class PackagesListScreen extends StatefulWidget {
  final TelecomProvider provider;
  final String? filterByPackageName;
  final List<DataPackageApi>? filteredPackages;

  const PackagesListScreen({
    super.key,
    required this.provider,
    this.filterByPackageName,
    this.filteredPackages,
  });

  @override
  State<PackagesListScreen> createState() => _PackagesListScreenState();
}

class _PackagesListScreenState extends State<PackagesListScreen> {
  final AudioService _audioService = AudioService();
  bool _isAudioPlaying = true;

  List<DataPackageApi> get packages => widget.filteredPackages ?? widget.provider.packages;
  bool get hasPackages => packages.isNotEmpty;
  String? get packageNameFilter => widget.filterByPackageName;

  @override
  void initState() {
    super.initState();
    // Play packages.mp3 when screen loads
    _audioService.play('audio/packages.mp3');
  }

  @override
  void dispose() {
    // Stop audio when leaving screen
    _audioService.stop();
    super.dispose();
  }

  void _toggleAudio() {
    setState(() {
      _isAudioPlaying = !_isAudioPlaying;
      if (_isAudioPlaying) {
        _audioService.play('audio/packages.mp3');
      } else {
        _audioService.stop();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final sizing = context.sizing;
    final isTablet = context.isTabletOrLarger;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkScaffoldBackground : Colors.white,
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
            fontSize: isTablet ? 20 : 17,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(
              _isAudioPlaying ? Icons.volume_up : Icons.volume_off,
              color: AppColors.white,
              size: isTablet ? 28 : 24,
            ),
            onPressed: _toggleAudio,
            tooltip: _isAudioPlaying ? 'Mute' : 'Unmute',
          ),
        ],
      ),
      body: _buildBody(isDark, sizing, isTablet),
    );
  }

  String _getLocalizedTitle() {
    // If filtered by package name, show that name
    if (packageNameFilter != null) {
      return packageNameFilter!;
    }
    
    final locale = Get.locale?.languageCode ?? 'en';
    switch (locale) {
      case 'so':
        return 'Adeegga ${widget.provider.name}';
      case 'ar':
        return 'خدمة ${widget.provider.name}';
      default:
        return '${widget.provider.name} Packages';
    }
  }

  Widget _buildBody(bool isDark, ResponsiveSizing sizing, bool isTablet) {
    if (!hasPackages) {
      return _buildEmptyState(isDark);
    }

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: EdgeInsets.symmetric(
        horizontal: isTablet ? 24 : 16,
        vertical: isTablet ? 20 : 16,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: isTablet ? 600 : double.infinity),
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: isTablet ? 16 : 12,
              mainAxisSpacing: isTablet ? 20 : 16,
              childAspectRatio: isTablet ? 0.78 : 0.72,
            ),
            itemCount: packages.length,
            itemBuilder: (context, index) {
              return _buildPackageCard(
                packages[index],
                index,
                isDark,
                isTablet,
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.inventory_2_outlined,
            size: 64,
            color: Colors.grey,
          ),
          const SizedBox(height: 16),
          Text(
            'No packages available',
            style: AppTextStyles.bodyLarge.copyWith(
              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPackageCard(
    DataPackageApi package,
    int index,
    bool isDark,
    bool isTablet,
  ) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        _onPackageTap(package);
      },
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: AppColors.primaryGreen.withValues(alpha: 0.15),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            children: [
              Column(
                children: [
                  // Top green section
                  Expanded(
                    flex: 6,
                    child: _buildGreenSection(package, isTablet),
                  ),
                  // Bottom section
                  Expanded(
                    flex: 4,
                    child: _buildWhiteSection(package, isDark, isTablet),
                  ),
                ],
              ),
              // Sale badge overlay
              if (package.isOnSale)
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: _buildSaleBadge(),
                ),
            ],
          ),
        ),
      ),
    ).animate(delay: (40 * index).ms).fadeIn(duration: 280.ms).scale(
          begin: const Offset(0.95, 0.95),
          end: const Offset(1, 1),
          duration: 220.ms,
          curve: Curves.easeOut,
        );
  }

  Widget _buildGreenSection(DataPackageApi package, bool isTablet) {
    return Container(
      width: double.infinity,
      color: AppColors.primaryGreen,
      padding: EdgeInsets.symmetric(
        horizontal: isTablet ? 14 : 10,
        vertical: isTablet ? 14 : 10,
      ),
      child: Column(
        children: [
          // Provider badge
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.wifi,
                  color: Colors.white,
                  size: isTablet ? 12 : 10,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 4),
          
          Text(
            '${'powered_by'.tr} • ${widget.provider.name}',
            style: TextStyle(
              color: Colors.white,
              fontSize: isTablet ? 10 : 9,
              fontWeight: FontWeight.w400,
            ),
          ),
          
          const Spacer(),
          
          // Price
          _buildPrice(package, isTablet),
          
          const Spacer(),
          
          // Duration with checkmark
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.25),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.check,
                  color: Colors.white,
                  size: isTablet ? 14 : 12,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                package.duration,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: isTablet ? 18 : 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPrice(DataPackageApi package, bool isTablet) {
    // Debug: print actual values
    print('_buildPrice: amount=${package.amount}, value=${package.value}, price=${package.price}, originalPrice=${package.originalPrice}');
    
    return Column(
      children: [
        if (package.isOnSale)
          Text(
            '\$${package.value.toStringAsFixed(2)}',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.6),
              fontSize: isTablet ? 16 : 14,
              fontWeight: FontWeight.w400,
              decoration: TextDecoration.lineThrough,
              decorationColor: Colors.white.withValues(alpha: 0.6),
            ),
          ),
        Text(
          '\$${package.amount.toStringAsFixed(2)}',
          style: TextStyle(
            color: Colors.white,
            fontSize: isTablet ? 36 : 30,
            fontWeight: FontWeight.w800,
            height: 1.1,
          ),
        ),
      ],
    );
  }


  Widget _buildWhiteSection(DataPackageApi package, bool isDark, bool isTablet) {
    return Container(
      width: double.infinity,
      color: isDark ? AppColors.darkCardBackground : const Color(0xFFF0F4F0),
      padding: EdgeInsets.symmetric(
        horizontal: isTablet ? 10 : 8,
        vertical: isTablet ? 6 : 4,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          for (final feature in package.features.take(3))
            Text(
              feature,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                fontSize: isTablet ? 12 : 11,
                fontWeight: FontWeight.w600,
                height: 1.3,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSaleBadge() {
    return ClipPath(
      clipper: _TriangleClipper(),
      child: Container(
        width: 48,
        height: 48,
        color: const Color(0xFFE53935),
        child: Align(
          alignment: const Alignment(0.35, 0.35),
          child: Transform.rotate(
            angle: -0.785398,
            child: const Text(
              'Sale',
              style: TextStyle(
                color: Colors.white,
                fontSize: 9,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _onPackageTap(DataPackageApi package) {
    Get.to(
      () => PhoneEntryScreen(
        package: package,
        provider: widget.provider,
      ),
      transition: Transition.rightToLeft,
    );
  }
}

/// Clipper for the corner triangle sale badge
class _TriangleClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path()
      ..moveTo(size.width, 0)
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}
