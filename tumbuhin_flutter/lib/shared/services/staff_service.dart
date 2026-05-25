import '../../../core/api/api_client.dart';
import '../models/staff.dart';

class StaffService {
  final ApiClient _apiClient;

  StaffService(this._apiClient);

  Future<List<StaffAccount>> getStaff() async {
    final response = await _apiClient.dio.get('/api/v1/business-profile/staff');
    return (response.data as List).map((e) {
      final data = Map<String, dynamic>.from(e);
      // Backend returns profiles table data
      return StaffAccount.fromJson(data);
    }).toList();
  }

  Future<void> inviteStaff(String email, String role) async {
    await _apiClient.dio.post(
      '/api/v1/business-profile/staff/invite',
      data: {'email': email, 'role': role},
    );
  }

  Future<List<StaffLog>> getStaffLogs(String staffId) async {
    final response = await _apiClient.dio.get(
      '/api/v1/business-profile/staff/$staffId/logs',
    );
    return (response.data as List).map((e) {
      final data = Map<String, dynamic>.from(e);
      // Map user_id to profile_id for model consistency
      data['profile_id'] = data['user_id'];
      return StaffLog.fromJson(data);
    }).toList();
  }
}
