import 'package:freezed_annotation/freezed_annotation.dart';

part 'personal_budget.freezed.dart';
part 'personal_budget.g.dart';

@freezed
class PersonalBudget with _$PersonalBudget {
  const factory PersonalBudget({
    required String id,
    @JsonKey(name: 'tenant_id') required String tenantId,
    @JsonKey(name: 'account_id') required String accountId,
    required int month,
    required int year,
    @JsonKey(name: 'budget_amount') required double budgetAmount,
    @JsonKey(name: 'chart_of_accounts') ChartOfAccountRef? chartOfAccounts,
    double? actual,
  }) = _PersonalBudget;

  factory PersonalBudget.fromJson(Map<String, dynamic> json) =>
      _$PersonalBudgetFromJson(json);
}

@freezed
class ChartOfAccountRef with _$ChartOfAccountRef {
  const factory ChartOfAccountRef({String? name, String? code}) =
      _ChartOfAccountRef;

  factory ChartOfAccountRef.fromJson(Map<String, dynamic> json) =>
      _$ChartOfAccountRefFromJson(json);
}

@freezed
class BudgetStatus with _$BudgetStatus {
  const factory BudgetStatus({
    @JsonKey(name: 'account_id') required String accountId,
    required String name,
    required String code,
    required double budget,
    required double actual,
    @JsonKey(name: 'pct_used') required double pctUsed,
    required String status,
  }) = _BudgetStatus;

  factory BudgetStatus.fromJson(Map<String, dynamic> json) =>
      _$BudgetStatusFromJson(json);
}
