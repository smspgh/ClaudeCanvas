import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// Badge component for status indicators
class CcBadge extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;

  const CcBadge({
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

    final variant = component['variant'] as String? ?? 'default';
    final size = component['size'] as String? ?? 'medium';
    final pill = component['pill'] as bool? ?? false;
    final dot = component['dot'] as bool? ?? false;
    final iconName = component['icon'] as String?;

    final colors = _getVariantColors(variant);

    if (dot) {
      return Container(
        width: 8,
        height: 8,
        decoration: BoxDecoration(
          color: colors.backgroundColor,
          shape: BoxShape.circle,
        ),
      );
    }

    final fontSize = size == 'small' ? 10.0 : (size == 'large' ? 14.0 : 12.0);
    final padding = size == 'small'
        ? const EdgeInsets.symmetric(horizontal: 6, vertical: 2)
        : (size == 'large'
            ? const EdgeInsets.symmetric(horizontal: 12, vertical: 6)
            : const EdgeInsets.symmetric(horizontal: 8, vertical: 4));

    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: colors.backgroundColor,
        borderRadius: BorderRadius.circular(pill ? 100 : 4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (iconName != null) ...[
            Icon(
              _getIconData(iconName),
              size: fontSize + 2,
              color: colors.textColor,
            ),
            const SizedBox(width: 4),
          ],
          if (content != null)
            Text(
              content,
              style: TextStyle(
                fontSize: fontSize,
                color: colors.textColor,
                fontWeight: FontWeight.w500,
              ),
            ),
        ],
      ),
    );
  }

  _BadgeColors _getVariantColors(String variant) {
    switch (variant) {
      case 'success':
        return _BadgeColors(
          backgroundColor: const Color(0xFFDCFCE7),
          textColor: const Color(0xFF166534),
        );
      case 'warning':
        return _BadgeColors(
          backgroundColor: const Color(0xFFFEF3C7),
          textColor: const Color(0xFF92400E),
        );
      case 'error':
        return _BadgeColors(
          backgroundColor: const Color(0xFFFEE2E2),
          textColor: const Color(0xFFB91C1C),
        );
      case 'info':
        return _BadgeColors(
          backgroundColor: const Color(0xFFDBEAFE),
          textColor: const Color(0xFF1E40AF),
        );
      case 'default':
      default:
        return _BadgeColors(
          backgroundColor: const Color(0xFFF1F5F9),
          textColor: const Color(0xFF475569),
        );
    }
  }

  IconData _getIconData(String name) {
    switch (name.toLowerCase()) {
      case 'check':
        return Icons.check;
      case 'close':
        return Icons.close;
      case 'info':
        return Icons.info;
      case 'warning':
        return Icons.warning;
      case 'error':
        return Icons.error;
      default:
        return Icons.circle;
    }
  }
}

class _BadgeColors {
  final Color backgroundColor;
  final Color textColor;

  _BadgeColors({required this.backgroundColor, required this.textColor});
}
