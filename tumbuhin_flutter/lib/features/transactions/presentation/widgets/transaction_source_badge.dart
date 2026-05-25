import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class TransactionSourceBadge extends StatelessWidget {
  final String? sourceType;

  const TransactionSourceBadge({super.key, this.sourceType});

  @override
  Widget build(BuildContext context) {
    final config = _getConfig();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: config.color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: config.color.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(config.icon, size: 12, color: config.color),
          const SizedBox(width: 4),
          Text(
            config.label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: config.color,
            ),
          ),
        ],
      ),
    );
  }

  _SourceConfig _getConfig() {
    switch (sourceType) {
      case 'pos_sale':
        return _SourceConfig(
          label: 'POS Sale',
          color: Colors.green,
          icon: Icons.shopping_cart_rounded,
        );
      case 'expense':
        return _SourceConfig(
          label: 'Biaya',
          color: Colors.red,
          icon: Icons.arrow_outward_rounded,
        );
      case 'receipt_ocr':
        return _SourceConfig(
          label: 'Scan Resi',
          color: Colors.blue,
          icon: Icons.document_scanner_rounded,
        );
      case 'po_fulfillment':
        return _SourceConfig(
          label: 'PO Fulfill',
          color: Colors.orange,
          icon: Icons.inventory_2_rounded,
        );
      case 'transfer':
        return _SourceConfig(
          label: 'Transfer',
          color: Colors.purple,
          icon: Icons.swap_horiz_rounded,
        );
      default:
        return _SourceConfig(
          label: 'Manual',
          color: AppColors.lightGrey,
          icon: Icons.edit_note_rounded,
        );
    }
  }
}

class _SourceConfig {
  final String label;
  final Color color;
  final IconData icon;

  const _SourceConfig({
    required this.label,
    required this.color,
    required this.icon,
  });
}
