import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:hugeicons/hugeicons.dart';

import '../../../shared/models/product.dart';
import '../../../shared/models/cart_item.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/dimens.dart';

class ProductSelectionSheet extends ConsumerStatefulWidget {
  final Product product;

  const ProductSelectionSheet({super.key, required this.product});

  @override
  ConsumerState<ProductSelectionSheet> createState() =>
      _ProductSelectionSheetState();
}

class _ProductSelectionSheetState extends ConsumerState<ProductSelectionSheet> {
  late final Map<String, List<String>> _selectedVariantIds;
  late final Map<String, List<String>> _selectedAddonIds;
  late int _quantity;
  final _instructionsController = TextEditingController();

  Product get _product => widget.product;

  @override
  void initState() {
    super.initState();
    _selectedVariantIds = {};
    _selectedAddonIds = {};
    _quantity = 1;

    for (final group in _product.variantGroups ?? []) {
      _selectedVariantIds[group.id] = [];
    }
    for (final group in _product.addonGroups ?? []) {
      _selectedAddonIds[group.id] = [];
    }
  }

  @override
  void dispose() {
    _instructionsController.dispose();
    super.dispose();
  }

  double get _unitPrice {
    double price = _product.price;
    for (final group in _product.variantGroups ?? []) {
      final selectedIds = _selectedVariantIds[group.id] ?? [];
      for (final option in group.options ?? []) {
        if (selectedIds.contains(option.id)) {
          price += option.priceDelta;
        }
      }
    }
    for (final group in _product.addonGroups ?? []) {
      final selectedIds = _selectedAddonIds[group.id] ?? [];
      for (final addon in group.addons ?? []) {
        if (selectedIds.contains(addon.id)) {
          price += addon.price;
        }
      }
    }
    return price;
  }

  List<VariantOption> get _selectedVariants {
    final result = <VariantOption>[];
    for (final group in _product.variantGroups ?? []) {
      final selectedIds = _selectedVariantIds[group.id] ?? [];
      for (final option in group.options ?? []) {
        if (selectedIds.contains(option.id)) {
          result.add(option);
        }
      }
    }
    return result;
  }

  List<Addon> get _selectedAddons {
    final result = <Addon>[];
    for (final group in _product.addonGroups ?? []) {
      final selectedIds = _selectedAddonIds[group.id] ?? [];
      for (final addon in group.addons ?? []) {
        if (selectedIds.contains(addon.id)) {
          result.add(addon);
        }
      }
    }
    return result;
  }

  String? _validate() {
    for (final group in _product.variantGroups ?? []) {
      final selected = _selectedVariantIds[group.id] ?? [];
      if (group.isRequired && selected.isEmpty) {
        return 'Pilih ${group.name}';
      }
    }
    for (final group in _product.addonGroups ?? []) {
      final selected = _selectedAddonIds[group.id] ?? [];
      if (group.isRequired && selected.isEmpty) {
        return 'Pilih minimal 1 addon untuk ${group.name}';
      }
      if (selected.length > group.maxSelections) {
        return 'Maksimal ${group.maxSelections} addon untuk ${group.name}';
      }
    }
    return null;
  }

  void _addToCart() {
    final error = _validate();
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error),
          backgroundColor: AppColors.error,
          duration: const Duration(seconds: 2),
        ),
      );
      return;
    }

    final cartItem = CartItem(
      product: _product,
      quantity: _quantity,
      selectedVariants: _selectedVariants,
      selectedAddons: _selectedAddons,
      specialInstructions: _instructionsController.text.trim().isEmpty
          ? null
          : _instructionsController.text.trim(),
    );
    Navigator.pop(context, cartItem);
  }

  void _toggleVariantOption(
    String groupId,
    String optionId,
    bool allowMultiple,
  ) {
    setState(() {
      final current = _selectedVariantIds[groupId] ?? [];
      if (current.contains(optionId)) {
        current.remove(optionId);
      } else {
        if (allowMultiple) {
          current.add(optionId);
        } else {
          current.clear();
          current.add(optionId);
        }
      }
      _selectedVariantIds[groupId] = current;
    });
  }

  void _toggleAddonOption(String groupId, String addonId) {
    setState(() {
      final current = _selectedAddonIds[groupId] ?? [];
      if (current.contains(addonId)) {
        current.remove(addonId);
      } else {
        final group = _product.addonGroups?.firstWhere((g) => g.id == groupId);
        final max = group?.maxSelections ?? 99;
        if (current.length < max) {
          current.add(addonId);
        }
      }
      _selectedAddonIds[groupId] = current;
    });
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    final variantGroups = _product.variantGroups ?? [];
    final addonGroups = _product.addonGroups ?? [];
    final totalPrice = _unitPrice * _quantity;

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Dimens.radiusXl),
      ),
      child: Column(
        children: [
          const SizedBox(height: 10),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.surfaceTertiary,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: _product.imageUrl != null
                      ? CachedNetworkImage(
                          imageUrl: _product.imageUrl!,
                          width: 56,
                          height: 56,
                          fit: BoxFit.cover,
                          placeholder: (ctx, url) => Container(
                            width: 56,
                            height: 56,
                            color: AppColors.surfaceSecondary,
                          ),
                          errorWidget: (ctx, url, error) => Container(
                            width: 56,
                            height: 56,
                            color: AppColors.surfaceSecondary,
                            child: const Icon(
                              Icons.image,
                              color: AppColors.textTertiary,
                              size: 24,
                            ),
                          ),
                        )
                      : Container(
                          width: 56,
                          height: 56,
                          color: AppColors.surfaceSecondary,
                          child: const Icon(
                            Icons.image,
                            color: AppColors.textTertiary,
                            size: 24,
                          ),
                        ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _product.name,
                        style: GoogleFonts.outfit(
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                          color: AppColors.textPrimary,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        currencyFormat.format(_product.price),
                        style: GoogleFonts.outfit(
                          color: AppColors.textSecondary,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(color: AppColors.divider),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _SectionLabel(label: 'Jumlah', required: true),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      _IconButton(
                        icon: Icons.remove,
                        onPressed: () {
                          if (_quantity > 1) {
                            setState(() => _quantity--);
                          }
                        },
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          '$_quantity',
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.w700,
                            fontSize: 18,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                      _IconButton(
                        icon: Icons.add,
                        onPressed: () {
                          if (_quantity < 999) {
                            setState(() => _quantity++);
                          }
                        },
                      ),
                    ],
                  ),

                  if (variantGroups.isNotEmpty) ...[
                    const SizedBox(height: Dimens.xl),
                    const Divider(color: AppColors.divider),
                    const SizedBox(height: Dimens.md),
                    _SectionLabel(label: 'Varian', required: false),
                    const SizedBox(height: 4),
                    ...variantGroups.map(
                      (group) => _VariantGroupWidget(
                        group: group,
                        selectedIds: _selectedVariantIds[group.id] ?? [],
                        onToggle: (optionId) => _toggleVariantOption(
                          group.id,
                          optionId,
                          group.allowMultiple,
                        ),
                      ),
                    ),
                  ],

                  if (addonGroups.isNotEmpty) ...[
                    const SizedBox(height: Dimens.xl),
                    const Divider(color: AppColors.divider),
                    const SizedBox(height: Dimens.md),
                    _SectionLabel(label: 'Add-on', required: false),
                    const SizedBox(height: 4),
                    ...addonGroups.map(
                      (group) => _AddonGroupWidget(
                        group: group,
                        selectedIds: _selectedAddonIds[group.id] ?? [],
                        onToggle: (addonId) =>
                            _toggleAddonOption(group.id, addonId),
                      ),
                    ),
                  ],

                  const SizedBox(height: Dimens.xl),
                  const Divider(color: AppColors.divider),
                  const SizedBox(height: Dimens.md),
                  _SectionLabel(label: 'Catatan Khusus', required: false),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _instructionsController,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      hintText: 'Contoh: tidak pedas, es batu terpisah',
                    ),
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: Dimens.xxxl),
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surfaceSecondary,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Total',
                          style: GoogleFonts.outfit(
                            color: AppColors.textSecondary,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Text(
                          currencyFormat.format(totalPrice),
                          style: GoogleFonts.outfit(
                            color: AppColors.textPrimary,
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _addToCart,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: AppColors.onPrimary,
                        padding: const EdgeInsets.symmetric(horizontal: 28),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: Text(
                        'Tambah ke Keranjang',
                        style: GoogleFonts.outfit(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;
  final bool required;

  const _SectionLabel({required this.label, required this.required});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          label,
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.w700,
            fontSize: 15,
            color: AppColors.textPrimary,
          ),
        ),
        if (required)
          Text(
            ' *',
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.w700,
              fontSize: 15,
              color: AppColors.error,
            ),
          ),
      ],
    );
  }
}

class _VariantGroupWidget extends StatelessWidget {
  final VariantGroup group;
  final List<String> selectedIds;
  final void Function(String optionId) onToggle;

  const _VariantGroupWidget({
    required this.group,
    required this.selectedIds,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    final options = group.options ?? [];

    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                group.name,
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: AppColors.textPrimary,
                ),
              ),
              if (group.isRequired)
                Text(
                  ' *',
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: AppColors.error,
                  ),
                ),
              const SizedBox(width: 8),
              if (!group.allowMultiple)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.infoLight,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'Pilih satu',
                    style: GoogleFonts.outfit(
                      fontSize: 10,
                      color: AppColors.info,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          ...options.map(
            (option) => _VariantOptionTile(
              option: option,
              isSelected: selectedIds.contains(option.id),
              isRadio: !group.allowMultiple,
              currencyFormat: currencyFormat,
              onTap: () => onToggle(option.id),
            ),
          ),
        ],
      ),
    );
  }
}

class _VariantOptionTile extends StatelessWidget {
  final VariantOption option;
  final bool isSelected;
  final bool isRadio;
  final NumberFormat currencyFormat;
  final VoidCallback onTap;

  const _VariantOptionTile({
    required this.option,
    required this.isSelected,
    required this.isRadio,
    required this.currencyFormat,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final priceLabel = option.priceDelta > 0
        ? ' +${currencyFormat.format(option.priceDelta)}'
        : option.priceDelta < 0
        ? ' ${currencyFormat.format(option.priceDelta)}'
        : '';

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Icon(
              isRadio
                  ? (isSelected
                        ? HugeIcons.strokeRoundedRadioButton
                        : HugeIcons.strokeRoundedRadio)
                  : (isSelected
                        ? HugeIcons.strokeRoundedCheckmarkSquare02
                        : HugeIcons.strokeRoundedSquare),
              size: 20,
              color: isSelected ? AppColors.primary : AppColors.textTertiary,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                '${option.name}$priceLabel',
                style: GoogleFonts.outfit(
                  fontSize: 14,
                  color: isSelected
                      ? AppColors.textPrimary
                      : AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AddonGroupWidget extends StatelessWidget {
  final AddonGroup group;
  final List<String> selectedIds;
  final void Function(String addonId) onToggle;

  const _AddonGroupWidget({
    required this.group,
    required this.selectedIds,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    final addons = group.addons ?? [];

    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                group.name,
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: AppColors.textPrimary,
                ),
              ),
              if (group.isRequired)
                Text(
                  ' *',
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: AppColors.error,
                  ),
                ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.surfaceTertiary,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'Maks ${group.maxSelections}',
                  style: GoogleFonts.outfit(
                    fontSize: 10,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ...addons.map(
            (addon) => InkWell(
              onTap: () => onToggle(addon.id),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  children: [
                    Icon(
                      selectedIds.contains(addon.id)
                          ? HugeIcons.strokeRoundedCheckmarkSquare02
                          : HugeIcons.strokeRoundedSquare,
                      size: 20,
                      color: selectedIds.contains(addon.id)
                          ? AppColors.primary
                          : AppColors.textTertiary,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        addon.name,
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          color: selectedIds.contains(addon.id)
                              ? AppColors.textPrimary
                              : AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    if (addon.price > 0)
                      Text(
                        currencyFormat.format(addon.price),
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _IconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;

  const _IconButton({required this.icon, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, size: 18, color: AppColors.textPrimary),
      ),
    );
  }
}
