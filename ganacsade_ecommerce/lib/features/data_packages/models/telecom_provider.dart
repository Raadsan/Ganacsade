import 'package:flutter/material.dart';

/// Model representing a telecom provider/company from API
class TelecomProvider {
  final int id;
  final String name;
  final String? logoUrl;
  final Color primaryColor;
  final Color secondaryColor;
  final Color borderColor;
  final List<DataPackageApi> packages;

  const TelecomProvider({
    required this.id,
    required this.name,
    this.logoUrl,
    required this.primaryColor,
    this.secondaryColor = Colors.white,
    this.borderColor = Colors.green,
    this.packages = const [],
  });

  /// Create from API JSON
  factory TelecomProvider.fromJson(Map<String, dynamic> json) {
    return TelecomProvider(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      logoUrl: json['logo'],
      primaryColor: _parseColor(json['color'], const Color(0xFF4CAF50)),
      secondaryColor: _parseColor(json['secondary_color'], Colors.white),
      borderColor: _parseColor(json['border_color'], const Color(0xFF4CAF50)),
      packages: (json['packages'] as List<dynamic>?)
          ?.map((p) => DataPackageApi.fromJson(p))
          .where((p) => p.status == 'active' && p.showOnApp)
          .toList() ?? [],
    );
  }

  static Color _parseColor(String? colorStr, Color defaultColor) {
    if (colorStr == null || colorStr.isEmpty) return defaultColor;
    try {
      String hex = colorStr.replaceAll('#', '');
      if (hex.length == 6) hex = 'FF$hex';
      return Color(int.parse(hex, radix: 16));
    } catch (e) {
      return defaultColor;
    }
  }

  /// Check if provider has packages
  bool get hasPackages => packages.isNotEmpty;

  /// Get unique package types/categories
  List<String> get packageTypes {
    final types = packages
        .map((p) => p.type ?? p.name)
        .toSet()
        .toList();
    return types;
  }
}

/// Model representing a data package from API
class DataPackageApi {
  final int id;
  final String name;
  final String? type;
  final int companyId;
  final String? code;
  final String status;
  final double amount;
  final double value;
  final int? expiryDuration;
  final String? expiryUnit;
  final String? data;
  final double? dataValue;
  final String? dataUnits;
  final String? sms;
  final double? smsValue;
  final String? call;
  final double? callValue;
  final String? callUnit;
  final bool showOnApp;

  const DataPackageApi({
    required this.id,
    required this.name,
    this.type,
    required this.companyId,
    this.code,
    this.status = 'active',
    required this.amount,
    required this.value,
    this.expiryDuration,
    this.expiryUnit,
    this.data,
    this.dataValue,
    this.dataUnits,
    this.sms,
    this.smsValue,
    this.call,
    this.callValue,
    this.callUnit,
    this.showOnApp = true,
  });

  factory DataPackageApi.fromJson(Map<String, dynamic> json) {
    final parsedAmount = double.tryParse(json['amount']?.toString() ?? '0') ?? 0;
    final parsedValue = double.tryParse(json['value']?.toString() ?? '0') ?? 0;
    
    print('DataPackageApi.fromJson: ${json['name']} - amount: $parsedAmount, value: $parsedValue, data: ${json['data']}, call: ${json['call']}, sms: ${json['sms']}, full_json: $json');
    
    return DataPackageApi(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      type: json['type'],
      companyId: json['company_id'] ?? 0,
      code: json['code'],
      status: json['status'] ?? 'active',
      amount: parsedAmount,
      value: parsedValue,
      expiryDuration: json['expiry_duration'],
      expiryUnit: json['expiry_unit'],
      data: json['data'],
      dataValue: double.tryParse(json['data_value']?.toString() ?? ''),
      dataUnits: json['data_units'],
      sms: json['sms'],
      smsValue: double.tryParse(json['sms_value']?.toString() ?? ''),
      call: json['call'],
      callValue: double.tryParse(json['call_value']?.toString() ?? ''),
      callUnit: json['call_unit'],
      showOnApp: json['show_on_the_app'] == 'Yes',
    );
  }

  /// Get formatted duration string
  String get duration {
    if (expiryDuration == null) return 'N/A';
    final unit = expiryUnit ?? 'hours';
    if (unit == 'hours') {
      if (expiryDuration! >= 24) {
        final days = expiryDuration! ~/ 24;
        return '$days ${days == 1 ? 'Day' : 'Days'}';
      }
      return '$expiryDuration Hrs';
    }
    return '$expiryDuration $unit';
  }

  /// Format a numeric quantity cleanly (e.g. 2.0 -> "2", 0.5 -> "0.5", 850.0 -> "850")
  static String _formatQty(double v) {
    return v % 1 == 0 ? v.toInt().toString() : v.toString();
  }

  /// Get features list using actual data_value, sms_value, call_value from API
  List<String> get features {
    final list = <String>[];

    if (data != null && data != 'none') {
      if (data == 'unlimited') {
        list.add('Unlimited Data');
      } else if (data == 'value' && dataValue != null) {
        final units = (dataUnits ?? 'mb').toLowerCase();
        if (units == 'gb') {
          list.add('${_formatQty(dataValue!)} GB Data');
        } else if (units == 'mb') {
          final mb = dataValue!;
          if (mb >= 1024) {
            list.add('${_formatQty(mb / 1024)} GB Data');
          } else {
            list.add('${_formatQty(mb)} MB Data');
          }
        } else {
          list.add('${_formatQty(dataValue!)} $units Data');
        }
      } else if (data == 'value') {
        list.add('Data Included');
      } else {
        list.add('$data Data');
      }
    }

    if (call != null && call != 'none') {
      if (call == 'unlimited') {
        list.add('Unlimited Calls');
      } else if (call == 'value' && callValue != null) {
        final unit = (callUnit ?? 'min').toLowerCase();
        if (unit == 'min') {
          list.add('${_formatQty(callValue!)} Min Calls');
        } else {
          list.add('${_formatQty(callValue!)} $unit Calls');
        }
      } else if (call == 'value') {
        list.add('Calls Included');
      } else {
        list.add('$call Calls');
      }
    }

    if (sms != null && sms != 'none') {
      if (sms == 'unlimited') {
        list.add('Unlimited SMS');
      } else if (sms == 'value' && smsValue != null) {
        list.add('${_formatQty(smsValue!)} SMS');
      } else if (sms == 'value') {
        list.add('SMS Included');
      } else {
        list.add('$sms SMS');
      }
    }

    if (list.isEmpty) list.add(name);
    return list;
  }

  /// Check if on sale (amount < value)
  bool get isOnSale => amount < value;

  /// Original price (value)
  double get originalPrice => value;

  /// Sale price (amount)
  double get price => amount;
}

/// Reseller data from API
class ResellerData {
  final int id;
  final String name;
  final String phone;
  final List<TelecomProvider> companies;

  const ResellerData({
    required this.id,
    required this.name,
    required this.phone,
    required this.companies,
  });

  factory ResellerData.fromJson(Map<String, dynamic> json) {
    return ResellerData(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      companies: (json['companies'] as List<dynamic>?)
          ?.map((c) => TelecomProvider.fromJson(c))
          .toList() ?? [],
    );
  }
}

/// Static placeholder data - will be replaced by API
class TelecomProviderPlaceholder {
  static List<TelecomProvider> get placeholderProviders => [
    TelecomProvider(
      id: 1,
      name: 'Hormuud',
      logoUrl: '',
      primaryColor: const Color(0xFF4CAF50),
      packages: [
        DataPackageApi(
          id: 1,
          name: 'Package 1',
          type: 'Data',
          companyId: 1,
          amount: 10.0,
          value: 15.0,
          expiryDuration: 30,
          expiryUnit: 'days',
          data: '1GB',
        ),
        DataPackageApi(
          id: 2,
          name: 'Package 2',
          type: 'Voice',
          companyId: 1,
          amount: 20.0,
          value: 30.0,
          expiryDuration: 30,
          expiryUnit: 'days',
          call: '100 minutes',
        ),
      ],
    ),
    TelecomProvider(
      id: 2,
      name: 'Somtel',
      logoUrl: '',
      primaryColor: const Color(0xFFFFEB3B),
      packages: [
        DataPackageApi(
          id: 3,
          name: 'Package 3',
          type: 'Data',
          companyId: 2,
          amount: 15.0,
          value: 20.0,
          expiryDuration: 30,
          expiryUnit: 'days',
          data: '2GB',
        ),
        DataPackageApi(
          id: 4,
          name: 'Package 4',
          type: 'Voice',
          companyId: 2,
          amount: 30.0,
          value: 40.0,
          expiryDuration: 30,
          expiryUnit: 'days',
          call: '200 minutes',
        ),
      ],
    ),
    TelecomProvider(
      id: 3,
      name: 'Somnet',
      logoUrl: '',
      primaryColor: const Color(0xFF2196F3),
      packages: [
        DataPackageApi(
          id: 5,
          name: 'Package 5',
          type: 'Data',
          companyId: 3,
          amount: 20.0,
          value: 25.0,
          expiryDuration: 30,
          expiryUnit: 'days',
          data: '3GB',
        ),
        DataPackageApi(
          id: 6,
          name: 'Package 6',
          type: 'Voice',
          companyId: 3,
          amount: 40.0,
          value: 50.0,
          expiryDuration: 30,
          expiryUnit: 'days',
          call: '300 minutes',
        ),
      ],
    ),
    TelecomProvider(
      id: 4,
      name: 'Telesom',
      logoUrl: '',
      primaryColor: const Color(0xFFF44336),
      packages: [
        DataPackageApi(
          id: 7,
          name: 'Package 7',
          type: 'Data',
          companyId: 4,
          amount: 25.0,
          value: 30.0,
          expiryDuration: 30,
          expiryUnit: 'days',
          data: '4GB',
        ),
        DataPackageApi(
          id: 8,
          name: 'Package 8',
          type: 'Voice',
          companyId: 4,
          amount: 50.0,
          value: 60.0,
          expiryDuration: 30,
          expiryUnit: 'days',
          call: '400 minutes',
        ),
      ],
    ),
    TelecomProvider(
      id: 5,
      name: 'Amtel',
      logoUrl: '',
      primaryColor: const Color(0xFF9C27B0),
      packages: [
        DataPackageApi(
          id: 9,
          name: 'Package 9',
          type: 'Data',
          companyId: 5,
          amount: 30.0,
          value: 35.0,
          expiryDuration: 30,
          expiryUnit: 'days',
          data: '5GB',
        ),
        DataPackageApi(
          id: 10,
          name: 'Package 10',
          type: 'Voice',
          companyId: 5,
          amount: 60.0,
          value: 70.0,
          expiryDuration: 30,
          expiryUnit: 'days',
          call: '500 minutes',
        ),
      ],
    ),
  ];
}
