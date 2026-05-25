import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../reports/models/report_models.dart';
import '../widgets/journal_lines_card.dart';
import '../widgets/transaction_source_badge.dart';
import '../providers/transaksi_providers.dart';
import '../../../../core/theme/app_colors.dart';

class TransaksiDetailScreen extends ConsumerWidget {
  final String transactionId;

  const TransaksiDetailScreen({super.key, required this.transactionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final entryAsync = ref.watch(transactionDetailProvider(transactionId));

    return entryAsync.when(
      loading: () => const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (err, _) => Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text(
            'Detail Transaksi',
            style: GoogleFonts.outfit(fontWeight: FontWeight.w800),
          ),
        ),
        body: Center(child: Text('Gagal memuat transaksi: $err')),
      ),
      data: (entry) => _buildContent(context, entry),
    );
  }

  Widget _buildContent(BuildContext context, JournalEntry entry) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    final dateFormat = DateFormat('dd MMM yyyy, HH:mm');

    final isIncome = entry.lines.any(
      (l) => [
        'income',
        'pendapatan',
        'revenue',
      ].contains(l.accountType.toLowerCase()),
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Detail Transaksi',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w800),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    if (entry.sourceType != null)
                      TransactionSourceBadge(sourceType: entry.sourceType),
                    if (entry.sourceType != null) const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: (isIncome ? Colors.green : Colors.red)
                            .withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        isIncome ? 'PEMASUKAN' : 'PENGELUARAN',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: isIncome ? Colors.green : Colors.red,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  entry.description,
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.w900,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  dateFormat.format(entry.date),
                  style: TextStyle(color: AppColors.mediumGrey, fontSize: 13),
                ),
                if (entry.referenceNumber.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Ref: ${entry.referenceNumber}',
                    style: TextStyle(color: AppColors.lightGrey, fontSize: 12),
                  ),
                ],
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Total',
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      '${isIncome ? "+" : "-"}${currencyFormat.format(entry.totalAmount)}',
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.w900,
                        fontSize: 24,
                        color: isIncome ? Colors.green : Colors.red,
                      ),
                    ),
                  ],
                ),
                if (entry.paymentMethod != null) ...[
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(
                        Icons.payment_rounded,
                        size: 16,
                        color: AppColors.mediumGrey,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Metode: ${entry.paymentMethod}',
                        style: TextStyle(
                          color: AppColors.mediumGrey,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),
          JournalLinesCard(lines: entry.lines, currencyFormat: currencyFormat),
          if (entry.referenceId != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Item Penjualan',
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.w800,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () =>
                          context.push('/pesanan/${entry.referenceId}'),
                      icon: const Icon(Icons.receipt_long_rounded, size: 18),
                      label: Text(
                        'Lihat Pesanan #${entry.referenceId!.length > 8 ? entry.referenceId!.substring(0, 8) : entry.referenceId}',
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
