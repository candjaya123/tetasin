// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'financial_goal.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$FinancialGoalImpl _$$FinancialGoalImplFromJson(Map<String, dynamic> json) =>
    _$FinancialGoalImpl(
      id: json['id'] as String,
      tenantId: json['tenant_id'] as String,
      name: json['name'] as String,
      goalType: json['goal_type'] as String,
      targetAmount: (json['target_amount'] as num).toDouble(),
      currentAmount: (json['current_amount'] as num).toDouble(),
      targetDate: json['target_date'] as String?,
      linkedAccountId: json['linked_account_id'] as String?,
      notes: json['notes'] as String?,
      status: json['status'] as String,
      progressPct: (json['progress_pct'] as num?)?.toDouble(),
      createdAt: json['created_at'] as String?,
    );

Map<String, dynamic> _$$FinancialGoalImplToJson(_$FinancialGoalImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'tenant_id': instance.tenantId,
      'name': instance.name,
      'goal_type': instance.goalType,
      'target_amount': instance.targetAmount,
      'current_amount': instance.currentAmount,
      'target_date': instance.targetDate,
      'linked_account_id': instance.linkedAccountId,
      'notes': instance.notes,
      'status': instance.status,
      'progress_pct': instance.progressPct,
      'created_at': instance.createdAt,
    };
