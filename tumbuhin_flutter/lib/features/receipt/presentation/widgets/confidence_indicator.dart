import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ConfidenceIndicator extends StatelessWidget {
  final String confidence;
  final double? score;

  const ConfidenceIndicator({super.key, required this.confidence, this.score});

  @override
  Widget build(BuildContext context) {
    final config = switch (confidence) {
      'high' => (color: Colors.green, icon: Icons.check_circle, label: 'High'),
      'medium' => (
        color: Colors.orange,
        icon: Icons.remove_circle_outline,
        label: 'Medium',
      ),
      _ => (color: Colors.red, icon: Icons.warning_amber_rounded, label: 'Low'),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: config.color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: config.color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(config.icon, size: 14, color: config.color),
          const SizedBox(width: 4),
          Text(
            config.label,
            style: GoogleFonts.outfit(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: config.color,
            ),
          ),
          if (score != null) ...[
            const SizedBox(width: 2),
            Text(
              '(${(score! * 100).round()}%)',
              style: GoogleFonts.outfit(
                fontSize: 10,
                color: config.color.withValues(alpha: 0.7),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
