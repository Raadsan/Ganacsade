import 'package:get/get.dart';
import '../../data/data_packages_api_service.dart';
import '../../models/telecom_provider.dart';
import '../pages/package_names_screen.dart';

/// Controller for Data Packages feature
class DataPackagesController extends GetxController {
  // API Service
  final _apiService = DataPackagesApiService();

  // Observable state
  final providers = <TelecomProvider>[].obs;
  final selectedProvider = Rxn<TelecomProvider>();
  final isLoading = false.obs;
  final errorMessage = ''.obs;
  final resellerId = 0.obs;

  @override
  void onInit() {
    super.onInit();
    loadProviders();
  }

  /// Load telecom providers from API
  Future<void> loadProviders() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      
      print('DataPackagesController: Loading providers...');
      final response = await _apiService.findReseller();
      print('DataPackagesController: Response status: ${response['status']}');
      
      if (response['status'] == 'Success' && response['data'] != null) {
        final data = response['data'];
        resellerId.value = data['id'] ?? 0;
        print('DataPackagesController: Reseller ID: ${resellerId.value}');
        
        final companies = data['companies'] as List<dynamic>? ?? [];
        print('DataPackagesController: Found ${companies.length} companies');
        
        final allProviders = companies.map((c) => TelecomProvider.fromJson(c)).toList();
        print('DataPackagesController: Parsed ${allProviders.length} providers');
        
        for (var p in allProviders) {
          print('DataPackagesController: Provider ${p.name} has ${p.packages.length} packages');
        }
        
        providers.value = allProviders;
        print('DataPackagesController: ${providers.length} total providers');
      } else {
        errorMessage.value = response['message'] ?? 'Failed to load providers';
        print('DataPackagesController: Error - ${errorMessage.value}');
      }
      
    } catch (e, stack) {
      errorMessage.value = 'Failed to load providers: $e';
      print('DataPackagesController: Exception - $e');
      print('DataPackagesController: Stack - $stack');
    } finally {
      isLoading.value = false;
    }
  }

  /// Select a telecom provider
  void selectProvider(TelecomProvider provider) {
    if (selectedProvider.value?.id == provider.id) {
      // Deselect if already selected
      selectedProvider.value = null;
    } else {
      selectedProvider.value = provider;
    }
  }

  /// Check if a provider is selected
  bool isProviderSelected(TelecomProvider provider) {
    return selectedProvider.value?.id == provider.id;
  }

  /// Proceed to next step (package names screen - shows grouped package types)
  void proceedToPackages() {
    if (selectedProvider.value == null) {
      Get.snackbar(
        'Select Provider',
        'Please select a telecom provider to continue',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    
    // Navigate to package names screen (shows package types/names grouped)
    Get.to(
      () => PackageNamesScreen(provider: selectedProvider.value!),
      transition: Transition.rightToLeft,
    );
  }

  /// Refresh providers list
  Future<void> refreshProviders() async {
    await loadProviders();
  }
}
