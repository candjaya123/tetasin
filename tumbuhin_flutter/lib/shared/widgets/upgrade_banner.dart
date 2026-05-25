import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/dimens.dart';

class UpgradeBanner extends StatelessWidget {
  final String tier;

  const UpgradeBanner({super.key, required this.tier});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/subscription'),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(
          horizontal: Dimens.xl,
          vertical: Dimens.md,
        ),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.primary,
              AppColors.primary.withValues(alpha: 0.8),
            ],
          ),
        ),
        child: SafeArea(
          top: false,
          child: Row(
            children: [
              const Icon(
                Icons.workspace_premium_rounded,
                color: AppColors.onPrimary,
                size: 22,
              ),
              const SizedBox(width: Dimens.md),
              Expanded(
                child: Text(
                  'Fitur ini tersedia untuk paket $tier. Upgrade sekarang',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.onPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const Icon(
                Icons.arrow_forward_rounded,
                color: AppColors.onPrimary,
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
