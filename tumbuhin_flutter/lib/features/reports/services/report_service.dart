import '../models/report_models.dart';
import '../../../core/api/api_client.dart';

class ReportService {
  final ApiClient _apiClient;

  ReportService(this._apiClient);

  String _formatDate(DateTime dt) {
    return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
  }

  Future<ReportSummary> getSummary({DateTime? start, DateTime? end}) async {
    final response = await _apiClient.dio.get(
      '/api/v1/report/dashboard',
      queryParameters: {
        if (start != null) 'startDate': _formatDate(start),
        if (end != null) 'endDate': _formatDate(end),
      },
    );
    return ReportSummary.fromJson(response.data is Map ? response.data : {});
  }

  Future<List<JournalEntry>> getJournals({
    DateTime? start,
    DateTime? end,
  }) async {
    final response = await _apiClient.dio.get(
      '/api/v1/accounting/journal-entries',
      queryParameters: {
        if (start != null) 'startDate': _formatDate(start),
        if (end != null) 'endDate': _formatDate(end),
      },
    );
    final data = response.data;
    if (data == null || data is! List) return [];
    return data.map((j) => JournalEntry.fromJson(j)).toList();
  }

  Future<List<LedgerEntry>> getLedger(
    String accountId, {
    DateTime? start,
    DateTime? end,
  }) async {
    final response = await _apiClient.dio.get(
      '/api/v1/finance/ledger',
      queryParameters: {
        'account_id': accountId,
        if (start != null) 'startDate': _formatDate(start),
        if (end != null) 'endDate': _formatDate(end),
      },
    );
    final data = response.data;
    if (data == null || data is! List) return [];
    double balance = 0;
    return data.reversed
        .map((l) {
          balance += (l['debit'] ?? 0.0) - (l['credit'] ?? 0.0);
          return LedgerEntry.fromJson(l, balance);
        })
        .toList()
        .reversed
        .toList();
  }

  Future<List<SalesReportItem>> getSales({
    DateTime? start,
    DateTime? end,
  }) async {
    final response = await _apiClient.dio.get(
      '/api/v1/report/sales',
      queryParameters: {
        if (start != null) 'startDate': _formatDate(start),
        if (end != null) 'endDate': _formatDate(end),
      },
    );
    final data = response.data;
    if (data == null || data is! List) return [];
    return data.map((s) => SalesReportItem.fromJson(s)).toList();
  }

  Future<List<StockReportItem>> getStockReport() async {
    final response = await _apiClient.dio.get('/api/v1/inventory/products');
    final data = response.data;
    if (data == null || data is! List) return [];
    return data.map((s) => StockReportItem.fromJson(s)).toList();
  }

  Future<Map<String, dynamic>> getIncomeStatement(
    String start,
    String end,
  ) async {
    final response = await _apiClient.dio.get(
      '/api/v1/finance/income-statement',
      queryParameters: {
        'startDate': start.length > 10 ? start.substring(0, 10) : start,
        'endDate': end.length > 10 ? end.substring(0, 10) : end,
      },
    );
    final data = response.data is Map<String, dynamic>
        ? response.data as Map<String, dynamic>
        : <String, dynamic>{};
    return {
      'revenue': _extractNumeric(data['revenue']),
      'expenses': _extractNumeric(data['expenses']),
      'net_profit': _extractNumeric(data['net_profit']),
    };
  }

  double _extractNumeric(dynamic value) {
    if (value == null) return 0;
    if (value is num) return value.toDouble();
    if (value is Map) {
      final v = value['value'] ?? value['total'] ?? value['amount'] ?? 0;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString()) ?? 0;
    }
    return double.tryParse(value.toString()) ?? 0;
  }

  Future<List<dynamic>> getBalanceSheet() async {
    final response = await _apiClient.dio.get(
      '/api/v1/finance/balance-sheet',
    );
    final data = response.data;
    if (data == null || data is! Map) return [];

    final List<dynamic> result = [];
    void addCategory(String typeKey, String flutterType) {
      if (data[typeKey]?['accounts'] != null) {
        for (var acc in data[typeKey]['accounts']) {
          result.add({
            'id': acc['id'],
            'code': acc['code'],
            'name': acc['name'],
            'type': flutterType,
            'total_debit': 0,
            'total_credit': 0,
            'current_balance':
                double.tryParse(acc['balance']?.toString() ?? '0') ?? 0,
          });
        }
      }
    }

    addCategory('assets', 'asset');
    addCategory('liabilities', 'liability');
    addCategory('equity', 'equity');

    return result;
  }

  Future<List<dynamic>> getCOA() async {
    final response = await _apiClient.dio.get('/api/v1/accounting/coa');
    return response.data as List;
  }

  Future<void> createExpense(Map<String, dynamic> data) async {
    await _apiClient.dio.post('/api/v1/accounting/journal-entries', data: data);
  }

  Future<List<CashFlowItem>> getCashFlow({
    DateTime? start,
    DateTime? end,
  }) async {
    final response = await _apiClient.dio.get(
      '/api/v1/finance/cash-flow',
      queryParameters: {
        if (start != null) 'startDate': _formatDate(start),
        if (end != null) 'endDate': _formatDate(end),
      },
    );
    final data = response.data;
    if (data == null || data is! Map) return [];

    final List<CashFlowItem> result = [];

    void addAccounts(String category) {
      if (data[category]?['accounts'] != null) {
        for (var acc in data[category]['accounts']) {
          final balance =
              double.tryParse(acc['balance']?.toString() ?? '0') ?? 0;
          result.add(
            CashFlowItem(
              id: acc['id'] ?? '',
              date: DateTime.now(), // Fallback since it's a summary
              description: '[$category] ${acc['name']}',
              inflow: balance > 0 ? balance : 0,
              outflow: balance < 0 ? balance.abs() : 0,
            ),
          );
        }
      }
    }

    addAccounts('operating');
    addAccounts('investing');
    addAccounts('financing');

    return result;
  }
}
