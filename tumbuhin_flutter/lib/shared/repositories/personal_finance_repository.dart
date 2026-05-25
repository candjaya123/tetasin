import '../services/personal_finance_service.dart';
import '../models/personal_budget.dart';
import '../models/financial_goal.dart';
import '../models/recurring_transaction.dart';

class PersonalFinanceRepository {
  final PersonalFinanceService _service;
  PersonalFinanceRepository(this._service);

  Future<Map<String, dynamic>> getSummary({int? month, int? year}) =>
      _service.getSummary(month: month, year: year);

  Future<Map<String, dynamic>> getNetWorth() => _service.getNetWorth();

  Future<Map<String, dynamic>> recordIncome(Map<String, dynamic> data) =>
      _service.recordIncome(data);

  Future<Map<String, dynamic>> recordExpense(Map<String, dynamic> data) =>
      _service.recordExpense(data);

  Future<Map<String, dynamic>> transfer(Map<String, dynamic> data) =>
      _service.transfer(data);

  Future<List<PersonalBudget>> getBudgets({int? month, int? year}) =>
      _service.getBudgets(month: month, year: year);

  Future<Map<String, dynamic>> upsertBudget(Map<String, dynamic> data) =>
      _service.upsertBudget(data);

  Future<List<FinancialGoal>> getGoals() => _service.getGoals();

  Future<Map<String, dynamic>> createGoal(Map<String, dynamic> data) =>
      _service.createGoal(data);

  Future<FinancialGoal> getGoalDetail(String id) => _service.getGoalDetail(id);

  Future<Map<String, dynamic>> updateGoalProgress(
    String id,
    Map<String, dynamic> data,
  ) => _service.updateGoalProgress(id, data);

  Future<void> cancelGoal(String id) => _service.cancelGoal(id);

  Future<List<RecurringTransaction>> getRecurring() => _service.getRecurring();

  Future<Map<String, dynamic>> createRecurring(Map<String, dynamic> data) =>
      _service.createRecurring(data);

  Future<Map<String, dynamic>> updateRecurring(
    String id,
    Map<String, dynamic> data,
  ) => _service.updateRecurring(id, data);

  Future<Map<String, dynamic>> triggerRecurring(String id) =>
      _service.triggerRecurring(id);

  Future<void> deactivateRecurring(String id) =>
      _service.deactivateRecurring(id);
}
