// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserImpl _$$UserImplFromJson(Map<String, dynamic> json) => _$UserImpl(
      id: json['id'] as String,
      email: json['email'] as String,
      phoneNumber: json['phoneNumber'] as String,
      firstName: json['firstName'] as String? ?? '',
      lastName: json['lastName'] as String? ?? '',
      displayName: json['displayName'] as String? ?? '',
      profileImageUrl: json['profileImageUrl'] as String? ?? '',
      gender: $enumDecodeNullable(_$UserGenderEnumMap, json['gender']) ??
          UserGender.notSpecified,
      preferredLanguage: json['preferredLanguage'] as String? ?? 'en',
      preferredCurrency: json['preferredCurrency'] as String? ?? 'USD',
      isEmailVerified: json['isEmailVerified'] as bool? ?? false,
      isPhoneVerified: json['isPhoneVerified'] as bool? ?? false,
      status: $enumDecodeNullable(_$UserStatusEnumMap, json['status']) ??
          UserStatus.active,
      addresses: (json['addresses'] as List<dynamic>?)
              ?.map((e) => Address.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      paymentMethods: (json['paymentMethods'] as List<dynamic>?)
              ?.map((e) => PaymentMethod.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      dateOfBirth: json['dateOfBirth'] == null
          ? null
          : DateTime.parse(json['dateOfBirth'] as String),
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
      lastLoginAt: json['lastLoginAt'] == null
          ? null
          : DateTime.parse(json['lastLoginAt'] as String),
      preferences: json['preferences'] == null
          ? null
          : UserPreferences.fromJson(
              json['preferences'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$UserImplToJson(_$UserImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'phoneNumber': instance.phoneNumber,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'displayName': instance.displayName,
      'profileImageUrl': instance.profileImageUrl,
      'gender': _$UserGenderEnumMap[instance.gender]!,
      'preferredLanguage': instance.preferredLanguage,
      'preferredCurrency': instance.preferredCurrency,
      'isEmailVerified': instance.isEmailVerified,
      'isPhoneVerified': instance.isPhoneVerified,
      'status': _$UserStatusEnumMap[instance.status]!,
      'addresses': instance.addresses,
      'paymentMethods': instance.paymentMethods,
      'dateOfBirth': instance.dateOfBirth?.toIso8601String(),
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
      'lastLoginAt': instance.lastLoginAt?.toIso8601String(),
      'preferences': instance.preferences,
    };

const _$UserGenderEnumMap = {
  UserGender.male: 'male',
  UserGender.female: 'female',
  UserGender.notSpecified: 'not_specified',
};

const _$UserStatusEnumMap = {
  UserStatus.active: 'active',
  UserStatus.inactive: 'inactive',
  UserStatus.suspended: 'suspended',
  UserStatus.deleted: 'deleted',
};

_$AddressImpl _$$AddressImplFromJson(Map<String, dynamic> json) =>
    _$AddressImpl(
      id: json['id'] as String,
      label: json['label'] as String,
      fullName: json['fullName'] as String,
      phoneNumber: json['phoneNumber'] as String,
      addressLine1: json['addressLine1'] as String,
      addressLine2: json['addressLine2'] as String? ?? '',
      city: json['city'] as String,
      state: json['state'] as String,
      country: json['country'] as String,
      postalCode: json['postalCode'] as String,
      isDefault: json['isDefault'] as bool? ?? false,
      type: $enumDecodeNullable(_$AddressTypeEnumMap, json['type']) ??
          AddressType.home,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$$AddressImplToJson(_$AddressImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'label': instance.label,
      'fullName': instance.fullName,
      'phoneNumber': instance.phoneNumber,
      'addressLine1': instance.addressLine1,
      'addressLine2': instance.addressLine2,
      'city': instance.city,
      'state': instance.state,
      'country': instance.country,
      'postalCode': instance.postalCode,
      'isDefault': instance.isDefault,
      'type': _$AddressTypeEnumMap[instance.type]!,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
    };

const _$AddressTypeEnumMap = {
  AddressType.home: 'home',
  AddressType.work: 'work',
  AddressType.other: 'other',
};

_$PaymentMethodImpl _$$PaymentMethodImplFromJson(Map<String, dynamic> json) =>
    _$PaymentMethodImpl(
      id: json['id'] as String,
      type: $enumDecode(_$PaymentMethodTypeEnumMap, json['type']),
      displayName: json['displayName'] as String,
      isDefault: json['isDefault'] as bool? ?? false,
      isActive: json['isActive'] as bool? ?? true,
      details: json['details'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$PaymentMethodImplToJson(_$PaymentMethodImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$PaymentMethodTypeEnumMap[instance.type]!,
      'displayName': instance.displayName,
      'isDefault': instance.isDefault,
      'isActive': instance.isActive,
      'details': instance.details,
    };

const _$PaymentMethodTypeEnumMap = {
  PaymentMethodType.waafiPay: 'waafi_pay',
  PaymentMethodType.edahab: 'edahab',
  PaymentMethodType.premierWallet: 'premier_wallet',
  PaymentMethodType.cashOnDelivery: 'cash_on_delivery',
  PaymentMethodType.creditCard: 'credit_card',
  PaymentMethodType.debitCard: 'debit_card',
};

_$UserPreferencesImpl _$$UserPreferencesImplFromJson(
        Map<String, dynamic> json) =>
    _$UserPreferencesImpl(
      pushNotifications: json['pushNotifications'] as bool? ?? true,
      emailNotifications: json['emailNotifications'] as bool? ?? true,
      smsNotifications: json['smsNotifications'] as bool? ?? true,
      marketingEmails: json['marketingEmails'] as bool? ?? true,
      darkMode: json['darkMode'] as bool? ?? false,
      biometricAuth: json['biometricAuth'] as bool? ?? true,
      themeMode: json['themeMode'] as String? ?? 'system',
    );

Map<String, dynamic> _$$UserPreferencesImplToJson(
        _$UserPreferencesImpl instance) =>
    <String, dynamic>{
      'pushNotifications': instance.pushNotifications,
      'emailNotifications': instance.emailNotifications,
      'smsNotifications': instance.smsNotifications,
      'marketingEmails': instance.marketingEmails,
      'darkMode': instance.darkMode,
      'biometricAuth': instance.biometricAuth,
      'themeMode': instance.themeMode,
    };
