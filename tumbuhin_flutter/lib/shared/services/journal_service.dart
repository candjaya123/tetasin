import '../models/journal.dart';
import '../../../core/api/api_client.dart';

class JournalService {
  final ApiClient _apiClient;

  JournalService(this._apiClient);

  Future<List<JournalEntry>> getJournalEntries() async {
    // Controller has Get('drafts') under api/v1/journal
    final response = await _apiClient.dio.get('/api/v1/journal/drafts');
    return (response.data as List).map((e) => JournalEntry.fromJson(e)).toList();
  }

  Future<List<LedgerBalance>> getTrialBalance() async {
    // Let's assume this exists under api/v1/journal/trial-balance or similar
    // Based on ReportController, there is getIncomeStatement
    final response = await _apiClient.dio.get('/api/v1/reports/income-statement');
    return (response.data as List).map((e) => LedgerBalance.fromJson(e)).toList();
  }
}
