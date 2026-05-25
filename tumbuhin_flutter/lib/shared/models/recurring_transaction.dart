import 'package:freezed_annotation/freezed_annotation.dart';

part 'recurring_transaction.freezed.dart';
part 'recurring_transaction.g.dart';

@freezed
class RecurringTransaction with _$RecurringTransaction {
  const factory RecurringTransaction({
    required String id,
    @JsonKey(name: 'tenant_id') required String tenantId,
    required String name,
    required double amount,
    required String direction,
    @JsonKey(name: 'debit_account_id') required String debitAccountId,
    @JsonKey(name: 'credit_account_id') required String creditAccountId,
    required String frequency,
    @JsonKey(name: 'day_of_period') int? dayOfPeriod,
    @JsonKey(name: 'next_due_date') required String nextDueDate,
    @JsonKey(name: 'is_active') required bool isActive,
    @JsonKey(name: 'last_triggered_at') String? lastTriggeredAt,
  }) = _RecurringTransaction;

  factory RecurringTransaction.fromJson(Map<String, dynamic> json) =>
      _$RecurringTransactionFromJson(json);
}
