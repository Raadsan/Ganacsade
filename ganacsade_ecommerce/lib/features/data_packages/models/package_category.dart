import 'package:flutter/material.dart';

/// Model for package categories/service types (e.g., ADSL PLUS, Unlimited Data, Bundle)
class PackageCategory {
  final String id;
  final String name;
  final String nameAr;
  final String nameSo;
  final String? description;
  final String iconName; // Icon identifier from API
  final String providerId;
  final bool isActive;

  const PackageCategory({
    required this.id,
    required this.name,
    this.nameAr = '',
    this.nameSo = '',
    this.description,
    required this.iconName,
    required this.providerId,
    this.isActive = true,
  });

  factory PackageCategory.fromJson(Map<String, dynamic> json) {
    return PackageCategory(
      id: json['id'] as String,
      name: json['name'] as String,
      nameAr: json['name_ar'] as String? ?? '',
      nameSo: json['name_so'] as String? ?? '',
      description: json['description'] as String?,
      iconName: json['icon_name'] as String? ?? 'data',
      providerId: json['provider_id'] as String,
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'name_ar': nameAr,
      'name_so': nameSo,
      'description': description,
      'icon_name': iconName,
      'provider_id': providerId,
      'is_active': isActive,
    };
  }

  /// Get the appropriate icon based on iconName
  IconData get icon {
    switch (iconName.toLowerCase()) {
      case 'adsl':
      case 'router':
      case 'wifi':
        return Icons.router;
      case 'unlimited':
      case 'data':
      case 'mobile_data':
        return Icons.swap_vert;
      case 'bundle':
      case 'package':
        return Icons.inventory_2_outlined;
      case 'voice':
      case 'call':
      case 'phone':
        return Icons.phone_in_talk;
      case 'iptv':
      case 'tv':
        return Icons.tv;
      case 'sms':
      case 'message':
        return Icons.sms;
      case 'international':
      case 'globe':
        return Icons.public;
      default:
        return Icons.sim_card;
    }
  }

  /// Placeholder data for Hormuud - will be replaced by API
  static List<PackageCategory> getPlaceholderCategories(String providerId) {
    switch (providerId.toLowerCase()) {
      case 'hormuud':
        return [
          PackageCategory(
            id: 'adsl_plus',
            name: 'ADSL PLUS',
            nameSo: 'ADSL PLUS',
            iconName: 'router',
            providerId: providerId,
          ),
          PackageCategory(
            id: 'unlimited_data',
            name: 'Unlimited Data',
            nameSo: 'Data Aan Xad Lahayn',
            iconName: 'unlimited',
            providerId: providerId,
          ),
          PackageCategory(
            id: 'adsl_arday',
            name: 'ADSL Arday / IPTV',
            nameSo: 'ADSL Arday / IPTV',
            iconName: 'iptv',
            providerId: providerId,
          ),
          PackageCategory(
            id: 'bundle',
            name: 'Bundle',
            nameSo: 'Xidhmada',
            iconName: 'bundle',
            providerId: providerId,
          ),
          PackageCategory(
            id: 'voice',
            name: 'Hormuud Voice',
            nameSo: 'Codka Hormuud',
            iconName: 'voice',
            providerId: providerId,
          ),
          PackageCategory(
            id: 'anfac_plus',
            name: 'Anfac Plus GB',
            nameSo: 'Anfac Plus GB',
            iconName: 'data',
            providerId: providerId,
          ),
        ];
      case 'somtel':
        return [
          PackageCategory(
            id: 'data_bundles',
            name: 'Data Bundles',
            iconName: 'data',
            providerId: providerId,
          ),
          PackageCategory(
            id: 'voice_bundles',
            name: 'Voice Bundles',
            iconName: 'voice',
            providerId: providerId,
          ),
          PackageCategory(
            id: 'combo',
            name: 'Combo Packages',
            iconName: 'bundle',
            providerId: providerId,
          ),
        ];
      default:
        return [
          PackageCategory(
            id: 'data',
            name: 'Data Packages',
            iconName: 'data',
            providerId: providerId,
          ),
          PackageCategory(
            id: 'voice',
            name: 'Voice Packages',
            iconName: 'voice',
            providerId: providerId,
          ),
        ];
    }
  }
}
