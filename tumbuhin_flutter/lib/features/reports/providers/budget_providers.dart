import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/services/budget_service.dart';
import 'package:intl/intl.dart';

final budgetMonthProvider = StateProvider<String>((ref) {
  return DateFormat('yyyy-MM').format(DateTime.now());
});

final budgetsProvider =
    FutureProvider.family<List<Map<String, dynamic>>, String>((
      ref,
      month,
    ) async {
      final service = ref.watch(budgetServiceProvider);
      return await service.getBudgets(month);
    });

final budgetSummaryProvider =
    FutureProvider.family<Map<String, dynamic>, String>((ref, month) async {
      final budgets = await ref.watch(budgetsProvider(month).future);

      double totalBudget = 0;
      double totalSpent = 0;
      int overBudgetCount = 0;

      for (final b in budgets) {
        totalBudget += (b['limit_amount'] ?? 0).toDouble();
        totalSpent += (b['current_spent'] ?? 0).toDouble();
        if ((b['current_spent'] ?? 0) > (b['limit_amount'] ?? 0)) {
          overBudgetCount++;
        }
      }

      return {
        'total_budget': totalBudget,
        'total_spent': totalSpent,
        'total_remaining': (totalBudget - totalSpent).clamp(0, double.infinity),
        'percentage': totalBudget > 0 ? (totalSpent / totalBudget) : 0,
        'over_budget_count': overBudgetCount,
        'budget_count': budgets.length,
      };
    });
