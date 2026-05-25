import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/recurring_transaction.dart';
import '../../../shared/repositories/repositories_provider.dart';

final recurringListProvider = FutureProvider<List<RecurringTransaction>>((ref) {
  return ref.read(personalFinanceRepositoryProvider).getRecurring();
});

class RecurringNotifier extends AsyncNotifier<List<RecurringTransaction>> {
  @override
  Future<List<RecurringTransaction>> build() async {
    return ref.read(personalFinanceRepositoryProvider).getRecurring();
  }

  Future<void> create(Map<String, dynamic> data) async {
    await ref.read(personalFinanceRepositoryProvider).createRecurring(data);
    ref.invalidate(recurringListProvider);
  }

  Future<void> editRecurring(String id, Map<String, dynamic> data) async {
    await ref.read(personalFinanceRepositoryProvider).updateRecurring(id, data);
    ref.invalidate(recurringListProvider);
  }

  Future<void> delete(String id) async {
    await ref.read(personalFinanceRepositoryProvider).deactivateRecurring(id);
    ref.invalidate(recurringListProvider);
  }

  Future<void> toggleActive(String id, bool isActive) async {
    await ref.read(personalFinanceRepositoryProvider).updateRecurring(id, {
      'is_active': isActive,
    });
    ref.invalidate(recurringListProvider);
  }

  Future<void> triggerNow(String id) async {
    await ref.read(personalFinanceRepositoryProvider).triggerRecurring(id);
    ref.invalidate(recurringListProvider);
  }
}

final recurringNotifierProvider =
    AsyncNotifierProvider<RecurringNotifier, List<RecurringTransaction>>(
      RecurringNotifier.new,
    );
