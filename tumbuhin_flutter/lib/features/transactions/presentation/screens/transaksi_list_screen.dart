import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../shared/widgets/polish_widgets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/dimens.dart';
import '../../../reports/providers/report_providers.dart';
import '../widgets/transaction_source_badge.dart';
import '../providers/transaksi_providers.dart';
import '../../widgets/add_transaction_bottom_sheet.dart';

class TransaksiListScreen extends ConsumerWidget {
  const TransaksiListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final journalAsync = ref.watch(journalProvider);
    final sourceFilter = ref.watch(transaksiSourceFilterProvider);
    final dateStart = ref.watch(transaksiDateStartProvider);
    final dateEnd = ref.watch(transaksiDateEndProvider);
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    final dateFormat = DateFormat('dd MMM yyyy, HH:mm');

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildFilterBar(
              context,
              ref,
              sourceFilter,
              dateStart,
              dateEnd,
              dateFormat,
            ),
            Expanded(
              child: journalAsync.when(
                data: (journals) {
                  var filtered = journals.toList();

                  if (sourceFilter != null) {
                    filtered = filtered
                        .where((j) => j.sourceType == sourceFilter)
                        .toList();
                  }
                  if (dateStart != null) {
                    filtered = filtered
                        .where(
                          (j) => j.date.isAfter(
                            dateStart.subtract(const Duration(days: 1)),
                          ),
                        )
                        .toList();
                  }
                  if (dateEnd != null) {
                    filtered = filtered
                        .where(
                          (j) => j.date.isBefore(
                            dateEnd.add(const Duration(days: 1)),
                          ),
                        )
                        .toList();
                  }

                  if (filtered.isEmpty) {
                    return const EmptyStateWidget(
                      title: 'Belum ada transaksi',
                      message:
                          'Catat pengeluaran atau pemasukan pertama Anda hari ini.',
                    );
                  }

                  return AppRefreshIndicator(
                    onRefresh: () => ref.refresh(journalProvider.future),
                    child: ListView.builder(
                      padding: const EdgeInsets.all(20),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final entry = filtered[index];

                        final isIncome = entry.lines.any(
                          (l) => [
                            'income',
                            'pendapatan',
                            'revenue',
                          ].contains(l.accountType.toLowerCase()),
                        );

                        final amount = entry.totalAmount;

                        return GestureDetector(
                              onTap: () =>
                                  context.push('/transaksi/${entry.id}'),
                              child: Container(
                                margin: const EdgeInsets.only(
                                  bottom: Dimens.md,
                                ),
                                padding: Dimens.card,
                                decoration: BoxDecoration(
                                  color: AppColors.surface,
                                  borderRadius: Dimens.brLg,
                                  border: Border.all(
                                    color: AppColors.borderLight,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(Dimens.sm),
                                      decoration: BoxDecoration(
                                        color:
                                            (isIncome
                                                    ? Colors.green
                                                    : Colors.red)
                                                .withValues(alpha: 0.1),
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(
                                        isIncome
                                            ? Icons.south_west_rounded
                                            : Icons.arrow_outward_rounded,
                                        color: isIncome
                                            ? Colors.green
                                            : Colors.red,
                                        size: 20,
                                      ),
                                    ),
                                    const SizedBox(width: Dimens.md),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            entry.description,
                                            style: Theme.of(
                                              context,
                                            ).textTheme.titleMedium,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: Dimens.xs),
                                          Row(
                                            children: [
                                              if (entry.sourceType != null) ...[
                                                TransactionSourceBadge(
                                                  sourceType: entry.sourceType,
                                                ),
                                                const SizedBox(
                                                  width: Dimens.xs,
                                                ),
                                              ],
                                              Text(
                                                dateFormat.format(entry.date),
                                                style: Theme.of(
                                                  context,
                                                ).textTheme.bodySmall,
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    Text(
                                      '${isIncome ? "+" : "-"}${currencyFormat.format(amount)}',
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleMedium
                                          ?.copyWith(
                                            color: isIncome
                                                ? Colors.green
                                                : Colors.red,
                                          ),
                                    ),
                                  ],
                                ),
                              ),
                            )
                            .animate()
                            .fadeIn(delay: (index * 50).ms)
                            .slideX(begin: 0.1, end: 0);
                      },
                    ),
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) => ErrorStateWidget(
                  error: err.toString(),
                  onRetry: () => ref.refresh(journalProvider),
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (context) => const AddTransactionBottomSheet(),
          );
        },
        child: const Icon(Icons.add_rounded, size: 28),
      ),
    );
  }

  Widget _buildFilterBar(
    BuildContext context,
    WidgetRef ref,
    String? sourceFilter,
    DateTime? dateStart,
    DateTime? dateEnd,
    DateFormat dateFormat,
  ) {
    final sourceTypes = [
      null,
      'pos_sale',
      'expense',
      'receipt_ocr',
      'po_fulfillment',
      'transfer',
    ];
    final sourceLabels = {
      null: 'Semua',
      'pos_sale': 'POS',
      'expense': 'Biaya',
      'receipt_ocr': 'Resi',
      'po_fulfillment': 'PO',
      'transfer': 'Transfer',
    };

    return Container(
      padding: const EdgeInsets.fromLTRB(
        Dimens.lg,
        Dimens.md,
        Dimens.lg,
        Dimens.md,
      ),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: const Border(bottom: BorderSide(color: AppColors.borderLight)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 36,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: sourceTypes.length,
              separatorBuilder: (_, __) => const SizedBox(width: Dimens.sm),
              itemBuilder: (context, index) {
                final type = sourceTypes[index];
                final isSelected = sourceFilter == type;
                return GestureDetector(
                  onTap: () =>
                      ref.read(transaksiSourceFilterProvider.notifier).state =
                          type,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(
                      horizontal: Dimens.md,
                      vertical: Dimens.sm,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary
                          : AppColors.surfaceSecondary,
                      borderRadius: Dimens.brSm,
                      border: Border.all(
                        color: isSelected
                            ? AppColors.primary
                            : AppColors.borderLight,
                      ),
                    ),
                    child: Text(
                      sourceLabels[type]!,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: isSelected
                            ? AppColors.onPrimary
                            : AppColors.textTertiary,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: Dimens.sm),
          Wrap(
            spacing: Dimens.sm,
            runSpacing: Dimens.sm,
            children: [
              GestureDetector(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: dateStart ?? DateTime.now(),
                    firstDate: DateTime(2020),
                    lastDate: DateTime.now(),
                    helpText: 'Pilih Tanggal Mulai',
                  );
                  if (picked != null) {
                    ref.read(transaksiDateStartProvider.notifier).state =
                        picked;
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: Dimens.sm,
                    vertical: Dimens.xs,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSecondary,
                    borderRadius: Dimens.brXs,
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.calendar_today_rounded,
                        size: 14,
                        color: AppColors.textTertiary,
                      ),
                      const SizedBox(width: Dimens.xs),
                      Flexible(
                        child: Text(
                          dateStart != null
                              ? dateFormat.format(dateStart)
                              : 'Dari',
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(
                                color: dateStart != null
                                    ? AppColors.textPrimary
                                    : AppColors.textTertiary,
                              ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (dateStart != null) ...[
                        const SizedBox(width: Dimens.xs),
                        GestureDetector(
                          onTap: () =>
                              ref
                                      .read(transaksiDateStartProvider.notifier)
                                      .state =
                                  null,
                          child: Icon(
                            Icons.close_rounded,
                            size: 14,
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              GestureDetector(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: dateEnd ?? DateTime.now(),
                    firstDate: DateTime(2020),
                    lastDate: DateTime.now(),
                    helpText: 'Pilih Tanggal Akhir',
                  );
                  if (picked != null) {
                    ref.read(transaksiDateEndProvider.notifier).state = picked;
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: Dimens.sm,
                    vertical: Dimens.xs,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSecondary,
                    borderRadius: Dimens.brXs,
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.calendar_today_rounded,
                        size: 14,
                        color: AppColors.textTertiary,
                      ),
                      const SizedBox(width: Dimens.xs),
                      Flexible(
                        child: Text(
                          dateEnd != null
                              ? dateFormat.format(dateEnd)
                              : 'Sampai',
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(
                                color: dateEnd != null
                                    ? AppColors.textPrimary
                                    : AppColors.textTertiary,
                              ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (dateEnd != null) ...[
                        const SizedBox(width: Dimens.xs),
                        GestureDetector(
                          onTap: () =>
                              ref
                                      .read(transaksiDateEndProvider.notifier)
                                      .state =
                                  null,
                          child: Icon(
                            Icons.close_rounded,
                            size: 14,
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
