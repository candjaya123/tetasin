import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tetasin/shared/widgets/main_shell.dart';
import 'package:tetasin/core/theme/app_colors.dart';

void main() {
  group('MainShell Widget Tests', () {
    testWidgets('renders top app bar with tetasin text', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: MainShell(
              child: const Text('Child Content'),
            ),
          ),
        ),
      );

      // Verify the AppBar contains the text "tumbuhin"
      expect(find.text('tetasin'), findsOneWidget);
      // Verify child content renders
      expect(find.text('Child Content'), findsOneWidget);
    });
  });
}
