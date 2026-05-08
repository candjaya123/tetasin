// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'tenant.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$TenantImpl _$$TenantImplFromJson(Map<String, dynamic> json) => _$TenantImpl(
  id: json['id'] as String,
  name: json['name'] as String,
  address: json['address'] as String?,
  contactPhone: json['contact_phone'] as String?,
  tier: json['tier'] as String?,
);

Map<String, dynamic> _$$TenantImplToJson(_$TenantImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'address': instance.address,
      'contact_phone': instance.contactPhone,
      'tier': instance.tier,
    };
