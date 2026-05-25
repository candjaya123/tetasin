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
    final isToolbarExpanded = ref.watch(posHeaderExpandedProvider);
    final isSearchExpanded = ref.watch(posSearchExpandedProvider);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.white,
        border: Border(
          top: BorderSide(color: AppColors.primary, width: 2),
          bottom: BorderSide(color: AppColors.border),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const _ViewToggle(),
              Row(
                children: [
                  if (viewMode == PosViewMode.grid)
                    Container(
                      height: 34,
                      width: 34,
                      margin: const EdgeInsets.only(right: 6),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        iconSize: 16,
                        onPressed: () {
                          ref.read(posSearchExpandedProvider.notifier).state =
                              !isSearchExpanded;
                        },
                        icon: Icon(
                          isSearchExpanded
                              ? Icons.search_off_rounded
                              : Icons.search_rounded,
                          color: AppColors.darkGrey,
                        ),
                      ),
                    ),
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    curve: Curves.easeInOut,
                    width: isToolbarExpanded ? null : 0,
                    child: isToolbarExpanded
                        ? Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                height: 34,
                                width: 34,
                                margin: const EdgeInsets.only(right: 6),
                                decoration: BoxDecoration(
                                  color: AppColors.surface,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: IconButton(
                                  padding: EdgeInsets.zero,
                                  onPressed: () => context.push('/pesanan'),
                                  icon: const Icon(
                                    Icons.receipt_long_rounded,
                                    color: AppColors.black,
                                    size: 16,
                                  ),
                                ),
                              ),
                              Container(
                                height: 34,
                                width: 34,
                                margin: const EdgeInsets.only(right: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.black,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: IconButton(
                                  padding: EdgeInsets.zero,
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            const BarcodeScannerScreen(),
                                      ),
                                    );
                                  },
                                  icon: const Icon(
                                    Icons.qr_code_scanner_rounded,
                                    color: AppColors.white,
                                    size: 16,
                                  ),
                                ),
                              ),
                            ],
                          )
                        : const SizedBox.shrink(),
                  ),
                  Container(
                    height: 34,
                    width: 34,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: IconButton(
                      padding: EdgeInsets.zero,
                      iconSize: 16,
                      onPressed: () {
                        ref.read(posHeaderExpandedProvider.notifier).state =
                            !isToolbarExpanded;
                      },
                      icon: Icon(
                        isToolbarExpanded
                            ? Icons.keyboard_arrow_up_rounded
                            : Icons.more_horiz_rounded,
                        color: AppColors.darkGrey,
                      ),
                    ),
                  ),
                  if (!isToolbarExpanded)
                    PopupMenuButton<String>(
                      padding: EdgeInsets.zero,
                      iconSize: 0,
                      child: const SizedBox.shrink(),
                      onSelected: (value) {
                        if (value == 'orders') {
                          context.push('/pesanan');
                        } else if (value == 'barcode') {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) =>
                                  const BarcodeScannerScreen(),
                            ),
                          );
                        }
                      },
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          value: 'orders',
                          child: Row(
                            children: [
                              Icon(
                                Icons.receipt_long_rounded,
                                size: 16,
                                color: AppColors.black,
                              ),
                              SizedBox(width: 10),
                              Text(
                                'Daftar Pesanan',
                                style: TextStyle(fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'barcode',
                          child: Row(
                            children: [
                              Icon(
                                Icons.qr_code_scanner_rounded,
                                size: 16,
                                color: AppColors.black,
                              ),
                              SizedBox(width: 10),
                              Text(
                                'Scan Barcode',
                                style: TextStyle(fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ],
          ),
          if (viewMode == PosViewMode.grid && isSearchExpanded) ...[
            const SizedBox(height: 12),
            TextField(
              onChanged: (value) =>
                  ref.read(posSearchQueryProvider.notifier).state = value,
              style: GoogleFonts.outfit(fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Cari nama produk...',
                hintStyle: GoogleFonts.outfit(
                  color: AppColors.mediumGrey,
                  fontSize: 14,
                ),
                prefixIcon: const Icon(
                  Icons.search_rounded,
                  color: AppColors.mediumGrey,
                  size: 16,
                ),
                filled: true,
                fillColor: AppColors.surface,
                contentPadding: const EdgeInsets.symmetric(
                  vertical: 0,
                  horizontal: 14,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
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
    final isActive = viewMode == PosViewMode.chat;

    return GestureDetector(
      onTap: () {
        ref.read(posViewModeProvider.notifier).state = isActive
            ? PosViewMode.grid
            : PosViewMode.chat;
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: isActive
              ? AppColors.primary.withValues(alpha: 0.12)
              : AppColors.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isActive
                ? AppColors.primary.withValues(alpha: 0.2)
                : AppColors.border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.auto_awesome_rounded,
              size: 16,
              color: isActive ? AppColors.primary : AppColors.lightGrey,
            ),
            const SizedBox(width: 5),
            Text(
              'AI',
              style: GoogleFonts.outfit(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: isActive ? AppColors.primary : AppColors.lightGrey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
