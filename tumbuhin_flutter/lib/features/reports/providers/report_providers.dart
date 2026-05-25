import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_provider.dart';
import '../services/report_service.dart';
import '../models/report_models.dart';

final reportServiceProvider = Provider<ReportService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ReportService(apiClient);
});

final reportSummaryProvider = FutureProvider<ReportSummary>((ref) async {
  final range = ref.watch(reportDateRangeProvider);
  // We should update getSummary to accept dates
  return ref
      .watch(reportServiceProvider)
      .getSummary(start: range.start, end: range.end);
});

final journalProvider = FutureProvider<List<JournalEntry>>((ref) async {
  final range = ref.watch(reportDateRangeProvider);
  return ref
      .watch(reportServiceProvider)
      .getJournals(start: range.start, end: range.end);
});

final salesReportProvider = FutureProvider<List<SalesReportItem>>((ref) async {
  final range = ref.watch(reportDateRangeProvider);
  return ref
      .watch(reportServiceProvider)
      .getSales(start: range.start, end: range.end);
});

final stockReportProvider = FutureProvider<List<StockReportItem>>((ref) async {
  return ref.watch(reportServiceProvider).getStockReport();
});

final ledgerProvider = FutureProvider.family<List<LedgerEntry>, String>((
  ref,
  accountId,
) async {
  final range = ref.watch(reportDateRangeProvider);
  return ref
      .watch(reportServiceProvider)
      .getLedger(accountId, start: range.start, end: range.end);
});

final selectedLedgerAccountProvider = StateProvider<String?>((ref) => null);

final incomeStatementProvider = FutureProvider<Map<String, dynamic>>((
  ref,
) async {
  final range = ref.watch(reportDateRangeProvider);
  return ref
      .watch(reportServiceProvider)
      .getIncomeStatement(
        range.start.toIso8601String(),
        range.end.toIso8601String(),
      );
});

final balanceSheetProvider = FutureProvider<List<BalanceSheetItem>>((
  ref,
) async {
  final data = await ref.watch(reportServiceProvider).getBalanceSheet();
  return data.map((e) => BalanceSheetItem.fromJson(e)).toList();
});

final coaProvider = FutureProvider<List<dynamic>>((ref) async {
  return ref.watch(reportServiceProvider).getCOA();
});

final cashFlowProvider = FutureProvider<List<CashFlowItem>>((ref) async {
  final range = ref.watch(reportDateRangeProvider);
  return ref
      .watch(reportServiceProvider)
      .getCashFlow(start: range.start, end: range.end);
});

// Filter state
final reportDateRangeProvider = StateProvider<({DateTime start, DateTime end})>(
  (ref) {
    final now = DateTime.now();
    return (
      start: DateTime(now.year, now.month, 1),
      end: DateTime(now.year, now.month + 1, 0),
    );
  },
);
