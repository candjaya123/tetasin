import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import '../../core/hardware/bluetooth_printer_service.dart';
import '../../core/theme/app_colors.dart';

class PrinterSettingsScreen extends ConsumerStatefulWidget {
  const PrinterSettingsScreen({super.key});

  @override
  ConsumerState<PrinterSettingsScreen> createState() => _PrinterSettingsScreenState();
}

class _PrinterSettingsScreenState extends ConsumerState<PrinterSettingsScreen> {
  bool _isConnecting = false;

  @override
  void initState() {
    super.initState();
    ref.read(bluetoothPrinterServiceProvider).startScan();
  }

  Future<void> _connect(BluetoothDevice device) async {
    setState(() => _isConnecting = true);
    try {
      await ref.read(bluetoothPrinterServiceProvider).connect(device);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Terhubung ke ${device.platformName.isEmpty ? device.remoteId : device.platformName}')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal terhubung: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isConnecting = false);
    }
  }

  Future<void> _testPrint() async {
    try {
      final service = ref.read(bluetoothPrinterServiceProvider);
      final bytes = await service.generateTestReceipt();
      await service.printReceipt(bytes);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal mencetak: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final service = ref.watch(bluetoothPrinterServiceProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Printer Bluetooth', style: GoogleFonts.outfit(fontWeight: FontWeight.w900)),
        backgroundColor: AppColors.background,
        elevation: 0,
        actions: [
          StreamBuilder<bool>(
            stream: service.isScanning,
            initialData: false,
            builder: (c, snapshot) {
              if (snapshot.data!) {
                return const Center(child: Padding(
                  padding: EdgeInsets.only(right: 16),
                  child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                ));
              }
              return IconButton(
                icon: const Icon(Icons.refresh_rounded),
                onPressed: () => service.startScan(),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          if (service.isConnected)
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.green.shade200),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle_rounded, color: Colors.green),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Printer Terhubung',
                          style: GoogleFonts.outfit(fontWeight: FontWeight.w900, color: Colors.green.shade900),
                        ),
                        Text(
                          service.connectedDevice?.platformName ?? service.connectedDevice?.remoteId.str ?? '',
                          style: GoogleFonts.outfit(fontSize: 12, color: Colors.green.shade700),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: _testPrint,
                    child: const Text('Test Print'),
                  ),
                ],
              ),
            ),
          
          Expanded(
            child: StreamBuilder<List<ScanResult>>(
              stream: service.scanResults,
              initialData: const [],
              builder: (c, snapshot) {
                final results = snapshot.data!;
                if (results.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.bluetooth_searching_rounded, size: 48, color: AppColors.lightGrey),
                        const SizedBox(height: 16),
                        Text(
                          'Mencari printer...',
                          style: GoogleFonts.outfit(color: AppColors.mediumGrey),
                        ),
                      ],
                    ),
                  );
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: results.length,
                  itemBuilder: (c, i) {
                    final d = results[i].device;
                    final isConnecting = _isConnecting && service.connectedDevice == null;
                    
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      child: ListTile(
                        leading: const Icon(Icons.print_rounded),
                        title: Text(d.platformName.isEmpty ? d.remoteId.str : d.platformName, style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                        subtitle: Text(d.remoteId.str, style: GoogleFonts.outfit(fontSize: 11)),
                        trailing: service.connectedDevice?.remoteId == d.remoteId
                          ? const Icon(Icons.check_circle_rounded, color: Colors.green)
                          : ElevatedButton(
                              onPressed: _isConnecting ? null : () => _connect(d),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.black,
                                foregroundColor: AppColors.primary,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: Text(isConnecting ? '...' : 'Hubungkan'),
                            ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
