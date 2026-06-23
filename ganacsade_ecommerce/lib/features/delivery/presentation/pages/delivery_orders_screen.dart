import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../controllers/delivery_orders_controller.dart';
import '../widgets/delivery_widgets.dart';

class DeliveryOrdersScreen extends StatelessWidget {
  const DeliveryOrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(DeliveryOrdersController());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Assigned Orders'),
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
            Expanded(child: _buildBody(controller)),
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
          'No assigned orders yet',
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
          final status = order['status']?.toString() ?? 'pending';

          return DeliveryOrderCard(
            order: order,
            onMarkDelivered: status != 'delivered'
                ? () async {
                    final success = await controller.markDelivered(order['id'].toString());
                    if (success) {
                      Get.snackbar('Success', 'Order marked as delivered');
                    } else if (controller.errorMessage.value.isNotEmpty) {
                      Get.snackbar('Error', controller.errorMessage.value);
                    }
                  }
                : null,
          );
        },
      ),
    );
  }
}
