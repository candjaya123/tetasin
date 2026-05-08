// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'staff.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$StaffAccountImpl _$$StaffAccountImplFromJson(Map<String, dynamic> json) =>
    _$StaffAccountImpl(
      id: json['id'] as String,
      fullName: json['full_name'] as String,
      role: json['role'] as String,
      email: json['email'] as String?,
      tenantId: json['tenant_id'] as String?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
    );

Map<String, dynamic> _$$StaffAccountImplToJson(_$StaffAccountImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'full_name': instance.fullName,
      'role': instance.role,
      'email': instance.email,
      'tenant_id': instance.tenantId,
      'created_at': instance.createdAt?.toIso8601String(),
    };

_$StaffLogImpl _$$StaffLogImplFromJson(Map<String, dynamic> json) =>
    _$StaffLogImpl(
      id: json['id'] as String,
      profileId: json['profile_id'] as String,
      action: json['action'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );

Map<String, dynamic> _$$StaffLogImplToJson(_$StaffLogImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'profile_id': instance.profileId,
      'action': instance.action,
      'created_at': instance.createdAt.toIso8601String(),
    };
