// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'journal.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$JournalEntryImpl _$$JournalEntryImplFromJson(Map<String, dynamic> json) =>
    _$JournalEntryImpl(
      id: json['id'] as String,
      date: DateTime.parse(json['date'] as String),
      description: json['description'] as String,
      lines: (json['lines'] as List<dynamic>)
          .map((e) => JournalLine.fromJson(e as Map<String, dynamic>))
          .toList(),
      referenceId: json['reference_id'] as String?,
    );

Map<String, dynamic> _$$JournalEntryImplToJson(_$JournalEntryImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'date': instance.date.toIso8601String(),
      'description': instance.description,
      'lines': instance.lines,
      'reference_id': instance.referenceId,
    };

_$JournalLineImpl _$$JournalLineImplFromJson(Map<String, dynamic> json) =>
    _$JournalLineImpl(
      id: json['id'] as String,
      accountId: json['account_id'] as String,
      debit: (json['debit'] as num).toDouble(),
      credit: (json['credit'] as num).toDouble(),
      description: json['description'] as String?,
    );

Map<String, dynamic> _$$JournalLineImplToJson(_$JournalLineImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'account_id': instance.accountId,
      'debit': instance.debit,
      'credit': instance.credit,
      'description': instance.description,
    };

_$LedgerBalanceImpl _$$LedgerBalanceImplFromJson(Map<String, dynamic> json) =>
    _$LedgerBalanceImpl(
      accountId: json['account_id'] as String,
      accountName: json['account_name'] as String,
      balance: (json['balance'] as num).toDouble(),
    );

Map<String, dynamic> _$$LedgerBalanceImplToJson(_$LedgerBalanceImpl instance) =>
    <String, dynamic>{
      'account_id': instance.accountId,
      'account_name': instance.accountName,
      'balance': instance.balance,
    };
