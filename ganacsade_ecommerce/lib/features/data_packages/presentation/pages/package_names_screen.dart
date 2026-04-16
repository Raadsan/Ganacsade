import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/responsive.dart';
import '../../../../core/services/audio_service.dart';
import '../../models/telecom_provider.dart';
import 'packages_list_screen.dart';

/// Screen displaying package names/types for a selected provider
/// User taps a company -> sees this screen with package names
/// User taps a package name -> sees packages with that name
class PackageNamesScreen extends StatefulWidget {
  final TelecomProvider provider;

  const PackageNamesScreen({
    super.key,
    required this.provider,
  });

  @override
  State<PackageNamesScreen> createState() => _PackageNamesScreenState();
}

class _PackageNamesScreenState extends State<PackageNamesScreen> {
  final AudioService _audioService = AudioService();
  bool _isAudioPlaying = true;

  @override
  void initState() {
    super.initState();
    // Play types.mp3 when screen loads
    _audioService.play('audio/types.mp3');
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
        _audioService.play('audio/types.mp3');
      } else {
        _audioService.stop();
      }
    });
  }

  /// Get unique package names from the provider's packages
  List<String> get uniquePackageNames {
    final names = widget.provider.packages
        .map((p) => p.name)
        .toSet()
        .toList();
    names.sort();
    return names;
  }

  /// Get packages count for a specific package name
  int getPackageCount(String packageName) {
    return widget.provider.packages.where((p) => p.name == packageName).length;
  }

  /// Get packages for a specific package name
  List<DataPackageApi> getPackagesForName(String packageName) {
    return widget.provider.packages.where((p) => p.name == packageName).toList();
  }

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
    final locale = Get.locale?.languageCode ?? 'en';
    return _getHeaderText(locale);
  }

  String _getHeaderText(String locale) {
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
    final packageNames = uniquePackageNames;

    if (packageNames.isEmpty) {
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Provider info header
              _buildProviderHeader(isDark, isTablet),
              
              SizedBox(height: isTablet ? 24 : 20),
              
              // Section title
              Text(
                _getPackagesTitle(),
                style: AppTextStyles.titleMedium.copyWith(
                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              
              SizedBox(height: isTablet ? 16 : 12),
              
              // Package names grid
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: isTablet ? 3 : 2,
                  crossAxisSpacing: isTablet ? 16 : 12,
                  mainAxisSpacing: isTablet ? 16 : 12,
                  childAspectRatio: isTablet ? 1.2 : 1.1,
                ),
                itemCount: packageNames.length,
                itemBuilder: (context, index) {
                  return _buildPackageNameCard(
                    packageNames[index],
                    index,
                    isDark,
                    isTablet,
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getPackagesTitle() {
    return 'select_package'.tr;
  }

  Widget _buildProviderHeader(bool isDark, bool isTablet) {
    return Container(
      padding: EdgeInsets.all(isTablet ? 20 : 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primaryGreen,
            AppColors.primaryGreen.withValues(alpha: 0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGreen.withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          // Provider icon/logo
          Container(
            width: isTablet ? 60 : 50,
            height: isTablet ? 60 : 50,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.cell_tower,
              color: Colors.white,
              size: isTablet ? 32 : 28,
            ),
          ),
          
          SizedBox(width: isTablet ? 16 : 12),
          
          // Provider info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.provider.name,
                  style: AppTextStyles.titleLarge.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: isTablet ? 22 : 18,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${widget.provider.packages.length} ${'packages_available'.tr}',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: Colors.white.withValues(alpha: 0.9),
                    fontSize: isTablet ? 14 : 12,
                  ),
                ),
              ],
            ),
          ),
          
          // Arrow icon
          Icon(
            Icons.arrow_forward_ios,
            color: Colors.white.withValues(alpha: 0.7),
            size: isTablet ? 20 : 16,
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.1, end: 0);
  }

  Widget _buildPackageNameCard(
    String packageName,
    int index,
    bool isDark,
    bool isTablet,
  ) {
    final packageCount = getPackageCount(packageName);
    
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        _onPackageNameTap(packageName);
      },
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCardBackground : AppColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? AppColors.darkBorderLight : AppColors.grey200,
            width: 1,
          ),
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
            // Icon
            Container(
              width: isTablet ? 56 : 48,
              height: isTablet ? 56 : 48,
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _getIconForPackageName(packageName),
                color: AppColors.primaryGreen,
                size: isTablet ? 28 : 24,
              ),
            ),
            
            SizedBox(height: isTablet ? 12 : 10),
            
            // Package name
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Text(
                packageName,
                style: AppTextStyles.titleSmall.copyWith(
                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                  fontSize: isTablet ? 14 : 12,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            
            const SizedBox(height: 4),
            
            // Package count
            Text(
              '$packageCount ${packageCount == 1 ? 'package'.tr : 'packages'.tr}',
              style: AppTextStyles.labelSmall.copyWith(
                color: isDark ? AppColors.darkTextSecondary : AppColors.grey600,
                fontSize: isTablet ? 11 : 10,
              ),
            ),
          ],
        ),
      ),
    ).animate(delay: (50 * index).ms).fadeIn(duration: 300.ms).scale(
          begin: const Offset(0.95, 0.95),
          end: const Offset(1, 1),
          duration: 250.ms,
          curve: Curves.easeOut,
        );
  }

  IconData _getIconForPackageName(String packageName) {
    final nameLower = packageName.toLowerCase();
    
    if (nameLower.contains('adsl') || nameLower.contains('router') || nameLower.contains('wifi')) {
      return Icons.router;
    } else if (nameLower.contains('unlimited') || nameLower.contains('data')) {
      return Icons.swap_vert;
    } else if (nameLower.contains('bundle') || nameLower.contains('combo')) {
      return Icons.inventory_2_outlined;
    } else if (nameLower.contains('voice') || nameLower.contains('call') || nameLower.contains('minute')) {
      return Icons.phone_in_talk;
    } else if (nameLower.contains('sms') || nameLower.contains('message')) {
      return Icons.sms;
    } else if (nameLower.contains('international') || nameLower.contains('roaming')) {
      return Icons.public;
    } else if (nameLower.contains('night') || nameLower.contains('evening')) {
      return Icons.nightlight_round;
    } else if (nameLower.contains('social') || nameLower.contains('facebook') || nameLower.contains('whatsapp')) {
      return Icons.share;
    } else {
      return Icons.sim_card;
    }
  }

  void _onPackageNameTap(String packageName) {
    final packagesForName = getPackagesForName(packageName);
    
    // Navigate to packages list with filtered packages
    Get.to(
      () => PackagesListScreen(
        provider: widget.provider,
        filterByPackageName: packageName,
        filteredPackages: packagesForName,
      ),
      transition: Transition.rightToLeft,
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
            color: isDark ? AppColors.darkTextSecondary : AppColors.grey400,
          ),
          const SizedBox(height: 16),
          Text(
            'no_packages_available'.tr,
            style: AppTextStyles.bodyLarge.copyWith(
              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
