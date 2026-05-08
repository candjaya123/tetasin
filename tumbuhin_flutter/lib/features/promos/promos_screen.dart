import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:intl/intl.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'providers/promo_providers.dart';
import '../../../shared/repositories/repositories_provider.dart';
import '../../../shared/models/promotion.dart';
import '../../../shared/widgets/polish_widgets.dart';

import '../../../core/theme/responsive.dart';

class PromosScreen extends ConsumerWidget {
  const PromosScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final promosAsync = ref.watch(promotionsProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Katalog Promo', style: TextStyle(fontWeight: FontWeight.w900)),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: promosAsync.when(
            data: (promos) => promos.isEmpty
                ? const EmptyStateWidget(
                    title: 'Belum ada promo',
                    message: 'Buat promo baru untuk menarik lebih banyak pelanggan ke toko Anda.',
                    icon: HugeIcons.strokeRoundedTag01,
                  )
                : AppRefreshIndicator(
                    onRefresh: () => ref.refresh(promotionsProvider.future),
                    child: Responsive(
                      mobile: ListView.builder(
                        padding: const EdgeInsets.all(20),
                        itemCount: promos.length,
                        itemBuilder: (context, index) {
                          Widget content;
                          if (index == 0) {
                            content = Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildHero(),
                                const SizedBox(height: 20),
                                _PromoCard(
                                  promo: promos[index],
                                  onEdit: () => context.push('/promos/edit', extra: promos[index]),
                                  onDelete: () => _deletePromo(context, ref, promos[index]),
                                ),
                              ],
                            );
                          } else {
                            content = _PromoCard(
                              promo: promos[index],
                              onEdit: () => context.push('/promos/edit', extra: promos[index]),
                              onDelete: () => _deletePromo(context, ref, promos[index]),
                            );
                          }
                          
                          return content
                              .animate()
                              .fadeIn(duration: 400.ms, delay: (index * 50).ms)
                              .slideY(begin: 0.1, end: 0, curve: Curves.easeOutQuad);
                        },
                      ),
                      tablet: SingleChildScrollView(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildHero(),
                            const SizedBox(height: 24),
                            GridView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: context.screenWidth > 900 ? 3 : 2,
                                childAspectRatio: 1.8,
                                crossAxisSpacing: 16,
                                mainAxisSpacing: 16,
                              ),
                              itemCount: promos.length,
                              itemBuilder: (context, index) {
                                return _PromoCard(
                                  promo: promos[index],
                                  onEdit: () => context.push('/promos/edit', extra: promos[index]),
                                  onDelete: () => _deletePromo(context, ref, promos[index]),
                                )
                                .animate()
                                .fadeIn(duration: 400.ms, delay: (index * 50).ms)
                                .scale(begin: const Offset(0.95, 0.95));
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
            loading: () => Responsive(
              mobile: ListView.builder(
                padding: const EdgeInsets.all(20),
                itemCount: 4,
                itemBuilder: (context, index) => SkeletonLoader.card(),
              ),
              tablet: GridView.builder(
                padding: const EdgeInsets.all(24),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: context.screenWidth > 900 ? 3 : 2,
                  childAspectRatio: 1.8,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                ),
                itemCount: 4,
                itemBuilder: (context, index) => SkeletonLoader.card(),
              ),
            ),
            error: (err, stack) => ErrorStateWidget(
              error: err.toString(),
              onRetry: () => ref.refresh(promotionsProvider.future),
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/promos/add'),
        backgroundColor: const Color(0xFFFDB827),
        child: const Icon(HugeIcons.strokeRoundedPlusSign, color: Color(0xFF1A1A1A)),
      ),
    );
  }

  Widget _buildHero() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Promo Aktif Hari Ini',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF1A1A1A)),
        ),
        const SizedBox(height: 4),
        Text(
          'Berikan penawaran terbaik untuk pelanggan Anda',
          style: TextStyle(fontSize: 14, color: Colors.grey[600]),
        ),
      ],
    );
  }

  Future<void> _deletePromo(BuildContext context, WidgetRef ref, Promotion promo) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Promo?'),
        content: Text('Yakin ingin menghapus promo "${promo.name}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Hapus', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await ref.read(promoRepositoryProvider).deletePromotion(promo.id);
        ref.invalidate(promotionsProvider);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Promo berhasil dihapus')),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Gagal menghapus: $e')),
          );
        }
      }
    }
  }

}

class _PromoCard extends StatelessWidget {
  final Promotion promo;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _PromoCard({
    required this.promo,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF3F4F6)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFFFFFBEB),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(
              child: Icon(HugeIcons.strokeRoundedTag01, color: Color(0xFFFDB827), size: 24),
            ),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  promo.name,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF1A1A1A)),
                ),
                const SizedBox(height: 4),
                Text(
                  promo.type == 'percentage' 
                      ? 'Diskon ${promo.value.toInt()}%' 
                      : 'Potongan ${currencyFormat.format(promo.value)}',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFFFDB827)),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(HugeIcons.strokeRoundedCalendar03, size: 12, color: Color(0xFF9CA3AF)),
                    const SizedBox(width: 4),
                    Text(
                      'Berakhir: ${DateFormat('dd/MM/yyyy').format(promo.endDate)}',
                      style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
                    ),
                  ],
                ),
                if (promo.minPurchase > 0)
                  Container(
                    margin: const EdgeInsets.only(top: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE0F2FE),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'Min. Belanja ${currencyFormat.format(promo.minPurchase)}',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF0369A1)),
                    ),
                  ),
              ],
            ),
          ),
          PopupMenuButton<String>(
            icon: const Icon(HugeIcons.strokeRoundedMoreVerticalCircle01, color: Color(0xFF9CA3AF)),
            onSelected: (value) {
              if (value == 'edit') onEdit();
              if (value == 'delete') onDelete();
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'edit',
                child: Row(
                  children: [
                    Icon(HugeIcons.strokeRoundedEdit02, size: 20, color: Color(0xFF1A1A1A)),
                    SizedBox(width: 10),
                    Text('Edit Promo'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'delete',
                child: Row(
                  children: [
                    Icon(HugeIcons.strokeRoundedDelete02, size: 20, color: Colors.red),
                    SizedBox(width: 10),
                    Text('Hapus', style: TextStyle(color: Colors.red)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
