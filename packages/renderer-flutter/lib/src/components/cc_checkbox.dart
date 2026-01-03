import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// Checkbox component for boolean input
class CcCheckbox extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final void Function(String path, dynamic value) onInput;

  const CcCheckbox({
    super.key,
    required this.component,
    required this.dataModel,
    required this.onInput,
  });

  @override
  Widget build(BuildContext context) {
    final valuePath = component['valuePath'] as String?;
    final label = component['label'] as String?;
    final disabled = component['disabled'] as bool? ?? false;

    bool? currentValue;
    if (valuePath != null) {
      final value = getByPointer(dataModel, valuePath);
      currentValue = value == true;
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Checkbox(
          value: currentValue ?? false,
          onChanged: disabled
              ? null
              : (value) {
                  if (valuePath != null) {
                    onInput(valuePath, value ?? false);
                  }
                },
        ),
        if (label != null)
          GestureDetector(
            onTap: disabled
                ? null
                : () {
                    if (valuePath != null) {
                      onInput(valuePath, !(currentValue ?? false));
                    }
                  },
            child: Text(label),
          ),
      ],
    );
  }
}
