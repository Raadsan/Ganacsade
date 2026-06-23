import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../controllers/delivery_orders_controller.dart';
import '../widgets/delivery_widgets.dart';

class DeliveryOrdersHistoryScreen extends StatelessWidget {
  const DeliveryOrdersHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(
      DeliveryOrdersController(historyMode: true),
      tag: 'history',
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery History'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        actions: [
          IconButton(
            onPressed: controller.fetchOrders,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Obx(() {
        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: DeliveryFiltersPanel(
                historyMode: true,
                search: controller.searchQuery.value,
                status: controller.statusFilter.value,
                dateFrom: controller.dateFrom.value,
                dateTo: controller.dateTo.value,
                onSearchChanged: controller.updateSearch,
                onStatusChanged: controller.updateStatusFilter,
                onDateFromChanged: controller.updateDateFrom,
                onDateToChanged: controller.updateDateTo,
                onClear: controller.clearFilters,
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Completed deliveries (${controller.orders.length} orders)',
                  style: AppTextStyles.bodySmall.copyWith(color: AppColors.grey600),
                ),
              ),
            ),
            Expanded(
              child: _buildBody(controller),
            ),
          ],
        );
      }),
    );
  }

  Widget _buildBody(DeliveryOrdersController controller) {
    if (controller.isLoading.value) {
      return const Center(child: CircularProgressIndicator());
    }

    if (controller.errorMessage.value.isNotEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            controller.errorMessage.value,
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.error),
          ),
        ),
      );
    }

    if (controller.orders.isEmpty) {
      return Center(
        child: Text(
          'No delivered orders found',
          style: AppTextStyles.bodyLarge.copyWith(color: AppColors.grey600),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: controller.fetchOrders,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: controller.orders.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final order = controller.orders[index];
          return DeliveryOrderCard(order: order, showDeliveredDate: true);
        },
      ),
    );
  }
}
