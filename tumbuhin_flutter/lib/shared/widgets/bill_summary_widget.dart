import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../features/bills/bills_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/dimens.dart';

class BillSummaryWidget extends ConsumerWidget {
  const BillSummaryWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaryAsync = ref.watch(billSummaryProvider);
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return summaryAsync.when(
      data: (summary) {
        final hutangAmount = summary.hutang.outstandingAmount;
        final piutangAmount = summary.piutang.outstandingAmount;
        final overdueCount = summary.hutang.overdueCount;

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: Dimens.brLg,
            border: Border.all(color: AppColors.borderLight),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: _SummaryItem(
                      label: 'Hutang',
                      value: currencyFormat.format(hutangAmount),
                      color: AppColors.error,
                      icon: Icons.trending_down_rounded,
                    ),
                  ),
                  Container(width: 1, height: 32, color: AppColors.borderLight),
                  Expanded(
                    child: _SummaryItem(
                      label: 'Piutang',
                      value: currencyFormat.format(piutangAmount),
                      color: AppColors.success,
                      icon: Icons.trending_up_rounded,
                    ),
                  ),
                ],
              ),
              if (overdueCount > 0) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.08),
                    borderRadius: Dimens.brSm,
                  ),
                  child: Text(
                    '$overdueCount tagihan jatuh tempo',
                    style: TextStyle(
                      color: AppColors.error,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ],
          ),
        );
      },
      loading: () => Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: Dimens.brLg,
          border: Border.all(color: AppColors.borderLight),
        ),
        child: const Center(
          child: SizedBox(
            height: 16,
            width: 16,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        ),
      ),
      error: (e, _) => const SizedBox.shrink(),
    );
  }
}

class _SummaryItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final IconData icon;

  const _SummaryItem({
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 14),
          const SizedBox(width: 6),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: AppColors.textTertiary,
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                value,
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
