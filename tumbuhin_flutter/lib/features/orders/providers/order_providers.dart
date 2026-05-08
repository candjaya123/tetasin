import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/order.dart';
import '../../../shared/repositories/repositories_provider.dart';

final orderTypeFilterProvider = StateProvider<String>((ref) => 'ALL'); // 'ALL', 'SO', 'PO'

final salesOrdersProvider = FutureProvider<List<Order>>((ref) async {
  final repository = ref.watch(orderRepositoryProvider);
  return repository.getSalesOrders();
});

final purchaseOrdersProvider = FutureProvider<List<Order>>((ref) async {
  final repository = ref.watch(orderRepositoryProvider);
  return repository.getPurchaseOrders();
});

final filteredOrdersProvider = Provider<AsyncValue<List<Order>>>((ref) {
  final type = ref.watch(orderTypeFilterProvider);
  final sales = ref.watch(salesOrdersProvider);
  final purchase = ref.watch(purchaseOrdersProvider);

  if (type == 'SO') return sales;
  if (type == 'PO') return purchase;

  return sales.when(
    data: (salesData) => purchase.when(
      data: (purchaseData) {
        final all = [...salesData, ...purchaseData];
        all.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        return AsyncValue.data(all);
      },
      loading: () => const AsyncValue.loading(),
      error: (e, s) => AsyncValue.error(e, s),
    ),
    loading: () => const AsyncValue.loading(),
    error: (e, s) => AsyncValue.error(e, s),
  );
});
