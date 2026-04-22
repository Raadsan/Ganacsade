import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import 'package:iconly/iconly.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../controllers/cart_controller.dart';
import '../../../checkout/presentation/pages/checkout_screen.dart';
import '../../../../shared/widgets/skeleton_loader.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  bool _isInitializing = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      print('🛒 CartScreen: Opened, refreshing settings...');
      final controller = Get.find<CartController>();
      controller.refreshSettings().then((_) {
        print('🛒 CartScreen: Settings refresh completed');
        if (mounted) setState(() => _isInitializing = false);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: Text(
          'My cart',
          style: AppTextStyles.headlineSmall.copyWith(
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        actions: [
          GetBuilder<CartController>(
            builder: (controller) => controller.cartItems.isNotEmpty
                ? IconButton(
                    onPressed: () {
                      _showClearCartDialog(context, controller);
                    },
                    icon: const Icon(
                      IconlyLight.delete,
                      color: AppColors.textPrimary,
                    ),
                    tooltip: 'Clear Cart',
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
      body: _isInitializing
          ? const CartScreenSkeleton()
          : GetBuilder<CartController>(
              builder: (controller) {
                if (controller.cartItems.isEmpty) {
                  return _buildEmptyCart();
                } else {
                  return _buildCartWithItems(controller);
                }
              },
            ),
    );
  }

  Widget _buildEmptyCart() {
    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: isDark
                          ? AppColors.darkCardBackground
                          : AppColors.grey100,
                      borderRadius: BorderRadius.circular(60),
                    ),
                    child: Icon(
                      Icons.shopping_cart_outlined,
                      size: 60,
                      color: isDark ? AppColors.grey500 : AppColors.grey400,
                    ),
                  )
                  .animate()
                  .scale(duration: 600.ms, curve: Curves.elasticOut)
                  .then(delay: 200.ms)
                  .shake(duration: 500.ms),
              const SizedBox(height: 24),
              Text(
                    'cart_empty'.tr,
                    style: AppTextStyles.headlineMedium.copyWith(
                      fontWeight: FontWeight.bold,
                      color: isDark
                          ? AppColors.darkTextPrimary
                          : AppColors.grey700,
                    ),
                  )
                  .animate()
                  .fadeIn(delay: 400.ms, duration: 600.ms)
                  .slideY(begin: 0.3, end: 0),
              const SizedBox(height: 8),
              Text(
                    'cart_empty_desc'.tr,
                    style: AppTextStyles.bodyLarge.copyWith(
                      color: isDark
                          ? AppColors.darkTextSecondary
                          : AppColors.grey600,
                    ),
                  )
                  .animate()
                  .fadeIn(delay: 600.ms, duration: 600.ms)
                  .slideY(begin: 0.3, end: 0),
              const SizedBox(height: 32),
              ElevatedButton(
                    onPressed: () {
                      Get.back();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryGreen,
                      foregroundColor: AppColors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 16,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text('nav_home'.tr),
                  )
                  .animate()
                  .fadeIn(delay: 800.ms, duration: 600.ms)
                  .slideY(begin: 0.3, end: 0),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCartWithItems(CartController controller) {
    return Column(
      children: [
        Expanded(
          child: RefreshIndicator(
            onRefresh: () async {
              HapticFeedback.lightImpact();
              await controller.refreshSettings();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Cart totals refreshed'),
                  backgroundColor: AppColors.primaryGreen,
                  behavior: SnackBarBehavior.floating,
                  duration: Duration(seconds: 2),
                ),
              );
            },
            color: AppColors.primaryGreen,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: controller.cartItems.length,
              itemBuilder: (context, index) {
                final cartItem = controller.cartItems[index];
                return _buildCartItemCard(cartItem, controller, index);
              },
            ),
          ),
        ),
        _buildCartSummary(controller),
      ],
    );
  }

  Widget _buildCartItemCard(
    dynamic cartItem,
    CartController controller,
    int index,
  ) {
    // List of soft colors for product backgrounds like in the image
    final List<Color> bgColors = [
      const Color(0xFFEFEBE0), // Light beige
      const Color(0xFFF1DADC), // Light pink
      const Color(0xFFD2E0E9), // Light blue
      const Color(0xFFE8D5CC), // Light brown
    ];
    final cardBgColor = bgColors[index % bgColors.length];

    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Container(
              padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 5),
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.darkCardBackground
                    : const Color(0xFFF8F8F8),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product Image with tinted background
                  Container(
                    width: 110,
                    height: 110,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.all(5.0),
                        child: cartItem.product.images.isNotEmpty
                            ? _buildProductImage(cartItem.product.images.first)
                            : _buildImagePlaceholder(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),

                  // Product Details
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                cartItem.product.name,
                                style: AppTextStyles.titleMedium.copyWith(
                                  fontWeight: FontWeight.w500,
                                  color: isDark
                                      ? AppColors.darkTextPrimary
                                      : AppColors.textPrimary,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Text(
                              'Size: ${index == 0
                                  ? "35"
                                  : index == 1
                                  ? "M"
                                  : "L"}',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.grey500,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '\$ ${cartItem.product.discountPrice.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => "${m[1]},")}',
                          style: AppTextStyles.titleLarge.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Quantity Controls (Pill Shape bottom right)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 4,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: isDark
                                    ? AppColors.darkScaffoldBackground
                                    : AppColors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: AppColors.grey200),
                              ),
                              child: Row(
                                children: [
                                  GestureDetector(
                                    onTap: () {
                                      HapticFeedback.lightImpact();
                                      if (cartItem.quantity > 1) {
                                        controller.updateQuantity(
                                          cartItem.id,
                                          cartItem.quantity - 1,
                                        );
                                      } else {
                                        controller.removeFromCart(cartItem.id);
                                      }
                                    },
                                    child: const Padding(
                                      padding: EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 4,
                                      ),
                                      child: Icon(
                                        Icons.remove,
                                        size: 14,
                                        color: AppColors.primaryBlue,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    '${cartItem.quantity}',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14,
                                    ),
                                  ),
                                  GestureDetector(
                                    onTap: () {
                                      HapticFeedback.lightImpact();
                                      controller.updateQuantity(
                                        cartItem.id,
                                        cartItem.quantity + 1,
                                      );
                                    },
                                    child: const Padding(
                                      padding: EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 4,
                                      ),
                                      child: Icon(
                                        Icons.add,
                                        size: 14,
                                        color: AppColors.primaryBlue,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            )
            .animate()
            .fadeIn(
              duration: 600.ms,
              delay: Duration(milliseconds: 100 * index),
            )
            .slideY(begin: 0.1, end: 0);
      },
    );
  }

  Widget _buildProductImage(String imagePath) {
    // Check if it's a placeholder or invalid path
    if (imagePath == 'placeholder' || imagePath.isEmpty) {
      return _buildImagePlaceholder();
    }

    // Check if it's a network URL or local asset
    if (imagePath.startsWith('http')) {
      return Image.network(
        imagePath,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        errorBuilder: (context, error, stackTrace) {
          return _buildImagePlaceholder();
        },
      );
    } else {
      return Image.asset(
        imagePath,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        errorBuilder: (context, error, stackTrace) {
          return _buildImagePlaceholder();
        },
      );
    }
  }

  Widget _buildImagePlaceholder() {
    return Container(
      color: AppColors.grey100,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            'assets/logos/GANACSADE LOGO-06.png',
            width: 40,
            height: 40,
            errorBuilder: (context, error, stackTrace) =>
                Icon(Icons.image_outlined, size: 40, color: AppColors.grey400),
          ),
        ],
      ),
    );
  }

  Widget _buildCartSummary(CartController controller) {
    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCardBackground : AppColors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            boxShadow: [
              BoxShadow(
                color: AppColors.shadowLight,
                blurRadius: 10,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: Column(
            children: [
              _buildSummaryRow(
                'cart_subtotal'.tr,
                '\$${controller.subtotal.toStringAsFixed(2)}',
                isDark,
              ),
              _buildSummaryRow(
                'cart_shipping'.tr,
                controller.shipping == 0
                    ? 'Free'
                    : '\$${controller.shipping.toStringAsFixed(2)}',
                isDark,
              ),
              _buildSummaryRow(
                'cart_tax'.tr,
                '\$${controller.tax.toStringAsFixed(2)}',
                isDark,
              ),
              const Divider(height: 24),
              _buildSummaryRow(
                'cart_total'.tr,
                '\$${controller.finalTotal.toStringAsFixed(2)}',
                isDark,
                isTotal: true,
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    HapticFeedback.lightImpact();
                    _proceedToCheckout(controller);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                    foregroundColor: AppColors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    '${'cart_checkout'.tr} (\$${controller.finalTotal.toStringAsFixed(2)})',
                    style: AppTextStyles.titleMedium.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSummaryRow(
    String label,
    String value,
    bool isDark, {
    bool isTotal = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: isTotal
                ? AppTextStyles.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.darkTextPrimary : null,
                  )
                : AppTextStyles.bodyLarge.copyWith(
                    color: isDark ? AppColors.darkTextPrimary : null,
                  ),
          ),
          Text(
            value,
            style: isTotal
                ? AppTextStyles.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryGreen,
                  )
                : AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.darkTextPrimary : null,
                  ),
          ),
        ],
      ),
    );
  }

  void _showClearCartDialog(BuildContext context, CartController controller) {
    Get.dialog(
      AlertDialog(
        title: const Text('Clear Cart'),
        content: const Text(
          'Are you sure you want to remove all items from your cart?',
        ),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              controller.clearCart();
              Get.back();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('All items have been removed from your cart'),
                  backgroundColor: AppColors.primaryGreen,
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            child: Text('Clear', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }

  void _proceedToCheckout(CartController controller) {
    Get.to(() => const CheckoutScreen());
  }
}
