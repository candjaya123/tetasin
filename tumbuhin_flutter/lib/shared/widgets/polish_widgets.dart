import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'package:hugeicons/hugeicons.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/dimens.dart';

class SkeletonLoader extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const SkeletonLoader({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = Dimens.sm,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.surfaceTertiary,
      highlightColor: AppColors.surfaceSecondary,
      period: const Duration(milliseconds: 1200),
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.surfaceTertiary,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }

  static Widget listTile({double height = 72}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: Dimens.xs),
      child: Container(
        height: height,
        padding: Dimens.card,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: Dimens.brLg,
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Row(
          children: [
            const SkeletonLoader(width: 44, height: 44, borderRadius: 12),
            SizedBox(width: Dimens.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SkeletonLoader(width: double.infinity * 0.6, height: 14),
                  SizedBox(height: Dimens.sm),
                  const SkeletonLoader(width: 80, height: 10),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  static Widget card({double? height}) {
    return Container(
      margin: const EdgeInsets.only(bottom: Dimens.md),
      padding: Dimens.card,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: Dimens.brLg,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              SkeletonLoader(width: 100, height: 14),
              const SkeletonLoader(width: 60, height: 20, borderRadius: 6),
            ],
          ),
          const SizedBox(height: Dimens.lg),
          const Divider(color: AppColors.divider),
          const SizedBox(height: Dimens.lg),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const SkeletonLoader(width: 80, height: 28),
              const SkeletonLoader(width: 100, height: 18),
            ],
          ),
        ],
      ),
    );
  }
}

class AppRefreshIndicator extends StatelessWidget {
  final Widget child;
  final Future<void> Function() onRefresh;

  const AppRefreshIndicator({
    super.key,
    required this.child,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      color: AppColors.onPrimary,
      backgroundColor: AppColors.primary,
      displacement: 48,
      edgeOffset: 0,
      onRefresh: onRefresh,
      child: child,
    );
  }
}

class EmptyStateWidget extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;
  final String? actionLabel;
  final VoidCallback? onAction;

  const EmptyStateWidget({
    super.key,
    required this.title,
    required this.message,
    this.icon = HugeIcons.strokeRoundedFileSearch,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(Dimens.xxxxl),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: AppColors.surfaceSecondary,
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 40, color: AppColors.textTertiary),
              ),
              const SizedBox(height: Dimens.xxl),
              Text(
                title,
                style: Theme.of(context).textTheme.headlineSmall,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: Dimens.sm),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: Dimens.xl),
                child: Text(
                  message,
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
              ),
              if (actionLabel != null && onAction != null) ...[
                const SizedBox(height: Dimens.xxxl),
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: onAction,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: Dimens.xxl,
                      ),
                    ),
                    child: Text(actionLabel!),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class ErrorStateWidget extends StatelessWidget {
  final String? error;
  final VoidCallback onRetry;

  const ErrorStateWidget({super.key, this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(Dimens.xxxxl),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: AppColors.errorLight,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  HugeIcons.strokeRoundedCloudServer,
                  size: 40,
                  color: AppColors.error,
                ),
              ),
              const SizedBox(height: Dimens.xxl),
              Text(
                'Terjadi Kesalahan',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: Dimens.sm),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: Dimens.xl),
                child: Text(
                  error ?? 'Gagal memuat data. Periksa koneksi internet Anda.',
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: Dimens.xxxl),
              SizedBox(
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: onRetry,
                  icon: const Icon(HugeIcons.strokeRoundedRefresh, size: 18),
                  label: const Text('Coba Lagi'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: Dimens.xxl),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SectionHeader extends StatelessWidget {
  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;

  const SectionHeader({
    super.key,
    required this.title,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleLarge),
        if (actionLabel != null && onAction != null)
          GestureDetector(
            onTap: onAction,
            child: Text(
              actionLabel!,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
      ],
    );
  }
}

class StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const StatCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: Dimens.card,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: Dimens.brLg,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: Dimens.brSm,
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: Dimens.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: Theme.of(context).textTheme.bodySmall,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: Dimens.xs),
                Text(
                  value,
                  style: Theme.of(context).textTheme.titleMedium,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final Widget? trailing;

  const InfoRow({
    super.key,
    required this.label,
    required this.value,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: Theme.of(context).textTheme.bodyMedium),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(value, style: Theme.of(context).textTheme.titleMedium),
            if (trailing != null) ...[
              const SizedBox(width: Dimens.sm),
              trailing!,
            ],
          ],
        ),
      ],
    );
  }
}

class StatusBadge extends StatelessWidget {
  final String label;
  final Color? color;

  const StatusBadge({super.key, required this.label, this.color});

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.textTertiary;
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: Dimens.sm,
        vertical: Dimens.xs,
      ),
      decoration: BoxDecoration(
        color: c.withValues(alpha: 0.1),
        borderRadius: Dimens.brXs,
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(color: c),
      ),
    );
  }
}
