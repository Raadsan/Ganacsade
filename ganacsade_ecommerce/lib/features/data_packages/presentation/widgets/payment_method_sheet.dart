import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../models/telecom_provider.dart';
import '../pages/phone_entry_screen.dart';

/// Payment method model for data packages
class DataPaymentMethod {
  final String id;
  final String name;
  final Widget logoWidget;

  const DataPaymentMethod({
    required this.id,
    required this.name,
    required this.logoWidget,
  });
}

/// Professional payment method selection bottom sheet
/// Matches the exact UI requested: EVC+, eDahab, Jeeb with selection checkmark
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

  List<DataPaymentMethod> _getAvailableMethods() {
    return [
      DataPaymentMethod(
        id: 'evc',
        name: 'EVC Plus',
        logoWidget: Container(
          width: 76,
          height: 44,
          decoration: BoxDecoration(
            color: const Color(0xFF007BC2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'EVC',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                    letterSpacing: -0.5,
                  ),
                ),
                Text(
                  '+',
                  style: TextStyle(
                    color: Color(0xFF4CAF50),
                    fontWeight: FontWeight.w900,
                    fontSize: 18,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      DataPaymentMethod(
        id: 'edahab',
        name: 'eDahab',
        logoWidget: Container(
          width: 76,
          height: 44,
          decoration: BoxDecoration(
            color: const Color(0xFF388E3C),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'e',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                  ),
                ),
                Stack(
                  clipBehavior: Clip.none,
                  alignment: Alignment.center,
                  children: [
                    const Text(
                      'D',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                      ),
                    ),
                    Positioned(
                      top: 1,
                      left: -2,
                      child: const Icon(
                        Icons.check,
                        size: 12,
                        color: Color(0xFFFFD54F),
                      ),
                    ),
                  ],
                ),
                const Text(
                  'ahab',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      DataPaymentMethod(
        id: 'jeeb',
        name: 'Jeeb',
        logoWidget: Container(
          width: 76,
          height: 44,
          decoration: BoxDecoration(
            color: const Color(0xFF007BC2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.account_balance_wallet_rounded,
                  color: Colors.white,
                  size: 16,
                ),
                SizedBox(width: 4),
                Text(
                  'Jeeb',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 15,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ];
  }

  void _handleSelectMethod(DataPaymentMethod method) {
    HapticFeedback.lightImpact();
    setState(() {
      _selectedMethodId = method.id;
    });

    // Brief delay to display the selection checkmark before navigating
    Future.delayed(const Duration(milliseconds: 200), () {
      if (!mounted) return;
      Navigator.of(context).pop();
      Get.to(
        () => PhoneEntryScreen(
          package: widget.package,
          provider: widget.provider,
          initialPaymentMethod: method.id,
        ),
        transition: Transition.rightToLeft,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final methods = _getAvailableMethods();

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardBackground : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Drag Handle
            Center(
              child: Container(
                margin: const EdgeInsets.only(top: 10, bottom: 4),
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // Header Title
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 16),
              child: Text(
                'Dooro habka lacag bixinta',
                style: TextStyle(
                  color: isDark ? AppColors.darkTextPrimary : const Color(0xFF0F172A),
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),

            // Payment Methods List
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: methods.map((method) {
                  return _buildPaymentMethodTile(method, isDark);
                }).toList(),
              ),
            ),

            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodTile(DataPaymentMethod method, bool isDark) {
    final isSelected = _selectedMethodId == method.id;

    return GestureDetector(
      onTap: () => _handleSelectMethod(method),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? const Color(0xFF1E293B) : const Color(0xFFF0F9FF))
              : (isDark ? const Color(0xFF18181B) : Colors.white),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF0284C7)
                : (isDark ? Colors.grey.shade800 : const Color(0xFFE2E8F0)),
            width: isSelected ? 1.8 : 1.2,
          ),
        ),
        child: Row(
          children: [
            // Payment method badge/logo
            method.logoWidget,

            const SizedBox(width: 14),

            // Payment method name
            Expanded(
              child: Text(
                method.name,
                style: TextStyle(
                  color: isDark ? AppColors.darkTextPrimary : const Color(0xFF1E293B),
                  fontSize: 16,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                ),
              ),
            ),

            // Checkmark badge when selected
            if (isSelected)
              Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(
                  color: Color(0xFF0284C7),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check,
                  color: Colors.white,
                  size: 15,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
