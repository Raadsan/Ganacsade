import 'package:get/get.dart';

class NavigationController extends GetxController {
  final _currentIndex = 0.obs;
  final _cartItemCount = 0.obs;

  int get currentIndex => _currentIndex.value;
  int get cartItemCount => _cartItemCount.value;

  void changeIndex(int index) {
    _currentIndex.value = index;
    update();
  }

  void updateCartCount(int count) {
    _cartItemCount.value = count;
    update();
  }

  void resetToHome() {
    _currentIndex.value = 0;
    update();
  }
}
