import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:csv/csv.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../shared/widgets/polish_widgets.dart';
import '../../core/theme/app_colors.dart';
import 'providers/report_providers.dart';
import 'widgets/report_tabs.dart';
import 'widgets/add_expense_sheet.dart';
import '../auth/providers/auth_provider.dart';

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});

  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    // Use a small delay or postFrameCallback to set length based on account type if needed,
    // but here we can just use a fixed length and filter.
    // Better: check account type in build.
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dateRange = ref.watch(reportDateRangeProvider);
    final dateFormat = DateFormat('dd MMM yyyy');
    final authState = ref.watch(authProvider);
    final isPersonal =
        (authState.profile?.accountType ?? 'business') == 'personal';

    final tabs = [
      if (!isPersonal) const Tab(text: 'Jurnal'),
      if (!isPersonal) const Tab(text: 'Buku Besar'),
      if (!isPersonal) const Tab(text: 'Neraca Saldo'),
      if (!isPersonal) const Tab(text: 'Penjualan'),
      if (!isPersonal) const Tab(text: 'Laba Rugi'),
      const Tab(text: 'Arus Kas'),
      if (!isPersonal) const Tab(text: 'Stok'),
      if (!isPersonal) const Tab(text: 'Neraca'),
    ];

    _tabController = TabController(length: tabs.length, vsync: this);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isPersonal ? 'Laporan Pribadi' : 'Laporan Keuangan Bisnis',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            Text(
              '${dateFormat.format(dateRange.start)} - ${dateFormat.format(dateRange.end)}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () => _showAddExpense(context),
            icon: const Icon(Icons.add_circle_outline_rounded),
            tooltip: 'Catat Pengeluaran',
          ),
          IconButton(
            onPressed: () => _selectDateRange(context),
            icon: const Icon(Icons.date_range_rounded),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: AppColors.textPrimary,
          unselectedLabelColor: AppColors.textTertiary,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          labelStyle: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w800),
          unselectedLabelStyle: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
          tabs: tabs,
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          if (!isPersonal)
            _buildTabContent(
              ref.watch(journalProvider),
              (data) => JournalTab(entries: data),
            ),
          if (!isPersonal) const LedgerTab(),
          if (!isPersonal)
            _buildTabContent(
              ref.watch(balanceSheetProvider),
              (data) => TrialBalanceTab(items: data),
            ),
          if (!isPersonal)
            _buildTabContent(
              ref.watch(salesReportProvider),
              (data) => SalesTab(sales: data),
            ),
          if (!isPersonal)
            ref
                .watch(incomeStatementProvider)
                .when(
                  data: (data) => IncomeStatementTab(data: data),
                  loading: () => ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: 8,
                    itemBuilder: (context, index) => SkeletonLoader.listTile(),
                  ),
                  error: (e, _) => ErrorStateWidget(
                    error: e.toString(),
                    onRetry: () => ref.refresh(incomeStatementProvider),
                  ),
                ),
          const CashFlowTab(),
          if (!isPersonal)
            _buildTabContent(
              ref.watch(stockReportProvider),
              (data) => StockTab(items: data),
            ),
          if (!isPersonal)
            _buildTabContent(
              ref.watch(balanceSheetProvider),
              (data) => BalanceSheetTab(items: data),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _exportCurrentTab,
        child: const Icon(Icons.download_rounded),
      ),
    );
  }

  Future<void> _selectDateRange(BuildContext context) async {
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
              surface: AppColors.white,
              onSurface: AppColors.black,
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

  void _showAddExpense(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const AddExpenseSheet(),
    );
  }

  Widget _buildTabContent<T>(
    AsyncValue<List<T>> asyncValue,
    Widget Function(List<T>) builder,
  ) {
    return asyncValue.when(
      data: (data) => builder(data).animate().fadeIn(duration: 400.ms),
      loading: () => ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 8,
        itemBuilder: (context, index) => SkeletonLoader.listTile(),
      ),
      error: (e, s) => ErrorStateWidget(
        error: e.toString(),
        onRetry: () => asyncValue.hasError
            ? null
            : null, // Provider refresh handled by caller if needed
      ),
    );
  }

  Future<void> _exportCurrentTab() async {
    final currentIndex = _tabController.index;

    // Unified model: no more tier paywall
    try {
      List<List<dynamic>> rows = [];
      String fileName = 'Laporan';

      if (currentIndex == 0) {
        // Jurnal
        final journals = await ref.read(journalProvider.future);
        fileName = 'Jurnal_Transaksi';
        rows.add(['Tanggal', 'Referensi', 'Akun', 'Debit', 'Kredit']);
        for (var entry in journals) {
          for (var line in entry.lines) {
            rows.add([
              DateFormat('yyyy-MM-dd HH:mm').format(entry.date),
              entry.referenceNumber,
              '${line.accountCode} - ${line.accountName}',
              line.debit,
              line.credit,
            ]);
          }
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Ekspor untuk tab ini sedang dikembangkan'),
          ),
        );
        return;
      }

      String csvData = const ListToCsvConverter().convert(rows);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Berhasil mengekspor $fileName.csv')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal mengekspor: $e')));
      }
    }
  }
}
