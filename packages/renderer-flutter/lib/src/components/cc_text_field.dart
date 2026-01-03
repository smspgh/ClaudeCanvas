import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// TextField component for text input
class CcTextField extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final void Function(String path, dynamic value) onInput;

  const CcTextField({
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
    final inputType = component['inputType'] as String? ?? 'text';
    final multiline = component['multiline'] as bool? ?? false;
    final rows = component['rows'] as int? ?? 3;
    final required = component['required'] as bool? ?? false;
    final disabled = component['disabled'] as bool? ?? false;

    String? currentValue;
    if (valuePath != null) {
      final value = getByPointer(dataModel, valuePath);
      currentValue = value?.toString();
    }

    return TextField(
      controller: TextEditingController(text: currentValue),
      decoration: InputDecoration(
        labelText: label != null ? (required ? '$label *' : label) : null,
        hintText: placeholder,
        border: const OutlineInputBorder(),
        enabled: !disabled,
      ),
      obscureText: inputType == 'password',
      keyboardType: _getKeyboardType(inputType),
      maxLines: multiline ? rows : 1,
      onChanged: (value) {
        if (valuePath != null) {
          onInput(valuePath, value);
        }
      },
    );
  }

  TextInputType _getKeyboardType(String inputType) {
    switch (inputType) {
      case 'email':
        return TextInputType.emailAddress;
      case 'number':
        return TextInputType.number;
      case 'tel':
        return TextInputType.phone;
      case 'url':
        return TextInputType.url;
      default:
        return TextInputType.text;
    }
  }
}
