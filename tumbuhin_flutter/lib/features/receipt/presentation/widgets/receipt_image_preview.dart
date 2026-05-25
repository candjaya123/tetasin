import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

class ReceiptImagePreview extends StatefulWidget {
  final String imageUrl;

  const ReceiptImagePreview({super.key, required this.imageUrl});

  @override
  State<ReceiptImagePreview> createState() => _ReceiptImagePreviewState();
}

class _ReceiptImagePreviewState extends State<ReceiptImagePreview> {
  final TransformationController _transformationController =
      TransformationController();

  @override
  void dispose() {
    _transformationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: InteractiveViewer(
        transformationController: _transformationController,
        minScale: 0.5,
        maxScale: 4.0,
        child: CachedNetworkImage(
          imageUrl: widget.imageUrl,
          fit: BoxFit.contain,
          placeholder: (_, __) =>
              const Center(child: CircularProgressIndicator()),
          errorWidget: (_, __, ___) => const Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.image_not_supported_outlined,
                  size: 48,
                  color: Colors.grey,
                ),
                SizedBox(height: 8),
                Text(
                  'Gagal memuat gambar',
                  style: TextStyle(color: Colors.grey),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
