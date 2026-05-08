import 'dart:async';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:esc_pos_utils_plus/esc_pos_utils_plus.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final bluetoothPrinterServiceProvider = Provider((ref) => BluetoothPrinterService());

class BluetoothPrinterService {
  final _storage = const FlutterSecureStorage();
  BluetoothDevice? _connectedDevice;
  
  BluetoothDevice? get connectedDevice => _connectedDevice;
  bool get isConnected => _connectedDevice != null;

  Stream<List<ScanResult>> get scanResults => FlutterBluePlus.scanResults;
  Stream<bool> get isScanning => FlutterBluePlus.isScanning;

  Future<void> startScan() async {
    if (await FlutterBluePlus.isSupported == false) return;
    await FlutterBluePlus.startScan(timeout: const Duration(seconds: 15));
  }

  Future<void> stopScan() async {
    await FlutterBluePlus.stopScan();
  }

  Future<void> connect(BluetoothDevice device) async {
    try {
      await device.connect();
      _connectedDevice = device;
      await _storage.write(key: 'last_printer_id', value: device.remoteId.str);
    } catch (e) {
      _connectedDevice = null;
      rethrow;
    }
  }

  Future<void> disconnect() async {
    if (_connectedDevice != null) {
      await _connectedDevice!.disconnect();
      _connectedDevice = null;
    }
  }

  Future<void> autoConnect() async {
    final lastId = await _storage.read(key: 'last_printer_id');
    if (lastId != null) {
      // Logic to find and connect to lastId if needed
      // For now, manual connection is more reliable in dev
    }
  }

  Future<void> printReceipt(List<int> bytes) async {
    if (_connectedDevice == null) throw Exception('Printer tidak terhubung');
    
    final services = await _connectedDevice!.discoverServices();
    BluetoothCharacteristic? writeChar;

    for (var service in services) {
      for (var char in service.characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          writeChar = char;
          break;
        }
      }
    }

    if (writeChar == null) throw Exception('Karakteristik tulis tidak ditemukan');

    // Split bytes into chunks (MTU limitations)
    const chunkSize = 20;
    for (var i = 0; i < bytes.length; i += chunkSize) {
      final end = (i + chunkSize < bytes.length) ? i + chunkSize : bytes.length;
      await writeChar.write(bytes.sublist(i, end), withoutResponse: true);
    }
  }

  Future<List<int>> generateTestReceipt() async {
    final profile = await CapabilityProfile.load();
    final generator = Generator(PaperSize.mm58, profile);
    List<int> bytes = [];

    bytes += generator.text('TUMBUHIN ERP', styles: const PosStyles(align: PosAlign.center, bold: true, height: PosTextSize.size2));
    bytes += generator.text('Test Print', styles: const PosStyles(align: PosAlign.center));
    bytes += generator.hr();
    bytes += generator.feed(2);
    bytes += generator.cut();

    return bytes;
  }
}
