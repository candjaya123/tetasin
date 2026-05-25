import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../shared/models/order.dart';
import '../../../../shared/repositories/repositories_provider.dart';

final orderTypeFilterProvider = StateProvider<String>((ref) => 'ALL');

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

final orderDetailProvider = FutureProvider.family<Order, String>((
  ref,
  id,
) async {
  final repository = ref.watch(orderRepositoryProvider);
  return repository.getOrderById(id);
});

class OrderStatusNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<void> updateStatus(String orderId, String newStatus) async {
    final repository = ref.read(orderRepositoryProvider);
    await repository.updateOrderStatus(orderId, newStatus);
    ref.invalidate(salesOrdersProvider);
    ref.invalidate(purchaseOrdersProvider);
    ref.invalidate(filteredOrdersProvider);
    ref.invalidate(orderDetailProvider(orderId));
  }
}

final orderStatusNotifierProvider =
    AsyncNotifierProvider<OrderStatusNotifier, void>(OrderStatusNotifier.new);

class DivisionNotesNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<void> updateDivisionNotes(String orderId, DivisionNotes notes) async {
    final repository = ref.read(orderRepositoryProvider);
    await repository.updateDivisionNotes(orderId, notes);
    ref.invalidate(salesOrdersProvider);
    ref.invalidate(purchaseOrdersProvider);
    ref.invalidate(filteredOrdersProvider);
    ref.invalidate(orderDetailProvider(orderId));
  }
}

final divisionNotesNotifierProvider =
    AsyncNotifierProvider<DivisionNotesNotifier, void>(
      DivisionNotesNotifier.new,
    );

final pesananStatusFilterProvider = StateProvider<String?>((ref) => null);

final pesananListProvider = FutureProvider<List<Order>>((ref) async {
  final repository = ref.watch(orderRepositoryProvider);
  final statusFilter = ref.watch(pesananStatusFilterProvider);
  final sales = await repository.getSalesOrders();
  final purchase = await repository.getPurchaseOrders();
  final all = [...sales, ...purchase];

  if (statusFilter != null) {
    all.removeWhere((o) => o.status != statusFilter);
  }

  all.sort((a, b) => b.createdAt.compareTo(a.createdAt));
  return all;
});

class UpdatePesananStatusNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<void> updateStatus(String orderId, String newStatus) async {
    final repository = ref.read(orderRepositoryProvider);
    await repository.updateOrderStatus(orderId, newStatus);
    ref.invalidate(salesOrdersProvider);
    ref.invalidate(purchaseOrdersProvider);
    ref.invalidate(filteredOrdersProvider);
    ref.invalidate(pesananListProvider);
    ref.invalidate(orderDetailProvider(orderId));
  }
}

final updatePesananStatusNotifierProvider =
    AsyncNotifierProvider<UpdatePesananStatusNotifier, void>(
      UpdatePesananStatusNotifier.new,
    );
