// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CategoryImpl _$$CategoryImplFromJson(Map<String, dynamic> json) =>
    _$CategoryImpl(
      id: json['id'] as String,
      nameEn: json['nameEn'] as String,
      nameSo: json['nameSo'] as String,
      nameAr: json['nameAr'] as String,
      descriptionEn: json['descriptionEn'] as String,
      descriptionSo: json['descriptionSo'] as String,
      descriptionAr: json['descriptionAr'] as String,
      iconPath: json['iconPath'] as String,
      color: const ColorConverter().fromJson((json['color'] as num).toInt()),
      type: $enumDecode(_$CategoryTypeEnumMap, json['type']),
      isActive: json['isActive'] as bool? ?? true,
      productCount: (json['productCount'] as num?)?.toInt() ?? 0,
      imageUrl: json['imageUrl'] as String?,
      subcategories: (json['subcategories'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
    );

Map<String, dynamic> _$$CategoryImplToJson(_$CategoryImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'nameEn': instance.nameEn,
      'nameSo': instance.nameSo,
      'nameAr': instance.nameAr,
      'descriptionEn': instance.descriptionEn,
      'descriptionSo': instance.descriptionSo,
      'descriptionAr': instance.descriptionAr,
      'iconPath': instance.iconPath,
      'color': const ColorConverter().toJson(instance.color),
      'type': _$CategoryTypeEnumMap[instance.type]!,
      'isActive': instance.isActive,
      'productCount': instance.productCount,
      'imageUrl': instance.imageUrl,
      'subcategories': instance.subcategories,
    };

const _$CategoryTypeEnumMap = {
  CategoryType.internet: 'internet',
  CategoryType.gifts: 'gifts',
  CategoryType.electronics: 'electronics',
  CategoryType.mens: 'mens',
  CategoryType.womens: 'womens',
  CategoryType.kids: 'kids',
  CategoryType.cosmetics: 'cosmetics',
  CategoryType.goods: 'goods',
};
