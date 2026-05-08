import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/product.dart';
import '../../../shared/repositories/repositories_provider.dart';

final inventorySearchProvider = StateProvider<String>((ref) => '');

final inventoryProductsProvider = FutureProvider<List<Product>>((ref) async {
  final repository = ref.watch(inventoryRepositoryProvider);
  final search = ref.watch(inventorySearchProvider);
  
  return repository.getInventory(search: search.isEmpty ? null : search);
});

final warehousesProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final repository = ref.watch(inventoryRepositoryProvider);
  return repository.getWarehouses();
});

final rawMaterialsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final repository = ref.watch(inventoryRepositoryProvider);
  return repository.getRawMaterials();
});
