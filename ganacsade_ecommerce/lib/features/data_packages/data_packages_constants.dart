import 'package:flutter/material.dart';

/// Static constants for the Data Packages category
/// This category is NOT managed from the admin dashboard
/// It has its own separate dashboard, database, and API
class DataPackagesConstants {
  // Category Information
  static const String categoryId = 'data_packages_static';
  static const String categoryNameEn = 'Internet Services';
  static const String categoryNameSo = 'Adeegyada Internetka';
  static const String categoryNameAr = 'خدمات الإنترنت';
  
  static const String descriptionEn = 'Mobile data packages and internet services';
  static const String descriptionSo = 'Xirmooyinka xogta gacanta iyo adeegyada internetka';
  static const String descriptionAr = 'باقات بيانات الهاتف المحمول وخدمات الإنترنت';
  
  // Brand Colors - GANACSADE themed
  static const Color primaryColor = Color(0xFF7EB725); // GANACSADE Green
  static const Color secondaryColor = Color(0xFF133191); // GANACSADE Blue
  static const Color accentColor = Color(0xFF133191); // Blue for data/internet theme
  
  // Category Icon
  static const IconData categoryIcon = Icons.sim_card;
  static const String iconPath = 'assets/icons/data_packages.svg';
  
  // API Configuration (separate from main API)
  // These will be configured when the backend is ready
  static const String apiBaseUrl = ''; // To be configured
  static const String apiEndpoint = '/data-packages';
  
  // Feature Flags
  static const bool isEnabled = true;
  static const bool isStatic = true; // Not managed from admin dashboard
  
  // Display Order (position in category list)
  static const int displayOrder = 0; // First position
}
