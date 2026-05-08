import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../shared/widgets/polish_widgets.dart';

import '../../core/theme/app_colors.dart';
import 'providers/report_providers.dart';
import 'models/report_models.dart';
import 'widgets/add_expense_sheet.dart';
import '../../features/auth/providers/auth_provider.dart';


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
          padding: const EdgeInsets.all(20),
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
                        style: GoogleFonts.outfit(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: AppColors.black,
                        ),
                      ),
                      Text(
                        isPersonal 
                            ? 'Pantau arus kas harian Anda'
                            : 'Pantau kesehatan finansial bisnis Anda',
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          color: AppColors.mediumGrey,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: () => _selectDateRange(context, ref),
                    icon: const Icon(Icons.calendar_month_rounded, color: AppColors.primary),
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.white,
                      padding: const EdgeInsets.all(12),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Periode: ${dateFormat.format(dateRange.start)} - ${dateFormat.format(dateRange.end)}',
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppColors.lightGrey,
                ),
              ),
              const SizedBox(height: 24),
              
              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: _ActionButton(
                      label: 'Catat Pengeluaran',
                      icon: Icons.add_circle_rounded,
                      color: AppColors.black,
                      onTap: () => _showAddExpense(context),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _ActionButton(
                      label: 'Lihat Laporan',
                      icon: Icons.analytics_rounded,
                      color: AppColors.primary,
                      textColor: AppColors.onPrimary,
                      onTap: () => context.push('/reports/detail'),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),

              summaryAsync.when(
                data: (summary) => Column(
                  children: [
                    _buildSummaryContent(summary, isPersonal)
                        .animate()
                        .fadeIn(duration: 600.ms)
                        .slideY(begin: 0.1, end: 0),
                    const SizedBox(height: 24),
                    _buildQuickAlerts(summary, isPersonal)
                        .animate()
                        .fadeIn(duration: 600.ms, delay: 200.ms)
                        .slideY(begin: 0.1, end: 0),
                  ],
                ),
                loading: () => ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: 3,
                  itemBuilder: (context, index) => SkeletonLoader.card(),
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

  Widget _buildSummaryContent(ReportSummary summary, bool isPersonal) {
    final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return Column(
      children: [
        // Net Profit Card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.black,
            borderRadius: BorderRadius.circular(32),
            boxShadow: [
              BoxShadow(
                color: AppColors.black.withValues(alpha: 0.2),
                blurRadius: 15,
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
                      color: Colors.white70,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Icon(Icons.info_outline_rounded, color: Colors.white30, size: 18),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                currencyFormat.format(summary.netProfit),
                style: GoogleFonts.outfit(
                  color: AppColors.primary,
                  fontSize: 36,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 24),
              const Divider(color: Colors.white10),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: _StatItem(
                      label: 'Pemasukan',
                      value: currencyFormat.format(summary.revenue),
                      color: Colors.greenAccent,
                      icon: Icons.arrow_downward_rounded,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatItem(
                      label: 'Pengeluaran',
                      value: currencyFormat.format(summary.expenses),
                      color: Colors.redAccent,
                      icon: Icons.arrow_upward_rounded,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuickAlerts(ReportSummary summary, bool isPersonal) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          isPersonal ? 'Wawasan Keuangan' : 'Wawasan Bisnis',
          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 16),
        if (!isPersonal && summary.lowStockCount > 0)
          _AlertCard(
            title: 'Stok Menipis',
            message: '${summary.lowStockCount} bahan baku membutuhkan restock segera.',
            icon: Icons.inventory_2_rounded,
            color: Colors.orange,
          ),
        const SizedBox(height: 12),
        _AlertCard(
          title: isPersonal ? 'Efisiensi Pengeluaran' : 'Efisiensi Biaya',
          message: summary.expenseRatio > 0.7 
            ? (isPersonal ? 'Pengeluaran Anda cukup tinggi bulan ini.' : 'Pengeluaran cukup tinggi (${(summary.expenseRatio * 100).toStringAsFixed(1)}% dari pendapatan).')
            : (isPersonal ? 'Pola pengeluaran Anda cukup terjaga.' : 'Struktur biaya Anda sehat (${(summary.expenseRatio * 100).toStringAsFixed(1)}% dari pendapatan).'),
          icon: Icons.trending_up_rounded,
          color: summary.expenseRatio > 0.7 ? Colors.red : Colors.blue,
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
      initialDateRange: DateTimeRange(start: dateRange.start, end: dateRange.end),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: AppColors.onPrimary,
              surface: AppColors.white,
              onSurface: AppColors.black,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      ref.read(reportDateRangeProvider.notifier).state = (start: picked.start, end: picked.end);
    }
  }

  void _showAddExpense(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const AddExpenseSheet(),
    );
  }

}

class _ActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final Color? textColor;
  final VoidCallback onTap;

  const _ActionButton({
    required this.label,
    required this.icon,
    required this.color,
    this.textColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          children: [
            Icon(icon, color: textColor ?? AppColors.primary, size: 24),
            const SizedBox(height: 8),
            Text(
              label,
              style: GoogleFonts.outfit(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: textColor ?? Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final IconData icon;

  const _StatItem({
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 16),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.outfit(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                value,
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _AlertCard extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;
  final Color color;

  const _AlertCard({
    required this.title,
    required this.message,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold),
                ),
                Text(
                  message,
                  style: GoogleFonts.outfit(fontSize: 12, color: AppColors.mediumGrey),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: AppColors.lightGrey),
        ],
      ),
    );
  }
}
