import 'package:flutter/material.dart';
import 'package:get/get.dart';

/// App Colors following G-Store branding and Somali cultural preferences
class AppColors {
  // Primary Brand Colors
  static const Color primaryGreen = Color(0xFF7EB725);
  static const Color primaryBlue = Color(0xFF133191);
  
  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryGreen, primaryBlue],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient reverseGradient = LinearGradient(
    colors: [primaryBlue, primaryGreen],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  // Semantic Colors
  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFF9800);
  static const Color error = Color(0xFFE53935);
  static const Color info = Color(0xFF2196F3);
  
  // Neutral Colors
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  static const Color grey50 = Color(0xFFFAFAFA);
  static const Color grey100 = Color(0xFFF5F5F5);
  static const Color grey200 = Color(0xFFEEEEEE);
  static const Color grey300 = Color(0xFFE0E0E0);
  static const Color grey400 = Color(0xFFBDBDBD);
  static const Color grey500 = Color(0xFF9E9E9E);
  static const Color grey600 = Color(0xFF757575);
  static const Color grey700 = Color(0xFF616161);
  static const Color grey800 = Color(0xFF424242);
  static const Color grey900 = Color(0xFF212121);
  
  // Cultural Colors (Islamic/Somali inspired)
  static const Color islamicGreen = Color(0xFF009639);
  static const Color crescentGold = Color(0xFFFFD700);
  static const Color desertSand = Color(0xFFF4E4BC);
  static const Color oceanBlue = Color(0xFF006994);
  
  // ============ LIGHT MODE COLORS ============
  // Background Colors (Light)
  static const Color scaffoldBackground = Color(0xFFF8F9FA);
  static const Color cardBackground = white;
  static const Color surfaceColor = white;
  
  // Text Colors (Light)
  static const Color textPrimary = grey900;
  static const Color textSecondary = grey600;
  static const Color textDisabled = grey400;
  static const Color textOnPrimary = white;
  
  // Border Colors (Light)
  static const Color borderLight = grey200;
  static const Color borderMedium = grey300;
  static const Color borderDark = grey400;
  
  // Shadow Colors
  static const Color shadowLight = Color(0x1A000000);
  static const Color shadowMedium = Color(0x33000000);
  static const Color shadowDark = Color(0x4D000000);
  
  // ============ DARK MODE COLORS ============
  // Background Colors (Dark)
  static const Color darkScaffoldBackground = Color(0xFF121212);
  static const Color darkCardBackground = Color(0xFF1E1E1E);
  static const Color darkSurfaceColor = Color(0xFF1E1E1E);
  static const Color darkElevatedSurface = Color(0xFF2C2C2C);
  
  // Text Colors (Dark)
  static const Color darkTextPrimary = Color(0xFFE1E1E1);
  static const Color darkTextSecondary = Color(0xFFB0B0B0);
  static const Color darkTextDisabled = Color(0xFF6B6B6B);
  
  // Border Colors (Dark)
  static const Color darkBorderLight = Color(0xFF2C2C2C);
  static const Color darkBorderMedium = Color(0xFF3D3D3D);
  static const Color darkBorderDark = Color(0xFF4D4D4D);
  
  // ============ ADAPTIVE COLORS ============
  /// Get adaptive background color based on current theme
  static Color get adaptiveBackground {
    return Get.isDarkMode ? darkScaffoldBackground : scaffoldBackground;
  }
  
  /// Get adaptive card background color
  static Color get adaptiveCardBackground {
    return Get.isDarkMode ? darkCardBackground : cardBackground;
  }
  
  /// Get adaptive surface color
  static Color get adaptiveSurface {
    return Get.isDarkMode ? darkSurfaceColor : surfaceColor;
  }
  
  /// Get adaptive text primary color
  static Color get adaptiveTextPrimary {
    return Get.isDarkMode ? darkTextPrimary : textPrimary;
  }
  
  /// Get adaptive text secondary color
  static Color get adaptiveTextSecondary {
    return Get.isDarkMode ? darkTextSecondary : textSecondary;
  }
  
  /// Get adaptive border color
  static Color get adaptiveBorder {
    return Get.isDarkMode ? darkBorderLight : borderLight;
  }
  
  /// Get adaptive grey50 equivalent
  static Color get adaptiveGrey50 {
    return Get.isDarkMode ? darkElevatedSurface : grey50;
  }
  
  /// Get adaptive grey100 equivalent
  static Color get adaptiveGrey100 {
    return Get.isDarkMode ? const Color(0xFF2A2A2A) : grey100;
  }
  
  // Category Colors (for 8 market categories)
  static const Color internetCategory = Color(0xFF133191);
  static const Color giftsCategory = Color(0xFFE91E63);
  static const Color electronicsCategory = Color(0xFF133191);
  static const Color mensCategory = Color(0xFF795548);
  static const Color womensCategory = Color(0xFF9C27B0);
  static const Color kidsCategory = Color(0xFFFF9800);
  static const Color cosmeticsCategory = Color(0xFFE91E63);
  static const Color goodsCategory = Color(0xFF7EB725);
  
  // Payment Method Colors
  static const Color waafiPayColor = Color(0xFF7EB725);
  static const Color edahabColor = Color(0xFF133191);
  static const Color premierWalletColor = Color(0xFF8E24AA);
  static const Color cashOnDeliveryColor = Color(0xFFFF6F00);
}
