import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../shared/models/order.dart' as models;

class DivisionNotesPanel extends ConsumerWidget {
  final models.DivisionNotes? notes;
  final bool canEdit;
  final ValueChanged<String>? onKasirChanged;
  final ValueChanged<String>? onStokChanged;
  final ValueChanged<String>? onDapurChanged;

  const DivisionNotesPanel({
    super.key,
    this.notes,
    this.canEdit = false,
    this.onKasirChanged,
    this.onStokChanged,
    this.onDapurChanged,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final kasir = notes?.kasir ?? '';
    final stok = notes?.stok ?? '';
    final dapur = notes?.dapur ?? '';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF3F4F6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.notes_rounded,
                size: 18,
                color: Color(0xFF6B7280),
              ),
              const SizedBox(width: 8),
              const Text(
                'CATATAN DIVISI',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF9CA3AF),
                  letterSpacing: 1.2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _DivisionField(
            label: 'Kasir',
            icon: Icons.point_of_sale_rounded,
            color: const Color(0xFF3B82F6),
            value: kasir,
            canEdit: canEdit,
            onChanged: onKasirChanged,
          ),
          const SizedBox(height: 12),
          _DivisionField(
            label: 'Stok / Gudang',
            icon: Icons.inventory_2_rounded,
            color: const Color(0xFF10B981),
            value: stok,
            canEdit: canEdit,
            onChanged: onStokChanged,
          ),
          const SizedBox(height: 12),
          _DivisionField(
            label: 'Dapur / Produksi',
            icon: Icons.restaurant_rounded,
            color: const Color(0xFFFDB827),
            value: dapur,
            canEdit: canEdit,
            onChanged: onDapurChanged,
          ),
        ],
      ),
    );
  }
}

class _DivisionField extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final String value;
  final bool canEdit;
  final ValueChanged<String>? onChanged;

  const _DivisionField({
    required this.label,
    required this.icon,
    required this.color,
    required this.value,
    required this.canEdit,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: color,
                  ),
                ),
                const SizedBox(height: 4),
                canEdit
                    ? TextFormField(
                        initialValue: value,
                        maxLines: null,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.zero,
                          hintText: 'Tulis catatan untuk $label...',
                          hintStyle: TextStyle(
                            fontSize: 13,
                            color: Colors.grey[400],
                          ),
                        ),
                        onFieldSubmitted: onChanged,
                        onChanged: onChanged,
                      )
                    : Text(
                        value.isNotEmpty ? value : 'Belum ada catatan',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: value.isNotEmpty
                              ? const Color(0xFF1A1A1A)
                              : Colors.grey[400],
                        ),
                      ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
