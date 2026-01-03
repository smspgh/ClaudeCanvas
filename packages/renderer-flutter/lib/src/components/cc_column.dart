import 'package:flutter/material.dart';

/// Column component for vertical layout
class CcColumn extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final Widget Function(Map<String, dynamic> component, {Key? key}) renderChild;

  const CcColumn({
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
    final gap = (component['gap'] as num?)?.toDouble() ?? 0;
    final align = _parseAlign(component['align'] as String?);

    final childWidgets = <Widget>[];
    for (var i = 0; i < children.length; i++) {
      if (i > 0 && gap > 0) {
        childWidgets.add(SizedBox(height: gap));
      }
      childWidgets.add(renderChild(children[i], key: ValueKey('col-child-$i')));
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: align,
      children: childWidgets,
    );
  }

  CrossAxisAlignment _parseAlign(String? align) {
    switch (align) {
      case 'start':
        return CrossAxisAlignment.start;
      case 'end':
        return CrossAxisAlignment.end;
      case 'center':
        return CrossAxisAlignment.center;
      case 'stretch':
        return CrossAxisAlignment.stretch;
      default:
        return CrossAxisAlignment.start;
    }
  }
}
