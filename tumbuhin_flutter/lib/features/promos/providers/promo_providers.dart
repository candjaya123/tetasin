import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/promotion.dart';
import '../../../shared/repositories/repositories_provider.dart';

final promotionsProvider = FutureProvider<List<Promotion>>((ref) async {
  final repository = ref.watch(promoRepositoryProvider);
  return repository.getPromotions();
});
