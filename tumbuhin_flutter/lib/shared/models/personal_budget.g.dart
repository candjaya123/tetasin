// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'personal_budget.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$PersonalBudgetImpl _$$PersonalBudgetImplFromJson(Map<String, dynamic> json) =>
    _$PersonalBudgetImpl(
      id: json['id'] as String,
      tenantId: json['tenant_id'] as String,
      accountId: json['account_id'] as String,
      month: (json['month'] as num).toInt(),
      year: (json['year'] as num).toInt(),
      budgetAmount: (json['budget_amount'] as num).toDouble(),
      chartOfAccounts: json['chart_of_accounts'] == null
          ? null
          : ChartOfAccountRef.fromJson(
              json['chart_of_accounts'] as Map<String, dynamic>,
            ),
      actual: (json['actual'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$$PersonalBudgetImplToJson(
  _$PersonalBudgetImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'tenant_id': instance.tenantId,
  'account_id': instance.accountId,
  'month': instance.month,
  'year': instance.year,
  'budget_amount': instance.budgetAmount,
  'chart_of_accounts': instance.chartOfAccounts,
  'actual': instance.actual,
};

_$ChartOfAccountRefImpl _$$ChartOfAccountRefImplFromJson(
  Map<String, dynamic> json,
) => _$ChartOfAccountRefImpl(
  name: json['name'] as String?,
  code: json['code'] as String?,
);

Map<String, dynamic> _$$ChartOfAccountRefImplToJson(
  _$ChartOfAccountRefImpl instance,
) => <String, dynamic>{'name': instance.name, 'code': instance.code};

_$BudgetStatusImpl _$$BudgetStatusImplFromJson(Map<String, dynamic> json) =>
    _$BudgetStatusImpl(
      accountId: json['account_id'] as String,
      name: json['name'] as String,
      code: json['code'] as String,
      budget: (json['budget'] as num).toDouble(),
      actual: (json['actual'] as num).toDouble(),
      pctUsed: (json['pct_used'] as num).toDouble(),
      status: json['status'] as String,
    );

Map<String, dynamic> _$$BudgetStatusImplToJson(_$BudgetStatusImpl instance) =>
    <String, dynamic>{
      'account_id': instance.accountId,
      'name': instance.name,
      'code': instance.code,
      'budget': instance.budget,
      'actual': instance.actual,
      'pct_used': instance.pctUsed,
      'status': instance.status,
    };
