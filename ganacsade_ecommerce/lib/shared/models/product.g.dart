// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ProductImpl _$$ProductImplFromJson(Map<String, dynamic> json) =>
    _$ProductImpl(
      id: json['id'] as String,
      name: json['name_en'] as String,
      nameAr: json['name_ar'] as String,
      nameSo: json['name_so'] as String,
      description: json['description_en'] as String,
      descriptionAr: json['description_ar'] as String,
      descriptionSo: json['description_so'] as String,
      price: _priceFromJson(json['price']),
      categoryId: json['category_id'] as String,
      images: _imagesFromJson(json['images']),
      discountPrice: json['discount_price'] == null
          ? 0
          : _discountPriceFromJson(json['discount_price']),
      rating: json['rating'] == null ? 0 : _ratingFromJson(json['rating']),
      reviewCount: json['review_count'] == null
          ? 0
          : _reviewCountFromJson(json['review_count']),
      inStock: json['in_stock'] as bool? ?? true,
      stockQuantity: (json['stock_quantity'] as num?)?.toInt() ?? 0,
      brand: json['brand'] == null ? '' : _stringFromJson(json['brand']),
      sku: json['sku'] as String? ?? '',
      tags: json['tags'] == null ? const [] : _tagsFromJson(json['tags']),
      variants: (json['variants'] as List<dynamic>?)
              ?.map((e) => ProductVariant.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      status: $enumDecodeNullable(_$ProductStatusEnumMap, json['status']) ??
          ProductStatus.active,
      isFeatured: json['is_featured'] as bool? ?? false,
      isHalal: json['is_halal'] as bool? ?? false,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$ProductImplToJson(_$ProductImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name_en': instance.name,
      'name_ar': instance.nameAr,
      'name_so': instance.nameSo,
      'description_en': instance.description,
      'description_ar': instance.descriptionAr,
      'description_so': instance.descriptionSo,
      'price': instance.price,
      'category_id': instance.categoryId,
      'images': instance.images,
      'discount_price': instance.discountPrice,
      'rating': instance.rating,
      'review_count': instance.reviewCount,
      'in_stock': instance.inStock,
      'stock_quantity': instance.stockQuantity,
      'brand': instance.brand,
      'sku': instance.sku,
      'tags': instance.tags,
      'variants': instance.variants,
      'status': _$ProductStatusEnumMap[instance.status]!,
      'is_featured': instance.isFeatured,
      'is_halal': instance.isHalal,
      'created_at': instance.createdAt?.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
      'metadata': instance.metadata,
    };

const _$ProductStatusEnumMap = {
  ProductStatus.active: 'active',
  ProductStatus.inactive: 'inactive',
  ProductStatus.draft: 'draft',
  ProductStatus.archived: 'archived',
};

_$ProductVariantImpl _$$ProductVariantImplFromJson(Map<String, dynamic> json) =>
    _$ProductVariantImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      nameAr: json['nameAr'] as String,
      nameSo: json['nameSo'] as String,
      price: (json['price'] as num).toDouble(),
      discountPrice: (json['discountPrice'] as num?)?.toDouble() ?? 0,
      inStock: json['inStock'] as bool? ?? true,
      stockQuantity: (json['stockQuantity'] as num?)?.toInt() ?? 0,
      sku: json['sku'] as String? ?? '',
      attributes: (json['attributes'] as Map<String, dynamic>?)?.map(
        (k, e) => MapEntry(k, e as String),
      ),
    );

Map<String, dynamic> _$$ProductVariantImplToJson(
        _$ProductVariantImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'nameAr': instance.nameAr,
      'nameSo': instance.nameSo,
      'price': instance.price,
      'discountPrice': instance.discountPrice,
      'inStock': instance.inStock,
      'stockQuantity': instance.stockQuantity,
      'sku': instance.sku,
      'attributes': instance.attributes,
    };
