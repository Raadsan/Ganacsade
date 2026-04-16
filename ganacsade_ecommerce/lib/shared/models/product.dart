import 'package:freezed_annotation/freezed_annotation.dart';

part 'product.freezed.dart';
part 'product.g.dart';

/// Product Model for G-Store
@freezed
class Product with _$Product {
  const factory Product({
    required String id,
    @JsonKey(name: 'name_en') required String name,
    @JsonKey(name: 'name_ar') required String nameAr,
    @JsonKey(name: 'name_so') required String nameSo,
    @JsonKey(name: 'description_en') required String description,
    @JsonKey(name: 'description_ar') required String descriptionAr,
    @JsonKey(name: 'description_so') required String descriptionSo,
    @JsonKey(fromJson: _priceFromJson) required double price,
    @JsonKey(name: 'category_id') required String categoryId,
    @JsonKey(fromJson: _imagesFromJson) required List<String> images,
    @JsonKey(name: 'discount_price', fromJson: _discountPriceFromJson) @Default(0) double discountPrice,
    @JsonKey(fromJson: _ratingFromJson) @Default(0) double rating,
    @JsonKey(name: 'review_count', fromJson: _reviewCountFromJson) @Default(0) int reviewCount,
    @JsonKey(name: 'in_stock') @Default(true) bool inStock,
    @JsonKey(name: 'stock_quantity') @Default(0) int stockQuantity,
    @JsonKey(fromJson: _stringFromJson) @Default('') String brand,
    @Default('') String sku,
    @JsonKey(fromJson: _tagsFromJson) @Default([]) List<String> tags,
    @Default([]) List<ProductVariant> variants,
    @Default(ProductStatus.active) ProductStatus status,
    @JsonKey(name: 'is_featured') @Default(false) bool isFeatured,
    @JsonKey(name: 'is_halal') @Default(false) bool isHalal,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    Map<String, dynamic>? metadata,
  }) = _Product;

  factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);
}

// Helper functions for parsing nullable fields
double _priceFromJson(dynamic json) {
  if (json == null) return 0;
  if (json is num) return json.toDouble();
  if (json is String) return double.tryParse(json) ?? 0;
  return 0;
}

List<String> _imagesFromJson(dynamic json) {
  if (json == null) return [];
  if (json is List) {
    return json.map((e) => e.toString()).toList();
  }
  return [];
}

double _discountPriceFromJson(dynamic json) {
  if (json == null) return 0;
  if (json is num) return json.toDouble();
  if (json is String) return double.tryParse(json) ?? 0;
  return 0;
}

double _ratingFromJson(dynamic json) {
  if (json == null) return 0;
  if (json is num) return json.toDouble();
  if (json is String) return double.tryParse(json) ?? 0;
  return 0;
}

int _reviewCountFromJson(dynamic json) {
  if (json == null) return 0;
  if (json is num) return json.toInt();
  if (json is String) return int.tryParse(json) ?? 0;
  return 0;
}

String _stringFromJson(dynamic json) {
  if (json == null) return '';
  return json.toString();
}

List<String> _tagsFromJson(dynamic json) {
  if (json == null) return [];
  if (json is List) {
    return json.map((e) => e.toString()).toList();
  }
  return [];
}

/// Product Variant for different options (size, color, etc.)
@freezed
class ProductVariant with _$ProductVariant {
  const factory ProductVariant({
    required String id,
    required String name,
    required String nameAr,
    required String nameSo,
    required double price,
    @Default(0) double discountPrice,
    @Default(true) bool inStock,
    @Default(0) int stockQuantity,
    @Default('') String sku,
    Map<String, String>? attributes, // color, size, etc.
  }) = _ProductVariant;

  factory ProductVariant.fromJson(Map<String, dynamic> json) => _$ProductVariantFromJson(json);
}

/// Product Status
enum ProductStatus {
  @JsonValue('active')
  active,
  @JsonValue('inactive')
  inactive,
  @JsonValue('draft')
  draft,
  @JsonValue('archived')
  archived,
}

/// Product Extensions
extension ProductExtension on Product {
  double get finalPrice => discountPrice > 0 ? discountPrice : price;
  
  bool get hasDiscount => discountPrice > 0 && discountPrice < price;
  
  double get discountPercentage {
    if (!hasDiscount) return 0;
    return ((price - discountPrice) / price * 100);
  }
  
  String get mainImage => images.isNotEmpty ? images.first : '';
  String get imageUrl => mainImage; // Alias for compatibility
  
  bool get isAvailable => inStock && status == ProductStatus.active;
  
  // Category name - will be populated from categoryId lookup
  String get category => categoryId;
  
  // Original price for discount display
  double? get originalPrice => hasDiscount ? price : null;
}
