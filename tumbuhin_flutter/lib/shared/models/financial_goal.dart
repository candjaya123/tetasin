import 'package:freezed_annotation/freezed_annotation.dart';

part 'financial_goal.freezed.dart';
part 'financial_goal.g.dart';

@freezed
class FinancialGoal with _$FinancialGoal {
  const factory FinancialGoal({
    required String id,
    @JsonKey(name: 'tenant_id') required String tenantId,
    required String name,
    @JsonKey(name: 'goal_type') required String goalType,
    @JsonKey(name: 'target_amount') required double targetAmount,
    @JsonKey(name: 'current_amount') required double currentAmount,
    @JsonKey(name: 'target_date') String? targetDate,
    @JsonKey(name: 'linked_account_id') String? linkedAccountId,
    String? notes,
    required String status,
    @JsonKey(name: 'progress_pct') double? progressPct,
    @JsonKey(name: 'created_at') String? createdAt,
  }) = _FinancialGoal;

  factory FinancialGoal.fromJson(Map<String, dynamic> json) =>
      _$FinancialGoalFromJson(json);
}
