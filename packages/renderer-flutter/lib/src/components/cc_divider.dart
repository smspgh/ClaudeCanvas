import 'package:flutter/material.dart';

/// Divider component for visual separation
class CcDivider extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;

  const CcDivider({
    super.key,
    required this.component,
    required this.dataModel,
  });

  @override
  Widget build(BuildContext context) {
    final orientation = component['orientation'] as String? ?? 'horizontal';

    if (orientation == 'vertical') {
      return const VerticalDivider();
    }

    return const Divider();
  }
}
