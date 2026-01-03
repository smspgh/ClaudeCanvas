import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// List component for rendering dynamic arrays
class CcList extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final Widget Function(Map<String, dynamic> component, {Key? key}) renderChild;

  const CcList({
    super.key,
    required this.component,
    required this.dataModel,
    required this.renderChild,
  });

  @override
  Widget build(BuildContext context) {
    final itemsPath = component['itemsPath'] as String?;
    final itemTemplate = component['itemTemplate'] as Map<String, dynamic>?;
    final emptyMessage = component['emptyMessage'] as String?;
    final gap = (component['gap'] as num?)?.toDouble() ?? 0;
    final alternateBackground = component['alternateBackground'] as bool? ?? false;

    if (itemsPath == null || itemTemplate == null) {
      return const SizedBox.shrink();
    }

    final items = getByPointer(dataModel, itemsPath);
    if (items is! List || items.isEmpty) {
      if (emptyMessage != null) {
        return Padding(
          padding: const EdgeInsets.all(16),
          child: Center(
            child: Text(emptyMessage, style: TextStyle(color: Colors.grey[600])),
          ),
        );
      }
      return const SizedBox.shrink();
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items.asMap().entries.map((entry) {
        final index = entry.key;
        final item = entry.value;

        // Create scoped data model with item and index
        final scopedDataModel = Map<String, dynamic>.from(dataModel);
        scopedDataModel['item'] = item;
        scopedDataModel['index'] = index;

        // Interpolate paths in template
        final interpolatedTemplate = _interpolateTemplate(itemTemplate, item, index);

        Widget child = _renderWithScopedData(interpolatedTemplate, scopedDataModel, index);

        // Apply alternate background
        if (alternateBackground && index % 2 == 1) {
          child = Container(
            color: Colors.grey[50],
            child: child,
          );
        }

        // Apply gap
        if (index > 0 && gap > 0) {
          child = Padding(
            padding: EdgeInsets.only(top: gap),
            child: child,
          );
        }

        return child;
      }).toList(),
    );
  }

  Map<String, dynamic> _interpolateTemplate(
    Map<String, dynamic> template,
    dynamic item,
    int index,
  ) {
    final result = Map<String, dynamic>.from(template);

    for (final key in result.keys) {
      final value = result[key];
      if (value is String && value.contains('{')) {
        result[key] = interpolatePath(value, item, index);
      } else if (value is Map<String, dynamic>) {
        result[key] = _interpolateTemplate(value, item, index);
      } else if (value is List) {
        result[key] = value.map((v) {
          if (v is Map<String, dynamic>) {
            return _interpolateTemplate(v, item, index);
          }
          return v;
        }).toList();
      }
    }

    return result;
  }

  Widget _renderWithScopedData(
    Map<String, dynamic> template,
    Map<String, dynamic> scopedDataModel,
    int index,
  ) {
    // For simplicity, we render using the main renderChild function
    // In a more complete implementation, we'd pass the scoped data model
    return renderChild(template, key: ValueKey('list-item-$index'));
  }
}
