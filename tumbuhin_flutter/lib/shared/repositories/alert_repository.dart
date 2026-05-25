import '../models/alert.dart';
import '../services/alert_service.dart';

class AlertRepository {
  final AlertService _service;

  AlertRepository(this._service);

  Future<List<SmartAlert>> getAlerts() => _service.getAlerts();
  Future<void> markAsRead(String id) => _service.markAsRead(id);
  Future<void> markAllAsRead() => _service.markAllAsRead();
  Future<Map<String, bool>> getNotificationSettings() =>
      _service.getNotificationSettings();
  Future<void> updateNotificationSettings(Map<String, bool> settings) =>
      _service.updateNotificationSettings(settings);
}
