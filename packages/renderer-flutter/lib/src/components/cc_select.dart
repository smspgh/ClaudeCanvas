import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// Select/Dropdown component
class CcSelect extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final void Function(String path, dynamic value) onInput;

  const CcSelect({
    super.key,
    required this.component,
    required this.dataModel,
    required this.onInput,
  });

  @override
  Widget build(BuildContext context) {
    final valuePath = component['valuePath'] as String?;
    final label = component['label'] as String?;
    final placeholder = component['placeholder'] as String?;
    final options = (component['options'] as List<dynamic>?)
            ?.map((e) => Map<String, dynamic>.from(e as Map))
            .toList() ??
        [];
    final disabled = component['disabled'] as bool? ?? false;

    String? currentValue;
    if (valuePath != null) {
      final value = getByPointer(dataModel, valuePath);
      currentValue = value?.toString();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
          ),
        DropdownButtonFormField<String>(
          value: currentValue,
          decoration: InputDecoration(
            border: const OutlineInputBorder(),
            hintText: placeholder,
            enabled: !disabled,
          ),
          items: options.map<DropdownMenuItem<String>>((option) {
            return DropdownMenuItem<String>(
              value: option['value']?.toString(),
              child: Text(option['label']?.toString() ?? option['value']?.toString() ?? ''),
            );
          }).toList(),
          onChanged: disabled
              ? null
              : (value) {
                  if (valuePath != null && value != null) {
                    onInput(valuePath, value);
                  }
                },
        ),
      ],
    );
  }
}
