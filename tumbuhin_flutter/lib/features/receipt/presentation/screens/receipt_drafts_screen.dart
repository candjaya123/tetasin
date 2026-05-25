import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/receipt_provider.dart';
import '../../data/receipt_models.dart';

class ReceiptDraftsScreen extends ConsumerWidget {
  const ReceiptDraftsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final draftsAsync = ref.watch(draftsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Receipt Center',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w800),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () => context.push('/receipt/scan'),
          ),
          IconButton(
            icon: const Icon(Icons.edit_note),
            onPressed: () => context.push('/receipt/manual'),
          ),
        ],
      ),
      body: draftsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
        data: (drafts) {
          final readyCount = drafts.where((d) => d.status == 'ready').length;
          final approvedCount = drafts
              .where((d) => d.status == 'approved')
              .length;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Row(
                children: [
                  _StatCard(
                    label: 'Perlu Review',
                    count: readyCount,
                    color: Colors.blue,
                  ),
                  const SizedBox(width: 12),
                  _StatCard(
                    label: 'Disetujui',
                    count: approvedCount,
                    color: Colors.green,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Text(
                'Daftar Draft',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 12),
              if (drafts.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(40),
                    child: Text(
                      'Belum ada draft.',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                )
              else
                ...drafts.map((draft) => _DraftCard(draft: draft)),
            ],
          );
        },
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final int count;
  final Color color;

  const _StatCard({
    required this.label,
    required this.count,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '$count',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w900,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DraftCard extends ConsumerWidget {
  final DraftTransaction draft;

  const _DraftCard({required this.draft});

  Color _statusColor() {
    switch (draft.status) {
      case 'ready':
        return Colors.blue;
      case 'approved':
        return Colors.green;
      case 'rejected':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _statusLabel() {
    switch (draft.status) {
      case 'ready':
        return 'Perlu Review';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      default:
        return draft.status;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        title: Text(
          draft.merchantName ?? 'Tanpa Nama',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(draft.category ?? '-'),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (draft.totalAmount != null)
              Text(
                'Rp ${draft.totalAmount!.toStringAsFixed(0)}',
                style: GoogleFonts.outfit(fontWeight: FontWeight.w700),
              ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: _statusColor().withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                _statusLabel(),
                style: TextStyle(
                  fontSize: 10,
                  color: _statusColor(),
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ),
        onTap: () => context.push('/receipt/${draft.id}'),
      ),
    );
  }
}
