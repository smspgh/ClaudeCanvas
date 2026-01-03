import 'package:flutter/material.dart';

/// Tooltip component for hover information
class CcTooltip extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final Widget Function(Map<String, dynamic> component, {Key? key}) renderChild;

  const CcTooltip({
    super.key,
    required this.component,
    required this.dataModel,
    required this.renderChild,
  });

  @override
  Widget build(BuildContext context) {
    final content = component['content'] as String? ?? '';
    final position = component['position'] as String? ?? 'top';
    final children = (component['children'] as List<dynamic>?)
            ?.map((e) => Map<String, dynamic>.from(e as Map))
            .toList() ??
        [];

    final preferBelow = position == 'bottom';

    Widget child;
    if (children.isEmpty) {
      child = const SizedBox.shrink();
    } else if (children.length == 1) {
      child = renderChild(children[0], key: const ValueKey('tooltip-child'));
    } else {
      child = Column(
        mainAxisSize: MainAxisSize.min,
        children: children.asMap().entries.map((entry) {
          return renderChild(entry.value, key: ValueKey('tooltip-child-${entry.key}'));
        }).toList(),
      );
    }

    return Tooltip(
      message: content,
      preferBelow: preferBelow,
      child: child,
    );
  }
}
