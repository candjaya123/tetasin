import 'package:freezed_annotation/freezed_annotation.dart';

part 'journal.freezed.dart';
part 'journal.g.dart';

@freezed
class JournalEntry with _$JournalEntry {
  const factory JournalEntry({
    required String id,
    required DateTime date,
    required String description,
    required List<JournalLine> lines,
    @JsonKey(name: 'reference_id') String? referenceId,
  }) = _JournalEntry;

  factory JournalEntry.fromJson(Map<String, dynamic> json) =>
      _$JournalEntryFromJson(json);
}

@freezed
class JournalLine with _$JournalLine {
  const factory JournalLine({
    required String id,
    @JsonKey(name: 'account_id') required String accountId,
    required double debit,
    required double credit,
    String? description,
  }) = _JournalLine;

  factory JournalLine.fromJson(Map<String, dynamic> json) =>
      _$JournalLineFromJson(json);
}

@freezed
class LedgerBalance with _$LedgerBalance {
  const factory LedgerBalance({
    @JsonKey(name: 'account_id') required String accountId,
    @JsonKey(name: 'account_name') required String accountName,
    required double balance,
  }) = _LedgerBalance;

  factory LedgerBalance.fromJson(Map<String, dynamic> json) =>
      _$LedgerBalanceFromJson(json);
}
