import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../shared/widgets/polish_widgets.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/dimens.dart';
import 'providers/report_providers.dart';
import 'models/report_models.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../shared/widgets/bill_summary_widget.dart';

class FinanceOverviewScreen extends ConsumerWidget {
  const FinanceOverviewScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaryAsync = ref.watch(reportSummaryProvider);
    final dateRange = ref.watch(reportDateRangeProvider);
    final authState = ref.watch(authProvider);
    final isPersonal = authState.profile?.accountType == 'personal';
    final dateFormat = DateFormat('dd MMM yyyy');

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: Dimens.page,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isPersonal ? 'Keuangan Pribadi' : 'Ringkasan Keuangan',
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                      const SizedBox(height: Dimens.xs),
                      Text(
                        isPersonal
                            ? 'Pantau arus kas harian Anda'
                            : 'Pantau kesehatan finansial bisnis Anda',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                  Flexible(
                    child: Material(
                      color: AppColors.surfaceSecondary,
                      borderRadius: BorderRadius.circular(100),
                      child: InkWell(
                        onTap: () => _selectDateRange(context, ref),
                        borderRadius: BorderRadius.circular(100),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.calendar_month_rounded,
                                color: AppColors.textPrimary,
                                size: 18,
                              ),
                              const SizedBox(width: 8),
                              Flexible(
                                child: Text(
                                  '${dateFormat.format(dateRange.start)} - ${dateFormat.format(dateRange.end)}',
                                  style: Theme.of(context).textTheme.bodySmall
                                      ?.copyWith(
                                        color: AppColors.textPrimary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: Dimens.sectionGap),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => context.push('/reports/detail'),
                  icon: const Icon(Icons.analytics_rounded, size: 18),
                  label: const Text('Lihat Laporan Lengkap'),
                  style: ElevatedButton.styleFrom(
                    elevation: 0,
                    shadowColor: Colors.transparent,
                  ),
                ),
              ),
              if (!isPersonal) ...[
                const SizedBox(height: Dimens.md),
                const BillSummaryWidget(),
              ],
              const SizedBox(height: Dimens.sectionGap),
              summaryAsync.when(
                data: (summary) => Column(
                  children: [
                    _buildSummaryContent(context, summary, isPersonal)
                        .animate()
                        .fadeIn(duration: 400.ms)
                        .slideY(begin: 0.05, end: 0),
                    const SizedBox(height: Dimens.sectionGap),
                    _buildQuickAlerts(context, summary, isPersonal)
                        .animate()
                        .fadeIn(duration: 400.ms, delay: 150.ms)
                        .slideY(begin: 0.05, end: 0),
                  ],
                ),
                loading: () => ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: 3,
                  itemBuilder: (_, __) => Padding(
                    padding: const EdgeInsets.only(bottom: Dimens.md),
                    child: SkeletonLoader.card(),
                  ),
                ),
                error: (e, s) => ErrorStateWidget(
                  error: e.toString(),
                  onRetry: () => ref.refresh(reportSummaryProvider),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryContent(
    BuildContext context,
    ReportSummary summary,
    bool isPersonal,
  ) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.textPrimary,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.textPrimary.withValues(alpha: 0.12),
            blurRadius: 24,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                isPersonal ? 'Estimasi Sisa Saldo' : 'Estimasi Laba Bersih',
                style: GoogleFonts.outfit(
                  color: AppColors.textInverse.withValues(alpha: 0.7),
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Icon(
                Icons.info_outline_rounded,
                color: AppColors.textInverse.withValues(alpha: 0.3),
                size: 18,
              ),
            ],
          ),
          const SizedBox(height: Dimens.sm),
          Text(
            currencyFormat.format(summary.netProfit),
            style: GoogleFonts.outfit(
              color: AppColors.primary,
              fontSize: 34,
              fontWeight: FontWeight.w800,
              height: 1.1,
            ),
          ),
          const SizedBox(height: Dimens.xxl),
          Divider(color: AppColors.textInverse.withValues(alpha: 0.1)),
          const SizedBox(height: Dimens.xl),
          Row(
            children: [
              Expanded(
                child: _buildStatItem(
                  context,
                  label: 'Pemasukan',
                  value: currencyFormat.format(summary.revenue),
                  color: AppColors.success,
                  icon: Icons.arrow_downward_rounded,
                ),
              ),
              const SizedBox(width: Dimens.md),
              Expanded(
                child: _buildStatItem(
                  context,
                  label: 'Pengeluaran',
                  value: currencyFormat.format(summary.expenses),
                  color: AppColors.error,
                  icon: Icons.arrow_upward_rounded,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(
    BuildContext context, {
    required String label,
    required String value,
    required Color color,
    required IconData icon,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(Dimens.sm),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 16),
        ),
        const SizedBox(width: Dimens.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.outfit(
                  color: AppColors.textInverse.withValues(alpha: 0.6),
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: Dimens.xs),
              Text(
                value,
                style: GoogleFonts.outfit(
                  color: AppColors.textInverse,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuickAlerts(
    BuildContext context,
    ReportSummary summary,
    bool isPersonal,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          isPersonal ? 'Wawasan Keuangan' : 'Wawasan Bisnis',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: Dimens.lg),
        if (!isPersonal && summary.lowStockCount > 0) ...[
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.warningLight,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: AppColors.warning.withValues(alpha: 0.15),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(Dimens.sm),
                  decoration: BoxDecoration(
                    color: AppColors.warning.withValues(alpha: 0.1),
                    borderRadius: Dimens.brSm,
                  ),
                  child: const Icon(
                    Icons.inventory_2_rounded,
                    color: AppColors.warning,
                    size: 20,
                  ),
                ),
                const SizedBox(width: Dimens.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Stok Menipis',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: Dimens.xs),
                      Text(
                        '${summary.lowStockCount} bahan baku membutuhkan restock segera.',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: Dimens.md),
        ],
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.borderLight, width: 0.5),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(Dimens.sm),
                decoration: BoxDecoration(
                  color:
                      (summary.expenseRatio > 0.7
                              ? AppColors.error
                              : AppColors.info)
                          .withValues(alpha: 0.1),
                  borderRadius: Dimens.brSm,
                ),
                child: Icon(
                  Icons.trending_up_rounded,
                  color: summary.expenseRatio > 0.7
                      ? AppColors.error
                      : AppColors.info,
                  size: 20,
                ),
              ),
              const SizedBox(width: Dimens.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isPersonal ? 'Efisiensi Pengeluaran' : 'Efisiensi Biaya',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: Dimens.xs),
                    Text(
                      summary.expenseRatio > 0.7
                          ? (isPersonal
                                ? 'Pengeluaran Anda cukup tinggi bulan ini.'
                                : 'Pengeluaran cukup tinggi (${(summary.expenseRatio * 100).toStringAsFixed(1)}% dari pendapatan).')
                          : (isPersonal
                                ? 'Pola pengeluaran Anda cukup terjaga.'
                                : 'Struktur biaya Anda sehat (${(summary.expenseRatio * 100).toStringAsFixed(1)}% dari pendapatan).'),
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Future<void> _selectDateRange(BuildContext context, WidgetRef ref) async {
    final dateRange = ref.read(reportDateRangeProvider);
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      initialDateRange: DateTimeRange(
        start: dateRange.start,
        end: dateRange.end,
      ),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: AppColors.onPrimary,
              surface: AppColors.surface,
              onSurface: AppColors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      ref.read(reportDateRangeProvider.notifier).state = (
        start: picked.start,
        end: picked.end,
      );
    }
  }
}
