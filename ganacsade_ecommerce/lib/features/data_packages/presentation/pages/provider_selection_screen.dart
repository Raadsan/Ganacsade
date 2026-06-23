import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/responsive.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/services/audio_service.dart';
import 'package:shimmer/shimmer.dart';
import '../../models/telecom_provider.dart';
import '../controllers/data_packages_controller.dart';

/// Screen for selecting a telecom provider for data packages
class ProviderSelectionScreen extends StatefulWidget {
  const ProviderSelectionScreen({super.key});

  @override
  State<ProviderSelectionScreen> createState() =>
      _ProviderSelectionScreenState();
}

class _ProviderSelectionScreenState extends State<ProviderSelectionScreen> {
  final AudioService _audioService = AudioService();
  bool _isAudioPlaying = true;

  @override
  void initState() {
    super.initState();
    // Play companies.mp3 when screen loads
    _audioService.play('audio/companies.mp3');
  }

  @override
  void dispose() {
    // Stop audio when leaving screen
    _audioService.stop();
    super.dispose();
  }

  static const String _contactPhone = '+252613223060';

  void _toggleAudio() {
    setState(() {
      _isAudioPlaying = !_isAudioPlaying;
      if (_isAudioPlaying) {
        _audioService.play('audio/companies.mp3');
      } else {
        _audioService.stop();
      }
    });
  }

  Future<void> _launchWhatsApp() async {
    final uri = Uri.parse(
      'https://wa.me/${_contactPhone.replaceAll(RegExp(r'[^0-9]'), '')}',
    );
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      Get.snackbar(
        'WhatsApp',
        'Could not open WhatsApp. Please install it first.',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  Future<void> _launchPhone() async {
    final uri = Uri(scheme: 'tel', path: _contactPhone);
    try {
      await launchUrl(uri);
    } catch (_) {
      Get.snackbar(
        'Call',
        'Could not make a call.',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(DataPackagesController());
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final sizing = context.sizing;
    final isTablet = context.isTabletOrLarger;

    return Scaffold(
      backgroundColor: isDark
          ? AppColors.darkScaffoldBackground
          : AppColors.white,
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
        centerTitle: true,
        toolbarHeight: sizing.appBarHeight,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.wifi, color: AppColors.white, size: isTablet ? 28 : 24),
            const SizedBox(width: 8),
            Text(
              'data_packages'.tr,
              style: AppTextStyles.headlineSmall.copyWith(
                color: AppColors.white,
                fontWeight: FontWeight.bold,
                fontSize: isTablet ? 22 : 18,
              ),
            ),
          ],
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
      body: Column(
        children: [
          // Main content
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) {
                return _buildShimmerGrid(context, sizing, isTablet);
              }

              if (controller.errorMessage.value.isNotEmpty) {
                return _buildErrorState(controller, isDark);
              }

              if (controller.providers.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.wifi_off, size: 64, color: Colors.grey),
                      const SizedBox(height: 16),
                      Text(
                        'no_providers_available'.tr,
                        style: TextStyle(color: Colors.grey),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: controller.refreshProviders,
                        child: Text('retry'.tr),
                      ),
                    ],
                  ),
                );
              }

              return _buildProviderGrid(
                context,
                controller,
                isDark,
                sizing,
                isTablet,
              );
            }),
          ),

          // Bottom section with Next button
          _buildBottomSection(context, controller, isDark, sizing),
        ],
      ),
    );
  }

  Widget _buildProviderGrid(
    BuildContext context,
    DataPackagesController controller,
    bool isDark,
    ResponsiveSizing sizing,
    bool isTablet,
  ) {
    return RefreshIndicator(
      onRefresh: controller.refreshProviders,
      color: AppColors.primaryGreen,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.all(sizing.horizontalPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header text
            Text(
              'select_provider'.tr,
              style: AppTextStyles.bodyLarge.copyWith(
                color: isDark
                    ? AppColors.darkTextSecondary
                    : AppColors.textSecondary,
                fontSize: isTablet ? 18 : 16,
              ),
            ).animate().fadeIn(duration: 400.ms),

            SizedBox(height: sizing.verticalPadding * 1.5),

            // Provider grid
            Center(
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  maxWidth: isTablet ? 600 : double.infinity,
                ),
                child: Obx(
                  () => GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 1.1,
                    ),
                    itemCount: controller.providers.length,
                    itemBuilder: (context, index) {
                      final provider = controller.providers[index];
                      return _buildProviderCard(
                        context,
                        provider,
                        controller,
                        isDark,
                        index,
                        isTablet,
                      );
                    },
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProviderCard(
    BuildContext context,
    TelecomProvider provider,
    DataPackagesController controller,
    bool isDark,
    int index,
    bool isTablet,
  ) {
    return Obx(() {
      final isSelected = controller.isProviderSelected(provider);
      final providerColor = provider.primaryColor;

      final hasPackages = provider.packages.isNotEmpty;

      return GestureDetector(
        onTap: () {
          HapticFeedback.lightImpact();
          if (hasPackages) {
            controller.selectProvider(provider);
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  'Coming soon - no packages available yet for ${provider.name}',
                ),
                backgroundColor: AppColors.primaryGreen,
                behavior: SnackBarBehavior.floating,
              ),
            );
          }
        },
        child:
            AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  decoration: BoxDecoration(
                    color: isDark
                        ? AppColors.darkCardBackground
                        : AppColors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected
                          ? AppColors.primaryGreen
                          : AppColors.primaryGreen.withOpacity(0.3),
                      width: isSelected ? 2 : 1,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppColors.primaryGreen.withOpacity(0.2),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ]
                        : null,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Provider logo in a square container
                      Container(
                        width: 60,
                        height: 60,
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child:
                            (provider.logoUrl != null &&
                                provider.logoUrl!.isNotEmpty)
                            ? Image.network(
                                provider.logoUrl!,
                                fit: BoxFit.contain,
                                errorBuilder: (_, __, ___) =>
                                    _buildPlaceholderLogo(provider, false),
                              )
                            : _buildPlaceholderLogo(provider, false),
                      ),
                      const SizedBox(height: 12),
                      // Provider name
                      Text(
                        provider.name,
                        style: AppTextStyles.titleMedium.copyWith(
                          color: const Color(
                            0xFF1A237E,
                          ), // Navy blue from design
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                )
                .animate(delay: (100 * index).ms)
                .fadeIn(duration: 400.ms)
                .slideY(begin: 0.1, end: 0),
      );
    });
  }

  Widget _buildPlaceholderLogo(TelecomProvider provider, bool isTablet) {
    return Text(
      provider.name.substring(0, 1).toUpperCase(),
      style: TextStyle(
        color: provider.primaryColor,
        fontSize: isTablet ? 32 : 24,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildBottomSection(
    BuildContext context,
    DataPackagesController controller,
    bool isDark,
    ResponsiveSizing sizing,
  ) {
    return Container(
      padding: EdgeInsets.all(sizing.horizontalPadding),
      color: isDark ? AppColors.darkScaffoldBackground : AppColors.white,
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Contact Buttons Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkCardBackground : AppColors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _buildContactButton(
                      imagePath: 'assets/images/whatsup.png',
                      label: 'WHATS APP',
                      onPressed: () => _launchWhatsApp(),
                      isDark: isDark,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildContactButton(
                      icon: Icons.call_rounded,
                      label: 'CALL',
                      onPressed: () => _launchPhone(),
                      isDark: isDark,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            // Next button
            Obx(() {
              final hasSelection = controller.selectedProvider.value != null;
              return SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: hasSelection ? controller.proceedToPackages : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: hasSelection
                        ? AppColors.primaryGreen
                        : (isDark
                              ? AppColors.darkCardBackground
                              : AppColors.grey300),
                    foregroundColor: Colors.black,
                    elevation: hasSelection ? 2 : 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: Text(
                    'NEXT',
                    style: const TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.w900,
                      fontSize: 18,
                      letterSpacing: 2.0,
                    ),
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildContactButton({
    required String label,
    required VoidCallback onPressed,
    required bool isDark,
    IconData? icon,
    String? imagePath,
  }) {
    return Container(
      height: 48,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          backgroundColor: isDark
              ? AppColors.darkElevatedSurface
              : Colors.white,
          side: BorderSide(
            color: AppColors.primaryGreen.withOpacity(0.3),
            width: 1,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (imagePath != null)
              Image.asset(imagePath, width: 20, height: 20)
            else if (icon != null)
              Icon(icon, color: AppColors.primaryGreen, size: 20),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: AppColors.primaryGreen,
                fontWeight: FontWeight.bold,
                fontSize: 12,
                letterSpacing: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShimmerGrid(
    BuildContext context,
    ResponsiveSizing sizing,
    bool isTablet,
  ) {
    return Padding(
      padding: EdgeInsets.all(sizing.horizontalPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Shimmer.fromColors(
            baseColor: AppColors.grey200,
            highlightColor: AppColors.grey100,
            child: Container(
              width: 200,
              height: 20,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Expanded(
            child: GridView.builder(
              padding: EdgeInsets.zero,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.1,
              ),
              itemCount: 6,
              itemBuilder: (context, index) {
                return Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.grey100),
                  ),
                  child: Shimmer.fromColors(
                    baseColor: AppColors.grey200,
                    highlightColor: AppColors.grey100,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 50,
                          height: 50,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Container(
                          width: 80,
                          height: 12,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(DataPackagesController controller, bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: AppColors.error),
            const SizedBox(height: 16),
            Text(
              controller.errorMessage.value,
              textAlign: TextAlign.center,
              style: AppTextStyles.bodyLarge.copyWith(
                color: isDark
                    ? AppColors.darkTextSecondary
                    : AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: controller.refreshProviders,
              icon: const Icon(Icons.refresh),
              label: Text('retry'.tr),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
