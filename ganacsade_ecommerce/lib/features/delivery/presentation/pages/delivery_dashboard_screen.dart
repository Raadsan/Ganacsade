import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../controllers/delivery_dashboard_controller.dart';
import '../widgets/delivery_widgets.dart';

class DeliveryDashboardScreen extends StatelessWidget {
  const DeliveryDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(DeliveryDashboardController());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Dashboard'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        actions: [
          IconButton(
            onPressed: controller.fetchDashboard,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value && controller.stats.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (controller.errorMessage.value.isNotEmpty && controller.stats.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    controller.errorMessage.value,
                    textAlign: TextAlign.center,
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.error),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: controller.fetchDashboard,
                    child: const Text('Try again'),
                  ),
                ],
              ),
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: controller.fetchDashboard,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(
                'Overview of your assigned deliveries and performance',
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.grey600),
              ),
              const SizedBox(height: 16),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.35,
                children: [
                  DeliveryStatCard(
                    title: 'Active Orders',
                    value: '${controller.statInt('activeCount')}',
                    subtitle: 'Orders waiting for delivery',
                    icon: Icons.local_shipping_outlined,
                    color: Colors.blue,
                  ),
                  DeliveryStatCard(
                    title: 'Delivered',
                    value: '${controller.statInt('deliveredCount')}',
                    subtitle: 'Completed deliveries',
                    icon: Icons.check_circle_outline,
                    color: AppColors.primaryGreen,
                  ),
                  DeliveryStatCard(
                    title: 'Delivered Today',
                    value: '${controller.statInt('todayDelivered')}',
                    subtitle: 'Completed today',
                    icon: Icons.inventory_2_outlined,
                    color: Colors.teal,
                  ),
                  DeliveryStatCard(
                    title: 'Total Deliveries',
                    value: '${controller.statInt('totalDeliveries')}',
                    subtitle: 'Rating ${controller.statDouble('rating').toStringAsFixed(1)}',
                    icon: Icons.star_outline,
                    color: Colors.amber,
                  ),
                  DeliveryStatCard(
                    title: 'Pending',
                    value: '${controller.statInt('pendingCount')}',
                    subtitle: 'Awaiting action',
                    icon: Icons.schedule,
                    color: Colors.orange,
                  ),
                  DeliveryStatCard(
                    title: 'Processing',
                    value: '${controller.statInt('processingCount')}',
                    subtitle: 'In progress',
                    icon: Icons.sync,
                    color: Colors.indigo,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              DeliveryStatCard(
                title: 'Availability',
                value: controller.isAvailable ? 'Available' : 'Unavailable',
                subtitle: 'Your current delivery status',
                icon: Icons.delivery_dining,
                color: controller.isAvailable ? AppColors.primaryGreen : AppColors.error,
              ),
              const SizedBox(height: 16),
              DeliveryStatusChart(
                pending: controller.statInt('pendingCount'),
                processing: controller.statInt('processingCount'),
                delivered: controller.statInt('deliveredCount'),
              ),
              const SizedBox(height: 20),
              DeliverySectionHeader(
                title: 'Active Assigned Orders',
                subtitle: 'Recent orders waiting for delivery',
              ),
              const SizedBox(height: 12),
              if (controller.recentActive.isEmpty)
                Text(
                  'No active orders right now.',
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.grey600),
                )
              else
                ...controller.recentActive.map(
                  (order) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: DeliveryOrderCard(order: order),
                  ),
                ),
              const SizedBox(height: 8),
              DeliverySectionHeader(
                title: 'Recent History',
                subtitle: 'Latest completed deliveries',
              ),
              const SizedBox(height: 12),
              if (controller.recentDelivered.isEmpty)
                Text(
                  'No completed deliveries yet.',
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.grey600),
                )
              else
                ...controller.recentDelivered.map(
                  (order) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: DeliveryOrderCard(order: order, showDeliveredDate: true),
                  ),
                ),
              const SizedBox(height: 80),
            ],
          ),
        );
      }),
    );
  }
}
