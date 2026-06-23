import 'package:get/get.dart';
import '../../data/delivery_api_service.dart';

class DeliveryDashboardController extends GetxController {
  final DeliveryApiService _api = DeliveryApiService();

  final RxBool isLoading = false.obs;
  final RxString errorMessage = ''.obs;
  final RxMap<String, dynamic> stats = <String, dynamic>{}.obs;
  final RxList<Map<String, dynamic>> recentActive = <Map<String, dynamic>>[].obs;
  final RxList<Map<String, dynamic>> recentDelivered = <Map<String, dynamic>>[].obs;

  @override
  void onInit() {
    super.onInit();
    fetchDashboard();
  }

  Future<void> fetchDashboard() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      final data = await _api.getDashboard();
      stats.value = data.stats;
      recentActive.value = data.recentActive;
      recentDelivered.value = data.recentDelivered;
    } catch (e) {
      errorMessage.value = e.toString().replaceAll('Exception: ', '');
    } finally {
      isLoading.value = false;
    }
  }

  int statInt(String key) {
    final value = stats[key];
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse('$value') ?? 0;
  }

  double statDouble(String key) {
    final value = stats[key];
    if (value is double) return value;
    if (value is num) return value.toDouble();
    return double.tryParse('$value') ?? 0;
  }

  bool get isAvailable => stats['isAvailable'] != false;
}
