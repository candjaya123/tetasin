// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'bill.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$BillImpl _$$BillImplFromJson(Map<String, dynamic> json) => _$BillImpl(
  id: json['id'] as String,
  tenantId: json['tenant_id'] as String,
  title: json['title'] as String,
  amount: (json['amount'] as num).toDouble(),
  billType: json['bill_type'] as String,
  dueDate: json['due_date'] as String,
  contactName: json['contact_name'] as String?,
  contactPhone: json['contact_phone'] as String?,
  coaAccountId: json['coa_account_id'] as String?,
  paymentAccountId: json['payment_account_id'] as String?,
  status: json['status'] as String,
  amountPaid: (json['amount_paid'] as num).toDouble(),
  reminderDays: (json['reminder_days'] as List<dynamic>?)
      ?.map((e) => (e as num).toInt())
      .toList(),
  description: json['description'] as String?,
  photoUrl: json['photoUrl'] as String?,
  journalEntryId: json['journal_entry_id'] as String?,
  lastRemindedAt: json['last_reminded_at'] as String?,
  createdAt: json['created_at'] as String?,
  payments: (json['payments'] as List<dynamic>?)
      ?.map((e) => BillPayment.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$$BillImplToJson(_$BillImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'tenant_id': instance.tenantId,
      'title': instance.title,
      'amount': instance.amount,
      'bill_type': instance.billType,
      'due_date': instance.dueDate,
      'contact_name': instance.contactName,
      'contact_phone': instance.contactPhone,
      'coa_account_id': instance.coaAccountId,
      'payment_account_id': instance.paymentAccountId,
      'status': instance.status,
      'amount_paid': instance.amountPaid,
      'reminder_days': instance.reminderDays,
      'description': instance.description,
      'photoUrl': instance.photoUrl,
      'journal_entry_id': instance.journalEntryId,
      'last_reminded_at': instance.lastRemindedAt,
      'created_at': instance.createdAt,
      'payments': instance.payments,
    };

_$BillPaymentImpl _$$BillPaymentImplFromJson(Map<String, dynamic> json) =>
    _$BillPaymentImpl(
      id: json['id'] as String,
      billId: json['bill_id'] as String,
      tenantId: json['tenant_id'] as String,
      amount: (json['amount'] as num).toDouble(),
      paymentDate: json['payment_date'] as String,
      paymentAccountId: json['payment_account_id'] as String?,
      notes: json['notes'] as String?,
      journalEntryId: json['journal_entry_id'] as String?,
      createdAt: json['created_at'] as String?,
    );

Map<String, dynamic> _$$BillPaymentImplToJson(_$BillPaymentImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'bill_id': instance.billId,
      'tenant_id': instance.tenantId,
      'amount': instance.amount,
      'payment_date': instance.paymentDate,
      'payment_account_id': instance.paymentAccountId,
      'notes': instance.notes,
      'journal_entry_id': instance.journalEntryId,
      'created_at': instance.createdAt,
    };

_$BillSummaryImpl _$$BillSummaryImplFromJson(Map<String, dynamic> json) =>
    _$BillSummaryImpl(
      hutang: BillCounter.fromJson(json['hutang'] as Map<String, dynamic>),
      piutang: BillCounter.fromJson(json['piutang'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$BillSummaryImplToJson(_$BillSummaryImpl instance) =>
    <String, dynamic>{'hutang': instance.hutang, 'piutang': instance.piutang};

_$BillCounterImpl _$$BillCounterImplFromJson(Map<String, dynamic> json) =>
    _$BillCounterImpl(
      total: (json['total'] as num).toInt(),
      outstandingAmount: (json['outstanding_amount'] as num).toDouble(),
      overdueCount: (json['overdue_count'] as num).toInt(),
    );

Map<String, dynamic> _$$BillCounterImplToJson(_$BillCounterImpl instance) =>
    <String, dynamic>{
      'total': instance.total,
      'outstanding_amount': instance.outstandingAmount,
      'overdue_count': instance.overdueCount,
    };
