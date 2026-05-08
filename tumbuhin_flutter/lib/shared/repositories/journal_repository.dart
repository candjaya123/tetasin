import '../models/journal.dart';
import '../services/journal_service.dart';

class JournalRepository {
  final JournalService _service;

  JournalRepository(this._service);

  Future<List<JournalEntry>> getJournalEntries() => _service.getJournalEntries();

  Future<List<LedgerBalance>> getTrialBalance() => _service.getTrialBalance();
}
