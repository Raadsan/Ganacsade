/// Model for individual data packages with pricing and features
class DataPackage {
  final String id;
  final String name;
  final String nameAr;
  final String nameSo;
  final String categoryId;
  final String providerId;
  final double price;
  final double? originalPrice; // For sale items
  final String duration; // e.g., "24 Hrs", "7 Days", "30 Days"
  final int durationHours; // Duration in hours for sorting
  final String dataAmount; // e.g., "5GB", "Unlimited"
  final String? description;
  final List<String> features; // e.g., ["Unlimited Data and Call"]
  final bool isOnSale;
  final bool isPopular;
  final bool isActive;

  const DataPackage({
    required this.id,
    required this.name,
    this.nameAr = '',
    this.nameSo = '',
    required this.categoryId,
    required this.providerId,
    required this.price,
    this.originalPrice,
    required this.duration,
    required this.durationHours,
    this.dataAmount = '',
    this.description,
    this.features = const [],
    this.isOnSale = false,
    this.isPopular = false,
    this.isActive = true,
  });

  factory DataPackage.fromJson(Map<String, dynamic> json) {
    return DataPackage(
      id: json['id'] as String,
      name: json['name'] as String,
      nameAr: json['name_ar'] as String? ?? '',
      nameSo: json['name_so'] as String? ?? '',
      categoryId: json['category_id'] as String,
      providerId: json['provider_id'] as String,
      price: (json['price'] as num).toDouble(),
      originalPrice: json['original_price'] != null
          ? (json['original_price'] as num).toDouble()
          : null,
      duration: json['duration'] as String,
      durationHours: json['duration_hours'] as int? ?? 24,
      dataAmount: json['data_amount'] as String? ?? '',
      description: json['description'] as String?,
      features: (json['features'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      isOnSale: json['is_on_sale'] as bool? ?? false,
      isPopular: json['is_popular'] as bool? ?? false,
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'name_ar': nameAr,
      'name_so': nameSo,
      'category_id': categoryId,
      'provider_id': providerId,
      'price': price,
      'original_price': originalPrice,
      'duration': duration,
      'duration_hours': durationHours,
      'data_amount': dataAmount,
      'description': description,
      'features': features,
      'is_on_sale': isOnSale,
      'is_popular': isPopular,
      'is_active': isActive,
    };
  }

  /// Check if this package has a discount
  bool get hasDiscount => originalPrice != null && originalPrice! > price;

  /// Calculate discount percentage
  int get discountPercentage {
    if (!hasDiscount) return 0;
    return (((originalPrice! - price) / originalPrice!) * 100).round();
  }

  /// Placeholder data for Unlimited Data category
  static List<DataPackage> getPlaceholderPackages(String categoryId, String providerId) {
    switch (categoryId.toLowerCase()) {
      case 'unlimited_data':
        return [
          DataPackage(
            id: 'ud_24h',
            name: 'Unlimited 24H',
            categoryId: categoryId,
            providerId: providerId,
            price: 0.75,
            originalPrice: 0.8,
            duration: '24 Hrs',
            durationHours: 24,
            dataAmount: 'Unlimited',
            features: ['Unlimited Data and Call'],
            isOnSale: true,
          ),
          DataPackage(
            id: 'ud_48h',
            name: 'Unlimited 48H',
            categoryId: categoryId,
            providerId: providerId,
            price: 1.5,
            duration: '48 Hrs',
            durationHours: 48,
            dataAmount: 'Unlimited',
            features: ['Unlimited Data and Call'],
          ),
          DataPackage(
            id: 'ud_4d',
            name: 'Unlimited 4 Days',
            categoryId: categoryId,
            providerId: providerId,
            price: 3.0,
            duration: '4 Days',
            durationHours: 96,
            dataAmount: 'Unlimited',
            features: ['Unlimited Data and Call'],
          ),
          DataPackage(
            id: 'ud_9d',
            name: 'Unlimited 9 Days',
            categoryId: categoryId,
            providerId: providerId,
            price: 6.5,
            duration: '9 Days',
            durationHours: 216,
            dataAmount: 'Unlimited',
            features: ['Unlimited Data and Call'],
          ),
          DataPackage(
            id: 'ud_7d',
            name: 'Unlimited 7 Days',
            categoryId: categoryId,
            providerId: providerId,
            price: 5.0,
            originalPrice: 5.5,
            duration: '7 Days',
            durationHours: 168,
            dataAmount: 'Unlimited',
            features: ['Unlimited Data and Call'],
            isOnSale: true,
          ),
          DataPackage(
            id: 'ud_14d',
            name: 'Unlimited 14 Days',
            categoryId: categoryId,
            providerId: providerId,
            price: 10.0,
            duration: '14 Days',
            durationHours: 336,
            dataAmount: 'Unlimited',
            features: ['Unlimited Data and Call'],
          ),
        ];
      case 'bundle':
        return [
          DataPackage(
            id: 'b_weekly',
            name: 'Weekly Bundle',
            categoryId: categoryId,
            providerId: providerId,
            price: 2.0,
            duration: '7 Days',
            durationHours: 168,
            dataAmount: '2GB',
            features: ['2GB Data', '100 Minutes'],
          ),
          DataPackage(
            id: 'b_monthly',
            name: 'Monthly Bundle',
            categoryId: categoryId,
            providerId: providerId,
            price: 7.0,
            duration: '30 Days',
            durationHours: 720,
            dataAmount: '10GB',
            features: ['10GB Data', '500 Minutes'],
            isPopular: true,
          ),
        ];
      default:
        return [
          DataPackage(
            id: 'default_1',
            name: 'Basic Package',
            categoryId: categoryId,
            providerId: providerId,
            price: 1.0,
            duration: '24 Hrs',
            durationHours: 24,
            dataAmount: '500MB',
            features: ['500MB Data'],
          ),
          DataPackage(
            id: 'default_2',
            name: 'Standard Package',
            categoryId: categoryId,
            providerId: providerId,
            price: 3.0,
            duration: '7 Days',
            durationHours: 168,
            dataAmount: '2GB',
            features: ['2GB Data'],
          ),
        ];
    }
  }
}
