import 'package:flutter/material.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import '../../core/utils/color_converter.dart';

part 'category.freezed.dart';
part 'category.g.dart';

/// Market Category Model for G-Store
@freezed
class Category with _$Category {
  const factory Category({
    required String id,
    required String nameEn,
    required String nameSo,
    required String nameAr,
    required String descriptionEn,
    required String descriptionSo,
    required String descriptionAr,
    required String iconPath,
    @ColorConverter() required Color color,
    required CategoryType type,
    @Default(true) bool isActive,
    @Default(0) int productCount,
    String? imageUrl,
    List<String>? subcategories,
  }) = _Category;

  factory Category.fromJson(Map<String, dynamic> json) => _$CategoryFromJson(json);
}


/// 8 Market Categories as per Somali E-commerce requirements
enum CategoryType {
  @JsonValue('internet')
  internet,
  @JsonValue('gifts')
  gifts,
  @JsonValue('electronics')
  electronics,
  @JsonValue('mens')
  mens,
  @JsonValue('womens')
  womens,
  @JsonValue('kids')
  kids,
  @JsonValue('cosmetics')
  cosmetics,
  @JsonValue('goods')
  goods,
}

/// Category Extensions for easy access
extension CategoryTypeExtension on CategoryType {
  String get displayName {
    switch (this) {
      case CategoryType.internet:
        return 'Internet Services';
      case CategoryType.gifts:
        return 'Gifts Market';
      case CategoryType.electronics:
        return 'Electronics';
      case CategoryType.mens:
        return "Men's Market";
      case CategoryType.womens:
        return "Women's Market";
      case CategoryType.kids:
        return 'Kids Market';
      case CategoryType.cosmetics:
        return 'Cosmetics';
      case CategoryType.goods:
        return 'General Goods';
    }
  }

  String get displayNameSomali {
    switch (this) {
      case CategoryType.internet:
        return 'Adeegyada Internetka';
      case CategoryType.gifts:
        return 'Suuqa Hadiyadaha';
      case CategoryType.electronics:
        return 'Qalabka Elektarooniga ah';
      case CategoryType.mens:
        return 'Suuqa Ragga';
      case CategoryType.womens:
        return 'Suuqa Haweenka';
      case CategoryType.kids:
        return 'Suuqa Carruurta';
      case CategoryType.cosmetics:
        return 'Quruxda';
      case CategoryType.goods:
        return 'Alaabta Guud';
    }
  }

  String get displayNameArabic {
    switch (this) {
      case CategoryType.internet:
        return 'خدمات الإنترنت';
      case CategoryType.gifts:
        return 'سوق الهدايا';
      case CategoryType.electronics:
        return 'الإلكترونيات';
      case CategoryType.mens:
        return 'سوق الرجال';
      case CategoryType.womens:
        return 'سوق النساء';
      case CategoryType.kids:
        return 'سوق الأطفال';
      case CategoryType.cosmetics:
        return 'مستحضرات التجميل';
      case CategoryType.goods:
        return 'البضائع العامة';
    }
  }

  Color get color {
    switch (this) {
      case CategoryType.internet:
        return const Color(0xFF3F51B5);
      case CategoryType.gifts:
        return const Color(0xFFE91E63);
      case CategoryType.electronics:
        return const Color(0xFF2196F3);
      case CategoryType.mens:
        return const Color(0xFF795548);
      case CategoryType.womens:
        return const Color(0xFF9C27B0);
      case CategoryType.kids:
        return const Color(0xFFFF9800);
      case CategoryType.cosmetics:
        return const Color(0xFFE91E63);
      case CategoryType.goods:
        return const Color(0xFF4CAF50);
    }
  }

  String get iconPath {
    switch (this) {
      case CategoryType.internet:
        return 'assets/icons/internet.svg';
      case CategoryType.gifts:
        return 'assets/icons/gifts.svg';
      case CategoryType.electronics:
        return 'assets/icons/electronics.svg';
      case CategoryType.mens:
        return 'assets/icons/mens.svg';
      case CategoryType.womens:
        return 'assets/icons/womens.svg';
      case CategoryType.kids:
        return 'assets/icons/kids.svg';
      case CategoryType.cosmetics:
        return 'assets/icons/cosmetics.svg';
      case CategoryType.goods:
        return 'assets/icons/goods.svg';
    }
  }
}
