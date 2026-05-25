import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AiSuggestionChip extends StatelessWidget {
  final String label;
  final String? value;
  final VoidCallback? onTap;
  final bool isLoading;

  const AiSuggestionChip({
    super.key,
    required this.label,
    this.value,
    this.onTap,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.blue.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.blue.withValues(alpha: 0.2)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.auto_awesome, size: 14, color: Colors.blue[700]),
            const SizedBox(width: 6),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  label,
                  style: GoogleFonts.outfit(
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    color: Colors.blue[700],
                    letterSpacing: 0.5,
                  ),
                ),
                if (isLoading)
                  SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.blue[700],
                    ),
                  )
                else if (value != null)
                  Text(
                    value!,
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.blue[900],
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
