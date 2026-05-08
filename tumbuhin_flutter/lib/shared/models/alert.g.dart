// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'alert.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SmartAlertImpl _$$SmartAlertImplFromJson(Map<String, dynamic> json) =>
    _$SmartAlertImpl(
      id: json['id'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      type: json['type'] as String,
      date: DateTime.parse(json['date'] as String),
      isRead: json['isRead'] as bool? ?? false,
    );

Map<String, dynamic> _$$SmartAlertImplToJson(_$SmartAlertImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'message': instance.message,
      'type': instance.type,
      'date': instance.date.toIso8601String(),
      'isRead': instance.isRead,
    };
