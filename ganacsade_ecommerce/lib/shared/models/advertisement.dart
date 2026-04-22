import 'package:flutter/material.dart';

class Advertisement {
  final String id;
  final String title;
  final String? description;
  final String imageUrl;
  final String? targetUrl;
  final String placement; // home_slider, home_banner, category_page, product_page, checkout
  final int displayOrder;
  final bool isActive;
  final DateTime? startDate;
  final DateTime? endDate;

  Advertisement({
    required this.id,
    required this.title,
    this.description,
    required this.imageUrl,
    this.targetUrl,
    required this.placement,
    this.displayOrder = 1,
    this.isActive = true,
    this.startDate,
    this.endDate,
  });

  factory Advertisement.fromJson(Map<String, dynamic> json) {
    // Safe int parser — PostgreSQL can return integers as strings
    int safeInt(dynamic v, int fallback) {
      if (v == null) return fallback;
      if (v is int) return v;
      if (v is double) return v.toInt();
      return int.tryParse(v.toString()) ?? fallback;
    }

    // Safe bool parser
    bool safeBool(dynamic v, bool fallback) {
      if (v == null) return fallback;
      if (v is bool) return v;
      return v.toString().toLowerCase() == 'true';
    }

    return Advertisement(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      // Accept both camelCase (from service layer) and snake_case (raw DB)
      imageUrl: json['imageUrl']?.toString() ?? json['image_url']?.toString() ?? '',
      targetUrl: json['targetUrl']?.toString() ?? json['target_url']?.toString(),
      placement: json['placement']?.toString() ?? 'home_slider',
      displayOrder: safeInt(json['displayOrder'] ?? json['display_order'], 1),
      isActive: safeBool(json['isActive'] ?? json['is_active'], true),
      startDate: (json['startDate'] ?? json['start_date']) != null
          ? DateTime.tryParse((json['startDate'] ?? json['start_date']).toString())
          : null,
      endDate: (json['endDate'] ?? json['end_date']) != null
          ? DateTime.tryParse((json['endDate'] ?? json['end_date']).toString())
          : null,
    );
  }

  /// Get a background color based on the ad title/content
  Color get backgroundColor {
    // Generate a color based on the title hash for variety
    final hash = title.hashCode;
    final colors = [
      const Color(0xFF009639), // Green (primary)
      const Color(0xFF2E69B3), // Blue
      const Color(0xFF8EC541), // Light green
      const Color(0xFFE65100), // Orange
      const Color(0xFF7B1FA2), // Purple
      const Color(0xFF00838F), // Teal
    ];
    return colors[hash.abs() % colors.length];
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'imageUrl': imageUrl,
      'targetUrl': targetUrl,
      'placement': placement,
      'displayOrder': displayOrder,
      'isActive': isActive,
      'startDate': startDate?.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
    };
  }

  bool get isCurrentlyActive {
    if (!isActive) return false;

    final now = DateTime.now();

    if (startDate != null && now.isBefore(startDate!)) {
      return false;
    }

    if (endDate != null && now.isAfter(endDate!)) {
      return false;
    }

    return true;
  }
}
