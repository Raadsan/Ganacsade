import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/utils/responsive.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/services/audio_service.dart';
import '../../models/telecom_provider.dart';
import '../controllers/data_packages_controller.dart';

/// Screen for selecting a telecom provider for data packages
class ProviderSelectionScreen extends StatefulWidget {
  const ProviderSelectionScreen({super.key});

  @override
  State<ProviderSelectionScreen> createState() => _ProviderSelectionScreenState();
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
    final uri = Uri.parse('https://wa.me/${_contactPhone.replaceAll(RegExp(r'[^0-9]'), '')}');
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
      backgroundColor: isDark ? AppColors.darkScaffoldBackground : AppColors.white,
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
        centerTitle: true,
        toolbarHeight: sizing.appBarHeight,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.wifi,
              color: AppColors.white,
              size: isTablet ? 28 : 24,
            ),
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
                return const Center(
                  child: CircularProgressIndicator(
                    color: AppColors.primaryGreen,
                  ),
                );
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

              return _buildProviderGrid(context, controller, isDark, sizing, isTablet);
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
                color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                fontSize: isTablet ? 18 : 16,
              ),
            ).animate().fadeIn(duration: 400.ms),
            
            SizedBox(height: sizing.verticalPadding * 1.5),

            // Provider grid
            Center(
              child: ConstrainedBox(
                constraints: BoxConstraints(maxWidth: isTablet ? 600 : double.infinity),
                child: Obx(() => GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: isTablet ? 32 : 24,
                    mainAxisSpacing: isTablet ? 32 : 24,
                    childAspectRatio: 1.0,
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
                )),
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
            Get.snackbar(
              provider.name,
              'Coming soon - no packages available yet',
              snackPosition: SnackPosition.BOTTOM,
              duration: const Duration(seconds: 2),
            );
          }
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCardBackground : AppColors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected ? AppColors.primaryGreen : Colors.transparent,
              width: 3,
            ),
            boxShadow: [
              BoxShadow(
                color: isSelected
                    ? AppColors.primaryGreen.withValues(alpha: 0.3)
                    : AppColors.shadowLight,
                blurRadius: isSelected ? 16 : 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Opacity(
            opacity: hasPackages ? 1.0 : 0.5,
            child: Stack(
              children: [
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Provider logo
                    Container(
                      width: isTablet ? 100 : 80,
                      height: isTablet ? 100 : 80,
                      decoration: BoxDecoration(
                        color: providerColor,
                        shape: BoxShape.circle,
                        image: (provider.logoUrl != null && provider.logoUrl!.isNotEmpty)
                            ? DecorationImage(
                                image: NetworkImage(provider.logoUrl!),
                                fit: BoxFit.cover,
                                onError: (_, __) {},
                              )
                            : null,
                        boxShadow: [
                          BoxShadow(
                            color: providerColor.withValues(alpha: 0.4),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: (provider.logoUrl == null || provider.logoUrl!.isEmpty)
                          ? Center(child: _buildPlaceholderLogo(provider, isTablet))
                          : null,
                    ),

                    // Provider name (shown always now)
                    Padding(
                      padding: const EdgeInsets.only(top: 10),
                      child: Text(
                        provider.name.toUpperCase(),
                        style: AppTextStyles.labelLarge.copyWith(
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                          fontWeight: FontWeight.bold,
                          fontSize: isTablet ? 13 : 11,
                          letterSpacing: 1.0,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),

                    // Selection indicator or coming soon
                    if (isSelected)
                      Padding(
                        padding: const EdgeInsets.only(top: 6),
                        child: Icon(
                          Icons.check_circle,
                          color: AppColors.primaryGreen,
                          size: isTablet ? 22 : 18,
                        ),
                      )
                    else if (!hasPackages)
                      Padding(
                        padding: const EdgeInsets.only(top: 6),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.grey400,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            'Soon',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: isTablet ? 11 : 9,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ).animate(delay: (100 * index).ms).fadeIn(duration: 400.ms).scale(
            begin: const Offset(0.8, 0.8),
            end: const Offset(1, 1),
            duration: 400.ms,
            curve: Curves.easeOutBack,
          );
    });
  }

  Widget _buildPlaceholderLogo(TelecomProvider provider, bool isTablet) {
    return Text(
      provider.name.substring(0, 1).toUpperCase(),
      style: TextStyle(
        color: Colors.white,
        fontSize: isTablet ? 36 : 28,
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
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardBackground : AppColors.white,
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Contact buttons row
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _launchWhatsApp(),
                    icon: const Icon(Icons.chat, size: 18),
                    label: const Text('WhatsApp'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF25D366),
                      side: const BorderSide(color: Color(0xFF25D366), width: 1.5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(28),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _launchPhone(),
                    icon: const Icon(Icons.call, size: 18),
                    label: const Text('Call Us'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primaryGreen,
                      side: const BorderSide(color: AppColors.primaryGreen, width: 1.5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(28),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
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
                        : (isDark ? AppColors.darkCardBackground : AppColors.grey200),
                    foregroundColor: hasSelection ? Colors.white : AppColors.grey500,
                    elevation: hasSelection ? 4 : 0,
                    shadowColor: AppColors.primaryGreen.withValues(alpha: 0.4),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28),
                    ),
                  ),
                  child: Text(
                    'next'.tr,
                    style: AppTextStyles.titleMedium.copyWith(
                      color: hasSelection ? Colors.white : AppColors.grey500,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
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

  Widget _buildErrorState(DataPackagesController controller, bool isDark) {
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
              controller.errorMessage.value,
              textAlign: TextAlign.center,
              style: AppTextStyles.bodyLarge.copyWith(
                color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
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
