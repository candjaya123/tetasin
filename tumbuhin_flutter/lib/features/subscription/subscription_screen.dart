import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/dimens.dart';

class SubscriptionScreen extends StatelessWidget {
  const SubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Upgrade Paket')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(Dimens.xxxl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.workspace_premium_rounded,
                  size: 40,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: Dimens.xxl),
              Text(
                'Upgrade Paket',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: Dimens.sm),
              Text(
                'Pilih paket yang sesuai dengan kebutuhan Anda\ndan dapatkan akses ke fitur premium.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
