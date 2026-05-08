import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/alert.dart';
import '../../../shared/repositories/repositories_provider.dart';

final alertsProvider = FutureProvider<List<SmartAlert>>((ref) async {
  final repository = ref.watch(alertRepositoryProvider);
  return repository.getAlerts();
});

final notificationSettingsProvider = FutureProvider<Map<String, bool>>((ref) async {
  final repository = ref.watch(alertRepositoryProvider);
  return repository.getNotificationSettings();
});

class NotificationSettingsNotifier extends StateNotifier<AsyncValue<Map<String, bool>>> {
  final Ref _ref;
  NotificationSettingsNotifier(this._ref) : super(const AsyncValue.loading()) {
    _init();
  }

  Future<void> _init() async {
    state = await AsyncValue.guard(() => _ref.read(alertRepositoryProvider).getNotificationSettings());
  }

  Future<void> updateSetting(String key, bool value) async {
    final current = state.value ?? {};
    final updated = {...current, key: value};
    state = AsyncValue.data(updated);
    
    try {
      await _ref.read(alertRepositoryProvider).updateNotificationSettings(updated);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final notificationSettingsNotifierProvider = StateNotifierProvider<NotificationSettingsNotifier, AsyncValue<Map<String, bool>>>((ref) {
  return NotificationSettingsNotifier(ref);
});
