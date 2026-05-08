import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:intl/intl.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../shared/widgets/polish_widgets.dart';
import '../../shared/models/order.dart';
import 'providers/order_providers.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(filteredOrdersProvider);
    final currentFilter = ref.watch(orderTypeFilterProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text(
          'Daftar Pesanan',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
        actions: [
          IconButton(
            icon: const Icon(HugeIcons.strokeRoundedPlusSign),
            onPressed: () => context.push('/orders/new'),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilterBar(ref, currentFilter),
          Expanded(
            child: ordersAsync.when(
              data: (orders) => orders.isEmpty
                  ? const EmptyStateWidget(
                      title: 'Belum ada pesanan',
                      message: 'Histori pesanan Anda akan muncul di sini setelah transaksi dilakukan.',
                    )
                  : AppRefreshIndicator(
                      onRefresh: () async {
                        ref.invalidate(salesOrdersProvider);
                        ref.invalidate(purchaseOrdersProvider);
                      },
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        itemCount: orders.length,
                        itemBuilder: (context, index) {
                          return _OrderCard(order: orders[index])
                              .animate()
                              .fadeIn(duration: 400.ms, delay: (index * 50).ms)
                              .slideY(begin: 0.2, end: 0, curve: Curves.easeOutQuad);
                        },
                      ),
                    ),
              loading: () => ListView.builder(
                padding: const EdgeInsets.all(20),
                itemCount: 5,
                itemBuilder: (context, index) => SkeletonLoader.card(),
              ),
              error: (err, stack) => ErrorStateWidget(
                error: err.toString(),
                onRetry: () {
                  ref.invalidate(salesOrdersProvider);
                  ref.invalidate(purchaseOrdersProvider);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterBar(WidgetRef ref, String currentFilter) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 20),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFF3F4F6))),
      ),
      child: Row(
        children: [
          _FilterChip(
            label: 'Semua',
            isSelected: currentFilter == 'ALL',
            onTap: () => ref.read(orderTypeFilterProvider.notifier).state = 'ALL',
          ),
          const SizedBox(width: 10),
          _FilterChip(
            label: 'Penjualan (SO)',
            isSelected: currentFilter == 'SO',
            onTap: () => ref.read(orderTypeFilterProvider.notifier).state = 'SO',
          ),
          const SizedBox(width: 10),
          _FilterChip(
            label: 'Pembelian (PO)',
            isSelected: currentFilter == 'PO',
            onTap: () => ref.read(orderTypeFilterProvider.notifier).state = 'PO',
          ),
        ],
      ),
    );
  }

}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFFDB827) : Colors.grey[100],
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            color: isSelected ? const Color(0xFF1A1A1A) : Colors.grey[600],
          ),
        ),
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;

  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF3F4F6)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: InkWell(
        onTap: () => context.push('/orders/detail', extra: order),
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '#${order.id.substring(0, 8).toUpperCase()}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 16,
                    ),
                  ),
                  _buildStatusBadge(order.status),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                order.type == 'SO' ? 'Sales Order' : 'Purchase Order',
                style: const TextStyle(
                  color: Color(0xFFFDB827),
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                ),
              ),
              const Divider(height: 30, color: Color(0xFFF3F4F6)),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.type == 'SO' ? 'Pelanggan' : 'Supplier',
                        style: TextStyle(color: Colors.grey[400], fontSize: 11),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        order.entityName ?? '-',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'Total amount',
                        style: TextStyle(color: Colors.grey[400], fontSize: 11),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        currencyFormat.format(order.totalAmount),
                        style: const TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 18,
                          color: Color(0xFF1A1A1A),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    Color bgColor;

    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        color = const Color(0xFF10B981);
        bgColor = const Color(0xFFD1FAE5);
        break;
      case 'pending':
        color = const Color(0xFFFDB827);
        bgColor = const Color(0xFFFEF3C7);
        break;
      case 'cancelled':
        color = const Color(0xFFEF4444);
        bgColor = const Color(0xFFFEE2E2);
        break;
      default:
        color = Colors.grey;
        bgColor = Colors.grey[100]!;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}
