import 'package:flutter/material.dart';

class PesananStatusChip extends StatelessWidget {
  final String status;
  final bool compact;

  const PesananStatusChip({
    super.key,
    required this.status,
    this.compact = false,
  });

  static const Map<String, Color> _statusColors = {
    'draft': Color(0xFF9CA3AF),
    'confirmed': Color(0xFF3B82F6),
    'processing': Color(0xFFFDB827),
    'ready': Color(0xFF14B8A6),
    'fulfilled': Color(0xFF10B981),
    'invoiced': Color(0xFF8B5CF6),
    'paid': Color(0xFF059669),
    'cancelled': Color(0xFFEF4444),
    'voided': Color(0xFFDC2626),
  };

  static const Map<String, String> _statusLabels = {
    'draft': 'DRAFT',
    'confirmed': 'CONFIRMED',
    'processing': 'PROCESSING',
    'ready': 'READY',
    'fulfilled': 'FULFILLED',
    'invoiced': 'INVOICED',
    'paid': 'PAID',
    'cancelled': 'CANCELLED',
    'voided': 'VOIDED',
  };

  @override
  Widget build(BuildContext context) {
    final color = _statusColors[status] ?? const Color(0xFF9CA3AF);
    final label = _statusLabels[status] ?? status.toUpperCase();

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 10,
        vertical: compact ? 3 : 4,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(compact ? 6 : 8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: compact ? 9 : 10,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
