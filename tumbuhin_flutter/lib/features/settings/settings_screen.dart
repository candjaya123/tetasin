import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../auth/providers/auth_provider.dart';
import '../../shared/models/tenant.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/dimens.dart';
import 'widgets/edit_sheets.dart';
import 'printer_settings_screen.dart';
import '../../shared/models/user_profile.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final profile = authState.profile;
    final tenant = authState.tenant;
    final isGuest = authState.isGuest;
    final isPersonal = authState.profile?.accountType == 'personal';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Pengaturan',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        backgroundColor: AppColors.background,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: Dimens.sm),
        children: [
          if (isGuest) _buildGuestBanner(context),

          // Profile Header
          _buildProfileHeader(context, profile, isGuest),

          const SizedBox(height: 12),

          // Subscription Tier Card
          _buildTierCard(context, tenant, isPersonal),

          Padding(
            padding: const EdgeInsets.fromLTRB(
              Dimens.xxl,
              Dimens.sectionGap,
              Dimens.lg,
              Dimens.sm,
            ),
            child: Text(
              isPersonal ? 'PENGATURAN' : 'BISNIS & PENGATURAN',
              style: Theme.of(
                context,
              ).textTheme.labelSmall?.copyWith(letterSpacing: 1.5),
            ),
          ),

          _buildSettingsTile(
            context,
            icon: Icons.store_rounded,
            title: isPersonal ? 'Informasi Akun' : 'Informasi Bisnis',
            subtitle: tenant?.name ?? 'Belum diatur',
            onTap: () => _showEditSheet(context, const TenantEditSheet()),
          ),

          if (!isPersonal) ...[
            _buildSettingsTile(
              context,
              icon: Icons.shopping_bag_rounded,
              title: 'Daftar Pesanan',
              subtitle: 'Lihat histori SO & PO',
              onTap: () => context.push('/pesanan'),
            ),

            _buildSettingsTile(
              context,
              icon: Icons.local_offer_rounded,
              title: 'Katalog Promo',
              subtitle: 'Manajemen diskon & penawaran',
              onTap: () => context.push('/promos'),
            ),

            if (profile?.role == UserRole.manager)
              _buildSettingsTile(
                context,
                icon: Icons.people_alt_rounded,
                title: 'Manajemen Tim',
                subtitle: 'Atur akses staf & pantau log',
                onTap: () => context.push('/staff'),
              ),

            _buildSettingsTile(
              context,
              icon: Icons.print_rounded,
              title: 'Printer Bluetooth',
              subtitle: 'Atur printer thermal untuk struk',
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (c) => const PrinterSettingsScreen(),
                ),
              ),
            ),
          ],

          _buildSettingsTile(
            context,
            icon: Icons.notifications_none_rounded,
            title: 'Notifikasi',
            subtitle: 'Atur pengingat stok dan laporan',
            onTap: () => context.push('/notifications'),
          ),

          _buildSettingsTile(
            context,
            icon: Icons.help_outline_rounded,
            title: 'Panduan Pengguna',
            subtitle: 'Cari bantuan & tutorial',
            onTap: () => _showUserGuide(context),
          ),

          Padding(
            padding: const EdgeInsets.fromLTRB(
              Dimens.xxl,
              Dimens.sectionGap,
              Dimens.lg,
              Dimens.sm,
            ),
            child: Text(
              'AKUN',
              style: Theme.of(
                context,
              ).textTheme.labelSmall?.copyWith(letterSpacing: 1.5),
            ),
          ),

          _buildSettingsTile(
            context,
            icon: Icons.logout_rounded,
            title: 'Keluar',
            subtitle: 'Selesaikan sesi Anda sekarang',
            iconColor: AppColors.error,
            onTap: () => ref.read(authProvider.notifier).signOut(),
          ),

          const SizedBox(height: Dimens.xxxl),
          Center(
            child: Text(
              'Tetasin v1.0.0 Stable',
              style: Theme.of(
                context,
              ).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: Dimens.xl),
        ],
      ),
    );
  }

  Widget _buildGuestBanner(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(Dimens.lg, 0, Dimens.lg, Dimens.lg),
      padding: const EdgeInsets.symmetric(
        vertical: Dimens.sm,
        horizontal: Dimens.md,
      ),
      decoration: BoxDecoration(
        color: Colors.amber.shade50,
        borderRadius: Dimens.brSm,
        border: Border.all(color: Colors.amber.shade200),
      ),
      child: Row(
        children: [
          Icon(
            Icons.info_outline_rounded,
            size: 16,
            color: Colors.amber.shade800,
          ),
          const SizedBox(width: Dimens.sm),
          Expanded(
            child: Text(
              'Anda dalam Mode Tamu. Data hanya disimpan di memori.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.amber.shade900,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileHeader(
    BuildContext context,
    UserProfile? profile,
    bool isGuest,
  ) {
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: Dimens.lg,
        vertical: Dimens.xs,
      ),
      padding: Dimens.card,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: Dimens.brXl,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: AppColors.primary,
            child: const Icon(
              Icons.person_rounded,
              color: AppColors.onPrimary,
              size: 30,
            ),
          ),
          const SizedBox(width: Dimens.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  profile?.fullName ?? 'User',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                if (profile?.accountType != 'personal')
                  Text(
                    profile?.role.name.toUpperCase() ?? 'MANAGER',
                    style: Theme.of(
                      context,
                    ).textTheme.labelSmall?.copyWith(letterSpacing: 1.1),
                  ),
              ],
            ),
          ),
          if (!isGuest)
            IconButton(
              onPressed: () =>
                  _showEditSheet(context, const ProfileEditSheet()),
              icon: const Icon(
                Icons.edit_note_rounded,
                color: AppColors.textTertiary,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTierCard(BuildContext context, Tenant? tenant, bool isPersonal) {
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: Dimens.lg,
        vertical: Dimens.sm,
      ),
      padding: Dimens.card,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.surface, Color(0xFF2D2D2D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: Dimens.brXl,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(Dimens.sm),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: Dimens.brSm,
            ),
            child: const Icon(
              Icons.auto_awesome_rounded,
              color: AppColors.primary,
              size: 24,
            ),
          ),
          const SizedBox(width: Dimens.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Membership Full Access',
                  style: Theme.of(
                    context,
                  ).textTheme.titleMedium?.copyWith(color: AppColors.white),
                ),
                Text(
                  isPersonal
                      ? 'Akses penuh fitur AI Planner & Budgeting'
                      : 'Akses penuh ekosistem ERP & AI Analyst',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.white.withValues(alpha: 0.7),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Color? iconColor,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: Dimens.lg,
        vertical: Dimens.xs,
      ),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: Dimens.brLg,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(Dimens.sm),
          decoration: BoxDecoration(
            color: (iconColor ?? AppColors.primary).withValues(alpha: 0.1),
            borderRadius: Dimens.brSm,
          ),
          child: Icon(
            icon,
            color: iconColor ?? AppColors.textPrimary,
            size: 20,
          ),
        ),
        title: Text(title, style: Theme.of(context).textTheme.titleSmall),
        subtitle: Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
        trailing: const Icon(
          Icons.chevron_right_rounded,
          size: 20,
          color: AppColors.textTertiary,
        ),
        onTap: onTap,
      ),
    );
  }

  void _showEditSheet(BuildContext context, Widget sheet) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => sheet,
    );
  }

  void _showUserGuide(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const _UserGuideSheet(),
    );
  }
}

class _UserGuideSheet extends StatefulWidget {
  const _UserGuideSheet();

  @override
  State<_UserGuideSheet> createState() => _UserGuideSheetState();
}

class _UserGuideSheetState extends State<_UserGuideSheet> {
  final List<Map<String, String>> _guides = [
    {
      'q': 'Cara mencatat penjualan?',
      'a': 'Gunakan tab POS, pilih produk, lalu tekan Bayar.',
    },
    {
      'q': 'Bagaimana melihat laporan?',
      'a':
          'Buka menu Laporan di tab bawah untuk melihat Jurnal, Buku Besar, dll.',
    },
    {
      'q': 'Cara menambah produk?',
      'a': 'Buka menu Produk, tekan tombol tambah (+) di pojok kanan bawah.',
    },
    {
      'q': 'Apa itu Double-Entry?',
      'a':
          'Sistem akuntansi otomatis Tetasin yang mencatat setiap transaksi ke dua akun (Debit & Kredit).',
    },
    {
      'q': 'Cara upgrade ke Full?',
      'a': 'Buka Pengaturan, klik tombol Upgrade di kartu Membership.',
    },
  ];

  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final filtered = _guides.where((g) {
      final reg = RegExp(_searchQuery, caseSensitive: false);
      return reg.hasMatch(g['q']!) || reg.hasMatch(g['a']!);
    }).toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      padding: const EdgeInsets.all(Dimens.xl),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: const BorderRadius.vertical(top: Dimens.radiusXl),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Panduan Tetasin',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: Dimens.lg),
          TextField(
            onChanged: (v) => setState(() => _searchQuery = v),
            decoration: InputDecoration(
              hintText: 'Cari bantuan...',
              prefixIcon: const Icon(Icons.search_rounded),
              border: OutlineInputBorder(borderRadius: Dimens.brMd),
              filled: true,
              fillColor: AppColors.background,
            ),
          ),
          const SizedBox(height: Dimens.xl),
          Expanded(
            child: filtered.isEmpty
                ? const Center(child: Text('Tidak ada hasil bantuan ditemukan'))
                : ListView.builder(
                    itemCount: filtered.length,
                    itemBuilder: (context, index) => ExpansionTile(
                      title: Text(
                        filtered[index]['q']!,
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(Dimens.md),
                          child: Text(
                            filtered[index]['a']!,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
