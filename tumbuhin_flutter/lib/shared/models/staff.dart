import 'package:freezed_annotation/freezed_annotation.dart';

part 'staff.freezed.dart';
part 'staff.g.dart';

@freezed
class StaffAccount with _$StaffAccount {
  const factory StaffAccount({
    required String id,
    @JsonKey(name: 'full_name') required String fullName,
    required String role,
    String? email,
    @JsonKey(name: 'tenant_id') String? tenantId,
    @JsonKey(name: 'created_at') DateTime? createdAt,
  }) = _StaffAccount;

  factory StaffAccount.fromJson(Map<String, dynamic> json) => _$StaffAccountFromJson(json);
}

@freezed
class StaffLog with _$StaffLog {
  const factory StaffLog({
    required String id,
    @JsonKey(name: 'profile_id') required String profileId,
    required String action,
    @JsonKey(name: 'created_at') required DateTime createdAt,
  }) = _StaffLog;

  factory StaffLog.fromJson(Map<String, dynamic> json) => _$StaffLogFromJson(json);
}
