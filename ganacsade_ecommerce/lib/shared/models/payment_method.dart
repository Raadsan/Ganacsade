class PaymentMethod {
  final String id;
  final String type;
  final String name;
  final String details;
  final bool isDefault;
  final String? provider;
  final String? logo;

  PaymentMethod({
    required this.id,
    required this.type,
    required this.name,
    required this.details,
    this.isDefault = false,
    this.provider,
    this.logo,
  });

  PaymentMethod copyWith({
    String? id,
    String? type,
    String? name,
    String? details,
    bool? isDefault,
    String? provider,
    String? logo,
  }) {
    return PaymentMethod(
      id: id ?? this.id,
      type: type ?? this.type,
      name: name ?? this.name,
      details: details ?? this.details,
      isDefault: isDefault ?? this.isDefault,
      provider: provider ?? this.provider,
      logo: logo ?? this.logo,
    );
  }

  String get displayName {
    switch (type) {
      case 'mobile_money':
        return name;
      case 'credit_card':
        return 'Credit Card';
      case 'debit_card':
        return 'Debit Card';
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      default:
        return name;
    }
  }

  String get maskedDetails {
    if (type == 'mobile_money') {
      if (details.length > 4) {
        return '${details.substring(0, 4)}****${details.substring(details.length - 4)}';
      }
      return details;
    } else if (type == 'credit_card' || type == 'debit_card') {
      if (details.length > 4) {
        return '**** **** **** ${details.substring(details.length - 4)}';
      }
      return details;
    }
    return details;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'name': name,
      'details': details,
      'isDefault': isDefault,
      'provider': provider,
      'logo': logo,
    };
  }

  factory PaymentMethod.fromJson(Map<String, dynamic> json) {
    return PaymentMethod(
      id: json['id'],
      type: json['type'],
      name: json['name'],
      details: json['details'],
      isDefault: json['isDefault'] ?? false,
      provider: json['provider'],
      logo: json['logo'],
    );
  }
}
