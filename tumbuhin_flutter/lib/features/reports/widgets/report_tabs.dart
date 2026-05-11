import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../models/report_models.dart';
import '../providers/report_providers.dart';

class JournalTab extends StatelessWidget {
  final List<JournalEntry> entries;

  const JournalTab({super.key, required this.entries});

  @override
  Widget build(BuildContext context) {
    if (entries.isEmpty) return _buildEmptyState();

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: entries.length,
      itemBuilder: (context, index) {
        final entry = entries[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          entry.referenceNumber,
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.w800,
                            fontSize: 14,
                            color: AppColors.black,
                          ),
                        ),
                        Text(
                          DateFormat('dd MMM yyyy HH:mm').format(entry.date),
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            color: AppColors.mediumGrey,
                          ),
                        ),
                      ],
                    ),
                    const Icon(Icons.description_outlined, size: 20, color: AppColors.lightGrey),
                  ],
                ),
              ),
              const Divider(height: 1),
              ...entry.lines.map((line) => Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            line.accountName,
                            style: GoogleFonts.outfit(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                              color: AppColors.black,
                            ),
                          ),
                          Text(
                            line.accountCode,
                            style: GoogleFonts.outfit(
                              fontSize: 11,
                              color: AppColors.lightGrey,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Text(
                        line.debit > 0 ? NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(line.debit) : '',
                        textAlign: TextAlign.right,
                        style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green),
                      ),
                    ),
                    Expanded(
                      child: Text(
                        line.credit > 0 ? NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(line.credit) : '',
                        textAlign: TextAlign.right,
                        style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.red),
                      ),
                    ),
                  ],
                ),
              )),
              const SizedBox(height: 8),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.history_edu_outlined, size: 64, color: AppColors.lightGrey.withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          Text(
            'Belum ada jurnal transaksi',
            style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: AppColors.mediumGrey),
          ),
        ],
      ),
    );
  }
}

class SalesTab extends StatelessWidget {
  final List<SalesReportItem> sales;

  const SalesTab({super.key, required this.sales});

  @override
  Widget build(BuildContext context) {
    if (sales.isEmpty) return _buildEmptyState();

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: sales.length,
      itemBuilder: (context, index) {
        final sale = sales[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: AppColors.primary.withValues(alpha: 0.1),
              child: const Icon(Icons.shopping_cart_outlined, color: AppColors.black, size: 18),
            ),
            title: Text(
              sale.orderNumber,
              style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            subtitle: Text(
              '${sale.customerName} • ${DateFormat('dd MMM').format(sale.date)}',
              style: GoogleFonts.outfit(fontSize: 12),
            ),
            trailing: Text(
              NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(sale.totalAmount),
              style: GoogleFonts.outfit(fontWeight: FontWeight.w900, color: AppColors.black),
            ),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.receipt_long_outlined, size: 64, color: AppColors.lightGrey.withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          Text(
            'Tidak ada data penjualan',
            style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: AppColors.mediumGrey),
          ),
        ],
      ),
    );
  }
}

class StockTab extends StatelessWidget {
  final List<StockReportItem> items;

  const StockTab({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return _buildEmptyState();

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        final isLow = item.currentStock <= item.minStock;

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: isLow ? Colors.red.shade100 : AppColors.border),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    Text(
                      item.sku,
                      style: GoogleFonts.outfit(fontSize: 12, color: AppColors.mediumGrey),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${item.currentStock} Unit',
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.w900,
                      fontSize: 16,
                      color: isLow ? Colors.red : AppColors.black,
                    ),
                  ),
                  if (isLow)
                    Text(
                      'Stok Menipis!',
                      style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.red),
                    ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inventory_2_outlined, size: 64, color: AppColors.lightGrey.withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          Text(
            'Tidak ada data stok',
            style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: AppColors.mediumGrey),
          ),
        ],
      ),
    );
  }
}

class LedgerTab extends ConsumerWidget {
  const LedgerTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final coaAsync = ref.watch(coaProvider);
    final selectedAccountId = ref.watch(selectedLedgerAccountProvider);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: coaAsync.when(
            data: (accounts) => DropdownButtonFormField<String>(
              initialValue: selectedAccountId,
              decoration: InputDecoration(
                labelText: 'Pilih Akun',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                filled: true,
                fillColor: Colors.white,
              ),
              items: accounts.map((a) => DropdownMenuItem(
                value: a['id'].toString(),
                child: Text('${a['code']} - ${a['name']}', style: GoogleFonts.outfit(fontSize: 13)),
              )).toList(),
              onChanged: (v) => ref.read(selectedLedgerAccountProvider.notifier).state = v,
            ),
            loading: () => const LinearProgressIndicator(),
            error: (e, _) => Text('Error loading accounts: $e'),
          ),
        ),
        if (selectedAccountId != null)
          Expanded(
            child: ref.watch(ledgerProvider(selectedAccountId)).when(
              data: (entries) {
                if (entries.isEmpty) return const Center(child: Text('Belum ada transaksi di akun ini'));
                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: entries.length,
                  itemBuilder: (context, index) {
                    final entry = entries[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        title: Text(entry.description, style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13)),
                        subtitle: Text(DateFormat('dd MMM yyyy').format(entry.date), style: GoogleFonts.outfit(fontSize: 11)),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              entry.debit > 0 ? '+ Rp ${entry.debit.toInt()}' : '- Rp ${entry.credit.toInt()}',
                              style: GoogleFonts.outfit(
                                fontWeight: FontWeight.bold,
                                color: entry.debit > 0 ? Colors.green : Colors.red,
                              ),
                            ),
                            Text(
                              'Saldo: Rp ${entry.balance.toInt()}',
                              style: GoogleFonts.outfit(fontSize: 10, color: AppColors.mediumGrey),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
            ),
          )
        else
          const Expanded(child: Center(child: Text('Pilih akun untuk melihat Buku Besar'))),
      ],
    );
  }
}

class TrialBalanceTab extends StatelessWidget {
  final List<BalanceSheetItem> items;

  const TrialBalanceTab({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const Center(child: Text('Tidak ada data'));

    double totalDebit = 0;
    double totalCredit = 0;
    for (var item in items) {
      totalDebit += item.totalDebit;
      totalCredit += item.totalCredit;
    }

    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return Container(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: AppColors.border)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.name, style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13)),
                          Text(item.code, style: GoogleFonts.outfit(fontSize: 11, color: AppColors.mediumGrey)),
                        ],
                      ),
                    ),
                    Expanded(child: Text(item.totalDebit > 0 ? NumberFormat.currency(locale: 'id_ID', symbol: '', decimalDigits: 0).format(item.totalDebit) : '-', textAlign: TextAlign.right, style: GoogleFonts.outfit(fontSize: 12))),
                    Expanded(child: Text(item.totalCredit > 0 ? NumberFormat.currency(locale: 'id_ID', symbol: '', decimalDigits: 0).format(item.totalCredit) : '-', textAlign: TextAlign.right, style: GoogleFonts.outfit(fontSize: 12))),
                  ],
                ),
              );
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.all(16),
          color: AppColors.black,
          child: Row(
            children: [
              Expanded(flex: 2, child: Text('TOTAL', style: GoogleFonts.outfit(color: AppColors.primary, fontWeight: FontWeight.w900))),
              Expanded(child: Text(NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(totalDebit), textAlign: TextAlign.right, style: GoogleFonts.outfit(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 11))),
              Expanded(child: Text(NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(totalCredit), textAlign: TextAlign.right, style: GoogleFonts.outfit(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 11))),
            ],
          ),
        ),
      ],
    );
  }
}

class IncomeStatementTab extends StatelessWidget {
  final Map<String, dynamic> data;

  const IncomeStatementTab({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _buildSectionHeader('Pendapatan'),
        _buildRow('Penjualan', data['revenue'] ?? 0),
        const Divider(height: 32),
        _buildSectionHeader('Beban'),
        _buildRow('Total Beban', data['expenses'] ?? 0, isNegative: true),
        const SizedBox(height: 32),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.black,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('LABA / RUGI BERSIH', style: GoogleFonts.outfit(color: AppColors.primary, fontWeight: FontWeight.w900)),
              Text(
                currency.format(data['net_profit'] ?? 0),
                style: GoogleFonts.outfit(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 18),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(title.toUpperCase(), style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w900, color: AppColors.mediumGrey, letterSpacing: 1.2)),
    );
  }

  Widget _buildRow(String label, dynamic value, {bool isNegative = false}) {
    final currency = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
          Text(
            isNegative ? '- ${currency.format(value)}' : currency.format(value),
            style: GoogleFonts.outfit(fontWeight: FontWeight.w900, color: isNegative ? Colors.red : AppColors.black),
          ),
        ],
      ),
    );
  }
}

class BalanceSheetTab extends StatelessWidget {
  final List<BalanceSheetItem> items;

  const BalanceSheetTab({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    final assets = items.where((i) => i.type == 'asset').toList();
    final liabilities = items.where((i) => i.type == 'liability').toList();
    final equity = items.where((i) => i.type == 'equity').toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildCategory('AKTIVA (ASET)', assets),
        _buildCategory('PASIVA (KEWAJIBAN)', liabilities),
        _buildCategory('EKUITAS (MODAL)', equity),
      ],
    );
  }

  Widget _buildCategory(String title, List<BalanceSheetItem> categoryItems) {
    double total = categoryItems.fold(0, (sum, item) => sum + item.currentBalance);
    final currency = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Text(title, style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 14, color: AppColors.mediumGrey)),
        ),
        ...categoryItems.map((item) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(item.name, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w600)),
              Text(currency.format(item.currentBalance), style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold)),
            ],
          ),
        )),
        const Divider(),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('TOTAL $title', style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 13)),
            Text(currency.format(total), style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 15)),
          ],
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

class CashFlowTab extends ConsumerWidget {
  const CashFlowTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cashFlowAsync = ref.watch(cashFlowProvider);
    final currency = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return cashFlowAsync.when(
      data: (items) {
        if (items.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.account_balance_wallet_outlined, size: 64, color: AppColors.lightGrey.withValues(alpha: 0.5)),
                const SizedBox(height: 16),
                Text(
                  'Tidak ada data arus kas',
                  style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: AppColors.mediumGrey),
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = items[index];
            final isOutflow = item.outflow > 0;

            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: (isOutflow ? Colors.red : Colors.green).withValues(alpha: 0.1),
                  child: Icon(
                    isOutflow ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded,
                    color: isOutflow ? Colors.red : Colors.green,
                    size: 18,
                  ),
                ),
                title: Text(
                  item.description,
                  style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                subtitle: Text(
                  DateFormat('dd MMM yyyy').format(item.date),
                  style: GoogleFonts.outfit(fontSize: 12),
                ),
                trailing: Text(
                  isOutflow ? '- ${currency.format(item.outflow)}' : currency.format(item.inflow),
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.w900,
                    color: isOutflow ? Colors.red : Colors.green,
                  ),
                ),
              ),
            );
          },
        );
      },
      loading: () => ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 8,
        itemBuilder: (context, index) => const ListTile(title: Text('Loading...')),
      ),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }
}
