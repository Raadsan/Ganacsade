import 'package:flutter/material.dart';
import 'app_colors.dart';

/// App Text Styles with Arabic/Somali font support
class AppTextStyles {
  // Font Families
  static const String primaryFontFamily = 'Cairo';
  static const String arabicFontFamily = 'Amiri';
  
  // Display Styles
  static const TextStyle displayLarge = TextStyle(
    fontSize: 57,
    fontWeight: FontWeight.w400,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
    height: 1.12,
  );
  
  static const TextStyle displayMedium = TextStyle(
    fontSize: 45,
    fontWeight: FontWeight.w400,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
    height: 1.16,
  );
  
  static const TextStyle displaySmall = TextStyle(
    fontSize: 36,
    fontWeight: FontWeight.w400,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
    height: 1.22,
  );
  
  // Headline Styles
  static const TextStyle headlineLarge = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.w700,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
    height: 1.25,
  );
  
  static const TextStyle headlineMedium = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w600,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
    height: 1.29,
  );
  
  static const TextStyle headlineSmall = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
    height: 1.33,
  );
  
  // Title Styles
  static const TextStyle titleLarge = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w600,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
    height: 1.27,
  );
  
  static const TextStyle titleMedium = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
    height: 1.50,
  );
  
  static const TextStyle titleSmall = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
    height: 1.43,
  );
  
  // Label Styles
  static const TextStyle labelLarge = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
    height: 1.43,
  );
  
  static const TextStyle labelMedium = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
    height: 1.33,
  );
  
  static const TextStyle labelSmall = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w500,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
    height: 1.45,
  );
  
  // Body Styles
  static const TextStyle bodyLarge = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
    height: 1.50,
  );
  
  static const TextStyle bodyMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
    height: 1.43,
  );
  
  static const TextStyle bodySmall = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    fontFamily: primaryFontFamily,
    color: AppColors.textSecondary,
    height: 1.33,
  );
  
  // Custom App Styles
  static const TextStyle appBarTitle = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    fontFamily: primaryFontFamily,
    color: AppColors.textOnPrimary,
  );
  
  static const TextStyle buttonText = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    fontFamily: primaryFontFamily,
    color: AppColors.textOnPrimary,
  );
  
  static const TextStyle priceText = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w700,
    fontFamily: primaryFontFamily,
    color: AppColors.primaryGreen,
  );
  
  static const TextStyle discountText = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    fontFamily: primaryFontFamily,
    color: AppColors.error,
    decoration: TextDecoration.lineThrough,
  );
  
  static const TextStyle categoryTitle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
  );
  
  static const TextStyle productTitle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    fontFamily: primaryFontFamily,
    color: AppColors.textPrimary,
  );
  
  static const TextStyle productDescription = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    fontFamily: primaryFontFamily,
    color: AppColors.textSecondary,
    height: 1.4,
  );
  
  // Arabic/Somali specific styles
  static const TextStyle arabicHeading = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    fontFamily: arabicFontFamily,
    color: AppColors.textPrimary,
    height: 1.5,
  );
  
  static const TextStyle arabicBody = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    fontFamily: arabicFontFamily,
    color: AppColors.textPrimary,
    height: 1.6,
  );
  
  // Cultural/Religious text styles
  static const TextStyle islamicText = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w500,
    fontFamily: arabicFontFamily,
    color: AppColors.islamicGreen,
  );
  
  // Error and validation styles
  static const TextStyle errorText = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    fontFamily: primaryFontFamily,
    color: AppColors.error,
  );
  
  static const TextStyle successText = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    fontFamily: primaryFontFamily,
    color: AppColors.success,
  );
  
  // Helper methods for RTL support
  static TextStyle withRTL(TextStyle style) {
    return style.copyWith(
      fontFamily: arabicFontFamily,
    );
  }
  
  static TextStyle withColor(TextStyle style, Color color) {
    return style.copyWith(color: color);
  }
  
  static TextStyle withWeight(TextStyle style, FontWeight weight) {
    return style.copyWith(fontWeight: weight);
  }
}
