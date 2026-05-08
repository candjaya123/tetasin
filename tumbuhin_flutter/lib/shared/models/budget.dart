import 'package:freezed_annotation/freezed_annotation.dart';

part 'budget.freezed.dart';
part 'budget.g.dart';

@freezed
class Budget with _$Budget {
  const factory Budget({
    required String id,
    @JsonKey(name: 'tenant_id') required String tenantId,
    @JsonKey(name: 'account_id') required String accountId,
    @JsonKey(name: 'period_month') required String periodMonth,
    @JsonKey(name: 'limit_amount') required double limitAmount,
    @JsonKey(name: 'account_name') String? accountName,
  }) = _Budget;

  factory Budget.fromJson(Map<String, dynamic> json) => _$BudgetFromJson(json);
}
