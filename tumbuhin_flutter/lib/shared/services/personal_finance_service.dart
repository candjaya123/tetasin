import '../../../core/api/api_client.dart';
import '../models/personal_budget.dart';
import '../models/financial_goal.dart';
import '../models/recurring_transaction.dart';

class PersonalFinanceService {
  final ApiClient _apiClient;
  PersonalFinanceService(this._apiClient);

  Future<Map<String, dynamic>> getSummary({int? month, int? year}) async {
    final params = <String, String>{};
    if (month != null) params['month'] = month.toString();
    if (year != null) params['year'] = year.toString();
    final response = await _apiClient.dio.get(
      '/api/v1/personal/summary',
      queryParameters: params,
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getNetWorth() async {
    final response = await _apiClient.dio.get('/api/v1/personal/net-worth');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> recordIncome(Map<String, dynamic> data) async {
    final response = await _apiClient.dio.post(
      '/api/v1/personal/income',
      data: data,
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> recordExpense(Map<String, dynamic> data) async {
    final response = await _apiClient.dio.post(
      '/api/v1/personal/expense',
      data: data,
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> transfer(Map<String, dynamic> data) async {
    final response = await _apiClient.dio.post(
      '/api/v1/personal/transfer',
      data: data,
    );
    return response.data as Map<String, dynamic>;
  }

  Future<List<PersonalBudget>> getBudgets({int? month, int? year}) async {
    final params = <String, String>{};
    if (month != null) params['month'] = month.toString();
    if (year != null) params['year'] = year.toString();
    final response = await _apiClient.dio.get(
      '/api/v1/personal/budgets',
      queryParameters: params,
    );
    return (response.data as List)
        .map((e) => PersonalBudget.fromJson(e))
        .toList();
  }

  Future<Map<String, dynamic>> upsertBudget(Map<String, dynamic> data) async {
    final response = await _apiClient.dio.post(
      '/api/v1/personal/budgets',
      data: data,
    );
    return response.data as Map<String, dynamic>;
  }

  Future<List<FinancialGoal>> getGoals() async {
    final response = await _apiClient.dio.get('/api/v1/personal/goals');
    return (response.data as List)
        .map((e) => FinancialGoal.fromJson(e))
        .toList();
  }

  Future<Map<String, dynamic>> createGoal(Map<String, dynamic> data) async {
    final response = await _apiClient.dio.post(
      '/api/v1/personal/goals',
      data: data,
    );
    return response.data as Map<String, dynamic>;
  }

  Future<FinancialGoal> getGoalDetail(String id) async {
    final response = await _apiClient.dio.get('/api/v1/personal/goals/$id');
    return FinancialGoal.fromJson(response.data);
  }

  Future<Map<String, dynamic>> updateGoalProgress(
    String id,
    Map<String, dynamic> data,
  ) async {
    final response = await _apiClient.dio.patch(
      '/api/v1/personal/goals/$id/progress',
      data: data,
    );
    return response.data as Map<String, dynamic>;
  }

  Future<void> cancelGoal(String id) async {
    await _apiClient.dio.patch('/api/v1/personal/goals/$id/cancel');
  }

  Future<List<RecurringTransaction>> getRecurring() async {
    final response = await _apiClient.dio.get('/api/v1/personal/recurring');
    return (response.data as List)
        .map((e) => RecurringTransaction.fromJson(e))
        .toList();
  }

  Future<Map<String, dynamic>> createRecurring(
    Map<String, dynamic> data,
  ) async {
    final response = await _apiClient.dio.post(
      '/api/v1/personal/recurring',
      data: data,
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateRecurring(
    String id,
    Map<String, dynamic> data,
  ) async {
    final response = await _apiClient.dio.patch(
      '/api/v1/personal/recurring/$id',
      data: data,
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> triggerRecurring(String id) async {
    final response = await _apiClient.dio.patch(
      '/api/v1/personal/recurring/$id/trigger',
    );
    return response.data as Map<String, dynamic>;
  }

  Future<void> deactivateRecurring(String id) async {
    await _apiClient.dio.delete('/api/v1/personal/recurring/$id');
  }
}
