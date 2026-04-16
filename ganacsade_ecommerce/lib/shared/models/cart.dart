import 'package:freezed_annotation/freezed_annotation.dart';
import 'product.dart';

part 'cart.freezed.dart';
part 'cart.g.dart';

/// Shopping Cart Model
@freezed
class Cart with _$Cart {
  const factory Cart({
    required String id,
    required String userId,
    @Default([]) List<CartItem> items,
    @Default(0.0) double subtotal,
    @Default(0.0) double tax,
    @Default(0.0) double shipping,
    @Default(0.0) double discount,
    @Default(0.0) double total,
    @Default('') String couponCode,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _Cart;

  factory Cart.fromJson(Map<String, dynamic> json) => _$CartFromJson(json);
}

/// Cart Item Model
@freezed
class CartItem with _$CartItem {
  const factory CartItem({
    required String id,
    required String productId,
    required Product product,
    required int quantity,
    required double unitPrice,
    @Default(0.0) double discountAmount,
    String? variantId,
    ProductVariant? variant,
    DateTime? addedAt,
  }) = _CartItem;

  factory CartItem.fromJson(Map<String, dynamic> json) => _$CartItemFromJson(json);
}

/// Cart Extensions
extension CartExtension on Cart {
  int get totalItems => items.fold(0, (sum, item) => sum + item.quantity);
  
  bool get isEmpty => items.isEmpty;
  
  bool get isNotEmpty => items.isNotEmpty;
  
  double get calculatedSubtotal {
    return items.fold(0.0, (sum, item) => sum + item.totalPrice);
  }
  
  double get calculatedTotal {
    return calculatedSubtotal + tax + shipping - discount;
  }
}

extension CartItemExtension on CartItem {
  double get totalPrice => unitPrice * quantity - discountAmount;
  
  double get originalTotalPrice => product.price * quantity;
  
  bool get hasDiscount => discountAmount > 0;
}
