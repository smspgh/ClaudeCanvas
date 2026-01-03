import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// Image component for displaying images
class CcImage extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;

  const CcImage({
    super.key,
    required this.component,
    required this.dataModel,
  });

  @override
  Widget build(BuildContext context) {
    String? src = component['src'] as String?;

    // Support srcPath binding
    if (component['srcPath'] != null) {
      final value = getByPointer(dataModel, component['srcPath'] as String);
      src = value?.toString();
    }

    if (src == null || src.isEmpty) {
      return const SizedBox.shrink();
    }

    final alt = component['alt'] as String?;
    final fit = _parseFit(component['fit'] as String?);

    Widget image;
    if (src.startsWith('http://') || src.startsWith('https://')) {
      image = Image.network(
        src,
        fit: fit,
        errorBuilder: (context, error, stackTrace) {
          return Container(
            color: Colors.grey[200],
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.broken_image, color: Colors.grey[400]),
                  if (alt != null)
                    Text(alt, style: TextStyle(color: Colors.grey[600])),
                ],
              ),
            ),
          );
        },
      );
    } else {
      // Assume asset image
      image = Image.asset(
        src,
        fit: fit,
        errorBuilder: (context, error, stackTrace) {
          return Container(
            color: Colors.grey[200],
            child: Center(
              child: Icon(Icons.broken_image, color: Colors.grey[400]),
            ),
          );
        },
      );
    }

    return Semantics(
      label: alt,
      child: image,
    );
  }

  BoxFit _parseFit(String? fit) {
    switch (fit) {
      case 'cover':
        return BoxFit.cover;
      case 'contain':
        return BoxFit.contain;
      case 'fill':
        return BoxFit.fill;
      case 'none':
        return BoxFit.none;
      default:
        return BoxFit.cover;
    }
  }
}
