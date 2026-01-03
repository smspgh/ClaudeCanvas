import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// Progress indicator component
class CcProgress extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;

  const CcProgress({
    super.key,
    required this.component,
    required this.dataModel,
  });

  @override
  Widget build(BuildContext context) {
    double? value;
    if (component['valuePath'] != null) {
      final rawValue = getByPointer(dataModel, component['valuePath'] as String);
      if (rawValue is num) {
        value = rawValue.toDouble() / 100; // Assume 0-100 scale
      }
    } else if (component['value'] != null) {
      value = (component['value'] as num).toDouble() / 100;
    }

    final variant = component['variant'] as String? ?? 'linear';
    final size = component['size'] as String? ?? 'medium';
    final showLabel = component['showLabel'] as bool? ?? false;
    final label = component['label'] as String?;
    final color = _parseColor(component['color'] as String?);
    final trackColor = _parseColor(component['trackColor'] as String?);

    if (variant == 'circular') {
      return _buildCircular(value, size, showLabel, label, color, trackColor);
    }

    return _buildLinear(value, size, showLabel, label, color, trackColor);
  }

  Widget _buildLinear(
    double? value,
    String size,
    bool showLabel,
    String? label,
    Color? color,
    Color? trackColor,
  ) {
    final height = size == 'small' ? 4.0 : (size == 'large' ? 12.0 : 8.0);

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null || showLabel)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (label != null) Text(label),
                if (showLabel && value != null)
                  Text('${(value * 100).toInt()}%'),
              ],
            ),
          ),
        SizedBox(
          height: height,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(height / 2),
            child: value != null
                ? LinearProgressIndicator(
                    value: value.clamp(0, 1),
                    backgroundColor: trackColor ?? Colors.grey[200],
                    valueColor: AlwaysStoppedAnimation(color ?? Colors.blue),
                  )
                : LinearProgressIndicator(
                    backgroundColor: trackColor ?? Colors.grey[200],
                    valueColor: AlwaysStoppedAnimation(color ?? Colors.blue),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildCircular(
    double? value,
    String size,
    bool showLabel,
    String? label,
    Color? color,
    Color? trackColor,
  ) {
    final dimension = size == 'small' ? 32.0 : (size == 'large' ? 80.0 : 48.0);
    final strokeWidth = size == 'small' ? 3.0 : (size == 'large' ? 8.0 : 5.0);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: dimension,
          height: dimension,
          child: Stack(
            alignment: Alignment.center,
            children: [
              value != null
                  ? CircularProgressIndicator(
                      value: value.clamp(0, 1),
                      backgroundColor: trackColor ?? Colors.grey[200],
                      valueColor: AlwaysStoppedAnimation(color ?? Colors.blue),
                      strokeWidth: strokeWidth,
                    )
                  : CircularProgressIndicator(
                      backgroundColor: trackColor ?? Colors.grey[200],
                      valueColor: AlwaysStoppedAnimation(color ?? Colors.blue),
                      strokeWidth: strokeWidth,
                    ),
              if (showLabel && value != null)
                Text(
                  '${(value * 100).toInt()}%',
                  style: TextStyle(
                    fontSize: dimension * 0.2,
                    fontWeight: FontWeight.bold,
                  ),
                ),
            ],
          ),
        ),
        if (label != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(label),
          ),
      ],
    );
  }

  Color? _parseColor(String? color) {
    if (color == null) return null;
    if (color.startsWith('#')) {
      final hex = color.substring(1);
      if (hex.length == 6) {
        return Color(int.parse('FF$hex', radix: 16));
      }
    }
    return null;
  }
}
