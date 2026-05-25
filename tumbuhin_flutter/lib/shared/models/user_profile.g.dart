// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_profile.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserProfileImpl _$$UserProfileImplFromJson(Map<String, dynamic> json) =>
    _$UserProfileImpl(
      id: json['id'] as String,
      fullName: json['full_name'] as String,
      role: $enumDecode(_$UserRoleEnumMap, json['role']),
      tenantId: json['tenant_id'] as String,
      isSuperadmin: json['is_superadmin'] as bool?,
      avatarUrl: json['avatar_url'] as String?,
      accountType: json['account_type'] as String?,
    );

Map<String, dynamic> _$$UserProfileImplToJson(_$UserProfileImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'full_name': instance.fullName,
      'role': _$UserRoleEnumMap[instance.role]!,
      'tenant_id': instance.tenantId,
      'is_superadmin': instance.isSuperadmin,
      'avatar_url': instance.avatarUrl,
      'account_type': instance.accountType,
    };

const _$UserRoleEnumMap = {
  UserRole.manager: 'manager',
  UserRole.kasir: 'kasir',
  UserRole.stok: 'stok',
  UserRole.personal: 'personal',
};
