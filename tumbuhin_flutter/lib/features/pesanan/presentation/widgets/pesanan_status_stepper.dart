import 'package:flutter/material.dart';

class PesananStatusStepper extends StatelessWidget {
  final String currentStatus;
  final List<String> possibleNextStatuses;
  final void Function(String newStatus)? onStatusChange;

  const PesananStatusStepper({
    super.key,
    required this.currentStatus,
    this.possibleNextStatuses = const [],
    this.onStatusChange,
  });

  static const Map<String, _StatusConfig> _statusConfigs = {
    'draft': _StatusConfig(label: 'Draft', color: Color(0xFF9CA3AF), index: 0),
    'confirmed': _StatusConfig(
      label: 'Confirmed',
      color: Color(0xFF3B82F6),
      index: 1,
    ),
    'processing': _StatusConfig(
      label: 'Processing',
      color: Color(0xFFFDB827),
      index: 2,
    ),
    'ready': _StatusConfig(label: 'Ready', color: Color(0xFF10B981), index: 3),
    'fulfilled': _StatusConfig(
      label: 'Fulfilled',
      color: Color(0xFF14B8A6),
      index: 4,
    ),
    'invoiced': _StatusConfig(
      label: 'Invoiced',
      color: Color(0xFF8B5CF6),
      index: 5,
    ),
    'paid': _StatusConfig(label: 'Paid', color: Color(0xFF34D399), index: 6),
    'cancelled': _StatusConfig(
      label: 'Cancelled',
      color: Color(0xFFEF4444),
      index: 7,
    ),
    'voided': _StatusConfig(
      label: 'Voided',
      color: Color(0xFFDC2626),
      index: 8,
    ),
  };

  @override
  Widget build(BuildContext context) {
    final currentIndex = _statusConfigs[currentStatus]?.index ?? 0;
    final entries = _statusConfigs.entries.toList();
    final cancellableStatuses = {'cancelled', 'voided'};
    final normalEntries = entries
        .where((e) => !cancellableStatuses.contains(e.key))
        .toList();
    final terminalEntries = entries
        .where((e) => cancellableStatuses.contains(e.key))
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              ...normalEntries.asMap().entries.map((entry) {
                final i = entry.key;
                final statusKey = entry.value.key;
                final config = entry.value.value;
                final isCurrent = statusKey == currentStatus;
                final isPast = config.index < currentIndex;
                final isNext = possibleNextStatuses.contains(statusKey);

                return _StatusDot(
                  label: config.label,
                  color: config.color,
                  isCurrent: isCurrent,
                  isPast: isPast,
                  isNext: isNext,
                  isLast: i == normalEntries.length - 1,
                  onTap: isNext && onStatusChange != null
                      ? () => onStatusChange!(statusKey)
                      : null,
                );
              }),
            ],
          ),
        ),
        if (currentStatus == 'cancelled' || currentStatus == 'voided')
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFFEE2E2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.block_rounded,
                    size: 16,
                    color: terminalEntries
                        .firstWhere((e) => e.key == currentStatus)
                        .value
                        .color,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    currentStatus == 'cancelled'
                        ? 'Pesanan dibatalkan'
                        : 'Pesanan di-void',
                    style: TextStyle(
                      color: terminalEntries
                          .firstWhere((e) => e.key == currentStatus)
                          .value
                          .color,
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ),
        if (isTerminalActionable)
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: terminalEntries
                  .where((e) => possibleNextStatuses.contains(e.key))
                  .map(
                    (e) => _ActionBadge(
                      label: e.value.label,
                      color: e.value.color,
                      onTap: onStatusChange != null
                          ? () => onStatusChange!(e.key)
                          : null,
                    ),
                  )
                  .toList(),
            ),
          ),
      ],
    );
  }

  bool get isTerminalActionable =>
      possibleNextStatuses.any((s) => s == 'cancelled' || s == 'voided');
}

class _StatusDot extends StatelessWidget {
  final String label;
  final Color color;
  final bool isCurrent;
  final bool isPast;
  final bool isNext;
  final bool isLast;
  final VoidCallback? onTap;

  const _StatusDot({
    required this.label,
    required this.color,
    required this.isCurrent,
    required this.isPast,
    required this.isNext,
    required this.isLast,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return IntrinsicWidth(
      child: GestureDetector(
        onTap: onTap,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: isCurrent ? 28 : 20,
                  height: isCurrent ? 28 : 20,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isCurrent
                        ? color
                        : isPast
                        ? color.withValues(alpha: 0.3)
                        : isNext
                        ? Colors.transparent
                        : Colors.grey[200],
                    border: isNext
                        ? Border.all(color: color, width: 2)
                        : isCurrent
                        ? Border.all(color: color, width: 0)
                        : null,
                  ),
                  child: isCurrent
                      ? const Icon(Icons.circle, size: 10, color: Colors.white)
                      : isNext
                      ? Center(
                          child: Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: color.withValues(alpha: 0.5),
                            ),
                          ),
                        )
                      : isPast
                      ? const Icon(Icons.check, size: 12, color: Colors.white)
                      : null,
                ),
                if (isCurrent)
                  Padding(
                    padding: const EdgeInsets.only(left: 6),
                    child: Text(
                      label,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: color,
                      ),
                    ),
                  ),
              ],
            ),
            if (!isCurrent)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: isNext ? FontWeight.w700 : FontWeight.w400,
                    color: isNext ? color : Colors.grey[500],
                  ),
                ),
              ),
            if (isNext && onTap != null)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  'Tap',
                  style: TextStyle(
                    fontSize: 8,
                    color: color.withValues(alpha: 0.7),
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ActionBadge extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback? onTap;

  const _ActionBadge({required this.label, required this.color, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withValues(alpha: 0.4)),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.w700,
            fontSize: 11,
          ),
        ),
      ),
    );
  }
}

class _StatusConfig {
  final String label;
  final Color color;
  final int index;

  const _StatusConfig({
    required this.label,
    required this.color,
    required this.index,
  });
}
