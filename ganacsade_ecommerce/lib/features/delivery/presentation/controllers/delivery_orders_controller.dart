import 'package:get/get.dart';
import '../../data/delivery_api_service.dart';

class DeliveryOrdersController extends GetxController {
  DeliveryOrdersController({this.historyMode = false});

  final bool historyMode;
  final DeliveryApiService _api = DeliveryApiService();

  final RxBool isLoading = false.obs;
  final RxString errorMessage = ''.obs;
  final RxList<Map<String, dynamic>> orders = <Map<String, dynamic>>[].obs;
  final RxString searchQuery = ''.obs;
  final RxString statusFilter = 'all'.obs;
  final Rxn<DateTime> dateFrom = Rxn<DateTime>();
  final Rxn<DateTime> dateTo = Rxn<DateTime>();

  @override
  void onInit() {
    super.onInit();
    if (historyMode) {
      statusFilter.value = 'delivered';
    }
    fetchOrders();
  }

  String? _formatDate(DateTime? date) {
    if (date == null) return null;
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  void updateSearch(String value) {
    searchQuery.value = value;
    fetchOrders();
  }

  void updateStatusFilter(String value) {
    statusFilter.value = value;
    fetchOrders();
  }

  void updateDateFrom(DateTime? value) {
    dateFrom.value = value;
    fetchOrders();
  }

  void updateDateTo(DateTime? value) {
    dateTo.value = value;
    fetchOrders();
  }

  void clearFilters() {
    searchQuery.value = '';
    statusFilter.value = historyMode ? 'delivered' : 'all';
    dateFrom.value = null;
    dateTo.value = null;
    fetchOrders();
  }

  Future<void> fetchOrders() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      final status = statusFilter.value;
      orders.value = await _api.getMyAssignedOrders(
        status: historyMode
            ? 'delivered'
            : (status != 'all' ? status : null),
        excludeStatus: !historyMode && status == 'all' ? 'delivered' : null,
        search: searchQuery.value.trim().isEmpty ? null : searchQuery.value.trim(),
        dateFrom: _formatDate(dateFrom.value),
        dateTo: _formatDate(dateTo.value),
      );
    } catch (e) {
      errorMessage.value = e.toString().replaceAll('Exception: ', '');
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> markDelivered(String orderId) async {
    try {
      await _api.markDelivered(orderId, notes: 'Delivered by delivery person');
      await fetchOrders();
      return true;
    } catch (e) {
      errorMessage.value = e.toString().replaceAll('Exception: ', '');
      return false;
    }
  }
}
