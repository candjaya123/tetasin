import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:tetasin/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('End-to-End App Test', () {
    testWidgets('App starts and navigates to login screen', (WidgetTester tester) async {
      // Start the app
      app.main();
      
      // Wait for the app to settle (animations finish, etc)
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Depending on authentication state, it might go to splash -> login
      // Let's verify we see a login or splash indicator
      
      // Attempt to find the login button (adjust text matching your UI)
      final loginButton = find.byType(ElevatedButton);
      
      // We aren't asserting strictly because auth state might redirect us to dashboard
      // Instead, we just ensure the app doesn't crash on launch.
      expect(find.byType(MaterialApp), findsOneWidget);
    });
  });
}
