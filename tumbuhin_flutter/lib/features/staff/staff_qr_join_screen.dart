import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import '../auth/providers/auth_provider.dart';

class StaffQRJoinScreen extends ConsumerWidget {
  const StaffQRJoinScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final tenant = authState.tenant;
    final userProfile = authState.profile;

    final joinData = {
      'tenant_id': tenant?.id,
      'type': 'staff_invite',
      'invited_by': userProfile?.fullName,
    };

    final joinCode = jsonEncode(joinData);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Undang Staf', style: TextStyle(fontWeight: FontWeight.w900)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(30),
        child: Column(
          children: [
            _buildInfoCard(),
            const SizedBox(height: 40),
            _buildQRContainer(joinCode, tenant?.name, tenant?.id),
            const SizedBox(height: 40),
            ElevatedButton.icon(
              onPressed: () => _handleShare(joinCode, tenant?.name),
              icon: const Icon(HugeIcons.strokeRoundedShare01),
              label: const Text('Bagikan Kode Undangan', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFDB827),
                foregroundColor: const Color(0xFF1A1A1A),
                padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 15),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
            const SizedBox(height: 30),
            _buildWarningBox(),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard() {
    return Column(
      children: [
        const Icon(Icons.verified_user_rounded, size: 40, color: Color(0xFF10B981)),
        const SizedBox(height: 15),
        const Text(
          'Undang via QR Code',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF1A1A1A)),
        ),
        const SizedBox(height: 8),
        Text(
          'Minta staf Anda untuk memindai kode di bawah ini dari layar Login aplikasi Tumbuhin mereka.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, color: Colors.grey[600], height: 1.4),
        ),
      ],
    );
  }

  Widget _buildQRContainer(String code, String? tenantName, String? tenantId) {
    return Container(
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(40),
        border: Border.all(color: const Color(0xFFF3F4F6)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: QrImageView(
              data: code,
              version: QrVersions.auto,
              size: 220.0,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            tenantName ?? 'Toko Anda',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF1A1A1A)),
          ),
          const SizedBox(height: 4),
          Text(
            'Tenant ID: ${tenantId?.substring(0, 12) ?? '-'}...',
            style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)),
          ),
        ],
      ),
    );
  }

  Widget _buildWarningBox() {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFEF3C7)),
      ),
      child: const Text(
        'PENTING: Hanya berikan kode ini kepada staf resmi Anda. Kode ini memberikan akses terbatas sesuai role default (Kasir).',
        textAlign: TextAlign.center,
        style: TextStyle(fontSize: 11, color: Color(0xFF92400E), fontStyle: FontStyle.italic),
      ),
    );
  }

  void _handleShare(String code, String? tenantName) {
    final message = 'Bergabunglah ke tim ${tenantName ?? "Tumbuhin"} di Tumbuhin menggunakan kode ini: $code';
    Share.share(message);
  }
}
