import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/network/orders_api_service.dart';
import '../../../../core/network/payment_api_service.dart';
import '../../../../shared/models/product.dart';
import '../../../../shared/widgets/advertisement_banner.dart';
import '../../../cart/presentation/controllers/cart_controller.dart';
import '../../../navigation/navigation_controller.dart';
import '../../../profile/presentation/controllers/profile_controller.dart';
import '../../../profile/presentation/pages/addresses_screen.dart';
import '../../../../shared/models/address.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final CartController _cartController = Get.find<CartController>();
  final ProfileController _profileController = Get.find<ProfileController>();
  final OrdersApiService _ordersApiService = OrdersApiService();
  final PaymentApiService _paymentApiService = PaymentApiService();
  String _selectedPaymentMethod = '';
  String _selectedPaymentName = '';
  bool _isProcessing = false;
  final TextEditingController _paymentPhoneController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  Address? _selectedAddress;

  @override
  void initState() {
    super.initState();
    _initializeSelectedAddress();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _profileController.reloadAddresses();
      if (mounted) _initializeSelectedAddress();
    });
    
    // Listen for address changes if they load late
    ever(_profileController.addresses, (_) {
      if (_selectedAddress == null) {
        _initializeSelectedAddress();
      }
    });
  }

  void _initializeSelectedAddress() {
    if (_profileController.addresses.isNotEmpty) {
      setState(() {
        _selectedAddress = _profileController.addresses.firstWhere(
          (addr) => addr.isDefault,
          orElse: () => _profileController.addresses.first,
        );
      });
    }
  }

  final List<PaymentMethod> _paymentMethods = [
    PaymentMethod(
      id: 'evcplus',
      name: 'EVC Plus',
      logo: 'assets/images/Hormuud.png',
      color: const Color(0xFFE53935),
      description: 'Pay with Hormuud EVC Plus',
      provider: 'waafipay',
    ),
    PaymentMethod(
      id: 'edahab',
      name: 'eDahab',
      logo: 'assets/logos/GANACSADE LOGO-06.png', // TODO: Add Dahabshiil logo
      color: const Color(0xFF7EB725),
      description: 'Pay with Dahabshiil eDahab',
      provider: 'edahab',
    ),
    PaymentMethod(
      id: 'zaad',
      name: 'ZAAD',
      logo: 'assets/images/Telesom.png',
      color: const Color(0xFF133191),
      description: 'Pay with Telesom ZAAD',
      provider: 'waafipay',
    ),
    PaymentMethod(
      id: 'waafi',
      name: 'WAAFI',
      logo: 'assets/images/Golis.png',
      color: const Color(0xFF133191),
      description: 'Pay with Golis WAAFI',
      provider: 'waafipay',
    ),
    PaymentMethod(
      id: 'sahal',
      name: 'SAHAL',
      logo: 'assets/images/Somtel.png',
      color: const Color(0xFF00897B),
      description: 'Pay with Somtel SAHAL',
      provider: 'waafipay',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          onPressed: () {
            // Dismiss keyboard before going back
            FocusManager.instance.primaryFocus?.unfocus();
            Navigator.pop(context);
          },
          icon: const Icon(Icons.arrow_back),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Checkout Advertisement Banner
                  const CheckoutAdvertisementBanner(),
                  _buildOrderSummary(),
                  const SizedBox(height: 24),
                  _buildDeliveryInfo(),
                  const SizedBox(height: 24),
                  _buildPaymentMethods(),
                  const SizedBox(height: 24),
                  _buildAdditionalNotes(),
                ],
              ),
            ),
          ),
          _buildCheckoutButton(),
        ],
      ),
    );
  }

  Widget _buildOrderSummary() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.shopping_bag_outlined,
                color: AppColors.primaryGreen,
                size: 24,
              ),
              const SizedBox(width: 12),
              Text(
                'Order Summary',
                style: AppTextStyles.titleLarge.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Order Items
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _cartController.cartItems.length,
            itemBuilder: (context, index) {
              final item = _cartController.cartItems[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: AppColors.grey100,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: _buildProductImage(item.product.images.isNotEmpty ? item.product.images.first : 'placeholder'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.product.name,
                            style: AppTextStyles.bodyMedium.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            'Qty: ${item.quantity}',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.grey600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '\$${(item.product.discountPrice * item.quantity).toStringAsFixed(2)}',
                      style: AppTextStyles.titleSmall.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
          
          const Divider(height: 24),
          
          // Price Breakdown
          _buildPriceRow('Subtotal', '\$${_cartController.subtotal.toStringAsFixed(2)}'),
          _buildPriceRow('Shipping', _cartController.shipping == 0 ? 'Free' : '\$${_cartController.shipping.toStringAsFixed(2)}'),
          _buildPriceRow('Tax', '\$${_cartController.tax.toStringAsFixed(2)}'),
          const Divider(height: 16),
          _buildPriceRow(
            'Total',
            '\$${_cartController.finalTotal.toStringAsFixed(2)}',
            isTotal: true,
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 600.ms)
        .slideY(begin: 0.3, end: 0);
  }

  Widget _buildPriceRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: isTotal
                ? AppTextStyles.titleMedium.copyWith(fontWeight: FontWeight.bold)
                : AppTextStyles.bodyMedium,
          ),
          Text(
            value,
            style: isTotal
                ? AppTextStyles.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryGreen,
                  )
                : AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryInfo() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.location_on_outlined,
                color: AppColors.primaryGreen,
                size: 24,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Delivery Information',
                  style: AppTextStyles.titleLarge.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              TextButton.icon(
                onPressed: () async {
                  await Get.to(() => const AddressesScreen());
                  await _profileController.reloadAddresses();
                  if (mounted) _initializeSelectedAddress();
                },
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add New'),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primaryGreen,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Address Selection
          Obx(() {
            if (_profileController.isLoadingAddresses.value) {
              return const Center(
                child: Padding(
                  padding: EdgeInsets.all(20.0),
                  child: CircularProgressIndicator(),
                ),
              );
            }

            if (_profileController.addresses.isEmpty) {
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.grey50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.grey200),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.location_off_outlined,
                      size: 48,
                      color: AppColors.grey400,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'No saved addresses',
                      style: AppTextStyles.titleMedium.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.grey700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Add a delivery address to continue',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.grey600,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () {
                        Get.to(() => const AddressesScreen());
                      },
                      icon: const Icon(Icons.add, size: 18),
                      label: const Text('Add Address'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        foregroundColor: AppColors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }

            return Column(
              children: _profileController.addresses.map((address) {
                final isSelected = _selectedAddress?.id == address.id;
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedAddress = address;
                    });
                    HapticFeedback.lightImpact();
                  },
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primaryGreen.withOpacity(0.1)
                          : AppColors.grey50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.primaryGreen
                            : AppColors.grey200,
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isSelected
                              ? Icons.check_circle
                              : Icons.circle_outlined,
                          color: isSelected
                              ? AppColors.primaryGreen
                              : AppColors.grey400,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    address.title,
                                    style: AppTextStyles.bodyLarge.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  if (address.isDefault) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 6,
                                        vertical: 2,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryGreen,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Text(
                                        'Default',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 10,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${address.street}, ${address.city}',
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.grey700,
                                ),
                              ),
                              Text(
                                '${address.fullName} • ${address.phoneNumber}',
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: AppColors.grey500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            );
          }),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 600.ms, delay: 200.ms)
        .slideY(begin: 0.3, end: 0);
  }

  Widget _buildPaymentMethods() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.payment_outlined,
                color: AppColors.primaryGreen,
                size: 24,
              ),
              const SizedBox(width: 12),
              Text(
                'Payment Method',
                style: AppTextStyles.titleLarge.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Select Payment Button or Selected Payment Display
          if (_selectedPaymentMethod.isEmpty)
            // Show "Select Payment" button
            Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: _showPaymentMethodsPopup,
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.grey300),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          color: AppColors.grey100,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          Icons.account_balance_wallet_outlined,
                          color: AppColors.grey500,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Text(
                          'Select Payment Method',
                          style: AppTextStyles.titleMedium.copyWith(
                            color: AppColors.grey600,
                          ),
                        ),
                      ),
                      Icon(
                        Icons.arrow_forward_ios,
                        color: AppColors.grey400,
                        size: 16,
                      ),
                    ],
                  ),
                ),
              ),
            )
          else
            // Show selected payment with phone input
            Column(
              children: [
                // Selected Payment Method
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: _showPaymentMethodsPopup,
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        border: Border.all(color: AppColors.primaryGreen, width: 2),
                        borderRadius: BorderRadius.circular(12),
                        color: AppColors.primaryGreen.withOpacity(0.05),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              color: _getSelectedPaymentColor().withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: _getSelectedPaymentColor().withOpacity(0.3),
                              ),
                            ),
                            child: Center(
                              child: Text(
                                _selectedPaymentName.isNotEmpty 
                                    ? _selectedPaymentName.substring(0, 1) 
                                    : 'P',
                                style: AppTextStyles.titleLarge.copyWith(
                                  color: _getSelectedPaymentColor(),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _selectedPaymentName,
                                  style: AppTextStyles.titleMedium.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                Text(
                                  'Tap to change',
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: AppColors.grey500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                // Phone Number Input
                TextFormField(
                  controller: _paymentPhoneController,
                  decoration: InputDecoration(
                    labelText: '$_selectedPaymentName Phone Number',
                    hintText: 'Enter your $_selectedPaymentName number',
                    prefixIcon: const Icon(Icons.phone_outlined),
                    prefixText: '+252 ',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: _getSelectedPaymentColor(), width: 2),
                    ),
                    helperText: 'Payment will be charged to this number',
                    helperStyle: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.grey500,
                    ),
                  ),
                  keyboardType: TextInputType.phone,
                  onChanged: (_) => setState(() {}),
                ),
              ],
            ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 600.ms, delay: 400.ms)
        .slideY(begin: 0.3, end: 0);
  }

  Color _getSelectedPaymentColor() {
    final method = _paymentMethods.where((m) => m.id == _selectedPaymentMethod).firstOrNull;
    return method?.color ?? AppColors.primaryGreen;
  }

  void _showPaymentMethodsPopup() {
    HapticFeedback.lightImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.grey300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            // Title
            Text(
              'Select Payment Method',
              style: AppTextStyles.titleLarge.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Choose how you want to pay',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.grey600,
              ),
            ),
            const SizedBox(height: 20),
            // Payment Methods Grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.5,
              ),
              itemCount: _paymentMethods.length,
              itemBuilder: (context, index) {
                final method = _paymentMethods[index];
                final isSelected = _selectedPaymentMethod == method.id;
                
                return Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () {
                      HapticFeedback.lightImpact();
                      setState(() {
                        _selectedPaymentMethod = method.id;
                        _selectedPaymentName = method.name;
                      });
                      Navigator.pop(context);
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: isSelected ? method.color : AppColors.grey300,
                          width: isSelected ? 2 : 1,
                        ),
                        borderRadius: BorderRadius.circular(12),
                        color: isSelected ? method.color.withOpacity(0.1) : null,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: method.color.withOpacity(0.15),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                method.name.substring(0, 1),
                                style: AppTextStyles.titleMedium.copyWith(
                                  color: method.color,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            method.name,
                            style: AppTextStyles.titleSmall.copyWith(
                              fontWeight: FontWeight.w600,
                              color: isSelected ? method.color : AppColors.grey800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildAdditionalNotes() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.note_outlined,
                color: AppColors.primaryGreen,
                size: 24,
              ),
              const SizedBox(width: 12),
              Text(
                'Additional Notes',
                style: AppTextStyles.titleLarge.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          TextFormField(
            controller: _notesController,
            decoration: InputDecoration(
              hintText: 'Any special instructions for delivery...',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: AppColors.primaryGreen),
              ),
            ),
            maxLines: 3,
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 600.ms, delay: 600.ms)
        .slideY(begin: 0.3, end: 0);
  }

  Widget _buildCheckoutButton() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _selectedPaymentMethod.isNotEmpty && 
                      _paymentPhoneController.text.isNotEmpty && 
                      _selectedAddress != null
                ? _processOrder
                : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGreen,
              foregroundColor: AppColors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              disabledBackgroundColor: AppColors.grey300,
            ),
            child: Text(
              'Place Order (\$${_cartController.finalTotal.toStringAsFixed(2)})',
              style: AppTextStyles.titleMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _processOrder() async {
    if (_isProcessing) return;
    
    setState(() => _isProcessing = true);
    HapticFeedback.lightImpact();
    
    // Show loading dialog with message
    _showLoadingDialog('Creating order...');
    
    try {
      // Prepare order items
      final items = _cartController.cartItems.map((item) => {
        'productId': item.product.id,
        'productName': item.product.name,
        'productImage': item.product.images.isNotEmpty ? item.product.images.first : null,
        'unitPrice': item.product.finalPrice,
        'discountAmount': item.product.hasDiscount ? (item.product.price - item.product.finalPrice) : 0,
        'quantity': item.quantity,
        'total': item.product.finalPrice * item.quantity,
      }).toList();

      // Prepare shipping address
      final shippingAddress = {
        'phone': _selectedAddress?.phoneNumber ?? _paymentPhoneController.text.trim(),
        'fullName': _selectedAddress?.fullName ?? '',
        'street': _selectedAddress?.street ?? '',
        'city': _selectedAddress?.city ?? '',
        'state': _selectedAddress?.state ?? '',
        'country': _selectedAddress?.country ?? '',
        'postalCode': _selectedAddress?.postalCode ?? '',
      };

      // Prepare payment method
      final selectedMethod = _paymentMethods.firstWhere((m) => m.id == _selectedPaymentMethod);
      final paymentMethod = {
        'method': _selectedPaymentMethod,
        'name': selectedMethod.name,
        'provider': selectedMethod.provider,
      };

      // Step 1: Process payment first
      _updateLoadingDialog('Please approve the payment\non your phone');

      print('💳 Processing payment via ${selectedMethod.provider} for phone: ${_paymentPhoneController.text.trim()}, amount: ${_cartController.finalTotal}');
      print('⏳ Waiting for payment confirmation (up to 90 seconds)...');
      
      final paymentResponse = await _paymentApiService.processPaymentDirect(
        phoneNumber: _paymentPhoneController.text.trim(),
        amount: _cartController.finalTotal,
        description: 'Order payment',
        provider: selectedMethod.provider,
      );
      
      print('✅ Payment Response received: $paymentResponse');

      if (paymentResponse['success'] == true) {
        // Payment successful - now create the order
        _updateLoadingDialog('Payment successful!\nCreating your order...');
        
        final orderResponse = await _ordersApiService.createOrder(
          items: items,
          shippingAddress: shippingAddress,
          paymentMethod: paymentMethod,
          subtotal: _cartController.subtotal,
          tax: _cartController.tax,
          shipping: _cartController.shipping,
          discount: 0,
          total: _cartController.finalTotal,
          notes: _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : null,
          transactionId: paymentResponse['data']?['transactionId'],
        );

        _closeLoadingDialog();

        if (orderResponse['success'] == true) {
          final orderNumber = orderResponse['data']?['orderNumber'] ?? 'N/A';
          
          _cartController.clearCart();
          _closeLoadingDialog();

          Get.find<NavigationController>().resetToHome();
          Get.offAllNamed('/main');

          await Future.delayed(const Duration(milliseconds: 300));
          
          _showSuccessDialog(
            orderNumber: orderNumber,
            transactionId: paymentResponse['data']?['transactionId'],
          );
        } else {
          // Order creation failed but payment succeeded - this is rare
          _closeLoadingDialog();
          _cartController.clearCart();
          Get.find<NavigationController>().resetToHome();
          Get.offAllNamed('/main');
          await Future.delayed(const Duration(milliseconds: 300));
          _showSuccessDialog(
            orderNumber: 'Processing',
            transactionId: paymentResponse['data']?['transactionId'],
          );
        }
      } else {
        _closeLoadingDialog();
        // Payment failed - don't create order, user can retry
        _showPaymentFailedDialog(
          message: _translateErrorMessage(paymentResponse['message']),
        );
      }
    } catch (e) {
      _closeLoadingDialog();
      _showPaymentFailedDialog(message: 'payment_error'.tr);
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  /// Translate error messages using localization
  String _translateErrorMessage(String? message) {
    if (message == null || message.isEmpty) {
      return 'payment_error'.tr;
    }
    
    final lowerMessage = message.toLowerCase();
    
    // Timeout errors
    if (lowerMessage.contains('timeout') || lowerMessage.contains('took longer')) {
      return 'payment_timeout'.tr;
    }
    
    // Balance errors
    if (lowerMessage.contains('insufficient') || lowerMessage.contains('balance')) {
      return 'payment_insufficient'.tr;
    }
    
    // Connection errors
    if (lowerMessage.contains('connection') || lowerMessage.contains('network')) {
      return 'payment_network_error'.tr;
    }
    
    // Invalid credentials
    if (lowerMessage.contains('invalid') || lowerMessage.contains('credentials')) {
      return 'payment_error'.tr;
    }
    
    // Cancelled by user
    if (lowerMessage.contains('cancel') || lowerMessage.contains('rejected')) {
      return 'payment_cancelled'.tr;
    }
    
    // Payment not completed
    if (lowerMessage.contains('not completed')) {
      return 'payment_not_completed'.tr;
    }
    
    // Default short message
    return 'payment_error'.tr;
  }

  void _showLoadingDialog(String message) {
    Get.dialog(
      WillPopScope(
        onWillPop: () async => false,
        child: Center(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 40),
            margin: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.15),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Animated payment icon
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppColors.primaryGreen,
                        AppColors.primaryGreen.withOpacity(0.7),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primaryGreen.withOpacity(0.3),
                        blurRadius: 15,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.phone_android_rounded,
                    color: AppColors.white,
                    size: 36,
                  ),
                ),
                const SizedBox(height: 28),
                // Loading indicator
                SizedBox(
                  width: 40,
                  height: 40,
                  child: CircularProgressIndicator(
                    strokeWidth: 3,
                    valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryGreen),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Processing Payment',
                  style: AppTextStyles.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.grey900,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  message,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.grey600,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                // Security badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.grey100,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.lock_rounded,
                        size: 14,
                        color: AppColors.grey600,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Secure Payment',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.grey600,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }

  void _updateLoadingDialog(String message) {
    if (Get.isDialogOpen ?? false) {
      Get.back();
    }
    _showLoadingDialog(message);
  }

  void _closeLoadingDialog() {
    if (Get.isDialogOpen ?? false) {
      Get.back();
    }
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
            width: 30,
            height: 30,
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) => Icon(
              Icons.image_outlined,
              size: 30,
              color: AppColors.grey400,
            ),
          ),
        ],
      ),
    );
  }

  void _showSuccessDialog({String? orderNumber, String? transactionId}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        child: Container(
          padding: const EdgeInsets.all(32),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Success animation container
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.primaryGreen,
                      AppColors.primaryGreen.withOpacity(0.8),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primaryGreen.withOpacity(0.4),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.check_rounded,
                  color: AppColors.white,
                  size: 50,
                ),
              ),
              const SizedBox(height: 28),
              Text(
                'Payment Successful!',
                style: AppTextStyles.headlineSmall.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryGreen,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              // Order info card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppColors.primaryGreen.withOpacity(0.2),
                  ),
                ),
                child: Column(
                  children: [
                    if (orderNumber != null) ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Order Number',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.grey600,
                            ),
                          ),
                          Text(
                            orderNumber,
                            style: AppTextStyles.bodyMedium.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.grey900,
                            ),
                          ),
                        ],
                      ),
                    ],
                    if (transactionId != null) ...[
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Transaction ID',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.grey600,
                            ),
                          ),
                          Text(
                            transactionId.length > 12 
                                ? '${transactionId.substring(0, 12)}...' 
                                : transactionId,
                            style: AppTextStyles.bodySmall.copyWith(
                              fontWeight: FontWeight.w500,
                              color: AppColors.grey700,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Thank you for your order! We\'ll start preparing it right away.',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.grey600,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(dialogContext).pop();
                    Get.find<NavigationController>().resetToHome();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                    foregroundColor: AppColors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    'Continue Shopping',
                    style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showPaymentFailedDialog({required String message}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        child: Container(
          padding: const EdgeInsets.all(32),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Failed icon
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.red.shade500,
                      Colors.red.shade400,
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.red.withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.close_rounded,
                  color: AppColors.white,
                  size: 50,
                ),
              ),
              const SizedBox(height: 28),
              Text(
                'payment_failed'.tr,
                style: AppTextStyles.headlineSmall.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.red.shade600,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              // Error message card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.red.shade100,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.info_outline_rounded,
                      color: Colors.red.shade400,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        message,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: Colors.red.shade700,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'payment_order_not_created'.tr,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.grey600,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 28),
              // Retry button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(dialogContext).pop(); // Close dialog only, stay on checkout to retry
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                    foregroundColor: AppColors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    'payment_try_again'.tr,
                    style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Cancel button
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () {
                    Navigator.of(dialogContext).pop(); // Close dialog
                    Get.back(); // Close checkout
                  },
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: Text(
                    'cancel'.tr,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.grey600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _paymentPhoneController.dispose();
    _notesController.dispose();
    super.dispose();
  }
}

class PaymentMethod {
  final String id;
  final String name;
  final String logo;
  final Color color;
  final String description;
  final String provider;

  PaymentMethod({
    required this.id,
    required this.name,
    required this.logo,
    required this.color,
    required this.description,
    this.provider = 'waafipay',
  });
}
