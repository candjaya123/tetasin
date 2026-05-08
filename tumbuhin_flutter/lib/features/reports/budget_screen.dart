import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/services/budget_service.dart';
import './providers/budget_providers.dart';
import './widgets/add_budget_sheet.dart';
import 'package:intl/intl.dart';
import 'package:flutter_animate/flutter_animate.dart';

class BudgetScreen extends ConsumerWidget {
  const BudgetScreen({super.key});

  String _formatCurrency(double val) {
    return NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(val);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentMonth = ref.watch(budgetMonthProvider);
    final budgetsAsync = ref.watch(budgetsProvider(currentMonth));
    final summaryAsync = ref.watch(budgetSummaryProvider(currentMonth));

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(budgetsProvider(currentMonth));
            return await ref.read(budgetsProvider(currentMonth).future);
          },
          child: ListView(
            padding: const EdgeInsets.all(24),
            children: [
              _buildHeader(context, ref, currentMonth),
              const SizedBox(height: 32),
              summaryAsync.when(
                data: (summary) => _buildSummaryCard(summary),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, _) => Text('Error: $err'),
              ),
              const SizedBox(height: 40),
              Text(
                'RINCIAN KATEGORI',
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: AppColors.lightGrey,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 16),
              budgetsAsync.when(
                data: (budgets) {
                  if (budgets.isEmpty) {
                    return _buildEmptyState();
                  }
                  return Column(
                    children: budgets.map((b) => _buildBudgetCard(context, ref, b)).toList(),
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, _) => Center(child: Text('Gagal memuat: $err')),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, WidgetRef ref, String currentMonth) {
    final date = DateFormat('yyyy-MM').parse(currentMonth);
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Anggaran',
              style: GoogleFonts.outfit(
                fontSize: 32,
                fontWeight: FontWeight.w900,
                color: AppColors.black,
              ),
            ),
            Text(
              DateFormat('MMMM yyyy', 'id_ID').format(date),
              style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.mediumGrey,
              ),
            ),
          ],
        ),
        Row(
          children: [
            IconButton(
              icon: const Icon(Icons.chevron_left_rounded),
              onPressed: () {
                final prev = DateFormat('yyyy-MM').format(
                  DateTime(date.year, date.month - 1),
                );
                ref.read(budgetMonthProvider.notifier).state = prev;
              },
            ),
            IconButton(
              icon: const Icon(Icons.chevron_right_rounded),
              onPressed: () {
                final next = DateFormat('yyyy-MM').format(
                  DateTime(date.year, date.month + 1),
                );
                ref.read(budgetMonthProvider.notifier).state = next;
              },
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSummaryCard(Map<String, dynamic> summary) {
    final totalBudget = (summary['total_budget'] as num).toDouble();
    final totalSpent = (summary['total_spent'] as num).toDouble();
    final percentage = (summary['percentage'] as num).toDouble();

    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: AppColors.secondary,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: AppColors.secondary.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'TOTAL ANGGARAN',
            style: GoogleFonts.outfit(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              color: Colors.white.withOpacity(0.4),
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _formatCurrency(totalBudget),
            style: GoogleFonts.outfit(
              fontSize: 36,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'TERPAKAI',
                      style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white.withOpacity(0.4)),
                    ),
                    Text(
                      _formatCurrency(totalSpent),
                      style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  '${(percentage * 100).toStringAsFixed(0)}%',
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: AppColors.onPrimary,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn().slideY(begin: 0.2, end: 0);
  }

  Widget _buildBudgetCard(BuildContext context, WidgetRef ref, Map<String, dynamic> budget) {
    final double limit = (budget['limit_amount'] ?? 0).toDouble();
    final double spent = (budget['current_spent'] ?? 0).toDouble();
    final double percent = limit > 0 ? (spent / limit) : 0;
    
    Color progressColor = AppColors.primary;
    if (percent >= 1.0) {
      progressColor = Colors.redAccent;
    } else if (percent >= 0.8) {
      progressColor = Colors.orangeAccent;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  budget['category_name'] ?? 'Kategori',
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppColors.black,
                  ),
                ),
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.edit_outlined, size: 18, color: AppColors.lightGrey),
                    onPressed: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor: Colors.transparent,
                        builder: (context) => AddBudgetSheet(initialBudget: budget),
                      );
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, size: 18, color: Colors.redAccent),
                    onPressed: () => _handleDelete(context, ref, budget),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: percent > 1.0 ? 1.0 : percent,
              minHeight: 12,
              backgroundColor: progressColor.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation<Color>(progressColor),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'TERPAKAI',
                    style: GoogleFonts.outfit(fontSize: 9, fontWeight: FontWeight.w900, color: AppColors.lightGrey, letterSpacing: 1),
                  ),
                  Text(
                    _formatCurrency(spent),
                    style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.black),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'LIMIT',
                    style: GoogleFonts.outfit(fontSize: 9, fontWeight: FontWeight.w900, color: AppColors.lightGrey, letterSpacing: 1),
                  ),
                  Text(
                    _formatCurrency(limit),
                    style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.mediumGrey),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: 100.ms).slideX(begin: 0.1, end: 0);
  }

  Future<void> _handleDelete(BuildContext context, WidgetRef ref, Map<String, dynamic> budget) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hapus Anggaran?'),
        content: Text('Anda akan menghapus anggaran untuk kategori ${budget['category_name']}.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Batal')),
          TextButton(
            onPressed: () => Navigator.pop(context, true), 
            child: const Text('Hapus', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        final service = ref.read(budgetServiceProvider);
        await service.deleteBudget(budget['id']);
        final month = ref.read(budgetMonthProvider);
        ref.invalidate(budgetsProvider(month));
        if (context.mounted) {
           ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Anggaran berhasil dihapus')));
        }
      } catch (e) {
        if (context.mounted) {
           ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal menghapus: $e')));
        }
      }
    }
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 60),
      child: Column(
        children: [
          const Icon(Icons.savings_outlined, size: 80, color: AppColors.border),
          const SizedBox(height: 24),
          Text(
            'Belum Ada Anggaran',
            style: GoogleFonts.outfit(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: AppColors.black,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Mulai atur pengeluaran Anda agar\ntetap hemat dan terencana.',
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppColors.mediumGrey,
            ),
          ),
        ],
      ),
    ).animate().fadeIn();
  }
}
