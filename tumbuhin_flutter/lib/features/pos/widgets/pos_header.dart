import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import '../providers/pos_providers.dart';
import '../../../core/theme/app_colors.dart';
import 'barcode_scanner_screen.dart';

class PosHeader extends ConsumerWidget {
  const PosHeader({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final viewMode = ref.watch(posViewModeProvider);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.white,
        border: Border(
          top: BorderSide(color: AppColors.primary, width: 4),
          bottom: BorderSide(color: AppColors.border),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // View Toggle — Chat/Grid
              const _ViewToggle(),

              // Actions
              Row(
                children: [
                  // Orders button
                  Container(
                    height: 42,
                    width: 42,
                    margin: const EdgeInsets.only(right: 8),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: IconButton(
                      padding: EdgeInsets.zero,
                      onPressed: () => context.push('/orders'),
                      icon: const Icon(Icons.receipt_long_rounded, color: AppColors.black, size: 20),
                    ),
                  ),
                  // Barcode Scanner
                  Container(
                    height: 42,
                    width: 42,
                    decoration: BoxDecoration(
                      color: AppColors.black,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: IconButton(
                      padding: EdgeInsets.zero,
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const BarcodeScannerScreen()),
                        );
                      },
                      icon: const Icon(Icons.qr_code_scanner_rounded, color: AppColors.white, size: 20),
                    ),
                  ),
                ],
              ),
            ],
          ),
          if (viewMode == PosViewMode.grid) ...[
            const SizedBox(height: 12),
            TextField(
              onChanged: (value) => ref.read(posSearchQueryProvider.notifier).state = value,
              style: GoogleFonts.outfit(fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Cari nama produk...',
                hintStyle: GoogleFonts.outfit(color: AppColors.mediumGrey, fontSize: 14),
                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.mediumGrey, size: 20),
                filled: true,
                fillColor: AppColors.surface,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.primary),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ViewToggle extends ConsumerWidget {
  const _ViewToggle();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final viewMode = ref.watch(posViewModeProvider);
    
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          _ToggleButton(
            icon: Icons.grid_view_rounded,
            label: 'Grid',
            isSelected: viewMode == PosViewMode.grid,
            onTap: () => ref.read(posViewModeProvider.notifier).state = PosViewMode.grid,
          ),
          _ToggleButton(
            icon: Icons.auto_awesome_rounded,
            label: 'AI',
            isSelected: viewMode == PosViewMode.chat,
            onTap: () => ref.read(posViewModeProvider.notifier).state = PosViewMode.chat,
          ),
        ],
      ),
    );
  }
}

class _ToggleButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _ToggleButton({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 16,
              color: isSelected ? AppColors.onPrimary : AppColors.lightGrey,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: GoogleFonts.outfit(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: isSelected ? AppColors.onPrimary : AppColors.lightGrey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
