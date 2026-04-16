import 'package:dio/dio.dart';
import 'http_client.dart';

class AdvertisementsApiService {
  final HttpClient _httpClient = HttpClient();

  /// Get advertisements by placement
  /// 
  /// Parameters:
  /// - placement: Filter by placement type (home_slider, home_banner, category_page, product_page, checkout)
  /// 
  /// Returns: Map containing advertisements array
  Future<Map<String, dynamic>> getAdvertisements({String? placement}) async {
    try {
      final queryParams = <String, dynamic>{};
      
      if (placement != null && placement.isNotEmpty) {
        queryParams['placement'] = placement;
      }

      final response = await _httpClient.get(
        '/customer/advertisements',
        queryParameters: queryParams,
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      } else {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: response.data['message'] ?? 'Failed to fetch advertisements',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to fetch advertisements');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    } catch (e) {
      throw Exception('Failed to fetch advertisements: ${e.toString()}');
    }
  }

  /// Get home slider advertisements
  Future<Map<String, dynamic>> getHomeSliderAds() async {
    return getAdvertisements(placement: 'home_slider');
  }

  /// Get home banner advertisements
  Future<Map<String, dynamic>> getHomeBannerAds() async {
    return getAdvertisements(placement: 'home_banner');
  }

  /// Get category page advertisements
  Future<Map<String, dynamic>> getCategoryPageAds() async {
    return getAdvertisements(placement: 'category_page');
  }

  /// Get product page advertisements
  Future<Map<String, dynamic>> getProductPageAds() async {
    return getAdvertisements(placement: 'product_page');
  }

  /// Get checkout page advertisements
  Future<Map<String, dynamic>> getCheckoutAds() async {
    return getAdvertisements(placement: 'checkout');
  }

  /// Record advertisement view
  Future<void> recordView(String advertisementId) async {
    try {
      await _httpClient.post('/customer/advertisements/$advertisementId/view');
    } catch (e) {
      // Silently fail - analytics shouldn't break the app
      print('Failed to record ad view: $e');
    }
  }

  /// Record advertisement click
  Future<void> recordClick(String advertisementId) async {
    try {
      await _httpClient.post('/customer/advertisements/$advertisementId/click');
    } catch (e) {
      // Silently fail - analytics shouldn't break the app
      print('Failed to record ad click: $e');
    }
  }
}
