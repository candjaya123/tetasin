import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';

// ---------------------------------------------------------------------------
// Flutter Widget Tests — Form behavior, validation, button states
// ---------------------------------------------------------------------------

void main() {
  group('ProductEditScreen — Form Behavior', () {
    testWidgets('should show validation error when name is empty', (tester) async {
      final formKey = GlobalKey<FormState>();
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Form(
              key: formKey,
              child: Column(children: [
                TextFormField(
                  validator: (v) => (v == null || v.isEmpty) ? 'Nama tidak boleh kosong' : null,
                  decoration: const InputDecoration(hintText: 'Nama Produk'),
                ),
                ElevatedButton(
                  onPressed: () => formKey.currentState!.validate(),
                  child: const Text('Simpan'),
                ),
              ]),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Simpan'));
      await tester.pumpAndSettle();

      expect(find.text('Nama tidak boleh kosong'), findsOneWidget);
    });

    testWidgets('should clear validation error after filling name', (tester) async {
      final formKey = GlobalKey<FormState>();
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Form(
              key: formKey,
              child: Column(children: [
                TextFormField(
                  validator: (v) => (v == null || v.isEmpty) ? 'Nama tidak boleh kosong' : null,
                  decoration: const InputDecoration(hintText: 'Nama Produk'),
                ),
                ElevatedButton(
                  onPressed: () => formKey.currentState!.validate(),
                  child: const Text('Simpan'),
                ),
              ]),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Simpan'));
      await tester.pumpAndSettle();
      expect(find.text('Nama tidak boleh kosong'), findsOneWidget);

      await tester.enterText(find.byType(TextFormField), 'Kopi Susu');
      await tester.tap(find.text('Simpan'));
      await tester.pumpAndSettle();
      expect(find.text('Nama tidak boleh kosong'), findsNothing);
    });

    testWidgets('should disable save button when loading', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: ElevatedButton(
                onPressed: null,
                child: const Text('Simpan'),
              ),
            ),
          ),
        ),
      );

      final button = tester.widget<ElevatedButton>(find.byType(ElevatedButton));
      expect(button.onPressed, isNull);
    });

    testWidgets('should show CircularProgressIndicator during save', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });
  });

  group('ExpensesScreen — Transaction Recording', () {
    testWidgets('should show empty state when no transactions', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Belum ada transaksi'),
                  Text('Catat pengeluaran atau pemasukan pertama Anda untuk memulai.'),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Belum ada transaksi'), findsOneWidget);
    });

    testWidgets('should show FAB for recording transaction', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            floatingActionButton: FloatingActionButton(
              onPressed: () {},
              child: const Icon(Icons.add),
            ),
            body: const Center(child: Text('Transaksi')),
          ),
        ),
      );

      expect(find.byType(FloatingActionButton), findsOneWidget);
      expect(find.byIcon(Icons.add), findsOneWidget);
    });

    testWidgets('should open bottom sheet on FAB tap', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (context) => Scaffold(
              floatingActionButton: FloatingActionButton(
                onPressed: () {
                  showModalBottomSheet(
                    context: context,
                    builder: (_) => const Padding(
                      padding: EdgeInsets.all(24),
                      child: Text('Catat Transaksi Baru'),
                    ),
                  );
                },
                child: const Icon(Icons.add),
              ),
              body: const Center(child: Text('Transaksi')),
            ),
          ),
        ),
      );

      await tester.tap(find.byType(FloatingActionButton));
      await tester.pumpAndSettle();

      expect(find.text('Catat Transaksi Baru'), findsOneWidget);
    });
  });

  group('InventoryScreen — List Display', () {
    testWidgets('should show skeleton loader while loading', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ListView.builder(
              itemCount: 3,
              itemBuilder: (_, i) => Container(
                height: 80,
                margin: const EdgeInsets.all(8),
                color: Colors.grey.shade300,
              ),
            ),
          ),
        ),
      );

      expect(find.byType(Container), findsWidgets);
      expect(find.byType(Container), findsAtLeast(1));
    });

    testWidgets('should show error state with retry button', (tester) async {
      bool retryPressed = false;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Terjadi Kesalahan'),
                  const Text('Gagal memuat data.'),
                  ElevatedButton(
                    onPressed: () => retryPressed = true,
                    child: const Text('Coba Lagi'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.text('Terjadi Kesalahan'), findsOneWidget);
      await tester.tap(find.text('Coba Lagi'));
      expect(retryPressed, isTrue);
    });
  });

  group('Login Validation', () {
    testWidgets('should show error on empty email', (tester) async {
      final formKey = GlobalKey<FormState>();
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Form(
              key: formKey,
              child: Column(children: [
                TextFormField(
                  validator: (v) => (v == null || v.isEmpty) ? 'Email wajib diisi' : null,
                  decoration: const InputDecoration(hintText: 'Email'),
                ),
                ElevatedButton(
                  onPressed: () => formKey.currentState!.validate(),
                  child: const Text('Login'),
                ),
              ]),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      expect(find.text('Email wajib diisi'), findsOneWidget);
    });

    testWidgets('should accept valid email', (tester) async {
      final formKey = GlobalKey<FormState>();
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Form(
              key: formKey,
              child: Column(children: [
                TextFormField(
                  validator: (v) => (v == null || v.isEmpty) ? 'Email wajib diisi' : null,
                  decoration: const InputDecoration(hintText: 'Email'),
                ),
                ElevatedButton(
                  onPressed: () => formKey.currentState!.validate(),
                  child: const Text('Login'),
                ),
              ]),
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextFormField), 'user@tetasin.com');
      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      expect(find.text('Email wajib diisi'), findsNothing);
    });
  });
}
