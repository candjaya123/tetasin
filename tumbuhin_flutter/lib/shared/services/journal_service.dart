import '../models/journal.dart';
import '../../../core/api/api_client.dart';
import '../../features/reports/models/report_models.dart' as reports;

class JournalService {
  final ApiClient _apiClient;

  JournalService(this._apiClient);

  Future<List<JournalEntry>> getJournalEntries() async {
    final response = await _apiClient.dio.get(
      '/api/v1/accounting/journal-entries',
    );
    final data = response.data;
    if (data == null || data is! List) return [];
    return data.map((e) => JournalEntry.fromJson(e)).toList();
  }

  Future<reports.JournalEntry> getJournalEntryById(String id) async {
    final response = await _apiClient.dio.get(
      '/api/v1/accounting/journal-entries/$id',
    );
    return reports.JournalEntry.fromJson(response.data);
  }

  Future<List<LedgerBalance>> getTrialBalance() async {
    final response = await _apiClient.dio.get('/api/v1/finance/trial-balance');
    return (response.data as List)
        .map((e) => LedgerBalance.fromJson(e))
        .toList();
  }
}
