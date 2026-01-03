/// ClaudeCanvas Core Types for Flutter
/// Mirrors the TypeScript types from @claude-canvas/core

class Surface {
  final String id;
  final String? title;
  final List<CCComponent> components;

  Surface({
    required this.id,
    this.title,
    required this.components,
  });

  factory Surface.fromJson(Map<String, dynamic> json) {
    return Surface(
      id: json['id'] as String,
      title: json['title'] as String?,
      components: (json['components'] as List?)
              ?.map((c) => CCComponent.fromJson(c as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class CCAction {
  final String type;
  final String? event;
  final Map<String, dynamic>? payload;
  final String? dataPath;
  final String? path;
  final dynamic value;

  CCAction({
    required this.type,
    this.event,
    this.payload,
    this.dataPath,
    this.path,
    this.value,
  });

  factory CCAction.fromJson(Map<String, dynamic> json) {
    return CCAction(
      type: json['type'] as String,
      event: json['event'] as String?,
      payload: json['payload'] as Map<String, dynamic>?,
      dataPath: json['dataPath'] as String?,
      path: json['path'] as String?,
      value: json['value'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      if (event != null) 'event': event,
      if (payload != null) 'payload': payload,
      if (dataPath != null) 'dataPath': dataPath,
      if (path != null) 'path': path,
      if (value != null) 'value': value,
    };
  }
}

class ComponentStyle {
  final dynamic padding;
  final dynamic margin;
  final String? backgroundColor;
  final String? background;
  final double? borderRadius;
  final String? borderColor;
  final double? borderWidth;
  final dynamic width;
  final dynamic height;
  final dynamic minWidth;
  final dynamic maxWidth;
  final double? flex;
  final double? opacity;

  ComponentStyle({
    this.padding,
    this.margin,
    this.backgroundColor,
    this.background,
    this.borderRadius,
    this.borderColor,
    this.borderWidth,
    this.width,
    this.height,
    this.minWidth,
    this.maxWidth,
    this.flex,
    this.opacity,
  });

  factory ComponentStyle.fromJson(Map<String, dynamic>? json) {
    if (json == null) return ComponentStyle();
    return ComponentStyle(
      padding: json['padding'],
      margin: json['margin'],
      backgroundColor: json['backgroundColor'] as String?,
      background: json['background'] as String?,
      borderRadius: (json['borderRadius'] as num?)?.toDouble(),
      borderColor: json['borderColor'] as String?,
      borderWidth: (json['borderWidth'] as num?)?.toDouble(),
      width: json['width'],
      height: json['height'],
      minWidth: json['minWidth'],
      maxWidth: json['maxWidth'],
      flex: (json['flex'] as num?)?.toDouble(),
      opacity: (json['opacity'] as num?)?.toDouble(),
    );
  }
}

class CCComponent {
  final String component;
  final String? id;
  final ComponentStyle? style;
  final dynamic visibleIf;
  final Map<String, dynamic> props;

  CCComponent({
    required this.component,
    this.id,
    this.style,
    this.visibleIf,
    required this.props,
  });

  factory CCComponent.fromJson(Map<String, dynamic> json) {
    final component = json['component'] as String;
    final props = Map<String, dynamic>.from(json);
    props.remove('component');
    props.remove('id');
    props.remove('style');
    props.remove('visibleIf');

    // Parse children if present
    if (props['children'] != null && props['children'] is List) {
      props['children'] = (props['children'] as List)
          .map((c) => CCComponent.fromJson(c as Map<String, dynamic>))
          .toList();
    }

    // Parse itemTemplate if present
    if (props['itemTemplate'] != null && props['itemTemplate'] is Map) {
      props['itemTemplate'] =
          CCComponent.fromJson(props['itemTemplate'] as Map<String, dynamic>);
    }

    // Parse action if present
    if (props['action'] != null && props['action'] is Map) {
      props['action'] =
          CCAction.fromJson(props['action'] as Map<String, dynamic>);
    }

    // Parse tabs if present
    if (props['tabs'] != null && props['tabs'] is List) {
      props['tabs'] = (props['tabs'] as List).map((tab) {
        final tabMap = Map<String, dynamic>.from(tab as Map);
        if (tabMap['children'] != null && tabMap['children'] is List) {
          tabMap['children'] = (tabMap['children'] as List)
              .map((c) => CCComponent.fromJson(c as Map<String, dynamic>))
              .toList();
        }
        return tabMap;
      }).toList();
    }

    // Parse accordion items if present
    if (props['items'] != null && props['items'] is List && component == 'Accordion') {
      props['items'] = (props['items'] as List).map((item) {
        final itemMap = Map<String, dynamic>.from(item as Map);
        if (itemMap['children'] != null && itemMap['children'] is List) {
          itemMap['children'] = (itemMap['children'] as List)
              .map((c) => CCComponent.fromJson(c as Map<String, dynamic>))
              .toList();
        }
        return itemMap;
      }).toList();
    }

    // Parse actions in Alert component
    if (props['actions'] != null && props['actions'] is List) {
      props['actions'] = (props['actions'] as List)
          .map((c) => CCComponent.fromJson(c as Map<String, dynamic>))
          .toList();
    }

    return CCComponent(
      component: component,
      id: json['id'] as String?,
      style: ComponentStyle.fromJson(json['style'] as Map<String, dynamic>?),
      visibleIf: json['visibleIf'],
      props: props,
    );
  }
}
