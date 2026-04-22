import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// App Text Styles with Arabic/Somali font support
class AppTextStyles {
  // Font Families
  static const String primaryFontFamily = 'Cairo';
  static const String arabicFontFamily = 'Amiri';
  
  // Display Styles
  static TextStyle get displayLarge => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 57,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
    height: 1.12,
  );
  
  static TextStyle get displayMedium => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 45,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
    height: 1.16,
  );
  
  static TextStyle get displaySmall => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 36,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
    height: 1.22,
  );
  
  // Headline Styles
  static TextStyle get headlineLarge => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 32,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
    height: 1.25,
  );
  
  static TextStyle get headlineMedium => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 28,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.29,
  );
  
  static TextStyle get headlineSmall => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 24,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.33,
  );
  
  // Title Styles
  static TextStyle get titleLarge => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 22,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.27,
  );
  
  static TextStyle get titleMedium => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.50,
  );
  
  static TextStyle get titleSmall => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.43,
  );
  
  // Label Styles
  static TextStyle get labelLarge => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
    height: 1.43,
  );
  
  static TextStyle get labelMedium => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
    height: 1.33,
  );
  
  static TextStyle get labelSmall => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 11,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
    height: 1.45,
  );
  
  // Body Styles
  static TextStyle get bodyLarge => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
    height: 1.50,
  );
  
  static TextStyle get bodyMedium => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
    height: 1.43,
  );
  
  static TextStyle get bodySmall => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.33,
  );
  
  // Custom App Styles
  static TextStyle get appBarTitle => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.textOnPrimary,
  );
  
  static TextStyle get buttonText => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textOnPrimary,
  );
  
  static TextStyle get priceText => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 18,
    fontWeight: FontWeight.w700,
    color: AppColors.primaryGreen,
  );
  
  static TextStyle get discountText => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.error,
    decoration: TextDecoration.lineThrough,
  );
  
  static TextStyle get categoryTitle => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );
  
  static TextStyle get productTitle => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
  );
  
  static TextStyle get productDescription => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.4,
  );
  
  // Arabic/Somali specific styles
  static TextStyle get arabicHeading => GoogleFonts.getFont(
    arabicFontFamily,
    fontSize: 24,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
    height: 1.5,
  );
  
  static TextStyle get arabicBody => GoogleFonts.getFont(
    arabicFontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
    height: 1.6,
  );
  
  // Cultural/Religious text styles
  static TextStyle get islamicText => GoogleFonts.getFont(
    arabicFontFamily,
    fontSize: 18,
    fontWeight: FontWeight.w500,
    color: AppColors.islamicGreen,
  );
  
  // Error and validation styles
  static TextStyle get errorText => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.error,
  );
  
  static TextStyle get successText => GoogleFonts.getFont(
    primaryFontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.success,
  );
  
  // Helper methods for RTL support
  static TextStyle withRTL(TextStyle style) {
    return GoogleFonts.getFont(
      arabicFontFamily,
      textStyle: style,
    );
  }
  
  static TextStyle withColor(TextStyle style, Color color) {
    return style.copyWith(color: color);
  }
  
  static TextStyle withWeight(TextStyle style, FontWeight weight) {
    return style.copyWith(fontWeight: weight);
  }
}
