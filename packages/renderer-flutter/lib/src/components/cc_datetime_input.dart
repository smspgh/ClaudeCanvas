import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../utils/json_pointer.dart';

/// DateTimeInput component for date/time selection
class CcDateTimeInput extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final void Function(String path, dynamic value) onInput;

  const CcDateTimeInput({
    super.key,
    required this.component,
    required this.dataModel,
    required this.onInput,
  });

  @override
  Widget build(BuildContext context) {
    final valuePath = component['valuePath'] as String?;
    final label = component['label'] as String?;
    final enableDate = component['enableDate'] as bool? ?? true;
    final enableTime = component['enableTime'] as bool? ?? false;
    final disabled = component['disabled'] as bool? ?? false;
    final minDateStr = component['minDate'] as String?;
    final maxDateStr = component['maxDate'] as String?;

    DateTime? currentValue;
    if (valuePath != null) {
      final value = getByPointer(dataModel, valuePath);
      if (value is String && value.isNotEmpty) {
        currentValue = DateTime.tryParse(value);
      }
    }

    final minDate = minDateStr != null ? DateTime.tryParse(minDateStr) : null;
    final maxDate = maxDateStr != null ? DateTime.tryParse(maxDateStr) : null;

    String displayValue = '';
    if (currentValue != null) {
      if (enableDate && enableTime) {
        displayValue = DateFormat('yyyy-MM-dd HH:mm').format(currentValue);
      } else if (enableDate) {
        displayValue = DateFormat('yyyy-MM-dd').format(currentValue);
      } else if (enableTime) {
        displayValue = DateFormat('HH:mm').format(currentValue);
      }
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
        InkWell(
          onTap: disabled
              ? null
              : () async {
                  DateTime? selectedDateTime = currentValue ?? DateTime.now();

                  if (enableDate) {
                    final pickedDate = await showDatePicker(
                      context: context,
                      initialDate: selectedDateTime,
                      firstDate: minDate ?? DateTime(1900),
                      lastDate: maxDate ?? DateTime(2100),
                    );
                    if (pickedDate != null) {
                      selectedDateTime = DateTime(
                        pickedDate.year,
                        pickedDate.month,
                        pickedDate.day,
                        selectedDateTime.hour,
                        selectedDateTime.minute,
                      );
                    } else {
                      return;
                    }
                  }

                  if (enableTime && context.mounted) {
                    final pickedTime = await showTimePicker(
                      context: context,
                      initialTime: TimeOfDay.fromDateTime(selectedDateTime),
                    );
                    if (pickedTime != null) {
                      selectedDateTime = DateTime(
                        selectedDateTime.year,
                        selectedDateTime.month,
                        selectedDateTime.day,
                        pickedTime.hour,
                        pickedTime.minute,
                      );
                    } else if (!enableDate) {
                      return;
                    }
                  }

                  if (valuePath != null) {
                    onInput(valuePath, selectedDateTime.toIso8601String());
                  }
                },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[400]!),
              borderRadius: BorderRadius.circular(4),
              color: disabled ? Colors.grey[100] : Colors.white,
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    displayValue.isEmpty ? 'Select date/time' : displayValue,
                    style: TextStyle(
                      color: displayValue.isEmpty ? Colors.grey[500] : Colors.black,
                    ),
                  ),
                ),
                Icon(
                  enableDate && enableTime
                      ? Icons.calendar_today
                      : (enableDate ? Icons.calendar_today : Icons.access_time),
                  color: Colors.grey[600],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
