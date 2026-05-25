import '../models/journal.dart';
import '../services/journal_service.dart';
import '../../features/reports/models/report_models.dart' as reports;

class JournalRepository {
  final JournalService _service;

  JournalRepository(this._service);

  Future<List<JournalEntry>> getJournalEntries() =>
      _service.getJournalEntries();

  Future<reports.JournalEntry> getJournalEntryById(String id) =>
      _service.getJournalEntryById(id);

  Future<List<LedgerBalance>> getTrialBalance() => _service.getTrialBalance();
}
