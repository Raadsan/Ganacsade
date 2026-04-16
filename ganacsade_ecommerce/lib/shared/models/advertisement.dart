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
    return Advertisement(
      id: json['id']?.toString() ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String? ?? '',
      targetUrl: json['targetUrl'] as String?,
      placement: json['placement'] as String? ?? 'home_slider',
      displayOrder: json['displayOrder'] as int? ?? 1,
      isActive: json['isActive'] as bool? ?? true,
      startDate: json['startDate'] != null 
          ? DateTime.tryParse(json['startDate'] as String)
          : null,
      endDate: json['endDate'] != null
          ? DateTime.tryParse(json['endDate'] as String)
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
