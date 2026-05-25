import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../reports/models/report_models.dart';
import '../../../../core/theme/app_colors.dart';

class JournalLinesCard extends StatefulWidget {
  final List<JournalLine> lines;
  final NumberFormat currencyFormat;

  const JournalLinesCard({
    super.key,
    required this.lines,
    required this.currencyFormat,
  });

  @override
  State<JournalLinesCard> createState() => _JournalLinesCardState();
}

class _JournalLinesCardState extends State<JournalLinesCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            borderRadius: BorderRadius.circular(20),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Icon(
                    _expanded
                        ? Icons.expand_less_rounded
                        : Icons.expand_more_rounded,
                    color: AppColors.mediumGrey,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Jurnal Akuntansi',
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.w800,
                      fontSize: 15,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${widget.lines.length} baris',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.mediumGrey,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (_expanded) ...[
            const Divider(height: 1, color: AppColors.border),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        flex: 3,
                        child: Text(
                          'Akun',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.lightGrey,
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(
                          'Debit',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.lightGrey,
                          ),
                          textAlign: TextAlign.right,
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(
                          'Kredit',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.lightGrey,
                          ),
                          textAlign: TextAlign.right,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ...widget.lines.map(
                    (line) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 3,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  line.accountName,
                                  style: GoogleFonts.outfit(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13,
                                  ),
                                ),
                                if (line.accountCode.isNotEmpty)
                                  Text(
                                    line.accountCode,
                                    style: TextStyle(
                                      fontSize: 10,
                                      color: AppColors.lightGrey,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          Expanded(
                            flex: 2,
                            child: Text(
                              line.debit > 0
                                  ? widget.currencyFormat.format(line.debit)
                                  : '-',
                              style: GoogleFonts.outfit(
                                fontWeight: FontWeight.w700,
                                fontSize: 12,
                                color: line.debit > 0
                                    ? AppColors.black
                                    : AppColors.lightGrey,
                              ),
                              textAlign: TextAlign.right,
                            ),
                          ),
                          Expanded(
                            flex: 2,
                            child: Text(
                              line.credit > 0
                                  ? widget.currencyFormat.format(line.credit)
                                  : '-',
                              style: GoogleFonts.outfit(
                                fontWeight: FontWeight.w700,
                                fontSize: 12,
                                color: line.credit > 0
                                    ? AppColors.black
                                    : AppColors.lightGrey,
                              ),
                              textAlign: TextAlign.right,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Divider(height: 16),
                  Row(
                    children: [
                      Expanded(
                        flex: 3,
                        child: Text(
                          'Total',
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.w900,
                            fontSize: 13,
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(
                          widget.currencyFormat.format(
                            widget.lines.fold(0.0, (sum, l) => sum + l.debit),
                          ),
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.w900,
                            fontSize: 13,
                          ),
                          textAlign: TextAlign.right,
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(
                          widget.currencyFormat.format(
                            widget.lines.fold(0.0, (sum, l) => sum + l.credit),
                          ),
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.w900,
                            fontSize: 13,
                          ),
                          textAlign: TextAlign.right,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
