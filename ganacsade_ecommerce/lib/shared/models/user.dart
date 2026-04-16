import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

/// User Model for G-Store
@freezed
class User with _$User {
  const factory User({
    required String id,
    required String email,
    required String phoneNumber,
    @Default('') String firstName,
    @Default('') String lastName,
    @Default('') String displayName,
    @Default('') String profileImageUrl,
    @Default(UserGender.notSpecified) UserGender gender,
    @Default('en') String preferredLanguage,
    @Default('USD') String preferredCurrency,
    @Default(false) bool isEmailVerified,
    @Default(false) bool isPhoneVerified,
    @Default(UserStatus.active) UserStatus status,
    @Default([]) List<Address> addresses,
    @Default([]) List<PaymentMethod> paymentMethods,
    DateTime? dateOfBirth,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? lastLoginAt,
    UserPreferences? preferences,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

/// User Address Model
@freezed
class Address with _$Address {
  const factory Address({
    required String id,
    required String label,
    required String fullName,
    required String phoneNumber,
    required String addressLine1,
    @Default('') String addressLine2,
    required String city,
    required String state,
    required String country,
    required String postalCode,
    @Default(false) bool isDefault,
    @Default(AddressType.home) AddressType type,
    double? latitude,
    double? longitude,
  }) = _Address;

  factory Address.fromJson(Map<String, dynamic> json) => _$AddressFromJson(json);
}

/// Payment Method Model
@freezed
class PaymentMethod with _$PaymentMethod {
  const factory PaymentMethod({
    required String id,
    required PaymentMethodType type,
    required String displayName,
    @Default(false) bool isDefault,
    @Default(true) bool isActive,
    Map<String, dynamic>? details,
  }) = _PaymentMethod;

  factory PaymentMethod.fromJson(Map<String, dynamic> json) => _$PaymentMethodFromJson(json);
}

/// User Preferences Model
@freezed
class UserPreferences with _$UserPreferences {
  const factory UserPreferences({
    @Default(true) bool pushNotifications,
    @Default(true) bool emailNotifications,
    @Default(true) bool smsNotifications,
    @Default(true) bool marketingEmails,
    @Default(false) bool darkMode,
    @Default(true) bool biometricAuth,
    @Default('system') String themeMode,
  }) = _UserPreferences;

  factory UserPreferences.fromJson(Map<String, dynamic> json) => _$UserPreferencesFromJson(json);
}

/// Enums
enum UserGender {
  @JsonValue('male')
  male,
  @JsonValue('female')
  female,
  @JsonValue('not_specified')
  notSpecified,
}

enum UserStatus {
  @JsonValue('active')
  active,
  @JsonValue('inactive')
  inactive,
  @JsonValue('suspended')
  suspended,
  @JsonValue('deleted')
  deleted,
}

enum AddressType {
  @JsonValue('home')
  home,
  @JsonValue('work')
  work,
  @JsonValue('other')
  other,
}

enum PaymentMethodType {
  @JsonValue('waafi_pay')
  waafiPay,
  @JsonValue('edahab')
  edahab,
  @JsonValue('premier_wallet')
  premierWallet,
  @JsonValue('cash_on_delivery')
  cashOnDelivery,
  @JsonValue('credit_card')
  creditCard,
  @JsonValue('debit_card')
  debitCard,
}

/// Extensions
extension PaymentMethodTypeExtension on PaymentMethodType {
  String get displayName {
    switch (this) {
      case PaymentMethodType.waafiPay:
        return 'WaafiPay';
      case PaymentMethodType.edahab:
        return 'E-dahab';
      case PaymentMethodType.premierWallet:
        return 'Premier Wallet';
      case PaymentMethodType.cashOnDelivery:
        return 'Cash on Delivery';
      case PaymentMethodType.creditCard:
        return 'Credit Card';
      case PaymentMethodType.debitCard:
        return 'Debit Card';
    }
  }

  String get iconPath {
    switch (this) {
      case PaymentMethodType.waafiPay:
        return 'assets/icons/waafi_pay.svg';
      case PaymentMethodType.edahab:
        return 'assets/icons/edahab.svg';
      case PaymentMethodType.premierWallet:
        return 'assets/icons/premier_wallet.svg';
      case PaymentMethodType.cashOnDelivery:
        return 'assets/icons/cash_on_delivery.svg';
      case PaymentMethodType.creditCard:
        return 'assets/icons/credit_card.svg';
      case PaymentMethodType.debitCard:
        return 'assets/icons/debit_card.svg';
    }
  }
}
