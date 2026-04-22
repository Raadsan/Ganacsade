import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../controllers/home_controller.dart';

class PromotionalBannerWidget extends StatelessWidget {
  final PromotionalBanner banner;
  final VoidCallback? onTap;

  const PromotionalBannerWidget({super.key, required this.banner, this.onTap});

  @override
  Widget build(BuildContext context) {
    final bool hasNetworkImage = banner.imageUrl.startsWith('http');

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: banner.backgroundColor.withOpacity(0.3),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            children: [
              // Background - either network image or gradient
              if (hasNetworkImage)
                Positioned.fill(
                  child: Image.network(
                    banner.imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return _buildGradientBackground();
                    },
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return _buildGradientBackground(
                        child: Center(
                          child: CircularProgressIndicator(
                            value: loadingProgress.expectedTotalBytes != null
                                ? loadingProgress.cumulativeBytesLoaded /
                                      loadingProgress.expectedTotalBytes!
                                : null,
                            color: AppColors.white,
                            strokeWidth: 2,
                          ),
                        ),
                      );
                    },
                  ),
                )
              else
                Positioned.fill(child: _buildGradientBackground()),

              // Dark overlay for better text readability on images
              if (hasNetworkImage)
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.black.withOpacity(0.5),
                          Colors.black.withOpacity(0.2),
                        ],
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                    ),
                  ),
                ),

              // Decorative circles (only show on gradient background)
              if (!hasNetworkImage) ...[
                Positioned(
                  right: -20,
                  top: -20,
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: AppColors.white.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
                Positioned(
                  right: 20,
                  bottom: -30,
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: AppColors.white.withOpacity(0.05),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],

              // Content
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                          banner.title,
                          style: AppTextStyles.headlineSmall.copyWith(
                            color: AppColors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        )
                        .animate()
                        .fadeIn(delay: 200.ms, duration: 600.ms)
                        .slideX(begin: -0.3, end: 0),

                    const SizedBox(height: 8),

                    if (banner.subtitle.isNotEmpty)
                      Text(
                            banner.subtitle,
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.white.withOpacity(0.9),
                            ),
                          )
                          .animate()
                          .fadeIn(delay: 600.ms, duration: 600.ms)
                          .slideX(begin: -0.2, end: 0),

                    const SizedBox(height: 16),

                    Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: AppColors.white.withOpacity(0.3),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Shop Now',
                                style: AppTextStyles.labelMedium.copyWith(
                                  color: AppColors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Icon(
                                Icons.arrow_forward,
                                color: AppColors.white,
                                size: 16,
                              ),
                            ],
                          ),
                        )
                        .animate()
                        .fadeIn(delay: 600.ms, duration: 600.ms)
                        .scaleXY(begin: 0.8, end: 1.0),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGradientBackground({Widget? child}) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            banner.backgroundColor,
            banner.backgroundColor.withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: child,
    );
  }
}
