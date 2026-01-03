import 'package:flutter/material.dart';
import 'types.dart';

/// Main Surface Renderer Widget
class CCSurfaceRenderer extends StatelessWidget {
  final Surface surface;
  final Map<String, dynamic> dataModel;
  final void Function(CCAction action) onAction;
  final void Function(Map<String, dynamic> dataModel) onDataModelChange;

  const CCSurfaceRenderer({
    super.key,
    required this.surface,
    required this.dataModel,
    required this.onAction,
    required this.onDataModelChange,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (surface.title != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Text(
              surface.title!,
              style: Theme.of(context).textTheme.headlineMedium,
            ),
          ),
        ...surface.components.map((c) => _ComponentRenderer(
              component: c,
              dataModel: dataModel,
              onAction: onAction,
              onDataModelChange: onDataModelChange,
            )),
      ],
    );
  }
}

/// Component Renderer - dispatches to specific component widgets
class _ComponentRenderer extends StatelessWidget {
  final CCComponent component;
  final Map<String, dynamic> dataModel;
  final void Function(CCAction action) onAction;
  final void Function(Map<String, dynamic> dataModel) onDataModelChange;
  final String? itemPrefix;

  const _ComponentRenderer({
    required this.component,
    required this.dataModel,
    required this.onAction,
    required this.onDataModelChange,
    this.itemPrefix,
  });

  dynamic _getByPointer(String? path) {
    if (path == null || path.isEmpty) return null;

    String resolvedPath = path;
    if (itemPrefix != null && path.startsWith('/item')) {
      resolvedPath = itemPrefix! + path.substring(5);
    }

    final parts = resolvedPath.split('/').where((p) => p.isNotEmpty).toList();
    dynamic current = dataModel;
    for (final part in parts) {
      if (current is Map) {
        current = current[part];
      } else if (current is List) {
        final index = int.tryParse(part);
        if (index != null && index < current.length) {
          current = current[index];
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
    return current;
  }

  void _setByPointer(String path, dynamic value) {
    String resolvedPath = path;
    if (itemPrefix != null && path.startsWith('/item')) {
      resolvedPath = itemPrefix! + path.substring(5);
    }

    final parts = resolvedPath.split('/').where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) {
      if (value is Map) {
        onDataModelChange(Map<String, dynamic>.from(value));
      }
      return;
    }

    final result = Map<String, dynamic>.from(dataModel);
    dynamic current = result;

    for (int i = 0; i < parts.length - 1; i++) {
      final part = parts[i];
      if (current is Map) {
        if (!current.containsKey(part) || current[part] is! Map) {
          current[part] = <String, dynamic>{};
        }
        current[part] = Map<String, dynamic>.from(current[part] as Map);
        current = current[part];
      }
    }

    if (current is Map) {
      current[parts.last] = value;
    }
    onDataModelChange(result);
  }

  bool _evaluateVisibility() {
    final visibleIf = component.visibleIf;
    if (visibleIf == null) return true;

    if (visibleIf is String) {
      final value = _getByPointer(visibleIf);
      return _isTruthy(value);
    }

    if (visibleIf is Map) {
      final path = visibleIf['path'] as String?;
      if (path == null) return true;

      dynamic value = _getByPointer(path);

      // Apply expression if present
      final expr = visibleIf['expr'] as String?;
      if (expr != null && value is List) {
        switch (expr) {
          case 'count':
          case 'length':
            value = value.length;
            break;
          case 'any':
            value = value.isNotEmpty;
            break;
          case 'none':
            value = value.isEmpty;
            break;
        }
      }

      // Check conditions
      if (visibleIf.containsKey('eq')) {
        return value == visibleIf['eq'];
      }
      if (visibleIf.containsKey('neq')) {
        return value != visibleIf['neq'];
      }
      if (visibleIf.containsKey('gt') && value is num) {
        return value > (visibleIf['gt'] as num);
      }
      if (visibleIf.containsKey('gte') && value is num) {
        return value >= (visibleIf['gte'] as num);
      }
      if (visibleIf.containsKey('lt') && value is num) {
        return value < (visibleIf['lt'] as num);
      }
      if (visibleIf.containsKey('lte') && value is num) {
        return value <= (visibleIf['lte'] as num);
      }

      return _isTruthy(value);
    }

    return true;
  }

  bool _isTruthy(dynamic value) {
    if (value == null) return false;
    if (value is bool) return value;
    if (value is num) return value != 0;
    if (value is String) return value.isNotEmpty;
    if (value is List) return value.isNotEmpty;
    if (value is Map) return value.isNotEmpty;
    return true;
  }

  @override
  Widget build(BuildContext context) {
    if (!_evaluateVisibility()) {
      return const SizedBox.shrink();
    }

    Widget child = _buildComponent(context);
    child = _applyStyle(child);
    return child;
  }

  Widget _applyStyle(Widget child) {
    final style = component.style;
    if (style == null) return child;

    EdgeInsets? padding;
    EdgeInsets? margin;

    if (style.padding != null) {
      padding = _parseSpacing(style.padding);
    }
    if (style.margin != null) {
      margin = _parseSpacing(style.margin);
    }

    BoxDecoration? decoration;
    if (style.backgroundColor != null ||
        style.borderRadius != null ||
        style.borderColor != null) {
      decoration = BoxDecoration(
        color: style.backgroundColor != null
            ? _parseColor(style.backgroundColor!)
            : null,
        borderRadius: style.borderRadius != null
            ? BorderRadius.circular(style.borderRadius!)
            : null,
        border: style.borderColor != null
            ? Border.all(
                color: _parseColor(style.borderColor!),
                width: style.borderWidth ?? 1,
              )
            : null,
      );
    }

    if (padding != null || margin != null || decoration != null) {
      child = Container(
        padding: padding,
        margin: margin,
        decoration: decoration,
        child: child,
      );
    }

    if (style.opacity != null) {
      child = Opacity(opacity: style.opacity!, child: child);
    }

    return child;
  }

  EdgeInsets _parseSpacing(dynamic spacing) {
    if (spacing is num) {
      return EdgeInsets.all(spacing.toDouble());
    }
    if (spacing is Map) {
      return EdgeInsets.only(
        top: (spacing['top'] as num?)?.toDouble() ?? 0,
        right: (spacing['right'] as num?)?.toDouble() ?? 0,
        bottom: (spacing['bottom'] as num?)?.toDouble() ?? 0,
        left: (spacing['left'] as num?)?.toDouble() ?? 0,
      );
    }
    return EdgeInsets.zero;
  }

  Color _parseColor(String colorStr) {
    if (colorStr.startsWith('#')) {
      final hex = colorStr.substring(1);
      if (hex.length == 6) {
        return Color(int.parse('FF$hex', radix: 16));
      }
      if (hex.length == 8) {
        return Color(int.parse(hex, radix: 16));
      }
    }
    // Named colors
    switch (colorStr.toLowerCase()) {
      case 'red':
        return Colors.red;
      case 'blue':
        return Colors.blue;
      case 'green':
        return Colors.green;
      case 'yellow':
        return Colors.yellow;
      case 'orange':
        return Colors.orange;
      case 'purple':
        return Colors.purple;
      case 'pink':
        return Colors.pink;
      case 'black':
        return Colors.black;
      case 'white':
        return Colors.white;
      case 'grey':
      case 'gray':
        return Colors.grey;
      default:
        return Colors.transparent;
    }
  }

  Widget _buildComponent(BuildContext context) {
    final props = component.props;

    switch (component.component) {
      case 'Row':
        return _buildRow(context, props);
      case 'Column':
        return _buildColumn(context, props);
      case 'Card':
        return _buildCard(context, props);
      case 'Text':
        return _buildText(context, props);
      case 'TextField':
        return _buildTextField(context, props);
      case 'Button':
        return _buildButton(context, props);
      case 'Checkbox':
        return _buildCheckbox(context, props);
      case 'Slider':
        return _buildSlider(context, props);
      case 'Select':
        return _buildSelect(context, props);
      case 'Image':
        return _buildImage(context, props);
      case 'Icon':
        return _buildIcon(context, props);
      case 'Divider':
        return _buildDivider(context, props);
      case 'Progress':
        return _buildProgress(context, props);
      case 'Badge':
        return _buildBadge(context, props);
      case 'Avatar':
        return _buildAvatar(context, props);
      case 'Alert':
        return _buildAlert(context, props);
      case 'List':
        return _buildList(context, props);
      case 'Tabs':
        return _buildTabs(context, props);
      case 'Accordion':
        return _buildAccordion(context, props);
      case 'Link':
        return _buildLink(context, props);
      case 'Skeleton':
        return _buildSkeleton(context, props);
      default:
        return Container(
          padding: const EdgeInsets.all(8),
          color: Colors.yellow.shade100,
          child: Text('Unknown component: ${component.component}'),
        );
    }
  }

  Widget _buildRow(BuildContext context, Map<String, dynamic> props) {
    final children = (props['children'] as List<CCComponent>?) ?? [];
    final gap = (props['gap'] as num?)?.toDouble() ?? 0;
    final align = props['align'] as String?;
    final justify = props['justify'] as String?;
    final wrap = props['wrap'] as bool? ?? false;

    final widgets = children.map((c) => _ComponentRenderer(
          component: c,
          dataModel: dataModel,
          onAction: onAction,
          onDataModelChange: onDataModelChange,
          itemPrefix: itemPrefix,
        ));

    if (wrap) {
      return Wrap(
        spacing: gap,
        runSpacing: gap,
        alignment: _mapWrapAlignment(justify),
        crossAxisAlignment: _mapWrapCrossAlignment(align),
        children: widgets.toList(),
      );
    }

    return Row(
      mainAxisAlignment: _mapMainAxisAlignment(justify),
      crossAxisAlignment: _mapCrossAxisAlignment(align),
      children: _insertGaps(widgets.toList(), gap),
    );
  }

  Widget _buildColumn(BuildContext context, Map<String, dynamic> props) {
    final children = (props['children'] as List<CCComponent>?) ?? [];
    final gap = (props['gap'] as num?)?.toDouble() ?? 0;
    final align = props['align'] as String?;

    final widgets = children.map((c) => _ComponentRenderer(
          component: c,
          dataModel: dataModel,
          onAction: onAction,
          onDataModelChange: onDataModelChange,
          itemPrefix: itemPrefix,
        ));

    return Column(
      crossAxisAlignment: _mapCrossAxisAlignment(align),
      children: _insertGaps(widgets.toList(), gap),
    );
  }

  Widget _buildCard(BuildContext context, Map<String, dynamic> props) {
    final children = (props['children'] as List<CCComponent>?) ?? [];
    final elevated = props['elevated'] as bool? ?? true;

    return Card(
      elevation: elevated ? 2 : 0,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: children.map((c) => _ComponentRenderer(
                component: c,
                dataModel: dataModel,
                onAction: onAction,
                onDataModelChange: onDataModelChange,
                itemPrefix: itemPrefix,
              )).toList(),
        ),
      ),
    );
  }

  Widget _buildText(BuildContext context, Map<String, dynamic> props) {
    final content = props['content'] as String?;
    final contentPath = props['contentPath'] as String?;
    final textStyle = props['textStyle'] as String?;
    final color = props['color'] as String?;

    String displayText = content ?? '';
    if (contentPath != null) {
      final value = _getByPointer(contentPath);
      displayText = value?.toString() ?? '';
    }

    TextStyle style = const TextStyle();
    switch (textStyle) {
      case 'heading1':
        style = Theme.of(context).textTheme.headlineLarge!;
        break;
      case 'heading2':
        style = Theme.of(context).textTheme.headlineMedium!;
        break;
      case 'heading3':
        style = Theme.of(context).textTheme.headlineSmall!;
        break;
      case 'body':
        style = Theme.of(context).textTheme.bodyLarge!;
        break;
      case 'caption':
        style = Theme.of(context).textTheme.bodySmall!;
        break;
      case 'code':
        style = const TextStyle(fontFamily: 'monospace');
        break;
    }

    if (color != null) {
      style = style.copyWith(color: _parseColor(color));
    }

    return Text(displayText, style: style);
  }

  Widget _buildTextField(BuildContext context, Map<String, dynamic> props) {
    final valuePath = props['valuePath'] as String?;
    final label = props['label'] as String?;
    final placeholder = props['placeholder'] as String?;
    final disabled = props['disabled'] as bool? ?? false;
    final multiline = props['multiline'] as bool? ?? false;
    final rows = props['rows'] as int? ?? 3;

    final value = valuePath != null ? _getByPointer(valuePath) : null;

    return TextField(
      controller: TextEditingController(text: value?.toString() ?? ''),
      decoration: InputDecoration(
        labelText: label,
        hintText: placeholder,
        border: const OutlineInputBorder(),
      ),
      enabled: !disabled,
      maxLines: multiline ? rows : 1,
      onChanged: valuePath != null
          ? (text) => _setByPointer(valuePath, text)
          : null,
    );
  }

  Widget _buildButton(BuildContext context, Map<String, dynamic> props) {
    final label = props['label'] as String? ?? '';
    final variant = props['variant'] as String? ?? 'primary';
    final disabled = props['disabled'] as bool? ?? false;
    final loading = props['loading'] as bool? ?? false;
    final action = props['action'] as CCAction?;
    final iconName = props['icon'] as String?;

    Widget? icon;
    if (iconName != null) {
      icon = Icon(_mapIconName(iconName), size: 18);
    }
    if (loading) {
      icon = const SizedBox(
        width: 18,
        height: 18,
        child: CircularProgressIndicator(strokeWidth: 2),
      );
    }

    void handlePress() {
      if (action != null && !disabled && !loading) {
        onAction(action);
      }
    }

    switch (variant) {
      case 'secondary':
        return FilledButton.tonal(
          onPressed: disabled || loading ? null : handlePress,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[icon, const SizedBox(width: 8)],
              Text(label),
            ],
          ),
        );
      case 'outline':
        return OutlinedButton(
          onPressed: disabled || loading ? null : handlePress,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[icon, const SizedBox(width: 8)],
              Text(label),
            ],
          ),
        );
      case 'ghost':
        return TextButton(
          onPressed: disabled || loading ? null : handlePress,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[icon, const SizedBox(width: 8)],
              Text(label),
            ],
          ),
        );
      case 'danger':
        return FilledButton(
          onPressed: disabled || loading ? null : handlePress,
          style: FilledButton.styleFrom(backgroundColor: Colors.red),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[icon, const SizedBox(width: 8)],
              Text(label),
            ],
          ),
        );
      default:
        return FilledButton(
          onPressed: disabled || loading ? null : handlePress,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[icon, const SizedBox(width: 8)],
              Text(label),
            ],
          ),
        );
    }
  }

  Widget _buildCheckbox(BuildContext context, Map<String, dynamic> props) {
    final valuePath = props['valuePath'] as String?;
    final label = props['label'] as String?;
    final disabled = props['disabled'] as bool? ?? false;

    final value = valuePath != null ? _getByPointer(valuePath) as bool? : false;

    return Row(
      children: [
        Checkbox(
          value: value ?? false,
          onChanged: disabled || valuePath == null
              ? null
              : (v) => _setByPointer(valuePath, v ?? false),
        ),
        if (label != null) Text(label),
      ],
    );
  }

  Widget _buildSlider(BuildContext context, Map<String, dynamic> props) {
    final valuePath = props['valuePath'] as String?;
    final label = props['label'] as String?;
    final min = (props['min'] as num?)?.toDouble() ?? 0;
    final max = (props['max'] as num?)?.toDouble() ?? 100;
    final step = (props['step'] as num?)?.toDouble();
    final disabled = props['disabled'] as bool? ?? false;
    final showValue = props['showValue'] as bool? ?? true;
    final fillColor = props['fillColor'] as String?;

    final value = valuePath != null
        ? (_getByPointer(valuePath) as num?)?.toDouble() ?? min
        : min;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label),
              if (showValue) Text(value.toStringAsFixed(step != null && step >= 1 ? 0 : 1)),
            ],
          ),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: fillColor != null ? _parseColor(fillColor) : null,
            thumbColor: fillColor != null ? _parseColor(fillColor) : null,
          ),
          child: Slider(
            value: value.clamp(min, max),
            min: min,
            max: max,
            divisions: step != null ? ((max - min) / step).round() : null,
            onChanged: disabled || valuePath == null
                ? null
                : (v) => _setByPointer(valuePath, v),
          ),
        ),
      ],
    );
  }

  Widget _buildSelect(BuildContext context, Map<String, dynamic> props) {
    final valuePath = props['valuePath'] as String?;
    final label = props['label'] as String?;
    final placeholder = props['placeholder'] as String?;
    final options = (props['options'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final disabled = props['disabled'] as bool? ?? false;

    final value = valuePath != null ? _getByPointer(valuePath) as String? : null;

    return DropdownButtonFormField<String>(
      value: value,
      decoration: InputDecoration(
        labelText: label,
        hintText: placeholder,
        border: const OutlineInputBorder(),
      ),
      items: options.map((opt) {
        return DropdownMenuItem(
          value: opt['value'] as String,
          child: Text(opt['label'] as String),
        );
      }).toList(),
      onChanged: disabled || valuePath == null
          ? null
          : (v) => _setByPointer(valuePath, v),
    );
  }

  Widget _buildImage(BuildContext context, Map<String, dynamic> props) {
    final src = props['src'] as String?;
    final srcPath = props['srcPath'] as String?;
    final alt = props['alt'] as String?;
    final fit = props['fit'] as String?;

    final url = src ?? (srcPath != null ? _getByPointer(srcPath) as String? : null);

    if (url == null || url.isEmpty) {
      return Container(
        color: Colors.grey.shade200,
        child: Center(child: Text(alt ?? 'No image')),
      );
    }

    BoxFit boxFit = BoxFit.cover;
    switch (fit) {
      case 'contain':
        boxFit = BoxFit.contain;
        break;
      case 'fill':
        boxFit = BoxFit.fill;
        break;
      case 'none':
        boxFit = BoxFit.none;
        break;
    }

    return Image.network(
      url,
      fit: boxFit,
      semanticLabel: alt,
      errorBuilder: (_, __, ___) => Container(
        color: Colors.grey.shade200,
        child: const Icon(Icons.broken_image),
      ),
    );
  }

  Widget _buildIcon(BuildContext context, Map<String, dynamic> props) {
    final name = props['name'] as String? ?? 'help';
    final size = (props['size'] as num?)?.toDouble() ?? 24;
    final color = props['color'] as String?;

    return Icon(
      _mapIconName(name),
      size: size,
      color: color != null ? _parseColor(color) : null,
    );
  }

  Widget _buildDivider(BuildContext context, Map<String, dynamic> props) {
    final vertical = props['vertical'] as bool? ?? false;

    if (vertical) {
      return const VerticalDivider();
    }
    return const Divider();
  }

  Widget _buildProgress(BuildContext context, Map<String, dynamic> props) {
    final value = props['value'] as num?;
    final valuePath = props['valuePath'] as String?;
    final variant = props['variant'] as String? ?? 'linear';
    final color = props['color'] as String?;
    final showLabel = props['showLabel'] as bool? ?? false;

    double? progress;
    if (value != null) {
      progress = value / 100;
    } else if (valuePath != null) {
      final pathValue = _getByPointer(valuePath) as num?;
      if (pathValue != null) {
        progress = pathValue / 100;
      }
    }

    final progressColor = color != null ? _parseColor(color) : null;

    Widget progressWidget;
    if (variant == 'circular') {
      progressWidget = SizedBox(
        width: 40,
        height: 40,
        child: CircularProgressIndicator(
          value: progress,
          color: progressColor,
        ),
      );
    } else {
      progressWidget = LinearProgressIndicator(
        value: progress,
        color: progressColor,
      );
    }

    if (showLabel && progress != null) {
      return Column(
        children: [
          progressWidget,
          const SizedBox(height: 4),
          Text('${(progress * 100).round()}%'),
        ],
      );
    }

    return progressWidget;
  }

  Widget _buildBadge(BuildContext context, Map<String, dynamic> props) {
    final content = props['content'] as String?;
    final contentPath = props['contentPath'] as String?;
    final variant = props['variant'] as String? ?? 'default';
    final pill = props['pill'] as bool? ?? false;

    String text = content ?? '';
    if (contentPath != null) {
      text = _getByPointer(contentPath)?.toString() ?? '';
    }

    Color bgColor;
    switch (variant) {
      case 'success':
        bgColor = Colors.green;
        break;
      case 'warning':
        bgColor = Colors.orange;
        break;
      case 'error':
        bgColor = Colors.red;
        break;
      case 'info':
        bgColor = Colors.blue;
        break;
      default:
        bgColor = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(pill ? 50 : 4),
      ),
      child: Text(
        text,
        style: const TextStyle(color: Colors.white, fontSize: 12),
      ),
    );
  }

  Widget _buildAvatar(BuildContext context, Map<String, dynamic> props) {
    final src = props['src'] as String?;
    final srcPath = props['srcPath'] as String?;
    final initials = props['initials'] as String?;
    final size = props['size'];

    double radius = 20;
    if (size is num) {
      radius = size / 2;
    } else if (size == 'small') {
      radius = 16;
    } else if (size == 'large') {
      radius = 32;
    }

    final url = src ?? (srcPath != null ? _getByPointer(srcPath) as String? : null);

    if (url != null && url.isNotEmpty) {
      return CircleAvatar(
        radius: radius,
        backgroundImage: NetworkImage(url),
      );
    }

    return CircleAvatar(
      radius: radius,
      child: Text(initials ?? '?'),
    );
  }

  Widget _buildAlert(BuildContext context, Map<String, dynamic> props) {
    final title = props['title'] as String?;
    final message = props['message'] as String? ?? '';
    final variant = props['variant'] as String? ?? 'info';
    final showIcon = props['showIcon'] as bool? ?? true;

    Color bgColor;
    IconData icon;
    switch (variant) {
      case 'success':
        bgColor = Colors.green.shade50;
        icon = Icons.check_circle;
        break;
      case 'warning':
        bgColor = Colors.orange.shade50;
        icon = Icons.warning;
        break;
      case 'error':
        bgColor = Colors.red.shade50;
        icon = Icons.error;
        break;
      default:
        bgColor = Colors.blue.shade50;
        icon = Icons.info;
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showIcon) ...[
            Icon(icon, size: 20),
            const SizedBox(width: 8),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (title != null)
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(message),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildList(BuildContext context, Map<String, dynamic> props) {
    final itemsPath = props['itemsPath'] as String?;
    final itemTemplate = props['itemTemplate'] as CCComponent?;
    final emptyMessage = props['emptyMessage'] as String? ?? 'No items';
    final gap = (props['gap'] as num?)?.toDouble() ?? 0;

    if (itemsPath == null || itemTemplate == null) {
      return Text(emptyMessage);
    }

    final items = _getByPointer(itemsPath) as List?;
    if (items == null || items.isEmpty) {
      return Text(emptyMessage);
    }

    return Column(
      children: _insertGaps(
        items.asMap().entries.map((entry) {
          final index = entry.key;
          final itemPath = '$itemsPath/$index';
          return _ComponentRenderer(
            component: itemTemplate,
            dataModel: dataModel,
            onAction: onAction,
            onDataModelChange: onDataModelChange,
            itemPrefix: itemPath,
          );
        }).toList(),
        gap,
      ),
    );
  }

  Widget _buildTabs(BuildContext context, Map<String, dynamic> props) {
    final valuePath = props['valuePath'] as String?;
    final tabs = (props['tabs'] as List?)?.cast<Map<String, dynamic>>() ?? [];

    final currentValue = valuePath != null ? _getByPointer(valuePath) as String? : null;
    final activeIndex = tabs.indexWhere((t) => t['value'] == currentValue);
    final safeIndex = activeIndex >= 0 ? activeIndex : 0;

    return DefaultTabController(
      length: tabs.length,
      initialIndex: safeIndex,
      child: Column(
        children: [
          TabBar(
            onTap: valuePath != null
                ? (index) => _setByPointer(valuePath, tabs[index]['value'])
                : null,
            tabs: tabs.map((tab) {
              return Tab(text: tab['label'] as String?);
            }).toList(),
          ),
          if (tabs.isNotEmpty && safeIndex < tabs.length)
            Padding(
              padding: const EdgeInsets.only(top: 16),
              child: Column(
                children: ((tabs[safeIndex]['children'] as List<CCComponent>?) ?? [])
                    .map((c) => _ComponentRenderer(
                          component: c,
                          dataModel: dataModel,
                          onAction: onAction,
                          onDataModelChange: onDataModelChange,
                          itemPrefix: itemPrefix,
                        ))
                    .toList(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildAccordion(BuildContext context, Map<String, dynamic> props) {
    final items = (props['items'] as List?)?.cast<Map<String, dynamic>>() ?? [];

    return Column(
      children: items.map((item) {
        final title = item['title'] as String? ?? '';
        final children = (item['children'] as List<CCComponent>?) ?? [];

        return ExpansionTile(
          title: Text(title),
          children: children.map((c) => Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: _ComponentRenderer(
              component: c,
              dataModel: dataModel,
              onAction: onAction,
              onDataModelChange: onDataModelChange,
              itemPrefix: itemPrefix,
            ),
          )).toList(),
        );
      }).toList(),
    );
  }

  Widget _buildLink(BuildContext context, Map<String, dynamic> props) {
    final label = props['label'] as String? ?? '';
    final href = props['href'] as String?;

    return InkWell(
      onTap: href != null ? () {} : null, // Would need url_launcher for actual navigation
      child: Text(
        label,
        style: TextStyle(
          color: Theme.of(context).colorScheme.primary,
          decoration: TextDecoration.underline,
        ),
      ),
    );
  }

  Widget _buildSkeleton(BuildContext context, Map<String, dynamic> props) {
    final variant = props['variant'] as String? ?? 'text';
    final width = props['width'];
    final height = props['height'];

    double? w = width is num ? width.toDouble() : null;
    double? h = height is num ? height.toDouble() : null;

    switch (variant) {
      case 'circular':
        return Container(
          width: w ?? 40,
          height: h ?? 40,
          decoration: BoxDecoration(
            color: Colors.grey.shade300,
            shape: BoxShape.circle,
          ),
        );
      case 'rectangular':
        return Container(
          width: w ?? double.infinity,
          height: h ?? 100,
          color: Colors.grey.shade300,
        );
      default:
        return Container(
          width: w ?? double.infinity,
          height: h ?? 16,
          decoration: BoxDecoration(
            color: Colors.grey.shade300,
            borderRadius: BorderRadius.circular(4),
          ),
        );
    }
  }

  // Helper methods
  List<Widget> _insertGaps(List<Widget> widgets, double gap) {
    if (gap <= 0 || widgets.isEmpty) return widgets;

    final result = <Widget>[];
    for (int i = 0; i < widgets.length; i++) {
      result.add(widgets[i]);
      if (i < widgets.length - 1) {
        result.add(SizedBox(width: gap, height: gap));
      }
    }
    return result;
  }

  MainAxisAlignment _mapMainAxisAlignment(String? value) {
    switch (value) {
      case 'start':
        return MainAxisAlignment.start;
      case 'center':
        return MainAxisAlignment.center;
      case 'end':
        return MainAxisAlignment.end;
      case 'spaceBetween':
        return MainAxisAlignment.spaceBetween;
      case 'spaceAround':
        return MainAxisAlignment.spaceAround;
      default:
        return MainAxisAlignment.start;
    }
  }

  CrossAxisAlignment _mapCrossAxisAlignment(String? value) {
    switch (value) {
      case 'start':
        return CrossAxisAlignment.start;
      case 'center':
        return CrossAxisAlignment.center;
      case 'end':
        return CrossAxisAlignment.end;
      case 'stretch':
        return CrossAxisAlignment.stretch;
      default:
        return CrossAxisAlignment.start;
    }
  }

  WrapAlignment _mapWrapAlignment(String? value) {
    switch (value) {
      case 'start':
        return WrapAlignment.start;
      case 'center':
        return WrapAlignment.center;
      case 'end':
        return WrapAlignment.end;
      case 'spaceBetween':
        return WrapAlignment.spaceBetween;
      case 'spaceAround':
        return WrapAlignment.spaceAround;
      default:
        return WrapAlignment.start;
    }
  }

  WrapCrossAlignment _mapWrapCrossAlignment(String? value) {
    switch (value) {
      case 'start':
        return WrapCrossAlignment.start;
      case 'center':
        return WrapCrossAlignment.center;
      case 'end':
        return WrapCrossAlignment.end;
      default:
        return WrapCrossAlignment.start;
    }
  }

  IconData _mapIconName(String name) {
    switch (name.toLowerCase()) {
      case 'add':
      case 'plus':
        return Icons.add;
      case 'remove':
      case 'minus':
        return Icons.remove;
      case 'close':
      case 'x':
        return Icons.close;
      case 'check':
        return Icons.check;
      case 'edit':
      case 'pencil':
        return Icons.edit;
      case 'delete':
      case 'trash':
        return Icons.delete;
      case 'search':
        return Icons.search;
      case 'settings':
      case 'gear':
        return Icons.settings;
      case 'home':
        return Icons.home;
      case 'user':
      case 'person':
        return Icons.person;
      case 'mail':
      case 'email':
        return Icons.mail;
      case 'phone':
        return Icons.phone;
      case 'star':
        return Icons.star;
      case 'heart':
      case 'favorite':
        return Icons.favorite;
      case 'info':
        return Icons.info;
      case 'warning':
        return Icons.warning;
      case 'error':
        return Icons.error;
      case 'success':
      case 'check_circle':
        return Icons.check_circle;
      case 'arrow_left':
      case 'chevron_left':
        return Icons.chevron_left;
      case 'arrow_right':
      case 'chevron_right':
        return Icons.chevron_right;
      case 'arrow_up':
        return Icons.arrow_upward;
      case 'arrow_down':
        return Icons.arrow_downward;
      case 'menu':
        return Icons.menu;
      case 'more':
      case 'more_vert':
        return Icons.more_vert;
      case 'download':
        return Icons.download;
      case 'upload':
        return Icons.upload;
      case 'share':
        return Icons.share;
      case 'copy':
        return Icons.copy;
      case 'paste':
        return Icons.paste;
      case 'refresh':
        return Icons.refresh;
      case 'sync':
        return Icons.sync;
      case 'calendar':
        return Icons.calendar_today;
      case 'clock':
      case 'time':
        return Icons.access_time;
      case 'location':
      case 'map':
        return Icons.location_on;
      case 'link':
        return Icons.link;
      case 'image':
      case 'photo':
        return Icons.image;
      case 'video':
        return Icons.videocam;
      case 'music':
      case 'audio':
        return Icons.music_note;
      case 'file':
      case 'document':
        return Icons.insert_drive_file;
      case 'folder':
        return Icons.folder;
      default:
        return Icons.help_outline;
    }
  }
}
