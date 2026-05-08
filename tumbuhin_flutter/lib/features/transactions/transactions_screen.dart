import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../shared/widgets/polish_widgets.dart';
import '../../core/theme/app_colors.dart';
import '../reports/providers/report_providers.dart';
import '../reports/models/report_models.dart';
import './widgets/add_transaction_bottom_sheet.dart';

class TransactionsScreen extends ConsumerWidget {
  const TransactionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final journalAsync = ref.watch(journalProvider);
    final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    final dateFormat = DateFormat('dd MMM yyyy, HH:mm');

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: journalAsync.when(
          data: (journals) {
            if (journals.isEmpty) {
              return const EmptyStateWidget(
                title: 'Belum ada transaksi',
                message: 'Catat pengeluaran atau pemasukan pertama Anda hari ini.',
              );
            }

            return AppRefreshIndicator(
              onRefresh: () => ref.refresh(journalProvider.future),
              child: ListView.builder(
                padding: const EdgeInsets.all(20),
                itemCount: journals.length,
                itemBuilder: (context, index) {
                  final entry = journals[index];
                  
                  // Logic match with Web: check if any line is income/pendapatan
                  final isIncome = entry.lines.any((l) => 
                    ['income', 'pendapatan', 'revenue'].contains(l.accountType.toLowerCase())
                  );
                  
                  final amount = entry.totalAmount;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: (isIncome ? Colors.green : Colors.red).withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            isIncome ? Icons.south_west_rounded : Icons.arrow_outward_rounded,
                            color: isIncome ? Colors.green : Colors.red,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                entry.description,
                                style: GoogleFonts.outfit(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                  color: AppColors.black,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Row(
                                children: [
                                  Text(
                                    entry.lines.isNotEmpty ? entry.lines.first.accountName : '',
                                    style: GoogleFonts.outfit(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  Text(
                                    ' • ${dateFormat.format(entry.date)}',
                                    style: GoogleFonts.outfit(
                                      fontSize: 11,
                                      color: AppColors.mediumGrey,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        Text(
                          '${isIncome ? "+" : "-"}${currencyFormat.format(amount)}',
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.w900,
                            fontSize: 16,
                            color: isIncome ? Colors.green : Colors.red,
                          ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(delay: (index * 50).ms).slideX(begin: 0.1, end: 0);
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
    );
  }
}
