import 'package:freezed_annotation/freezed_annotation.dart';

part 'alert.freezed.dart';
part 'alert.g.dart';

@freezed
class SmartAlert with _$SmartAlert {
  const factory SmartAlert({
    required String id,
    required String title,
    required String message,
    required String type,
    required DateTime date,
    @Default(false) bool isRead,
  }) = _SmartAlert;

  factory SmartAlert.fromJson(Map<String, dynamic> json) => _$SmartAlertFromJson(json);
}
