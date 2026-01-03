/// Core types for ClaudeCanvas Flutter renderer
library;

import 'package:flutter/material.dart';

/// A surface containing UI components
class Surface {
  final String id;
  final String? title;
  final List<Map<String, dynamic>> components;

  Surface({
    required this.id,
    this.title,
    required this.components,
  });

  factory Surface.fromJson(Map<String, dynamic> json) {
    return Surface(
      id: json['id'] as String,
      title: json['title'] as String?,
      components: (json['components'] as List<dynamic>)
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        if (title != null) 'title': title,
        'components': components,
      };
}

/// User action message sent when user interacts with UI
class UserActionMessage {
  final String type = 'userAction';
  final String surfaceId;
  final Action action;
  final Map<String, dynamic> dataModel;

  UserActionMessage({
    required this.surfaceId,
    required this.action,
    required this.dataModel,
  });

  Map<String, dynamic> toJson() => {
        'type': type,
        'surfaceId': surfaceId,
        'action': action.toJson(),
        'dataModel': dataModel,
      };
}

/// Action types
class Action {
  final String type;
  final String? event;
  final String? path;
  final dynamic value;
  final Map<String, dynamic>? payload;

  Action({
    required this.type,
    this.event,
    this.path,
    this.value,
    this.payload,
  });

  factory Action.fromJson(Map<String, dynamic> json) {
    return Action(
      type: json['type'] as String,
      event: json['event'] as String?,
      path: json['path'] as String?,
      value: json['value'],
      payload: json['payload'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() => {
        'type': type,
        if (event != null) 'event': event,
        if (path != null) 'path': path,
        if (value != null) 'value': value,
        if (payload != null) 'payload': payload,
      };
}

/// Agent-to-client message types
abstract class AgentToClientMessage {
  String get type;

  factory AgentToClientMessage.fromJson(Map<String, dynamic> json) {
    switch (json['type']) {
      case 'surfaceUpdate':
        return SurfaceUpdateMessage.fromJson(json);
      case 'dataModelUpdate':
        return DataModelUpdateMessage.fromJson(json);
      case 'deleteSurface':
        return DeleteSurfaceMessage.fromJson(json);
      case 'beginRendering':
        return BeginRenderingMessage.fromJson(json);
      default:
        throw ArgumentError('Unknown message type: ${json['type']}');
    }
  }
}

class SurfaceUpdateMessage implements AgentToClientMessage {
  @override
  final String type = 'surfaceUpdate';
  final Surface surface;

  SurfaceUpdateMessage({required this.surface});

  factory SurfaceUpdateMessage.fromJson(Map<String, dynamic> json) {
    return SurfaceUpdateMessage(
      surface: Surface.fromJson(json['surface'] as Map<String, dynamic>),
    );
  }
}

class DataModelUpdateMessage implements AgentToClientMessage {
  @override
  final String type = 'dataModelUpdate';
  final String path;
  final dynamic data;

  DataModelUpdateMessage({required this.path, required this.data});

  factory DataModelUpdateMessage.fromJson(Map<String, dynamic> json) {
    return DataModelUpdateMessage(
      path: json['path'] as String,
      data: json['data'],
    );
  }
}

class DeleteSurfaceMessage implements AgentToClientMessage {
  @override
  final String type = 'deleteSurface';
  final String surfaceId;

  DeleteSurfaceMessage({required this.surfaceId});

  factory DeleteSurfaceMessage.fromJson(Map<String, dynamic> json) {
    return DeleteSurfaceMessage(
      surfaceId: json['surfaceId'] as String,
    );
  }
}

class BeginRenderingMessage implements AgentToClientMessage {
  @override
  final String type = 'beginRendering';
  final String? surfaceId;

  BeginRenderingMessage({this.surfaceId});

  factory BeginRenderingMessage.fromJson(Map<String, dynamic> json) {
    return BeginRenderingMessage(
      surfaceId: json['surfaceId'] as String?,
    );
  }
}

/// Visibility condition for conditional rendering
class VisibilityCondition {
  final String path;
  final String? expr;
  final dynamic eq;
  final dynamic neq;
  final num? gt;
  final num? gte;
  final num? lt;
  final num? lte;

  VisibilityCondition({
    required this.path,
    this.expr,
    this.eq,
    this.neq,
    this.gt,
    this.gte,
    this.lt,
    this.lte,
  });

  factory VisibilityCondition.fromJson(Map<String, dynamic> json) {
    return VisibilityCondition(
      path: json['path'] as String,
      expr: json['expr'] as String?,
      eq: json['eq'],
      neq: json['neq'],
      gt: json['gt'] as num?,
      gte: json['gte'] as num?,
      lt: json['lt'] as num?,
      lte: json['lte'] as num?,
    );
  }
}

/// Component style configuration
class ComponentStyle {
  final dynamic padding;
  final dynamic margin;
  final String? backgroundColor;
  final String? background;
  final dynamic width;
  final dynamic height;
  final dynamic minWidth;
  final dynamic maxWidth;
  final dynamic minHeight;
  final dynamic maxHeight;
  final num? flex;
  final dynamic borderRadius;
  final String? borderColor;
  final num? borderWidth;
  final num? opacity;

  ComponentStyle({
    this.padding,
    this.margin,
    this.backgroundColor,
    this.background,
    this.width,
    this.height,
    this.minWidth,
    this.maxWidth,
    this.minHeight,
    this.maxHeight,
    this.flex,
    this.borderRadius,
    this.borderColor,
    this.borderWidth,
    this.opacity,
  });

  factory ComponentStyle.fromJson(Map<String, dynamic>? json) {
    if (json == null) return ComponentStyle();
    return ComponentStyle(
      padding: json['padding'],
      margin: json['margin'],
      backgroundColor: json['backgroundColor'] as String?,
      background: json['background'] as String?,
      width: json['width'],
      height: json['height'],
      minWidth: json['minWidth'],
      maxWidth: json['maxWidth'],
      minHeight: json['minHeight'],
      maxHeight: json['maxHeight'],
      flex: json['flex'] as num?,
      borderRadius: json['borderRadius'],
      borderColor: json['borderColor'] as String?,
      borderWidth: json['borderWidth'] as num?,
      opacity: json['opacity'] as num?,
    );
  }

  EdgeInsets? get paddingEdgeInsets => _parseEdgeInsets(padding);
  EdgeInsets? get marginEdgeInsets => _parseEdgeInsets(margin);

  EdgeInsets? _parseEdgeInsets(dynamic value) {
    if (value == null) return null;
    if (value is num) {
      return EdgeInsets.all(value.toDouble());
    }
    if (value is Map) {
      return EdgeInsets.only(
        top: (value['top'] as num?)?.toDouble() ?? 0,
        right: (value['right'] as num?)?.toDouble() ?? 0,
        bottom: (value['bottom'] as num?)?.toDouble() ?? 0,
        left: (value['left'] as num?)?.toDouble() ?? 0,
      );
    }
    return null;
  }

  BorderRadius? get borderRadiusValue {
    if (borderRadius == null) return null;
    if (borderRadius is num) {
      return BorderRadius.circular((borderRadius as num).toDouble());
    }
    return null;
  }

  Color? get backgroundColorValue {
    if (backgroundColor == null) return null;
    return _parseColor(backgroundColor!);
  }

  Color? get borderColorValue {
    if (borderColor == null) return null;
    return _parseColor(borderColor!);
  }

  Color? _parseColor(String color) {
    if (color.startsWith('#')) {
      final hex = color.substring(1);
      if (hex.length == 6) {
        return Color(int.parse('FF$hex', radix: 16));
      } else if (hex.length == 8) {
        return Color(int.parse(hex, radix: 16));
      }
    }
    // Named colors
    switch (color.toLowerCase()) {
      case 'white':
        return Colors.white;
      case 'black':
        return Colors.black;
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
      case 'grey':
      case 'gray':
        return Colors.grey;
      case 'transparent':
        return Colors.transparent;
      default:
        return null;
    }
  }
}

/// Text style variants
enum TextStyleVariant {
  heading1,
  heading2,
  heading3,
  body,
  caption,
  code,
}

/// Button variants
enum ButtonVariant {
  primary,
  secondary,
  outline,
  ghost,
  danger,
}

/// Chart types
enum ChartType {
  bar,
  line,
  pie,
  doughnut,
}

/// Progress variants
enum ProgressVariant {
  linear,
  circular,
}

/// Alert/Toast variants
enum FeedbackVariant {
  info,
  success,
  warning,
  error,
}

/// Avatar shapes
enum AvatarShape {
  circle,
  square,
  rounded,
}

/// Avatar status
enum AvatarStatus {
  online,
  offline,
  busy,
  away,
}

/// Toast positions
enum ToastPosition {
  top,
  topLeft,
  topRight,
  bottom,
  bottomLeft,
  bottomRight,
}

/// Accordion variants
enum AccordionVariant {
  defaultVariant,
  bordered,
  separated,
}

/// Image fit options
enum ImageFit {
  cover,
  contain,
  fill,
  none,
}
