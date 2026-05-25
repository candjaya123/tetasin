// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recurring_transaction.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RecurringTransactionImpl _$$RecurringTransactionImplFromJson(
  Map<String, dynamic> json,
) => _$RecurringTransactionImpl(
  id: json['id'] as String,
  tenantId: json['tenant_id'] as String,
  name: json['name'] as String,
  amount: (json['amount'] as num).toDouble(),
  direction: json['direction'] as String,
  debitAccountId: json['debit_account_id'] as String,
  creditAccountId: json['credit_account_id'] as String,
  frequency: json['frequency'] as String,
  dayOfPeriod: (json['day_of_period'] as num?)?.toInt(),
  nextDueDate: json['next_due_date'] as String,
  isActive: json['is_active'] as bool,
  lastTriggeredAt: json['last_triggered_at'] as String?,
);

Map<String, dynamic> _$$RecurringTransactionImplToJson(
  _$RecurringTransactionImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'tenant_id': instance.tenantId,
  'name': instance.name,
  'amount': instance.amount,
  'direction': instance.direction,
  'debit_account_id': instance.debitAccountId,
  'credit_account_id': instance.creditAccountId,
  'frequency': instance.frequency,
  'day_of_period': instance.dayOfPeriod,
  'next_due_date': instance.nextDueDate,
  'is_active': instance.isActive,
  'last_triggered_at': instance.lastTriggeredAt,
};
