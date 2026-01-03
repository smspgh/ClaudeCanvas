import 'package:flutter/material.dart';

/// Card component for grouped content
class CcCard extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final Widget Function(Map<String, dynamic> component, {Key? key}) renderChild;

  const CcCard({
    super.key,
    required this.component,
    required this.dataModel,
    required this.renderChild,
  });

  @override
  Widget build(BuildContext context) {
    final children = (component['children'] as List<dynamic>?)
            ?.map((e) => Map<String, dynamic>.from(e as Map))
            .toList() ??
        [];
    final elevated = component['elevated'] as bool? ?? false;

    return Card(
      elevation: elevated ? 4 : 1,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: children.asMap().entries.map((entry) {
            return renderChild(entry.value, key: ValueKey('card-child-${entry.key}'));
          }).toList(),
        ),
      ),
    );
  }
}
