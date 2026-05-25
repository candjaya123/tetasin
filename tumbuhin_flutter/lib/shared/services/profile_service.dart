import '../models/user_profile.dart';
import '../models/tenant.dart';
import '../../../core/api/api_client.dart';

class ProfileService {
  final ApiClient _apiClient;

  ProfileService(this._apiClient);

  Future<UserProfile> getProfile() async {
    final response = await _apiClient.dio.get(
      '/api/v1/business-profile/profile',
    );
    return UserProfile.fromJson(response.data);
  }

  Future<Tenant> getTenant() async {
    final response = await _apiClient.dio.get(
      '/api/v1/business-profile/tenant',
    );
    return Tenant.fromJson(response.data);
  }

  Future<UserProfile> updateProfile(Map<String, dynamic> updates) async {
    final response = await _apiClient.dio.put(
      '/api/v1/business-profile/profile',
      data: updates,
    );
    return UserProfile.fromJson(response.data);
  }

  Future<Tenant> updateTenant(Map<String, dynamic> updates) async {
    final response = await _apiClient.dio.put(
      '/api/v1/business-profile/tenant',
      data: updates,
    );
    return Tenant.fromJson(response.data);
  }
}
