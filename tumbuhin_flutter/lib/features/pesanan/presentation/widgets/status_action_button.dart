import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../shared/models/order.dart';
import '../../../../shared/models/user_profile.dart';
import '../../../auth/providers/auth_provider.dart';
import '../providers/pesanan_provider.dart';

class StatusActionButton extends ConsumerWidget {
  final Order order;
  final VoidCallback? onTransitionComplete;

  const StatusActionButton({
    super.key,
    required this.order,
    this.onTransitionComplete,
  });

  static const Map<String, String> _actionLabels = {
    'draft': 'Konfirmasi',
    'confirmed': 'Proses',
    'processing': 'Siap',
    'ready': 'Selesai',
    'fulfilled': 'Invoice',
    'invoiced': 'Dibayar',
    'cancelled': 'Batalkan',
    'voided': 'Void',
    'paid': 'Void',
  };

  static const Map<String, Color> _actionColors = {
    'confirmed': Color(0xFF3B82F6),
    'processing': Color(0xFFFDB827),
    'ready': Color(0xFF14B8A6),
    'fulfilled': Color(0xFF10B981),
    'invoiced': Color(0xFF8B5CF6),
    'paid': Color(0xFF059669),
    'cancelled': Color(0xFFEF4444),
    'voided': Color(0xFFDC2626),
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final role = authState.profile?.role;
    final isManager = role == UserRole.manager;
    final notifier = ref.watch(updatePesananStatusNotifierProvider.notifier);

    if (!order.canTransition) return const SizedBox.shrink();

    final allowedStatuses = order.possibleNextStatuses.where((s) {
      if ((s == 'cancelled' || s == 'voided') && !isManager) return false;
      return true;
    }).toList();

    if (allowedStatuses.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF3F4F6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'AKSI STATUS',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: Color(0xFF6B7280),
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: allowedStatuses.map((status) {
              final label = _actionLabels[status] ?? status;
              final color = _actionColors[status] ?? const Color(0xFF9CA3AF);

              return ElevatedButton.icon(
                onPressed: () => _handleTransition(context, notifier, status),
                icon: const Icon(Icons.arrow_forward_rounded, size: 16),
                label: Text(label),
                style: ElevatedButton.styleFrom(
                  backgroundColor: color,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 10,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Future<void> _handleTransition(
    BuildContext context,
    UpdatePesananStatusNotifier notifier,
    String newStatus,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Ubah Status'),
        content: Text('Pindahkan status ke "$newStatus"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Konfirmasi'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await notifier.updateStatus(order.id, newStatus);
      onTransitionComplete?.call();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Status berhasil diubah ke $newStatus')),
        );
      }
    }
  }
}
