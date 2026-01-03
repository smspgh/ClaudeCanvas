import 'package:flutter/material.dart';

/// Row component for horizontal layout
class CcRow extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final Widget Function(Map<String, dynamic> component, {Key? key}) renderChild;

  const CcRow({
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
    final justify = _parseJustify(component['justify'] as String?);
    final wrap = component['wrap'] as bool? ?? false;

    final childWidgets = <Widget>[];
    for (var i = 0; i < children.length; i++) {
      if (i > 0 && gap > 0) {
        childWidgets.add(SizedBox(width: gap));
      }
      childWidgets.add(renderChild(children[i], key: ValueKey('row-child-$i')));
    }

    if (wrap) {
      return Wrap(
        spacing: gap,
        runSpacing: gap,
        alignment: _wrapAlignment(justify),
        crossAxisAlignment: _wrapCrossAlignment(align),
        children: children.asMap().entries.map((entry) {
          return renderChild(entry.value, key: ValueKey('row-child-${entry.key}'));
        }).toList(),
      );
    }

    return Row(
      mainAxisAlignment: justify,
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
      case 'baseline':
        return CrossAxisAlignment.baseline;
      default:
        return CrossAxisAlignment.center;
    }
  }

  MainAxisAlignment _parseJustify(String? justify) {
    switch (justify) {
      case 'start':
        return MainAxisAlignment.start;
      case 'end':
        return MainAxisAlignment.end;
      case 'center':
        return MainAxisAlignment.center;
      case 'space-between':
        return MainAxisAlignment.spaceBetween;
      case 'space-around':
        return MainAxisAlignment.spaceAround;
      case 'space-evenly':
        return MainAxisAlignment.spaceEvenly;
      default:
        return MainAxisAlignment.start;
    }
  }

  WrapAlignment _wrapAlignment(MainAxisAlignment justify) {
    switch (justify) {
      case MainAxisAlignment.start:
        return WrapAlignment.start;
      case MainAxisAlignment.end:
        return WrapAlignment.end;
      case MainAxisAlignment.center:
        return WrapAlignment.center;
      case MainAxisAlignment.spaceBetween:
        return WrapAlignment.spaceBetween;
      case MainAxisAlignment.spaceAround:
        return WrapAlignment.spaceAround;
      case MainAxisAlignment.spaceEvenly:
        return WrapAlignment.spaceEvenly;
    }
  }

  WrapCrossAlignment _wrapCrossAlignment(CrossAxisAlignment align) {
    switch (align) {
      case CrossAxisAlignment.start:
        return WrapCrossAlignment.start;
      case CrossAxisAlignment.end:
        return WrapCrossAlignment.end;
      case CrossAxisAlignment.center:
        return WrapCrossAlignment.center;
      default:
        return WrapCrossAlignment.center;
    }
  }
}
