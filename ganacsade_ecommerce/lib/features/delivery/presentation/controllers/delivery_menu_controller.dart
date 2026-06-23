import 'package:get/get.dart';
import 'package:ganacsade/core/network/menus_api_service.dart';
import 'package:ganacsade/features/delivery/presentation/config/delivery_menu_registry.dart';

class DeliveryMenuController extends GetxController {
  final MenusApiService _menusApi = MenusApiService();

  final RxBool isLoading = true.obs;
  final RxString errorMessage = ''.obs;
  final RxList<DeliveryNavItem> navItems = <DeliveryNavItem>[].obs;

  @override
  void onInit() {
    super.onInit();
    loadMenus();
  }

  Future<void> loadMenus() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      final menus = await _menusApi.getMyMenus();
      final mapped = <DeliveryNavItem>[];

      for (final menu in menus) {
        final item = DeliveryMenuRegistry.fromMenu(menu);
        if (item != null) mapped.add(item);
      }

      navItems.value = mapped.isNotEmpty ? mapped : DeliveryMenuRegistry.fallbackItems();
    } catch (e) {
      errorMessage.value = e.toString().replaceAll('Exception: ', '');
      navItems.value = DeliveryMenuRegistry.fallbackItems();
    } finally {
      isLoading.value = false;
    }
  }
}
