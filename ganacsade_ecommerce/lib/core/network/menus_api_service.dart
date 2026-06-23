import 'package:dio/dio.dart';
import 'package:ganacsade/core/network/http_client.dart';

class MenusApiService {
  final HttpClient _httpClient = HttpClient();

  Future<List<Map<String, dynamic>>> getMyMenus() async {
    try {
      final response = await _httpClient.get('/admin/menus');

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'];
        if (data is List) {
          return data.cast<Map<String, dynamic>>();
        }
      }
      return [];
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Failed to load menus');
    }
  }
}
