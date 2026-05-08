import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/polish_widgets.dart';
import 'providers/notification_providers.dart';
import '../auth/providers/auth_provider.dart';

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text('Notifikasi', style: GoogleFonts.outfit(fontWeight: FontWeight.w900)),
          bottom: TabBar(
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.mediumGrey,
            indicatorColor: AppColors.primary,
            indicatorWeight: 3,
            labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.bold),
            tabs: const [
              Tab(text: 'Aktivitas'),
              Tab(text: 'Pengaturan'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _AlertsList(),
            _NotificationSettings(),
          ],
        ),
      ),
    );
  }
}

class _AlertsList extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alertsAsync = ref.watch(alertsProvider);

    return alertsAsync.when(
      data: (alerts) => alerts.isEmpty
          ? const EmptyStateWidget(
              title: 'Tidak ada notifikasi',
              message: 'Semua aktivitas terbaru akan muncul di sini.',
              icon: HugeIcons.strokeRoundedNotification01,
            )
          : AppRefreshIndicator(
              onRefresh: () => ref.refresh(alertsProvider.future),
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: alerts.length,
                itemBuilder: (context, index) {
                  final alert = alerts[index];
                  return _AlertTile(alert: alert);
                },
              ),
            ),
      loading: () => ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 5,
        itemBuilder: (context, index) => SkeletonLoader.listTile(),
      ),
      error: (e, s) => ErrorStateWidget(
        error: e.toString(),
        onRetry: () => ref.refresh(alertsProvider.future),
      ),
    );
  }
}

class _AlertTile extends StatelessWidget {
  final dynamic alert;
  const _AlertTile({required this.alert});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: alert.isRead ? AppColors.border : AppColors.primary.withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: _getTypeColor(alert.type).withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(_getTypeIcon(alert.type), color: _getTypeColor(alert.type), size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        alert.title,
                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                    Text(
                      DateFormat('HH:mm').format(alert.date),
                      style: GoogleFonts.outfit(fontSize: 11, color: AppColors.mediumGrey),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  alert.message,
                  style: GoogleFonts.outfit(fontSize: 13, color: AppColors.mediumGrey),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'warning': return Colors.orange;
      case 'error': return Colors.red;
      case 'info': return Colors.blue;
      default: return AppColors.primary;
    }
  }

  IconData _getTypeIcon(String type) {
    switch (type) {
      case 'warning': return HugeIcons.strokeRoundedAlert01;
      case 'error': return HugeIcons.strokeRoundedAlertCircle;
      case 'info': return HugeIcons.strokeRoundedInformationCircle;
      default: return HugeIcons.strokeRoundedNotification01;
    }
  }
}

class _NotificationSettings extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final isPersonal = authState.profile?.accountType == 'personal';
    final settingsAsync = ref.watch(notificationSettingsNotifierProvider);

    return settingsAsync.when(
      data: (settings) => ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (isPersonal) ...[
            _buildSectionHeader('PENGATURAN ANGGARAN'),
            _buildSwitchTile(
              ref,
              'budget_warning',
              'Peringatan Anggaran',
              'Notifikasi saat pengeluaran mencapai 80% dari limit.',
              settings['budget_warning'] ?? true,
            ),
            _buildSwitchTile(
              ref,
              'budget_limit',
              'Limit Anggaran Terlampaui',
              'Notifikasi saat pengeluaran melebihi limit anggaran.',
              settings['budget_limit'] ?? true,
            ),
            const SizedBox(height: 24),
            _buildSectionHeader('RINGKASAN HARIAN'),
            _buildSwitchTile(
              ref,
              'daily_summary',
              'Ringkasan Keuangan',
              'Terima ringkasan pengeluaran harian Anda.',
              settings['daily_summary'] ?? false,
            ),
          ] else ...[
            _buildSectionHeader('PENGINGAT STOK'),
            _buildSwitchTile(
              ref,
              'low_stock',
              'Stok Rendah',
              'Dapatkan notifikasi saat stok produk hampir habis.',
              settings['low_stock'] ?? false,
            ),
            _buildSwitchTile(
              ref,
              'out_of_stock',
              'Stok Habis',
              'Dapatkan notifikasi saat produk tidak tersedia.',
              settings['out_of_stock'] ?? false,
            ),
            const SizedBox(height: 24),
            _buildSectionHeader('LAPORAN & TRANSAKSI'),
            _buildSwitchTile(
              ref,
              'daily_report',
              'Laporan Harian',
              'Terima ringkasan penjualan setiap akhir hari.',
              settings['daily_report'] ?? false,
            ),
            _buildSwitchTile(
              ref,
              'new_order',
              'Pesanan Baru',
              'Notifikasi untuk setiap transaksi masuk.',
              settings['new_order'] ?? false,
            ),
          ],
        ],
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, s) => ErrorStateWidget(onRetry: () => ref.refresh(notificationSettingsProvider)),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 16, 12, 12),
      child: Text(
        title,
        style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.mediumGrey, letterSpacing: 1.2),
      ),
    );
  }

  Widget _buildSwitchTile(WidgetRef ref, String key, String title, String subtitle, bool value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: SwitchListTile(
        value: value,
        onChanged: (v) => ref.read(notificationSettingsNotifierProvider.notifier).updateSetting(key, v),
        title: Text(title, style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(subtitle, style: GoogleFonts.outfit(fontSize: 12, color: AppColors.mediumGrey)),
        activeThumbColor: AppColors.primary,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      ),
    );
  }
}
