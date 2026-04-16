import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../models/telecom_provider.dart';
import '../pages/phone_entry_screen.dart';

/// Payment method model for data packages
class DataPaymentMethod {
  final String id;
  final String name;
  final String logo;
  final Color color;
  final String provider;

  const DataPaymentMethod({
    required this.id,
    required this.name,
    required this.logo,
    required this.color,
    required this.provider,
  });

  static List<DataPaymentMethod> get availableMethods => [
    const DataPaymentMethod(
      id: 'evcplus',
      name: 'EVC Plus',
      logo: 'assets/images/Hormuud.png',
      color: Color(0xFF133191),
      provider: 'waafipay',
    ),
    const DataPaymentMethod(
      id: 'edahab',
      name: 'eDahab',
      logo: 'assets/images/edahab.png',
      color: Color(0xFF7EB725),
      provider: 'edahab',
    ),
    const DataPaymentMethod(
      id: 'zaad',
      name: 'ZAAD',
      logo: 'assets/images/Telesom.png',
      color: Color(0xFF133191),
      provider: 'waafipay',
    ),
  ];
}

/// Professional payment method selection bottom sheet
class PaymentMethodSheet extends StatefulWidget {
  final DataPackageApi package;
  final TelecomProvider provider;

  const PaymentMethodSheet({
    super.key,
    required this.package,
    required this.provider,
  });

  static Future<void> show({
    required BuildContext context,
    required DataPackageApi package,
    required TelecomProvider provider,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => PaymentMethodSheet(
        package: package,
        provider: provider,
      ),
    );
  }

  @override
  State<PaymentMethodSheet> createState() => _PaymentMethodSheetState();
}

class _PaymentMethodSheetState extends State<PaymentMethodSheet> {
  String? _selectedMethodId;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardBackground : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Title
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
            child: Text(
              'select_payment_method'.tr,
              style: AppTextStyles.titleLarge.copyWith(
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),

          // Payment methods list
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: DataPaymentMethod.availableMethods.map((method) {
                return _buildPaymentMethodTile(method, isDark);
              }).toList(),
            ),
          ),

          const SizedBox(height: 24),

          // Next button
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: SafeArea(
              top: false,
              child: SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _selectedMethodId != null ? _onNext : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: Colors.grey.withValues(alpha: 0.3),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: Text(
                    'next'.tr,
                    style: AppTextStyles.titleMedium.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodTile(DataPaymentMethod method, bool isDark) {
    final isSelected = _selectedMethodId == method.id;

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        setState(() {
          _selectedMethodId = method.id;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primaryGreen.withValues(alpha: 0.08)
              : (isDark ? Colors.white.withValues(alpha: 0.03) : Colors.grey.withValues(alpha: 0.05)),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? AppColors.primaryGreen : Colors.grey.withValues(alpha: 0.15),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            // Logo
            Container(
              width: 56,
              height: 40,
              decoration: BoxDecoration(
                color: method.color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.asset(
                  method.logo,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) {
                    return Center(
                      child: Text(
                        method.name.substring(0, 3).toUpperCase(),
                        style: TextStyle(
                          color: method.color,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            const SizedBox(width: 14),

            // Name
            Expanded(
              child: Text(
                method.name,
                style: AppTextStyles.bodyLarge.copyWith(
                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                ),
              ),
            ),

            // Checkmark
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primaryGreen : Colors.transparent,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? AppColors.primaryGreen : Colors.grey.withValues(alpha: 0.3),
                  width: 2,
                ),
              ),
              child: isSelected
                  ? const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 16,
                    )
                  : null,
            ),
          ],
        ),
      ),
    );
  }

  void _onNext() {
    Navigator.pop(context);
    Get.to(
      () => PhoneEntryScreen(
        package: widget.package,
        provider: widget.provider,
      ),
      transition: Transition.rightToLeft,
    );
  }
}
