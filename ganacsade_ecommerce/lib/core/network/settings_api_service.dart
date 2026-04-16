import 'package:dio/dio.dart';
import 'http_client.dart';

class SettingsApiService {
  final HttpClient _httpClient = HttpClient();

  /// Get public settings (shipping, tax rates)
  Future<Map<String, dynamic>> getPublicSettings() async {
    try {
      print('🔄 Fetching settings from API...');
      final response = await _httpClient.get('/customer/settings/public');

      print('📦 API Response: ${response.data}');
      
      if (response.statusCode == 200 && response.data['success'] == true) {
        final settings = response.data['data']['settings'];
        print('✅ Settings loaded: $settings');
        return settings;
      } else {
        throw Exception(response.data['message'] ?? 'Failed to fetch settings');
      }
    } on DioException catch (e) {
      print('❌ Error fetching settings: $e');
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to fetch settings');
      } else {
        throw Exception('Network error. Please check your connection.');
      }
    }
  }
}
