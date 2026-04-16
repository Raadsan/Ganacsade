// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'category.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Category _$CategoryFromJson(Map<String, dynamic> json) {
  return _Category.fromJson(json);
}

/// @nodoc
mixin _$Category {
  String get id => throw _privateConstructorUsedError;
  String get nameEn => throw _privateConstructorUsedError;
  String get nameSo => throw _privateConstructorUsedError;
  String get nameAr => throw _privateConstructorUsedError;
  String get descriptionEn => throw _privateConstructorUsedError;
  String get descriptionSo => throw _privateConstructorUsedError;
  String get descriptionAr => throw _privateConstructorUsedError;
  String get iconPath => throw _privateConstructorUsedError;
  @ColorConverter()
  Color get color => throw _privateConstructorUsedError;
  CategoryType get type => throw _privateConstructorUsedError;
  bool get isActive => throw _privateConstructorUsedError;
  int get productCount => throw _privateConstructorUsedError;
  String? get imageUrl => throw _privateConstructorUsedError;
  List<String>? get subcategories => throw _privateConstructorUsedError;

  /// Serializes this Category to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Category
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CategoryCopyWith<Category> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CategoryCopyWith<$Res> {
  factory $CategoryCopyWith(Category value, $Res Function(Category) then) =
      _$CategoryCopyWithImpl<$Res, Category>;
  @useResult
  $Res call(
      {String id,
      String nameEn,
      String nameSo,
      String nameAr,
      String descriptionEn,
      String descriptionSo,
      String descriptionAr,
      String iconPath,
      @ColorConverter() Color color,
      CategoryType type,
      bool isActive,
      int productCount,
      String? imageUrl,
      List<String>? subcategories});
}

/// @nodoc
class _$CategoryCopyWithImpl<$Res, $Val extends Category>
    implements $CategoryCopyWith<$Res> {
  _$CategoryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Category
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? nameEn = null,
    Object? nameSo = null,
    Object? nameAr = null,
    Object? descriptionEn = null,
    Object? descriptionSo = null,
    Object? descriptionAr = null,
    Object? iconPath = null,
    Object? color = null,
    Object? type = null,
    Object? isActive = null,
    Object? productCount = null,
    Object? imageUrl = freezed,
    Object? subcategories = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      nameEn: null == nameEn
          ? _value.nameEn
          : nameEn // ignore: cast_nullable_to_non_nullable
              as String,
      nameSo: null == nameSo
          ? _value.nameSo
          : nameSo // ignore: cast_nullable_to_non_nullable
              as String,
      nameAr: null == nameAr
          ? _value.nameAr
          : nameAr // ignore: cast_nullable_to_non_nullable
              as String,
      descriptionEn: null == descriptionEn
          ? _value.descriptionEn
          : descriptionEn // ignore: cast_nullable_to_non_nullable
              as String,
      descriptionSo: null == descriptionSo
          ? _value.descriptionSo
          : descriptionSo // ignore: cast_nullable_to_non_nullable
              as String,
      descriptionAr: null == descriptionAr
          ? _value.descriptionAr
          : descriptionAr // ignore: cast_nullable_to_non_nullable
              as String,
      iconPath: null == iconPath
          ? _value.iconPath
          : iconPath // ignore: cast_nullable_to_non_nullable
              as String,
      color: null == color
          ? _value.color
          : color // ignore: cast_nullable_to_non_nullable
              as Color,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as CategoryType,
      isActive: null == isActive
          ? _value.isActive
          : isActive // ignore: cast_nullable_to_non_nullable
              as bool,
      productCount: null == productCount
          ? _value.productCount
          : productCount // ignore: cast_nullable_to_non_nullable
              as int,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      subcategories: freezed == subcategories
          ? _value.subcategories
          : subcategories // ignore: cast_nullable_to_non_nullable
              as List<String>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$CategoryImplCopyWith<$Res>
    implements $CategoryCopyWith<$Res> {
  factory _$$CategoryImplCopyWith(
          _$CategoryImpl value, $Res Function(_$CategoryImpl) then) =
      __$$CategoryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String nameEn,
      String nameSo,
      String nameAr,
      String descriptionEn,
      String descriptionSo,
      String descriptionAr,
      String iconPath,
      @ColorConverter() Color color,
      CategoryType type,
      bool isActive,
      int productCount,
      String? imageUrl,
      List<String>? subcategories});
}

/// @nodoc
class __$$CategoryImplCopyWithImpl<$Res>
    extends _$CategoryCopyWithImpl<$Res, _$CategoryImpl>
    implements _$$CategoryImplCopyWith<$Res> {
  __$$CategoryImplCopyWithImpl(
      _$CategoryImpl _value, $Res Function(_$CategoryImpl) _then)
      : super(_value, _then);

  /// Create a copy of Category
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? nameEn = null,
    Object? nameSo = null,
    Object? nameAr = null,
    Object? descriptionEn = null,
    Object? descriptionSo = null,
    Object? descriptionAr = null,
    Object? iconPath = null,
    Object? color = null,
    Object? type = null,
    Object? isActive = null,
    Object? productCount = null,
    Object? imageUrl = freezed,
    Object? subcategories = freezed,
  }) {
    return _then(_$CategoryImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      nameEn: null == nameEn
          ? _value.nameEn
          : nameEn // ignore: cast_nullable_to_non_nullable
              as String,
      nameSo: null == nameSo
          ? _value.nameSo
          : nameSo // ignore: cast_nullable_to_non_nullable
              as String,
      nameAr: null == nameAr
          ? _value.nameAr
          : nameAr // ignore: cast_nullable_to_non_nullable
              as String,
      descriptionEn: null == descriptionEn
          ? _value.descriptionEn
          : descriptionEn // ignore: cast_nullable_to_non_nullable
              as String,
      descriptionSo: null == descriptionSo
          ? _value.descriptionSo
          : descriptionSo // ignore: cast_nullable_to_non_nullable
              as String,
      descriptionAr: null == descriptionAr
          ? _value.descriptionAr
          : descriptionAr // ignore: cast_nullable_to_non_nullable
              as String,
      iconPath: null == iconPath
          ? _value.iconPath
          : iconPath // ignore: cast_nullable_to_non_nullable
              as String,
      color: null == color
          ? _value.color
          : color // ignore: cast_nullable_to_non_nullable
              as Color,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as CategoryType,
      isActive: null == isActive
          ? _value.isActive
          : isActive // ignore: cast_nullable_to_non_nullable
              as bool,
      productCount: null == productCount
          ? _value.productCount
          : productCount // ignore: cast_nullable_to_non_nullable
              as int,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      subcategories: freezed == subcategories
          ? _value._subcategories
          : subcategories // ignore: cast_nullable_to_non_nullable
              as List<String>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$CategoryImpl implements _Category {
  const _$CategoryImpl(
      {required this.id,
      required this.nameEn,
      required this.nameSo,
      required this.nameAr,
      required this.descriptionEn,
      required this.descriptionSo,
      required this.descriptionAr,
      required this.iconPath,
      @ColorConverter() required this.color,
      required this.type,
      this.isActive = true,
      this.productCount = 0,
      this.imageUrl,
      final List<String>? subcategories})
      : _subcategories = subcategories;

  factory _$CategoryImpl.fromJson(Map<String, dynamic> json) =>
      _$$CategoryImplFromJson(json);

  @override
  final String id;
  @override
  final String nameEn;
  @override
  final String nameSo;
  @override
  final String nameAr;
  @override
  final String descriptionEn;
  @override
  final String descriptionSo;
  @override
  final String descriptionAr;
  @override
  final String iconPath;
  @override
  @ColorConverter()
  final Color color;
  @override
  final CategoryType type;
  @override
  @JsonKey()
  final bool isActive;
  @override
  @JsonKey()
  final int productCount;
  @override
  final String? imageUrl;
  final List<String>? _subcategories;
  @override
  List<String>? get subcategories {
    final value = _subcategories;
    if (value == null) return null;
    if (_subcategories is EqualUnmodifiableListView) return _subcategories;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'Category(id: $id, nameEn: $nameEn, nameSo: $nameSo, nameAr: $nameAr, descriptionEn: $descriptionEn, descriptionSo: $descriptionSo, descriptionAr: $descriptionAr, iconPath: $iconPath, color: $color, type: $type, isActive: $isActive, productCount: $productCount, imageUrl: $imageUrl, subcategories: $subcategories)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CategoryImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.nameEn, nameEn) || other.nameEn == nameEn) &&
            (identical(other.nameSo, nameSo) || other.nameSo == nameSo) &&
            (identical(other.nameAr, nameAr) || other.nameAr == nameAr) &&
            (identical(other.descriptionEn, descriptionEn) ||
                other.descriptionEn == descriptionEn) &&
            (identical(other.descriptionSo, descriptionSo) ||
                other.descriptionSo == descriptionSo) &&
            (identical(other.descriptionAr, descriptionAr) ||
                other.descriptionAr == descriptionAr) &&
            (identical(other.iconPath, iconPath) ||
                other.iconPath == iconPath) &&
            (identical(other.color, color) || other.color == color) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive) &&
            (identical(other.productCount, productCount) ||
                other.productCount == productCount) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            const DeepCollectionEquality()
                .equals(other._subcategories, _subcategories));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      nameEn,
      nameSo,
      nameAr,
      descriptionEn,
      descriptionSo,
      descriptionAr,
      iconPath,
      color,
      type,
      isActive,
      productCount,
      imageUrl,
      const DeepCollectionEquality().hash(_subcategories));

  /// Create a copy of Category
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CategoryImplCopyWith<_$CategoryImpl> get copyWith =>
      __$$CategoryImplCopyWithImpl<_$CategoryImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CategoryImplToJson(
      this,
    );
  }
}

abstract class _Category implements Category {
  const factory _Category(
      {required final String id,
      required final String nameEn,
      required final String nameSo,
      required final String nameAr,
      required final String descriptionEn,
      required final String descriptionSo,
      required final String descriptionAr,
      required final String iconPath,
      @ColorConverter() required final Color color,
      required final CategoryType type,
      final bool isActive,
      final int productCount,
      final String? imageUrl,
      final List<String>? subcategories}) = _$CategoryImpl;

  factory _Category.fromJson(Map<String, dynamic> json) =
      _$CategoryImpl.fromJson;

  @override
  String get id;
  @override
  String get nameEn;
  @override
  String get nameSo;
  @override
  String get nameAr;
  @override
  String get descriptionEn;
  @override
  String get descriptionSo;
  @override
  String get descriptionAr;
  @override
  String get iconPath;
  @override
  @ColorConverter()
  Color get color;
  @override
  CategoryType get type;
  @override
  bool get isActive;
  @override
  int get productCount;
  @override
  String? get imageUrl;
  @override
  List<String>? get subcategories;

  /// Create a copy of Category
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CategoryImplCopyWith<_$CategoryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
