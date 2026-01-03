import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// MultipleChoice component for multi-select options
class CcMultipleChoice extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final void Function(String path, dynamic value) onInput;

  const CcMultipleChoice({
    super.key,
    required this.component,
    required this.dataModel,
    required this.onInput,
  });

  @override
  Widget build(BuildContext context) {
    final valuePath = component['valuePath'] as String?;
    final label = component['label'] as String?;
    final options = (component['options'] as List<dynamic>?)
            ?.map((e) => Map<String, dynamic>.from(e as Map))
            .toList() ??
        [];
    final maxSelections = component['maxSelections'] as int?;
    final disabled = component['disabled'] as bool? ?? false;

    List<String> selectedValues = [];
    if (valuePath != null) {
      final value = getByPointer(dataModel, valuePath);
      if (value is List) {
        selectedValues = value.map((e) => e.toString()).toList();
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
          ),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: options.map((option) {
            final optionValue = option['value']?.toString() ?? '';
            final optionLabel = option['label']?.toString() ?? optionValue;
            final isSelected = selectedValues.contains(optionValue);

            final canSelect = isSelected ||
                maxSelections == null ||
                selectedValues.length < maxSelections;

            return FilterChip(
              label: Text(optionLabel),
              selected: isSelected,
              onSelected: disabled || (!canSelect && !isSelected)
                  ? null
                  : (selected) {
                      if (valuePath == null) return;

                      List<String> newValues;
                      if (selected) {
                        newValues = [...selectedValues, optionValue];
                      } else {
                        newValues = selectedValues.where((v) => v != optionValue).toList();
                      }
                      onInput(valuePath, newValues);
                    },
            );
          }).toList(),
        ),
      ],
    );
  }
}
