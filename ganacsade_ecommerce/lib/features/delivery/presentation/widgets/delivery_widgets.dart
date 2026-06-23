import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class DeliveryStatCard extends StatelessWidget {
  const DeliveryStatCard({
    super.key,
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.grey200),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTextStyles.bodySmall.copyWith(color: AppColors.grey600)),
                const SizedBox(height: 6),
                Text(
                  value,
                  style: AppTextStyles.headlineSmall.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(subtitle, style: AppTextStyles.bodySmall.copyWith(color: AppColors.grey500)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
        ],
      ),
    );
  }
}

class DeliveryStatusChart extends StatelessWidget {
  const DeliveryStatusChart({
    super.key,
    required this.pending,
    required this.processing,
    required this.delivered,
  });

  final int pending;
  final int processing;
  final int delivered;

  @override
  Widget build(BuildContext context) {
    final total = pending + processing + delivered;
    final maxValue = [pending, processing, delivered, 1].reduce((a, b) => a > b ? a : b);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.grey200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Delivery Overview', style: AppTextStyles.titleMedium.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(
            total == 0 ? 'No delivery data yet' : '$total total assigned orders',
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.grey600),
          ),
          const SizedBox(height: 20),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              _Bar(label: 'Pending', value: pending, max: maxValue, color: Colors.orange),
              const SizedBox(width: 16),
              _Bar(label: 'Processing', value: processing, max: maxValue, color: Colors.indigo),
              const SizedBox(width: 16),
              _Bar(label: 'Delivered', value: delivered, max: maxValue, color: AppColors.primaryGreen),
            ],
          ),
        ],
      ),
    );
  }
}

class _Bar extends StatelessWidget {
  const _Bar({
    required this.label,
    required this.value,
    required this.max,
    required this.color,
  });

  final String label;
  final int value;
  final int max;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final height = value == 0 ? 8.0 : (value / max) * 120;

    return Expanded(
      child: Column(
        children: [
          Text('$value', style: AppTextStyles.labelLarge.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          AnimatedContainer(
            duration: const Duration(milliseconds: 400),
            height: height,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            textAlign: TextAlign.center,
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.grey600),
          ),
        ],
      ),
    );
  }
}

class DeliveryOrderCard extends StatelessWidget {
  const DeliveryOrderCard({
    super.key,
    required this.order,
    this.showDeliveredDate = false,
    this.onMarkDelivered,
  });

  final Map<String, dynamic> order;
  final bool showDeliveredDate;
  final VoidCallback? onMarkDelivered;

  String _formatDate(dynamic value) {
    if (value == null) return '';
    final date = DateTime.tryParse(value.toString());
    if (date == null) return '';
    return DateFormat('MMM dd, yyyy').format(date.toLocal());
  }

  @override
  Widget build(BuildContext context) {
    final orderNumber = order['order_number']?.toString() ?? 'Order';
    final customerName = order['customer_name']?.toString() ?? 'Customer';
    final total = order['total']?.toString() ?? '0';
    final status = order['status']?.toString() ?? 'pending';
    final paymentStatus = order['payment_status']?.toString() ?? 'pending';
    final date = showDeliveredDate
        ? _formatDate(order['delivery_delivered_at'] ?? order['created_at'])
        : _formatDate(order['created_at']);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.grey200),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(orderNumber, style: AppTextStyles.titleSmall.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(customerName, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.grey700)),
                    if (date.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(date, style: AppTextStyles.bodySmall.copyWith(color: AppColors.grey500)),
                    ],
                  ],
                ),
              ),
              Text(
                '\$$total',
                style: AppTextStyles.titleMedium.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryGreen,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              DeliveryStatusBadge(label: status, tone: _statusTone(status)),
              DeliveryStatusBadge(label: paymentStatus, tone: _paymentTone(paymentStatus)),
            ],
          ),
          if (onMarkDelivered != null) ...[
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onMarkDelivered,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: AppColors.white,
                ),
                child: const Text('Mark Delivered'),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Color _statusTone(String status) {
    switch (status.toLowerCase()) {
      case 'delivered':
        return AppColors.primaryGreen;
      case 'processing':
        return Colors.indigo;
      default:
        return Colors.orange;
    }
  }

  Color _paymentTone(String status) {
    switch (status.toLowerCase()) {
      case 'paid':
        return AppColors.primaryGreen;
      default:
        return Colors.amber.shade700;
    }
  }
}

class DeliveryStatusBadge extends StatelessWidget {
  const DeliveryStatusBadge({super.key, required this.label, required this.tone});

  final String label;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: tone.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: tone.withOpacity(0.25)),
      ),
      child: Text(
        label,
        style: AppTextStyles.bodySmall.copyWith(
          color: tone,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class DeliverySectionHeader extends StatelessWidget {
  const DeliverySectionHeader({super.key, required this.title, this.subtitle});

  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: AppTextStyles.titleMedium.copyWith(fontWeight: FontWeight.bold)),
        if (subtitle != null) ...[
          const SizedBox(height: 4),
          Text(subtitle!, style: AppTextStyles.bodySmall.copyWith(color: AppColors.grey600)),
        ],
      ],
    );
  }
}

class DeliveryFiltersPanel extends StatefulWidget {
  const DeliveryFiltersPanel({
    super.key,
    required this.search,
    required this.status,
    required this.dateFrom,
    required this.dateTo,
    required this.onSearchChanged,
    required this.onStatusChanged,
    required this.onDateFromChanged,
    required this.onDateToChanged,
    required this.onClear,
    this.historyMode = false,
  });

  final String search;
  final String status;
  final DateTime? dateFrom;
  final DateTime? dateTo;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String> onStatusChanged;
  final ValueChanged<DateTime?> onDateFromChanged;
  final ValueChanged<DateTime?> onDateToChanged;
  final VoidCallback onClear;
  final bool historyMode;

  @override
  State<DeliveryFiltersPanel> createState() => _DeliveryFiltersPanelState();
}

class _DeliveryFiltersPanelState extends State<DeliveryFiltersPanel> {
  late final TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController(text: widget.search);
  }

  @override
  void didUpdateWidget(covariant DeliveryFiltersPanel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.search != widget.search && _searchController.text != widget.search) {
      _searchController.text = widget.search;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _pickDate(
    BuildContext context,
    DateTime? initial,
    ValueChanged<DateTime?> onChanged,
  ) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: initial ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    onChanged(picked);
  }

  String _formatDate(DateTime? date) {
    if (date == null) return 'Select date';
    return DateFormat('MMM dd, yyyy').format(date);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.grey200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            controller: _searchController,
            onChanged: widget.onSearchChanged,
            decoration: InputDecoration(
              hintText: 'Search orders by number or customer...',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            ),
          ),
          const SizedBox(height: 12),
          if (!widget.historyMode)
            DropdownButtonFormField<String>(
              value: widget.status,
              decoration: InputDecoration(
                labelText: 'Order Status',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              items: const [
                DropdownMenuItem(value: 'all', child: Text('All Statuses')),
                DropdownMenuItem(value: 'pending', child: Text('Pending')),
                DropdownMenuItem(value: 'processing', child: Text('Processing')),
              ],
              onChanged: (value) => widget.onStatusChanged(value ?? 'all'),
            ),
          if (!widget.historyMode) const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _pickDate(context, widget.dateFrom, widget.onDateFromChanged),
                  icon: const Icon(Icons.calendar_today, size: 16),
                  label: Text(_formatDate(widget.dateFrom), overflow: TextOverflow.ellipsis),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _pickDate(context, widget.dateTo, widget.onDateToChanged),
                  icon: const Icon(Icons.calendar_today, size: 16),
                  label: Text(_formatDate(widget.dateTo), overflow: TextOverflow.ellipsis),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(onPressed: widget.onClear, child: const Text('Clear filters')),
          ),
        ],
      ),
    );
  }
}
