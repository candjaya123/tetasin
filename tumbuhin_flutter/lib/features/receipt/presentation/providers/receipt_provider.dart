import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_provider.dart';
import '../../data/receipt_repository.dart';
import '../../data/receipt_models.dart';

final receiptRepositoryProvider = Provider<ReceiptRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ReceiptRepository(apiClient);
});

final draftsProvider = FutureProvider<List<DraftTransaction>>((ref) {
  return ref.read(receiptRepositoryProvider).getDrafts();
});

final draftDetailProvider = FutureProvider.family<DraftTransaction, String>((
  ref,
  id,
) {
  return ref.read(receiptRepositoryProvider).getDraft(id);
});

final merchantsProvider = FutureProvider<List<MerchantMapping>>((ref) {
  return ref.read(receiptRepositoryProvider).getMerchants();
});

class DraftNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<void> approve(String id) async {
    await ref.read(receiptRepositoryProvider).approveDraft(id);
    ref.invalidate(draftsProvider);
  }

  Future<void> reject(String id, {String? reason}) async {
    await ref.read(receiptRepositoryProvider).rejectDraft(id, reason: reason);
    ref.invalidate(draftsProvider);
  }

  Future<DraftTransaction> createManual(Map<String, dynamic> data) async {
    final draft = await ref
        .read(receiptRepositoryProvider)
        .createManualDraft(data);
    ref.invalidate(draftsProvider);
    return draft;
  }

  Future<DraftTransaction> updateDraft(
    String id,
    Map<String, dynamic> data,
  ) async {
    final draft = await ref
        .read(receiptRepositoryProvider)
        .updateDraft(id, data);
    ref.invalidate(draftsProvider);
    return draft;
  }

  Future<ReceiptScan> uploadScan(File image) async {
    final scan = await ref.read(receiptRepositoryProvider).uploadScan(image);
    ref.invalidate(draftsProvider);
    return scan;
  }
}

final draftNotifierProvider = AsyncNotifierProvider<DraftNotifier, void>(
  DraftNotifier.new,
);
