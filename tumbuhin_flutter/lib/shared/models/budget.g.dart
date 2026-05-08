// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'budget.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$BudgetImpl _$$BudgetImplFromJson(Map<String, dynamic> json) => _$BudgetImpl(
  id: json['id'] as String,
  tenantId: json['tenant_id'] as String,
  accountId: json['account_id'] as String,
  periodMonth: json['period_month'] as String,
  limitAmount: (json['limit_amount'] as num).toDouble(),
  accountName: json['account_name'] as String?,
);

Map<String, dynamic> _$$BudgetImplToJson(_$BudgetImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'tenant_id': instance.tenantId,
      'account_id': instance.accountId,
      'period_month': instance.periodMonth,
      'limit_amount': instance.limitAmount,
      'account_name': instance.accountName,
    };
