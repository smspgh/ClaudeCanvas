import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// Text component for displaying text content
class CcText extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;

  const CcText({
    super.key,
    required this.component,
    required this.dataModel,
  });

  @override
  Widget build(BuildContext context) {
    String? content = component['content'] as String?;

    // Support contentPath binding
    if (component['contentPath'] != null) {
      final value = getByPointer(dataModel, component['contentPath'] as String);
      content = value?.toString();
    }

    if (content == null || content.isEmpty) {
      return const SizedBox.shrink();
    }

    final textStyle = _getTextStyle(context, component['textStyle'] as String?);
    final color = _parseColor(component['color'] as String?);
    final markdown = component['markdown'] as bool? ?? false;

    // For markdown support, we'd need flutter_markdown package
    // For now, render as plain text
    return Text(
      content,
      style: textStyle.copyWith(color: color),
    );
  }

  TextStyle _getTextStyle(BuildContext context, String? variant) {
    final theme = Theme.of(context).textTheme;

    switch (variant) {
      case 'heading1':
        return theme.headlineLarge ?? const TextStyle(fontSize: 32, fontWeight: FontWeight.bold);
      case 'heading2':
        return theme.headlineMedium ?? const TextStyle(fontSize: 24, fontWeight: FontWeight.bold);
      case 'heading3':
        return theme.headlineSmall ?? const TextStyle(fontSize: 20, fontWeight: FontWeight.w600);
      case 'caption':
        return theme.bodySmall ?? const TextStyle(fontSize: 12, color: Colors.grey);
      case 'code':
        return const TextStyle(fontFamily: 'monospace', fontSize: 14, backgroundColor: Color(0xFFF1F5F9));
      case 'body':
      default:
        return theme.bodyMedium ?? const TextStyle(fontSize: 16);
    }
  }

  Color? _parseColor(String? color) {
    if (color == null) return null;
    if (color.startsWith('#')) {
      final hex = color.substring(1);
      if (hex.length == 6) {
        return Color(int.parse('FF$hex', radix: 16));
      } else if (hex.length == 8) {
        return Color(int.parse(hex, radix: 16));
      }
    }
    return null;
  }
}
