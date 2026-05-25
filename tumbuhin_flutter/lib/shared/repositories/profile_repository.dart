import '../models/user_profile.dart';
import '../models/tenant.dart';
import '../services/profile_service.dart';

class ProfileRepository {
  final ProfileService _service;

  ProfileRepository(this._service);

  Future<UserProfile> getProfile() => _service.getProfile();

  Future<Tenant> getTenant() => _service.getTenant();

  Future<UserProfile> updateProfile(Map<String, dynamic> updates) =>
      _service.updateProfile(updates);

  Future<Tenant> updateTenant(Map<String, dynamic> updates) =>
      _service.updateTenant(updates);
}
