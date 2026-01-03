import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// Accordion component for expandable sections
class CcAccordion extends StatefulWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final void Function(String path, dynamic value) onInput;
  final Widget Function(Map<String, dynamic> component, {Key? key}) renderChild;

  const CcAccordion({
    super.key,
    required this.component,
    required this.dataModel,
    required this.onInput,
    required this.renderChild,
  });

  @override
  State<CcAccordion> createState() => _CcAccordionState();
}

class _CcAccordionState extends State<CcAccordion> {
  Set<int> _expandedItems = {};

  @override
  void initState() {
    super.initState();
    _loadExpandedState();
  }

  void _loadExpandedState() {
    final expandedPath = widget.component['expandedPath'] as String?;
    if (expandedPath != null) {
      final value = getByPointer(widget.dataModel, expandedPath);
      if (value is List) {
        _expandedItems = value.whereType<int>().toSet();
      } else if (value is int) {
        _expandedItems = {value};
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = (widget.component['items'] as List<dynamic>?)
            ?.map((e) => Map<String, dynamic>.from(e as Map))
            .toList() ??
        [];
    final allowMultiple = widget.component['allowMultiple'] as bool? ?? false;
    final variant = widget.component['variant'] as String? ?? 'default';

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: items.asMap().entries.map((entry) {
        final index = entry.key;
        final item = entry.value;
        final isExpanded = _expandedItems.contains(index);

        Widget tile = ExpansionTile(
          title: Text(item['title'] as String? ?? ''),
          initiallyExpanded: isExpanded,
          onExpansionChanged: (expanded) {
            setState(() {
              if (expanded) {
                if (allowMultiple) {
                  _expandedItems.add(index);
                } else {
                  _expandedItems = {index};
                }
              } else {
                _expandedItems.remove(index);
              }
            });
            final expandedPath = widget.component['expandedPath'] as String?;
            if (expandedPath != null) {
              widget.onInput(
                expandedPath,
                allowMultiple ? _expandedItems.toList() : (_expandedItems.isNotEmpty ? _expandedItems.first : null),
              );
            }
          },
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: ((item['children'] as List<dynamic>?)
                        ?.map((e) => Map<String, dynamic>.from(e as Map))
                        .toList() ??
                    []).asMap().entries.map((childEntry) {
                  return widget.renderChild(
                    childEntry.value,
                    key: ValueKey('accordion-$index-child-${childEntry.key}'),
                  );
                }).toList(),
              ),
            ),
          ],
        );

        // Apply variant styling
        if (variant == 'bordered') {
          tile = Container(
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(8),
            ),
            child: tile,
          );
        } else if (variant == 'separated') {
          tile = Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: tile,
          );
        }

        return tile;
      }).toList(),
    );
  }
}
