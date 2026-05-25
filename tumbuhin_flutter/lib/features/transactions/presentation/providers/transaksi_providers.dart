import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/repositories/repositories_provider.dart';
import '../../../reports/models/report_models.dart';

final transaksiSourceFilterProvider = StateProvider<String?>((ref) => null);

final transaksiDateStartProvider = StateProvider<DateTime?>((ref) => null);
final transaksiDateEndProvider = StateProvider<DateTime?>((ref) => null);

final transactionDetailProvider = FutureProvider.family<JournalEntry, String>((
  ref,
  id,
) async {
  return ref.watch(journalRepositoryProvider).getJournalEntryById(id);
});
