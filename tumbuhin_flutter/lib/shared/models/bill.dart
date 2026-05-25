import 'package:freezed_annotation/freezed_annotation.dart';

part 'bill.freezed.dart';
part 'bill.g.dart';

@freezed
class Bill with _$Bill {
  const factory Bill({
    required String id,
    @JsonKey(name: 'tenant_id') required String tenantId,
    required String title,
    required double amount,
    @JsonKey(name: 'bill_type') required String billType,
    @JsonKey(name: 'due_date') required String dueDate,
    @JsonKey(name: 'contact_name') String? contactName,
    @JsonKey(name: 'contact_phone') String? contactPhone,
    @JsonKey(name: 'coa_account_id') String? coaAccountId,
    @JsonKey(name: 'payment_account_id') String? paymentAccountId,
    required String status,
    @JsonKey(name: 'amount_paid') required double amountPaid,
    @JsonKey(name: 'reminder_days') List<int>? reminderDays,
    String? description,
    String? photoUrl,
    @JsonKey(name: 'journal_entry_id') String? journalEntryId,
    @JsonKey(name: 'last_reminded_at') String? lastRemindedAt,
    @JsonKey(name: 'created_at') String? createdAt,
    List<BillPayment>? payments,
  }) = _Bill;

  factory Bill.fromJson(Map<String, dynamic> json) => _$BillFromJson(json);
}

@freezed
class BillPayment with _$BillPayment {
  const factory BillPayment({
    required String id,
    @JsonKey(name: 'bill_id') required String billId,
    @JsonKey(name: 'tenant_id') required String tenantId,
    required double amount,
    @JsonKey(name: 'payment_date') required String paymentDate,
    @JsonKey(name: 'payment_account_id') String? paymentAccountId,
    String? notes,
    @JsonKey(name: 'journal_entry_id') String? journalEntryId,
    @JsonKey(name: 'created_at') String? createdAt,
  }) = _BillPayment;

  factory BillPayment.fromJson(Map<String, dynamic> json) =>
      _$BillPaymentFromJson(json);
}

@freezed
class BillSummary with _$BillSummary {
  const factory BillSummary({
    required BillCounter hutang,
    required BillCounter piutang,
  }) = _BillSummary;

  factory BillSummary.fromJson(Map<String, dynamic> json) =>
      _$BillSummaryFromJson(json);
}

@freezed
class BillCounter with _$BillCounter {
  const factory BillCounter({
    required int total,
    @JsonKey(name: 'outstanding_amount') required double outstandingAmount,
    @JsonKey(name: 'overdue_count') required int overdueCount,
  }) = _BillCounter;

  factory BillCounter.fromJson(Map<String, dynamic> json) =>
      _$BillCounterFromJson(json);
}
