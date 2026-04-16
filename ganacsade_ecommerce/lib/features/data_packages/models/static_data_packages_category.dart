import 'package:flutter/material.dart';
import '../../../shared/models/category.dart';
import '../data_packages_constants.dart';

/// Static Data Packages Category
/// This category is hardcoded and NOT fetched from the admin API
/// It has its own separate management system
class StaticDataPackagesCategory {
  /// Get the static Data Packages category
  static Category getCategory() {
    return Category(
      id: DataPackagesConstants.categoryId,
      nameEn: DataPackagesConstants.categoryNameEn,
      nameSo: DataPackagesConstants.categoryNameSo,
      nameAr: DataPackagesConstants.categoryNameAr,
      descriptionEn: DataPackagesConstants.descriptionEn,
      descriptionSo: DataPackagesConstants.descriptionSo,
      descriptionAr: DataPackagesConstants.descriptionAr,
      iconPath: DataPackagesConstants.iconPath,
      color: DataPackagesConstants.primaryColor,
      type: CategoryType.internet, // Using internet type for data packages
      isActive: DataPackagesConstants.isEnabled,
      productCount: 0, // Will be updated from separate API
      imageUrl: null, // Will use icon instead
    );
  }

  /// Check if a category ID belongs to the static Data Packages category
  static bool isDataPackagesCategory(String categoryId) {
    return categoryId == DataPackagesConstants.categoryId;
  }

  /// Get the icon for Data Packages category
  static IconData getCategoryIcon() {
    return DataPackagesConstants.categoryIcon;
  }

  /// Get the primary color for Data Packages category
  static Color getCategoryColor() {
    return DataPackagesConstants.primaryColor;
  }
}
