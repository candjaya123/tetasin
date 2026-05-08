
import '../models/report_models.dart';
import '../../../core/api/api_client.dart';

class ReportService {
  final ApiClient _apiClient;

  ReportService(this._apiClient);

  Future<ReportSummary> getSummary({DateTime? start, DateTime? end}) async {
    try {
      final response = await _apiClient.dio.get('/api/v1/reports/dashboard', queryParameters: {
        if (start != null) 'startDate': '${start.year}-${start.month.toString().padLeft(2,'0')}-${start.day.toString().padLeft(2,'0')}',
        if (end != null) 'endDate': '${end.year}-${end.month.toString().padLeft(2,'0')}-${end.day.toString().padLeft(2,'0')}',
      });
      return ReportSummary.fromJson(response.data is Map ? response.data : {});
    } catch (_) {
      return ReportSummary(netProfit: 0, revenue: 0, expenses: 0, lowStockCount: 0, expenseRatio: 0);
    }
  }

  Future<List<JournalEntry>> getJournals({DateTime? start, DateTime? end}) async {
    final response = await _apiClient.dio.get('/api/v1/finance/transactions', queryParameters: {
      if (start != null) 'startDate': '${start.year}-${start.month.toString().padLeft(2,'0')}-${start.day.toString().padLeft(2,'0')}',
      if (end != null) 'endDate': '${end.year}-${end.month.toString().padLeft(2,'0')}-${end.day.toString().padLeft(2,'0')}',
    });
    final data = response.data;
    if (data == null || data is! List) return [];
    return data.map((j) => JournalEntry.fromJson(j)).toList();
  }

  Future<List<LedgerEntry>> getLedger(String accountId, {DateTime? start, DateTime? end}) async {
    final response = await _apiClient.dio.get('/api/v1/finance/ledger', queryParameters: {
      'account_id': accountId,
      if (start != null) 'startDate': '${start.year}-${start.month.toString().padLeft(2,'0')}-${start.day.toString().padLeft(2,'0')}',
      if (end != null) 'endDate': '${end.year}-${end.month.toString().padLeft(2,'0')}-${end.day.toString().padLeft(2,'0')}',
    });
    final data = response.data;
    if (data == null || data is! List) return [];
    double balance = 0;
    return data.reversed.map((l) {
      balance += (l['debit'] ?? 0.0) - (l['credit'] ?? 0.0);
      return LedgerEntry.fromJson(l, balance);
    }).toList().reversed.toList();
  }

  Future<List<SalesReportItem>> getSales({DateTime? start, DateTime? end}) async {
    final response = await _apiClient.dio.get('/api/v1/reports/sales', queryParameters: {
      if (start != null) 'startDate': '${start.year}-${start.month.toString().padLeft(2,'0')}-${start.day.toString().padLeft(2,'0')}',
      if (end != null) 'endDate': '${end.year}-${end.month.toString().padLeft(2,'0')}-${end.day.toString().padLeft(2,'0')}',
    });
    final data = response.data;
    if (data == null || data is! List) return [];
    return data.map((s) => SalesReportItem.fromJson(s)).toList();
  }

  Future<List<StockReportItem>> getStockReport() async {
    try {
      final response = await _apiClient.dio.get('/api/v1/inventory/products');
      final data = response.data;
      if (data == null || data is! List) return [];
      return data.map((s) => StockReportItem.fromJson(s)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<Map<String, dynamic>> getIncomeStatement(String start, String end) async {
    try {
      final response = await _apiClient.dio.get('/api/v1/reports/income-statement', queryParameters: {
        'startDate': start.length > 10 ? start.substring(0, 10) : start,
        'endDate': end.length > 10 ? end.substring(0, 10) : end,
      });
      return response.data is Map<String, dynamic> ? response.data : {};
    } catch (_) {
      return {};
    }
  }

  Future<List<dynamic>> getBalanceSheet() async {
    final response = await _apiClient.dio.get('/api/v1/finance/balance-sheet');
    return response.data as List;
  }

  Future<List<dynamic>> getCOA() async {
    final response = await _apiClient.dio.get('/api/v1/finance/coa');
    return response.data as List;
  }

  Future<void> createExpense(Map<String, dynamic> data) async {
    await _apiClient.dio.post('/api/v1/journal', data: data);
  }
}
