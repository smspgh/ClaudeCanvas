import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// Slider component for numeric range input
class CcSlider extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final void Function(String path, dynamic value) onInput;

  const CcSlider({
    super.key,
    required this.component,
    required this.dataModel,
    required this.onInput,
  });

  @override
  Widget build(BuildContext context) {
    final valuePath = component['valuePath'] as String?;
    final label = component['label'] as String?;
    final min = (component['min'] as num?)?.toDouble() ?? 0;
    final max = (component['max'] as num?)?.toDouble() ?? 100;
    final step = (component['step'] as num?)?.toDouble() ?? 1;
    final showValue = component['showValue'] as bool? ?? true;
    final disabled = component['disabled'] as bool? ?? false;
    final trackColor = _parseColor(component['trackColor'] as String?);
    final fillColor = _parseColor(component['fillColor'] as String?);

    double currentValue = min;
    if (valuePath != null) {
      final value = getByPointer(dataModel, valuePath);
      if (value is num) {
        currentValue = value.toDouble().clamp(min, max);
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
                if (showValue)
                  Text(
                    currentValue.toStringAsFixed(step < 1 ? 1 : 0),
                    style: TextStyle(color: Colors.grey[600]),
                  ),
              ],
            ),
          ),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: fillColor ?? Theme.of(context).primaryColor,
            inactiveTrackColor: trackColor ?? Colors.grey[300],
          ),
          child: Slider(
            value: currentValue,
            min: min,
            max: max,
            divisions: ((max - min) / step).round(),
            onChanged: disabled
                ? null
                : (value) {
                    if (valuePath != null) {
                      onInput(valuePath, value);
                    }
                  },
          ),
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
