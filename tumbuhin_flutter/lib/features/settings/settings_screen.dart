import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../auth/providers/auth_provider.dart';
import '../../shared/models/tenant.dart';
import '../../core/theme/app_colors.dart';
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
        title: Text('Pengaturan', style: GoogleFonts.outfit(fontWeight: FontWeight.w900)),
        backgroundColor: AppColors.background,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 10),
        children: [
          if (isGuest) _buildGuestBanner(),

          // Profile Header
          _buildProfileHeader(context, profile, isGuest),

          const SizedBox(height: 12),

          // Subscription Tier Card
          _buildTierCard(context, tenant, isPersonal),

          Padding(
            padding: const EdgeInsets.fromLTRB(28, 24, 16, 12),
            child: Text(isPersonal ? 'PENGATURAN' : 'BISNIS & PENGATURAN', style: _sectionHeaderStyle),
          ),

          _buildSettingsTile(
            icon: Icons.store_rounded,
            title: isPersonal ? 'Informasi Akun' : 'Informasi Bisnis',
            subtitle: tenant?.name ?? 'Belum diatur',
            onTap: () => _showEditSheet(context, const TenantEditSheet()),
          ),

          if (!isPersonal) ...[
            _buildSettingsTile(
              icon: Icons.shopping_bag_rounded,
              title: 'Daftar Pesanan',
              subtitle: 'Lihat histori SO & PO',
              onTap: () => context.push('/orders'),
            ),

            _buildSettingsTile(
              icon: Icons.local_offer_rounded,
              title: 'Katalog Promo',
              subtitle: 'Manajemen diskon & penawaran',
              onTap: () => context.push('/promos'),
            ),

            if (profile?.role == UserRole.manager)
              _buildSettingsTile(
                icon: Icons.people_alt_rounded,
                title: 'Manajemen Tim',
                subtitle: 'Atur akses staf & pantau log',
                onTap: () => context.push('/staff'),
              ),

            _buildSettingsTile(
              icon: Icons.print_rounded,
              title: 'Printer Bluetooth',
              subtitle: 'Atur printer thermal untuk struk',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (c) => const PrinterSettingsScreen())),
            ),
          ],

          _buildSettingsTile(
            icon: Icons.notifications_none_rounded,
            title: 'Notifikasi',
            subtitle: 'Atur pengingat stok dan laporan',
            onTap: () => context.push('/notifications'),
          ),

          _buildSettingsTile(
            icon: Icons.help_outline_rounded,
            title: 'Panduan Pengguna',
            subtitle: 'Cari bantuan & tutorial',
            onTap: () => _showUserGuide(context),
          ),

          const Padding(
            padding: EdgeInsets.fromLTRB(28, 24, 16, 12),
            child: Text('AKUN', style: _sectionHeaderStyle),
          ),

          _buildSettingsTile(
            icon: Icons.logout_rounded,
            title: 'Keluar',
            subtitle: 'Selesaikan sesi Anda sekarang',
            iconColor: AppColors.error,
            onTap: () => ref.read(authProvider.notifier).signOut(),
          ),

          const SizedBox(height: 40),
          Center(
            child: Text(
              'Tumbuhin v1.0.0 Stable',
              style: GoogleFonts.outfit(fontSize: 12, color: AppColors.lightGrey, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  static const _sectionHeaderStyle = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w800,
    color: AppColors.lightGrey,
    letterSpacing: 1.5,
  );

  Widget _buildGuestBanner() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.amber.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.amber.shade200),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline_rounded, size: 16, color: Colors.amber.shade800),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Anda dalam Mode Tamu. Data hanya disimpan di memori.',
              style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.amber.shade900),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, UserProfile? profile, bool isGuest) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: AppColors.primary,
            child: const Icon(Icons.person_rounded, color: AppColors.onPrimary, size: 30),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  profile?.fullName ?? 'User',
                  style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.black),
                ),
                if (profile?.accountType != 'personal')
                  Text(
                    profile?.role.name.toUpperCase() ?? 'MANAGER',
                    style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.mediumGrey, letterSpacing: 1.1),
                  ),
              ],
            ),
          ),
          if (!isGuest)
            IconButton(
              onPressed: () => _showEditSheet(context, const ProfileEditSheet()),
              icon: const Icon(Icons.edit_note_rounded, color: AppColors.mediumGrey),
            ),
        ],
      ),
    );
  }

  Widget _buildTierCard(BuildContext context, Tenant? tenant, bool isPersonal) {
    // Transition to unified model: everything is Full
    const isFull = true; 
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.black, Color(0xFF2D2D2D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.auto_awesome_rounded,
                  color: AppColors.primary,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Membership Full Access',
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: AppColors.white,
                      ),
                    ),
                    Text(
                      isPersonal 
                        ? 'Akses penuh fitur AI Planner & Budgeting' 
                        : 'Akses penuh ekosistem ERP & AI Analyst',
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        color: AppColors.white.withValues(alpha: 0.7),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Color? iconColor,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: (iconColor ?? AppColors.primary).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: iconColor ?? AppColors.black, size: 20),
        ),
        title: Text(title, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle, style: GoogleFonts.outfit(fontSize: 12, color: AppColors.mediumGrey)),
        trailing: const Icon(Icons.chevron_right_rounded, size: 20, color: AppColors.lightGrey),
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

  void _showNotImplemented(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Fitur ini akan segera hadir!')),
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
    {'q': 'Cara mencatat penjualan?', 'a': 'Gunakan tab POS, pilih produk, lalu tekan Bayar.'},
    {'q': 'Bagaimana melihat laporan?', 'a': 'Buka menu Laporan di tab bawah untuk melihat Jurnal, Buku Besar, dll.'},
    {'q': 'Cara menambah produk?', 'a': 'Buka menu Produk, tekan tombol tambah (+) di pojok kanan bawah.'},
    {'q': 'Apa itu Double-Entry?', 'a': 'Sistem akuntansi otomatis Tumbuhin yang mencatat setiap transaksi ke dua akun (Debit & Kredit).'},
    {'q': 'Cara upgrade ke Full?', 'a': 'Buka Pengaturan, klik tombol Upgrade di kartu Membership.'},
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
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Panduan Tumbuhin', style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w900)),
          const SizedBox(height: 16),
          TextField(
            onChanged: (v) => setState(() => _searchQuery = v),
            decoration: InputDecoration(
              hintText: 'Cari bantuan...',
              prefixIcon: const Icon(Icons.search_rounded),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
              filled: true,
              fillColor: AppColors.background,
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: filtered.isEmpty 
              ? const Center(child: Text('Tidak ada hasil bantuan ditemukan'))
              : ListView.builder(
                  itemCount: filtered.length,
                  itemBuilder: (context, index) => ExpansionTile(
                    title: Text(filtered[index]['q']!, style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14)),
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Text(filtered[index]['a']!, style: GoogleFonts.outfit(color: AppColors.mediumGrey)),
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
