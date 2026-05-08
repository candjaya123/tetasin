import 'package:freezed_annotation/freezed_annotation.dart';

part 'promotion.freezed.dart';
part 'promotion.g.dart';

@freezed
class Promotion with _$Promotion {
  const factory Promotion({
    required String id,
    required String name,
    required String type, // 'percentage' or 'fixed'
    required double value,
    @JsonKey(name: 'start_date') required DateTime startDate,
    @JsonKey(name: 'end_date') required DateTime endDate,
    @JsonKey(name: 'min_purchase') @Default(0.0) double minPurchase,
    @Default(true) bool isActive,
  }) = _Promotion;

  factory Promotion.fromJson(Map<String, dynamic> json) => _$PromotionFromJson(json);
}
