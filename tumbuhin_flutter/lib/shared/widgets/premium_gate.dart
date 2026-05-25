import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/dimens.dart';

class PremiumGate extends StatelessWidget {
  final String featureName;
  final String requiredTier;
  final Widget child;

  const PremiumGate({
    super.key,
    required this.featureName,
    required this.requiredTier,
    required this.child,
  });

  String _tierLabel(String tier) {
    switch (tier.toLowerCase()) {
      case 'premium':
        return 'Premium';
      case 'pro':
        return 'Pro';
      case 'franchise':
        return 'Franchise';
      default:
        return tier;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        Positioned.fill(
          child: ClipRRect(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 4, sigmaY: 4),
              child: Container(
                color: Colors.black.withValues(alpha: 0.4),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.lock_rounded,
                        size: 40,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: Dimens.xxl),
                    Text(
                      'Fitur $_tierLabel(featureName)',
                      style: Theme.of(
                        context,
                      ).textTheme.titleLarge?.copyWith(color: Colors.white),
                    ),
                    const SizedBox(height: Dimens.sm),
                    Text(
                      'Tersedia untuk paket ${_tierLabel(requiredTier)} ke atas',
                      style: Theme.of(
                        context,
                      ).textTheme.bodyMedium?.copyWith(color: Colors.white70),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: Dimens.xxxl),
                    SizedBox(
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () => context.push('/subscription'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: AppColors.onPrimary,
                          padding: const EdgeInsets.symmetric(
                            horizontal: Dimens.xxl,
                          ),
                        ),
                        child: const Text('Upgrade Sekarang'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
