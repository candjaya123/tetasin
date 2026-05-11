import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_profile.freezed.dart';
part 'user_profile.g.dart';

enum UserRole {
  manager,
  kasir,
  stok,
  personal,
}

@freezed
class UserProfile with _$UserProfile {
  const factory UserProfile({
    required String id,
    @JsonKey(name: 'full_name') required String fullName,
    required UserRole role,
    @JsonKey(name: 'tenant_id') required String tenantId,
    @JsonKey(name: 'is_superadmin') bool? isSuperadmin,
    @JsonKey(name: 'avatar_url') String? avatarUrl,
    @JsonKey(name: 'account_type') String? accountType,
  }) = _UserProfile;

  factory UserProfile.fromJson(Map<String, dynamic> json) => _$UserProfileFromJson(json);
}
