import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../shared/models/bill.dart';
import '../../shared/services/services_provider.dart';

final billTypeFilterProvider = StateProvider<String?>((ref) => null);

final billsListProvider = FutureProvider<List<Bill>>((ref) async {
  final filter = ref.watch(billTypeFilterProvider);
  final params = <String, String>{};
  if (filter != null) params['bill_type'] = filter;
  return ref.read(billTrackerServiceProvider).getBills(params: params);
});

final billSummaryProvider = FutureProvider<BillSummary>((ref) {
  return ref.read(billTrackerServiceProvider).getSummary();
});

final billsOverdueProvider = FutureProvider<List<Bill>>((ref) async {
  return ref
      .read(billTrackerServiceProvider)
      .getBills(params: {'status': 'overdue'});
});
