// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'product.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Product _$ProductFromJson(Map<String, dynamic> json) {
  return _Product.fromJson(json);
}

/// @nodoc
mixin _$Product {
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'name_en')
  String get name => throw _privateConstructorUsedError;
  @JsonKey(name: 'name_ar')
  String get nameAr => throw _privateConstructorUsedError;
  @JsonKey(name: 'name_so')
  String get nameSo => throw _privateConstructorUsedError;
  @JsonKey(name: 'description_en')
  String get description => throw _privateConstructorUsedError;
  @JsonKey(name: 'description_ar')
  String get descriptionAr => throw _privateConstructorUsedError;
  @JsonKey(name: 'description_so')
  String get descriptionSo => throw _privateConstructorUsedError;
  @JsonKey(fromJson: _priceFromJson)
  double get price => throw _privateConstructorUsedError;
  @JsonKey(name: 'category_id')
  String get categoryId => throw _privateConstructorUsedError;
  @JsonKey(fromJson: _imagesFromJson)
  List<String> get images => throw _privateConstructorUsedError;
  @JsonKey(name: 'discount_price', fromJson: _discountPriceFromJson)
  double get discountPrice => throw _privateConstructorUsedError;
  @JsonKey(fromJson: _ratingFromJson)
  double get rating => throw _privateConstructorUsedError;
  @JsonKey(name: 'review_count', fromJson: _reviewCountFromJson)
  int get reviewCount => throw _privateConstructorUsedError;
  @JsonKey(name: 'in_stock')
  bool get inStock => throw _privateConstructorUsedError;
  @JsonKey(name: 'stock_quantity')
  int get stockQuantity => throw _privateConstructorUsedError;
  @JsonKey(fromJson: _stringFromJson)
  String get brand => throw _privateConstructorUsedError;
  String get sku => throw _privateConstructorUsedError;
  @JsonKey(fromJson: _tagsFromJson)
  List<String> get tags => throw _privateConstructorUsedError;
  List<ProductVariant> get variants => throw _privateConstructorUsedError;
  ProductStatus get status => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_featured')
  bool get isFeatured => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_halal')
  bool get isHalal => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime? get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'updated_at')
  DateTime? get updatedAt => throw _privateConstructorUsedError;
  Map<String, dynamic>? get metadata => throw _privateConstructorUsedError;

  /// Serializes this Product to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Product
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ProductCopyWith<Product> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ProductCopyWith<$Res> {
  factory $ProductCopyWith(Product value, $Res Function(Product) then) =
      _$ProductCopyWithImpl<$Res, Product>;
  @useResult
  $Res call(
      {String id,
      @JsonKey(name: 'name_en') String name,
      @JsonKey(name: 'name_ar') String nameAr,
      @JsonKey(name: 'name_so') String nameSo,
      @JsonKey(name: 'description_en') String description,
      @JsonKey(name: 'description_ar') String descriptionAr,
      @JsonKey(name: 'description_so') String descriptionSo,
      @JsonKey(fromJson: _priceFromJson) double price,
      @JsonKey(name: 'category_id') String categoryId,
      @JsonKey(fromJson: _imagesFromJson) List<String> images,
      @JsonKey(name: 'discount_price', fromJson: _discountPriceFromJson)
      double discountPrice,
      @JsonKey(fromJson: _ratingFromJson) double rating,
      @JsonKey(name: 'review_count', fromJson: _reviewCountFromJson)
      int reviewCount,
      @JsonKey(name: 'in_stock') bool inStock,
      @JsonKey(name: 'stock_quantity') int stockQuantity,
      @JsonKey(fromJson: _stringFromJson) String brand,
      String sku,
      @JsonKey(fromJson: _tagsFromJson) List<String> tags,
      List<ProductVariant> variants,
      ProductStatus status,
      @JsonKey(name: 'is_featured') bool isFeatured,
      @JsonKey(name: 'is_halal') bool isHalal,
      @JsonKey(name: 'created_at') DateTime? createdAt,
      @JsonKey(name: 'updated_at') DateTime? updatedAt,
      Map<String, dynamic>? metadata});
}

/// @nodoc
class _$ProductCopyWithImpl<$Res, $Val extends Product>
    implements $ProductCopyWith<$Res> {
  _$ProductCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Product
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? nameAr = null,
    Object? nameSo = null,
    Object? description = null,
    Object? descriptionAr = null,
    Object? descriptionSo = null,
    Object? price = null,
    Object? categoryId = null,
    Object? images = null,
    Object? discountPrice = null,
    Object? rating = null,
    Object? reviewCount = null,
    Object? inStock = null,
    Object? stockQuantity = null,
    Object? brand = null,
    Object? sku = null,
    Object? tags = null,
    Object? variants = null,
    Object? status = null,
    Object? isFeatured = null,
    Object? isHalal = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? metadata = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      nameAr: null == nameAr
          ? _value.nameAr
          : nameAr // ignore: cast_nullable_to_non_nullable
              as String,
      nameSo: null == nameSo
          ? _value.nameSo
          : nameSo // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      descriptionAr: null == descriptionAr
          ? _value.descriptionAr
          : descriptionAr // ignore: cast_nullable_to_non_nullable
              as String,
      descriptionSo: null == descriptionSo
          ? _value.descriptionSo
          : descriptionSo // ignore: cast_nullable_to_non_nullable
              as String,
      price: null == price
          ? _value.price
          : price // ignore: cast_nullable_to_non_nullable
              as double,
      categoryId: null == categoryId
          ? _value.categoryId
          : categoryId // ignore: cast_nullable_to_non_nullable
              as String,
      images: null == images
          ? _value.images
          : images // ignore: cast_nullable_to_non_nullable
              as List<String>,
      discountPrice: null == discountPrice
          ? _value.discountPrice
          : discountPrice // ignore: cast_nullable_to_non_nullable
              as double,
      rating: null == rating
          ? _value.rating
          : rating // ignore: cast_nullable_to_non_nullable
              as double,
      reviewCount: null == reviewCount
          ? _value.reviewCount
          : reviewCount // ignore: cast_nullable_to_non_nullable
              as int,
      inStock: null == inStock
          ? _value.inStock
          : inStock // ignore: cast_nullable_to_non_nullable
              as bool,
      stockQuantity: null == stockQuantity
          ? _value.stockQuantity
          : stockQuantity // ignore: cast_nullable_to_non_nullable
              as int,
      brand: null == brand
          ? _value.brand
          : brand // ignore: cast_nullable_to_non_nullable
              as String,
      sku: null == sku
          ? _value.sku
          : sku // ignore: cast_nullable_to_non_nullable
              as String,
      tags: null == tags
          ? _value.tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>,
      variants: null == variants
          ? _value.variants
          : variants // ignore: cast_nullable_to_non_nullable
              as List<ProductVariant>,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as ProductStatus,
      isFeatured: null == isFeatured
          ? _value.isFeatured
          : isFeatured // ignore: cast_nullable_to_non_nullable
              as bool,
      isHalal: null == isHalal
          ? _value.isHalal
          : isHalal // ignore: cast_nullable_to_non_nullable
              as bool,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      metadata: freezed == metadata
          ? _value.metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ProductImplCopyWith<$Res> implements $ProductCopyWith<$Res> {
  factory _$$ProductImplCopyWith(
          _$ProductImpl value, $Res Function(_$ProductImpl) then) =
      __$$ProductImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      @JsonKey(name: 'name_en') String name,
      @JsonKey(name: 'name_ar') String nameAr,
      @JsonKey(name: 'name_so') String nameSo,
      @JsonKey(name: 'description_en') String description,
      @JsonKey(name: 'description_ar') String descriptionAr,
      @JsonKey(name: 'description_so') String descriptionSo,
      @JsonKey(fromJson: _priceFromJson) double price,
      @JsonKey(name: 'category_id') String categoryId,
      @JsonKey(fromJson: _imagesFromJson) List<String> images,
      @JsonKey(name: 'discount_price', fromJson: _discountPriceFromJson)
      double discountPrice,
      @JsonKey(fromJson: _ratingFromJson) double rating,
      @JsonKey(name: 'review_count', fromJson: _reviewCountFromJson)
      int reviewCount,
      @JsonKey(name: 'in_stock') bool inStock,
      @JsonKey(name: 'stock_quantity') int stockQuantity,
      @JsonKey(fromJson: _stringFromJson) String brand,
      String sku,
      @JsonKey(fromJson: _tagsFromJson) List<String> tags,
      List<ProductVariant> variants,
      ProductStatus status,
      @JsonKey(name: 'is_featured') bool isFeatured,
      @JsonKey(name: 'is_halal') bool isHalal,
      @JsonKey(name: 'created_at') DateTime? createdAt,
      @JsonKey(name: 'updated_at') DateTime? updatedAt,
      Map<String, dynamic>? metadata});
}

/// @nodoc
class __$$ProductImplCopyWithImpl<$Res>
    extends _$ProductCopyWithImpl<$Res, _$ProductImpl>
    implements _$$ProductImplCopyWith<$Res> {
  __$$ProductImplCopyWithImpl(
      _$ProductImpl _value, $Res Function(_$ProductImpl) _then)
      : super(_value, _then);

  /// Create a copy of Product
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? nameAr = null,
    Object? nameSo = null,
    Object? description = null,
    Object? descriptionAr = null,
    Object? descriptionSo = null,
    Object? price = null,
    Object? categoryId = null,
    Object? images = null,
    Object? discountPrice = null,
    Object? rating = null,
    Object? reviewCount = null,
    Object? inStock = null,
    Object? stockQuantity = null,
    Object? brand = null,
    Object? sku = null,
    Object? tags = null,
    Object? variants = null,
    Object? status = null,
    Object? isFeatured = null,
    Object? isHalal = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? metadata = freezed,
  }) {
    return _then(_$ProductImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      nameAr: null == nameAr
          ? _value.nameAr
          : nameAr // ignore: cast_nullable_to_non_nullable
              as String,
      nameSo: null == nameSo
          ? _value.nameSo
          : nameSo // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      descriptionAr: null == descriptionAr
          ? _value.descriptionAr
          : descriptionAr // ignore: cast_nullable_to_non_nullable
              as String,
      descriptionSo: null == descriptionSo
          ? _value.descriptionSo
          : descriptionSo // ignore: cast_nullable_to_non_nullable
              as String,
      price: null == price
          ? _value.price
          : price // ignore: cast_nullable_to_non_nullable
              as double,
      categoryId: null == categoryId
          ? _value.categoryId
          : categoryId // ignore: cast_nullable_to_non_nullable
              as String,
      images: null == images
          ? _value._images
          : images // ignore: cast_nullable_to_non_nullable
              as List<String>,
      discountPrice: null == discountPrice
          ? _value.discountPrice
          : discountPrice // ignore: cast_nullable_to_non_nullable
              as double,
      rating: null == rating
          ? _value.rating
          : rating // ignore: cast_nullable_to_non_nullable
              as double,
      reviewCount: null == reviewCount
          ? _value.reviewCount
          : reviewCount // ignore: cast_nullable_to_non_nullable
              as int,
      inStock: null == inStock
          ? _value.inStock
          : inStock // ignore: cast_nullable_to_non_nullable
              as bool,
      stockQuantity: null == stockQuantity
          ? _value.stockQuantity
          : stockQuantity // ignore: cast_nullable_to_non_nullable
              as int,
      brand: null == brand
          ? _value.brand
          : brand // ignore: cast_nullable_to_non_nullable
              as String,
      sku: null == sku
          ? _value.sku
          : sku // ignore: cast_nullable_to_non_nullable
              as String,
      tags: null == tags
          ? _value._tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>,
      variants: null == variants
          ? _value._variants
          : variants // ignore: cast_nullable_to_non_nullable
              as List<ProductVariant>,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as ProductStatus,
      isFeatured: null == isFeatured
          ? _value.isFeatured
          : isFeatured // ignore: cast_nullable_to_non_nullable
              as bool,
      isHalal: null == isHalal
          ? _value.isHalal
          : isHalal // ignore: cast_nullable_to_non_nullable
              as bool,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      metadata: freezed == metadata
          ? _value._metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ProductImpl implements _Product {
  const _$ProductImpl(
      {required this.id,
      @JsonKey(name: 'name_en') required this.name,
      @JsonKey(name: 'name_ar') required this.nameAr,
      @JsonKey(name: 'name_so') required this.nameSo,
      @JsonKey(name: 'description_en') required this.description,
      @JsonKey(name: 'description_ar') required this.descriptionAr,
      @JsonKey(name: 'description_so') required this.descriptionSo,
      @JsonKey(fromJson: _priceFromJson) required this.price,
      @JsonKey(name: 'category_id') required this.categoryId,
      @JsonKey(fromJson: _imagesFromJson) required final List<String> images,
      @JsonKey(name: 'discount_price', fromJson: _discountPriceFromJson)
      this.discountPrice = 0,
      @JsonKey(fromJson: _ratingFromJson) this.rating = 0,
      @JsonKey(name: 'review_count', fromJson: _reviewCountFromJson)
      this.reviewCount = 0,
      @JsonKey(name: 'in_stock') this.inStock = true,
      @JsonKey(name: 'stock_quantity') this.stockQuantity = 0,
      @JsonKey(fromJson: _stringFromJson) this.brand = '',
      this.sku = '',
      @JsonKey(fromJson: _tagsFromJson) final List<String> tags = const [],
      final List<ProductVariant> variants = const [],
      this.status = ProductStatus.active,
      @JsonKey(name: 'is_featured') this.isFeatured = false,
      @JsonKey(name: 'is_halal') this.isHalal = false,
      @JsonKey(name: 'created_at') this.createdAt,
      @JsonKey(name: 'updated_at') this.updatedAt,
      final Map<String, dynamic>? metadata})
      : _images = images,
        _tags = tags,
        _variants = variants,
        _metadata = metadata;

  factory _$ProductImpl.fromJson(Map<String, dynamic> json) =>
      _$$ProductImplFromJson(json);

  @override
  final String id;
  @override
  @JsonKey(name: 'name_en')
  final String name;
  @override
  @JsonKey(name: 'name_ar')
  final String nameAr;
  @override
  @JsonKey(name: 'name_so')
  final String nameSo;
  @override
  @JsonKey(name: 'description_en')
  final String description;
  @override
  @JsonKey(name: 'description_ar')
  final String descriptionAr;
  @override
  @JsonKey(name: 'description_so')
  final String descriptionSo;
  @override
  @JsonKey(fromJson: _priceFromJson)
  final double price;
  @override
  @JsonKey(name: 'category_id')
  final String categoryId;
  final List<String> _images;
  @override
  @JsonKey(fromJson: _imagesFromJson)
  List<String> get images {
    if (_images is EqualUnmodifiableListView) return _images;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_images);
  }

  @override
  @JsonKey(name: 'discount_price', fromJson: _discountPriceFromJson)
  final double discountPrice;
  @override
  @JsonKey(fromJson: _ratingFromJson)
  final double rating;
  @override
  @JsonKey(name: 'review_count', fromJson: _reviewCountFromJson)
  final int reviewCount;
  @override
  @JsonKey(name: 'in_stock')
  final bool inStock;
  @override
  @JsonKey(name: 'stock_quantity')
  final int stockQuantity;
  @override
  @JsonKey(fromJson: _stringFromJson)
  final String brand;
  @override
  @JsonKey()
  final String sku;
  final List<String> _tags;
  @override
  @JsonKey(fromJson: _tagsFromJson)
  List<String> get tags {
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_tags);
  }

  final List<ProductVariant> _variants;
  @override
  @JsonKey()
  List<ProductVariant> get variants {
    if (_variants is EqualUnmodifiableListView) return _variants;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_variants);
  }

  @override
  @JsonKey()
  final ProductStatus status;
  @override
  @JsonKey(name: 'is_featured')
  final bool isFeatured;
  @override
  @JsonKey(name: 'is_halal')
  final bool isHalal;
  @override
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  @override
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;
  final Map<String, dynamic>? _metadata;
  @override
  Map<String, dynamic>? get metadata {
    final value = _metadata;
    if (value == null) return null;
    if (_metadata is EqualUnmodifiableMapView) return _metadata;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  String toString() {
    return 'Product(id: $id, name: $name, nameAr: $nameAr, nameSo: $nameSo, description: $description, descriptionAr: $descriptionAr, descriptionSo: $descriptionSo, price: $price, categoryId: $categoryId, images: $images, discountPrice: $discountPrice, rating: $rating, reviewCount: $reviewCount, inStock: $inStock, stockQuantity: $stockQuantity, brand: $brand, sku: $sku, tags: $tags, variants: $variants, status: $status, isFeatured: $isFeatured, isHalal: $isHalal, createdAt: $createdAt, updatedAt: $updatedAt, metadata: $metadata)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProductImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.nameAr, nameAr) || other.nameAr == nameAr) &&
            (identical(other.nameSo, nameSo) || other.nameSo == nameSo) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.descriptionAr, descriptionAr) ||
                other.descriptionAr == descriptionAr) &&
            (identical(other.descriptionSo, descriptionSo) ||
                other.descriptionSo == descriptionSo) &&
            (identical(other.price, price) || other.price == price) &&
            (identical(other.categoryId, categoryId) ||
                other.categoryId == categoryId) &&
            const DeepCollectionEquality().equals(other._images, _images) &&
            (identical(other.discountPrice, discountPrice) ||
                other.discountPrice == discountPrice) &&
            (identical(other.rating, rating) || other.rating == rating) &&
            (identical(other.reviewCount, reviewCount) ||
                other.reviewCount == reviewCount) &&
            (identical(other.inStock, inStock) || other.inStock == inStock) &&
            (identical(other.stockQuantity, stockQuantity) ||
                other.stockQuantity == stockQuantity) &&
            (identical(other.brand, brand) || other.brand == brand) &&
            (identical(other.sku, sku) || other.sku == sku) &&
            const DeepCollectionEquality().equals(other._tags, _tags) &&
            const DeepCollectionEquality().equals(other._variants, _variants) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.isFeatured, isFeatured) ||
                other.isFeatured == isFeatured) &&
            (identical(other.isHalal, isHalal) || other.isHalal == isHalal) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            const DeepCollectionEquality().equals(other._metadata, _metadata));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
        runtimeType,
        id,
        name,
        nameAr,
        nameSo,
        description,
        descriptionAr,
        descriptionSo,
        price,
        categoryId,
        const DeepCollectionEquality().hash(_images),
        discountPrice,
        rating,
        reviewCount,
        inStock,
        stockQuantity,
        brand,
        sku,
        const DeepCollectionEquality().hash(_tags),
        const DeepCollectionEquality().hash(_variants),
        status,
        isFeatured,
        isHalal,
        createdAt,
        updatedAt,
        const DeepCollectionEquality().hash(_metadata)
      ]);

  /// Create a copy of Product
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ProductImplCopyWith<_$ProductImpl> get copyWith =>
      __$$ProductImplCopyWithImpl<_$ProductImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ProductImplToJson(
      this,
    );
  }
}

abstract class _Product implements Product {
  const factory _Product(
      {required final String id,
      @JsonKey(name: 'name_en') required final String name,
      @JsonKey(name: 'name_ar') required final String nameAr,
      @JsonKey(name: 'name_so') required final String nameSo,
      @JsonKey(name: 'description_en') required final String description,
      @JsonKey(name: 'description_ar') required final String descriptionAr,
      @JsonKey(name: 'description_so') required final String descriptionSo,
      @JsonKey(fromJson: _priceFromJson) required final double price,
      @JsonKey(name: 'category_id') required final String categoryId,
      @JsonKey(fromJson: _imagesFromJson) required final List<String> images,
      @JsonKey(name: 'discount_price', fromJson: _discountPriceFromJson)
      final double discountPrice,
      @JsonKey(fromJson: _ratingFromJson) final double rating,
      @JsonKey(name: 'review_count', fromJson: _reviewCountFromJson)
      final int reviewCount,
      @JsonKey(name: 'in_stock') final bool inStock,
      @JsonKey(name: 'stock_quantity') final int stockQuantity,
      @JsonKey(fromJson: _stringFromJson) final String brand,
      final String sku,
      @JsonKey(fromJson: _tagsFromJson) final List<String> tags,
      final List<ProductVariant> variants,
      final ProductStatus status,
      @JsonKey(name: 'is_featured') final bool isFeatured,
      @JsonKey(name: 'is_halal') final bool isHalal,
      @JsonKey(name: 'created_at') final DateTime? createdAt,
      @JsonKey(name: 'updated_at') final DateTime? updatedAt,
      final Map<String, dynamic>? metadata}) = _$ProductImpl;

  factory _Product.fromJson(Map<String, dynamic> json) = _$ProductImpl.fromJson;

  @override
  String get id;
  @override
  @JsonKey(name: 'name_en')
  String get name;
  @override
  @JsonKey(name: 'name_ar')
  String get nameAr;
  @override
  @JsonKey(name: 'name_so')
  String get nameSo;
  @override
  @JsonKey(name: 'description_en')
  String get description;
  @override
  @JsonKey(name: 'description_ar')
  String get descriptionAr;
  @override
  @JsonKey(name: 'description_so')
  String get descriptionSo;
  @override
  @JsonKey(fromJson: _priceFromJson)
  double get price;
  @override
  @JsonKey(name: 'category_id')
  String get categoryId;
  @override
  @JsonKey(fromJson: _imagesFromJson)
  List<String> get images;
  @override
  @JsonKey(name: 'discount_price', fromJson: _discountPriceFromJson)
  double get discountPrice;
  @override
  @JsonKey(fromJson: _ratingFromJson)
  double get rating;
  @override
  @JsonKey(name: 'review_count', fromJson: _reviewCountFromJson)
  int get reviewCount;
  @override
  @JsonKey(name: 'in_stock')
  bool get inStock;
  @override
  @JsonKey(name: 'stock_quantity')
  int get stockQuantity;
  @override
  @JsonKey(fromJson: _stringFromJson)
  String get brand;
  @override
  String get sku;
  @override
  @JsonKey(fromJson: _tagsFromJson)
  List<String> get tags;
  @override
  List<ProductVariant> get variants;
  @override
  ProductStatus get status;
  @override
  @JsonKey(name: 'is_featured')
  bool get isFeatured;
  @override
  @JsonKey(name: 'is_halal')
  bool get isHalal;
  @override
  @JsonKey(name: 'created_at')
  DateTime? get createdAt;
  @override
  @JsonKey(name: 'updated_at')
  DateTime? get updatedAt;
  @override
  Map<String, dynamic>? get metadata;

  /// Create a copy of Product
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ProductImplCopyWith<_$ProductImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ProductVariant _$ProductVariantFromJson(Map<String, dynamic> json) {
  return _ProductVariant.fromJson(json);
}

/// @nodoc
mixin _$ProductVariant {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get nameAr => throw _privateConstructorUsedError;
  String get nameSo => throw _privateConstructorUsedError;
  double get price => throw _privateConstructorUsedError;
  double get discountPrice => throw _privateConstructorUsedError;
  bool get inStock => throw _privateConstructorUsedError;
  int get stockQuantity => throw _privateConstructorUsedError;
  String get sku => throw _privateConstructorUsedError;
  Map<String, String>? get attributes => throw _privateConstructorUsedError;

  /// Serializes this ProductVariant to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ProductVariant
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ProductVariantCopyWith<ProductVariant> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ProductVariantCopyWith<$Res> {
  factory $ProductVariantCopyWith(
          ProductVariant value, $Res Function(ProductVariant) then) =
      _$ProductVariantCopyWithImpl<$Res, ProductVariant>;
  @useResult
  $Res call(
      {String id,
      String name,
      String nameAr,
      String nameSo,
      double price,
      double discountPrice,
      bool inStock,
      int stockQuantity,
      String sku,
      Map<String, String>? attributes});
}

/// @nodoc
class _$ProductVariantCopyWithImpl<$Res, $Val extends ProductVariant>
    implements $ProductVariantCopyWith<$Res> {
  _$ProductVariantCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ProductVariant
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? nameAr = null,
    Object? nameSo = null,
    Object? price = null,
    Object? discountPrice = null,
    Object? inStock = null,
    Object? stockQuantity = null,
    Object? sku = null,
    Object? attributes = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      nameAr: null == nameAr
          ? _value.nameAr
          : nameAr // ignore: cast_nullable_to_non_nullable
              as String,
      nameSo: null == nameSo
          ? _value.nameSo
          : nameSo // ignore: cast_nullable_to_non_nullable
              as String,
      price: null == price
          ? _value.price
          : price // ignore: cast_nullable_to_non_nullable
              as double,
      discountPrice: null == discountPrice
          ? _value.discountPrice
          : discountPrice // ignore: cast_nullable_to_non_nullable
              as double,
      inStock: null == inStock
          ? _value.inStock
          : inStock // ignore: cast_nullable_to_non_nullable
              as bool,
      stockQuantity: null == stockQuantity
          ? _value.stockQuantity
          : stockQuantity // ignore: cast_nullable_to_non_nullable
              as int,
      sku: null == sku
          ? _value.sku
          : sku // ignore: cast_nullable_to_non_nullable
              as String,
      attributes: freezed == attributes
          ? _value.attributes
          : attributes // ignore: cast_nullable_to_non_nullable
              as Map<String, String>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ProductVariantImplCopyWith<$Res>
    implements $ProductVariantCopyWith<$Res> {
  factory _$$ProductVariantImplCopyWith(_$ProductVariantImpl value,
          $Res Function(_$ProductVariantImpl) then) =
      __$$ProductVariantImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String nameAr,
      String nameSo,
      double price,
      double discountPrice,
      bool inStock,
      int stockQuantity,
      String sku,
      Map<String, String>? attributes});
}

/// @nodoc
class __$$ProductVariantImplCopyWithImpl<$Res>
    extends _$ProductVariantCopyWithImpl<$Res, _$ProductVariantImpl>
    implements _$$ProductVariantImplCopyWith<$Res> {
  __$$ProductVariantImplCopyWithImpl(
      _$ProductVariantImpl _value, $Res Function(_$ProductVariantImpl) _then)
      : super(_value, _then);

  /// Create a copy of ProductVariant
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? nameAr = null,
    Object? nameSo = null,
    Object? price = null,
    Object? discountPrice = null,
    Object? inStock = null,
    Object? stockQuantity = null,
    Object? sku = null,
    Object? attributes = freezed,
  }) {
    return _then(_$ProductVariantImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      nameAr: null == nameAr
          ? _value.nameAr
          : nameAr // ignore: cast_nullable_to_non_nullable
              as String,
      nameSo: null == nameSo
          ? _value.nameSo
          : nameSo // ignore: cast_nullable_to_non_nullable
              as String,
      price: null == price
          ? _value.price
          : price // ignore: cast_nullable_to_non_nullable
              as double,
      discountPrice: null == discountPrice
          ? _value.discountPrice
          : discountPrice // ignore: cast_nullable_to_non_nullable
              as double,
      inStock: null == inStock
          ? _value.inStock
          : inStock // ignore: cast_nullable_to_non_nullable
              as bool,
      stockQuantity: null == stockQuantity
          ? _value.stockQuantity
          : stockQuantity // ignore: cast_nullable_to_non_nullable
              as int,
      sku: null == sku
          ? _value.sku
          : sku // ignore: cast_nullable_to_non_nullable
              as String,
      attributes: freezed == attributes
          ? _value._attributes
          : attributes // ignore: cast_nullable_to_non_nullable
              as Map<String, String>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ProductVariantImpl implements _ProductVariant {
  const _$ProductVariantImpl(
      {required this.id,
      required this.name,
      required this.nameAr,
      required this.nameSo,
      required this.price,
      this.discountPrice = 0,
      this.inStock = true,
      this.stockQuantity = 0,
      this.sku = '',
      final Map<String, String>? attributes})
      : _attributes = attributes;

  factory _$ProductVariantImpl.fromJson(Map<String, dynamic> json) =>
      _$$ProductVariantImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String nameAr;
  @override
  final String nameSo;
  @override
  final double price;
  @override
  @JsonKey()
  final double discountPrice;
  @override
  @JsonKey()
  final bool inStock;
  @override
  @JsonKey()
  final int stockQuantity;
  @override
  @JsonKey()
  final String sku;
  final Map<String, String>? _attributes;
  @override
  Map<String, String>? get attributes {
    final value = _attributes;
    if (value == null) return null;
    if (_attributes is EqualUnmodifiableMapView) return _attributes;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  String toString() {
    return 'ProductVariant(id: $id, name: $name, nameAr: $nameAr, nameSo: $nameSo, price: $price, discountPrice: $discountPrice, inStock: $inStock, stockQuantity: $stockQuantity, sku: $sku, attributes: $attributes)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProductVariantImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.nameAr, nameAr) || other.nameAr == nameAr) &&
            (identical(other.nameSo, nameSo) || other.nameSo == nameSo) &&
            (identical(other.price, price) || other.price == price) &&
            (identical(other.discountPrice, discountPrice) ||
                other.discountPrice == discountPrice) &&
            (identical(other.inStock, inStock) || other.inStock == inStock) &&
            (identical(other.stockQuantity, stockQuantity) ||
                other.stockQuantity == stockQuantity) &&
            (identical(other.sku, sku) || other.sku == sku) &&
            const DeepCollectionEquality()
                .equals(other._attributes, _attributes));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      nameAr,
      nameSo,
      price,
      discountPrice,
      inStock,
      stockQuantity,
      sku,
      const DeepCollectionEquality().hash(_attributes));

  /// Create a copy of ProductVariant
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ProductVariantImplCopyWith<_$ProductVariantImpl> get copyWith =>
      __$$ProductVariantImplCopyWithImpl<_$ProductVariantImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ProductVariantImplToJson(
      this,
    );
  }
}

abstract class _ProductVariant implements ProductVariant {
  const factory _ProductVariant(
      {required final String id,
      required final String name,
      required final String nameAr,
      required final String nameSo,
      required final double price,
      final double discountPrice,
      final bool inStock,
      final int stockQuantity,
      final String sku,
      final Map<String, String>? attributes}) = _$ProductVariantImpl;

  factory _ProductVariant.fromJson(Map<String, dynamic> json) =
      _$ProductVariantImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String get nameAr;
  @override
  String get nameSo;
  @override
  double get price;
  @override
  double get discountPrice;
  @override
  bool get inStock;
  @override
  int get stockQuantity;
  @override
  String get sku;
  @override
  Map<String, String>? get attributes;

  /// Create a copy of ProductVariant
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ProductVariantImplCopyWith<_$ProductVariantImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
