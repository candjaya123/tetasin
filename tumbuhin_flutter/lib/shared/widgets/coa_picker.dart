import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../features/reports/providers/report_providers.dart';

class CoaPicker extends ConsumerWidget {
  final String? initialValue;
  final String label;
  final String? filter;
  final ValueChanged<String?> onChanged;
  final String? hintText;

  const CoaPicker({
    super.key,
    this.initialValue,
    required this.label,
    this.filter,
    required this.onChanged,
    this.hintText,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final coaAsync = ref.watch(coaProvider);

    return coaAsync.when(
      loading: () => DropdownButtonFormField<String>(
        initialValue: null,
        decoration: InputDecoration(
          labelText: label,
          hintText: 'Memuat akun...',
        ),
        items: const [],
        onChanged: null,
      ),
      error: (e, _) => DropdownButtonFormField<String>(
        initialValue: null,
        decoration: InputDecoration(
          labelText: label,
          errorText: 'Gagal memuat akun',
        ),
        items: const [],
        onChanged: null,
      ),
      data: (accounts) {
        var filtered = accounts;
        if (filter != null) {
          filtered = accounts.where((a) {
            final type = (a['type'] ?? '').toString().toUpperCase();
            return type.contains(filter!.toUpperCase());
          }).toList();
        }

        return DropdownButtonFormField<String>(
          initialValue: initialValue,
          decoration: InputDecoration(
            labelText: label,
            hintText: hintText ?? 'Pilih Akun',
          ),
          isExpanded: true,
          items: [
            DropdownMenuItem<String>(
              value: null,
              child: Text(
                hintText ?? 'Pilih Akun',
                style: GoogleFonts.outfit(fontSize: 13, color: Colors.grey),
              ),
            ),
            ...filtered.map(
              (a) => DropdownMenuItem<String>(
                value: a['id'].toString(),
                child: Text(
                  '${a['code']} - ${a['name']}',
                  style: GoogleFonts.outfit(fontSize: 13),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
          ],
          onChanged: onChanged,
        );
      },
    );
  }
}
