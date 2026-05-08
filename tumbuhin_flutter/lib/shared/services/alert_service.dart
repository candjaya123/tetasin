import '../../../core/api/api_client.dart';
import '../models/alert.dart';

class AlertService {
  final ApiClient _apiClient;

  AlertService(this._apiClient);

  Future<List<SmartAlert>> getAlerts() async {
    final response = await _apiClient.dio.get('/api/v1/alerts');
    return (response.data as List).map((e) => SmartAlert.fromJson(e)).toList();
  }

  Future<void> markAsRead(String id) async {
    await _apiClient.dio.patch('/api/v1/alerts/$id/read');
  }

  Future<void> markAllAsRead() async {
    await _apiClient.dio.post('/api/v1/alerts/read-all');
  }

  Future<Map<String, bool>> getNotificationSettings() async {
    final response = await _apiClient.dio.get('/api/v1/notifications/settings');
    return Map<String, bool>.from(response.data);
  }

  Future<void> updateNotificationSettings(Map<String, bool> settings) async {
    await _apiClient.dio.put('/api/v1/notifications/settings', data: settings);
  }
}
