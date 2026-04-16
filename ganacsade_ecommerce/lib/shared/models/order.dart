import 'package:freezed_annotation/freezed_annotation.dart';
import 'user.dart';
import 'cart.dart';

part 'order.freezed.dart';
part 'order.g.dart';

/// Order Model for G-Store
@freezed
class Order with _$Order {
  const factory Order({
    required String id,
    required String userId,
    required String orderNumber,
    required List<CartItem> items,
    required Address shippingAddress,
    required PaymentMethod paymentMethod,
    required double subtotal,
    required double tax,
    required double shipping,
    required double discount,
    required double total,
    @Default(OrderStatus.pending) OrderStatus status,
    @Default(PaymentStatus.pending) PaymentStatus paymentStatus,
    @Default([]) List<OrderStatusHistory> statusHistory,
    @Default('') String notes,
    @Default('') String trackingNumber,
    DateTime? estimatedDelivery,
    DateTime? actualDelivery,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _Order;

  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);
}

/// Order Status History
@freezed
class OrderStatusHistory with _$OrderStatusHistory {
  const factory OrderStatusHistory({
    required OrderStatus status,
    required DateTime timestamp,
    @Default('') String notes,
    @Default('') String updatedBy,
  }) = _OrderStatusHistory;

  factory OrderStatusHistory.fromJson(Map<String, dynamic> json) => _$OrderStatusHistoryFromJson(json);
}

/// Order Status Enum
enum OrderStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('confirmed')
  confirmed,
  @JsonValue('processing')
  processing,
  @JsonValue('ready_for_pickup')
  readyForPickup,
  @JsonValue('out_for_delivery')
  outForDelivery,
  @JsonValue('delivered')
  delivered,
  @JsonValue('cancelled')
  cancelled,
  @JsonValue('returned')
  returned,
  @JsonValue('refunded')
  refunded,
}

/// Payment Status Enum
enum PaymentStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('processing')
  processing,
  @JsonValue('completed')
  completed,
  @JsonValue('failed')
  failed,
  @JsonValue('cancelled')
  cancelled,
  @JsonValue('refunded')
  refunded,
}

/// Extensions
extension OrderStatusExtension on OrderStatus {
  String get displayName {
    switch (this) {
      case OrderStatus.pending:
        return 'Pending';
      case OrderStatus.confirmed:
        return 'Order Confirmed';
      case OrderStatus.processing:
        return 'Processing';
      case OrderStatus.readyForPickup:
        return 'Ready for Pickup';
      case OrderStatus.outForDelivery:
        return 'On the Way';
      case OrderStatus.delivered:
        return 'Order Delivered';
      case OrderStatus.cancelled:
        return 'Cancelled';
      case OrderStatus.returned:
        return 'Returned';
      case OrderStatus.refunded:
        return 'Refunded';
    }
  }

  String get displayNameSomali {
    switch (this) {
      case OrderStatus.pending:
        return 'Sugaya';
      case OrderStatus.confirmed:
        return 'Dalabka la xaqiijiyay';
      case OrderStatus.processing:
        return 'Hawlgalka';
      case OrderStatus.readyForPickup:
        return 'Diyaar u ah qaadista';
      case OrderStatus.outForDelivery:
        return 'Jidka ayuu ku jiraa';
      case OrderStatus.delivered:
        return 'Dalabka la keenay';
      case OrderStatus.cancelled:
        return 'La joojiyay';
      case OrderStatus.returned:
        return 'La soo celiyay';
      case OrderStatus.refunded:
        return 'Lacagta la soo celiyay';
    }
  }

  String get displayNameArabic {
    switch (this) {
      case OrderStatus.pending:
        return 'في الانتظار';
      case OrderStatus.confirmed:
        return 'تم تأكيد الطلب';
      case OrderStatus.processing:
        return 'قيد المعالجة';
      case OrderStatus.readyForPickup:
        return 'جاهز للاستلام';
      case OrderStatus.outForDelivery:
        return 'في الطريق';
      case OrderStatus.delivered:
        return 'تم تسليم الطلب';
      case OrderStatus.cancelled:
        return 'ملغي';
      case OrderStatus.returned:
        return 'مُرتجع';
      case OrderStatus.refunded:
        return 'مُسترد';
    }
  }

  bool get isCompleted => this == OrderStatus.delivered;
  bool get isCancellable => [OrderStatus.pending, OrderStatus.confirmed].contains(this);
  bool get isActive => ![OrderStatus.delivered, OrderStatus.cancelled, OrderStatus.returned, OrderStatus.refunded].contains(this);
}
