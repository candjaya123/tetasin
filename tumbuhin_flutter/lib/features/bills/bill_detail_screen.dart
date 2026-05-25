import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/dimens.dart';
import '../../shared/services/services_provider.dart';
import '../../shared/widgets/polish_widgets.dart';
import 'payment_sheet.dart';
import 'bills_provider.dart';

class BillDetailScreen extends ConsumerWidget {
  final String billId;
  const BillDetailScreen({super.key, required this.billId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final billAsync = ref.watch(_billDetailProvider(billId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Detail Tagihan')),
      body: billAsync.when(
        data: (bill) => _buildContent(context, ref, bill),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ErrorStateWidget(
          error: e.toString(),
          onRetry: () => ref.invalidate(_billDetailProvider(billId)),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, dynamic bill) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    final status = bill.status?.toString() ?? 'pending';
    final dueDate = bill.dueDate != null
        ? DateTime.parse(bill.dueDate.toString())
        : null;
    final payments = bill.payments as List? ?? [];

    String statusLabel(String s) {
      switch (s) {
        case 'paid':
          return 'Lunas';
        case 'overdue':
          return 'Terlewat';
        case 'cancelled':
          return 'Dibatalkan';
        default:
          return 'Menunggu';
      }
    }

    Color statusColor(String s) {
      switch (s) {
        case 'paid':
          return AppColors.success;
        case 'overdue':
          return AppColors.error;
        case 'cancelled':
          return AppColors.textTertiary;
        default:
          return AppColors.warning;
      }
    }

    return SingleChildScrollView(
      padding: Dimens.page,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: Dimens.card,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: Dimens.brLg,
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(Dimens.md),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.receipt_long_rounded,
                    size: 36,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: Dimens.lg),
                Text(
                  bill.name ?? bill.billName ?? 'Tagihan',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: Dimens.xs),
                StatusBadge(
                  label: statusLabel(status),
                  color: statusColor(status),
                ),
                const SizedBox(height: Dimens.lg),
                Text(
                  currencyFormat.format(
                    (bill.amount ?? bill.amountDue ?? 0).toDouble(),
                  ),
                  style: Theme.of(context).textTheme.displaySmall,
                ),
              ],
            ),
          ),
          const SizedBox(height: Dimens.lg),
          if (dueDate != null || bill.description != null)
            Container(
              width: double.infinity,
              padding: Dimens.card,
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: Dimens.brLg,
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                children: [
                  if (dueDate != null)
                    InfoRow(
                      label: 'Jatuh Tempo',
                      value: DateFormat('d MMMM yyyy', 'id_ID').format(dueDate),
                    ),
                  if (dueDate != null && bill.description != null)
                    const SizedBox(height: Dimens.md),
                  if (bill.description != null)
                    InfoRow(
                      label: 'Keterangan',
                      value: bill.description.toString(),
                    ),
                ],
              ),
            ),
          if (status == 'pending' || status == 'overdue') ...[
            const SizedBox(height: Dimens.lg),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => _showPaySheet(context, ref, bill),
                icon: const Icon(Icons.payment_rounded),
                label: const Text('Bayar Tagihan'),
              ),
            ),
            const SizedBox(height: Dimens.md),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => _confirmCancel(context, ref),
                icon: const Icon(Icons.cancel_outlined),
                label: const Text('Batalkan Tagihan'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.error,
                ),
              ),
            ),
          ],
          if (payments.isNotEmpty) ...[
            const SizedBox(height: Dimens.xxl),
            Text(
              'Riwayat Pembayaran',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: Dimens.md),
            ...payments.map(
              (p) => Container(
                margin: const EdgeInsets.only(bottom: Dimens.sm),
                padding: Dimens.card,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: Dimens.brMd,
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          currencyFormat.format(
                            (p['amount'] as num?)?.toDouble() ?? 0,
                          ),
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        if (p['payment_date'] != null)
                          Text(
                            DateFormat('d MMM yyyy', 'id_ID').format(
                              DateTime.parse(p['payment_date'].toString()),
                            ),
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                      ],
                    ),
                    if (p['payment_method'] != null)
                      Text(
                        p['payment_method'].toString(),
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _showPaySheet(BuildContext context, WidgetRef ref, dynamic bill) async {
    final remainingAmount =
        ((bill.amount ?? bill.amountDue ?? 0).toDouble()) -
        ((bill.amountPaid ?? 0).toDouble());
    final billName = (bill.name ?? bill.billName ?? bill.title ?? 'Tagihan')
        .toString();

    final result = await showPaymentSheet(
      context: context,
      ref: ref,
      billId: bill.id.toString(),
      billName: billName,
      remainingAmount: remainingAmount > 0
          ? remainingAmount
          : (bill.amount ?? bill.amountDue ?? 0).toDouble(),
    );

    if (result == true) {
      ref.invalidate(_billDetailProvider(billId));
      ref.invalidate(billsListProvider);
      ref.invalidate(billSummaryProvider);
    }
  }

  void _confirmCancel(BuildContext context, WidgetRef ref) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Batalkan Tagihan?'),
        content: const Text(
          'Tagihan yang dibatalkan tidak dapat dikembalikan.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Tidak'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text(
              'Ya, Batalkan',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
    if (confirm == true) {
      await ref.read(billTrackerServiceProvider).cancelBill(billId);
      if (context.mounted) {
        ref.invalidate(_billDetailProvider(billId));
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Tagihan dibatalkan')));
      }
    }
  }
}

final _billDetailProvider = FutureProvider.family((ref, String id) async {
  return ref.read(billTrackerServiceProvider).getBillDetail(id);
});
