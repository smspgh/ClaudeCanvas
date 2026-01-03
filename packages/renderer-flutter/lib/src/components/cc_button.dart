import 'package:flutter/material.dart';
import '../types.dart';

/// Button component for user actions
class CcButton extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final void Function(Action action) onAction;

  const CcButton({
    super.key,
    required this.component,
    required this.dataModel,
    required this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final label = component['label'] as String? ?? '';
    final variant = component['variant'] as String? ?? 'primary';
    final disabled = component['disabled'] as bool? ?? false;
    final loading = component['loading'] as bool? ?? false;
    final iconName = component['icon'] as String?;

    Widget child;
    if (loading) {
      child = const SizedBox(
        width: 20,
        height: 20,
        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
      );
    } else {
      final textWidget = Text(label);
      if (iconName != null) {
        child = Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(_getIconData(iconName), size: 18),
            if (label.isNotEmpty) const SizedBox(width: 8),
            if (label.isNotEmpty) textWidget,
          ],
        );
      } else {
        child = textWidget;
      }
    }

    final onPressed = disabled || loading
        ? null
        : () {
            final actionData = component['action'] as Map<String, dynamic>?;
            if (actionData != null) {
              onAction(Action.fromJson(actionData));
            }
          };

    switch (variant) {
      case 'secondary':
        return ElevatedButton(
          onPressed: onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.grey[200],
            foregroundColor: Colors.black87,
          ),
          child: child,
        );
      case 'outline':
        return OutlinedButton(onPressed: onPressed, child: child);
      case 'ghost':
        return TextButton(onPressed: onPressed, child: child);
      case 'danger':
        return ElevatedButton(
          onPressed: onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            foregroundColor: Colors.white,
          ),
          child: child,
        );
      case 'primary':
      default:
        return ElevatedButton(
          onPressed: onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).primaryColor,
            foregroundColor: Colors.white,
          ),
          child: child,
        );
    }
  }

  IconData _getIconData(String name) {
    // Map common icon names to Material icons
    switch (name.toLowerCase()) {
      case 'add':
      case 'plus':
        return Icons.add;
      case 'remove':
      case 'minus':
        return Icons.remove;
      case 'edit':
        return Icons.edit;
      case 'delete':
        return Icons.delete;
      case 'save':
        return Icons.save;
      case 'cancel':
      case 'close':
        return Icons.close;
      case 'check':
        return Icons.check;
      case 'settings':
        return Icons.settings;
      case 'search':
        return Icons.search;
      case 'home':
        return Icons.home;
      case 'person':
      case 'user':
        return Icons.person;
      case 'email':
      case 'mail':
        return Icons.email;
      case 'phone':
        return Icons.phone;
      case 'send':
        return Icons.send;
      case 'refresh':
        return Icons.refresh;
      case 'download':
        return Icons.download;
      case 'upload':
        return Icons.upload;
      case 'share':
        return Icons.share;
      case 'favorite':
      case 'heart':
        return Icons.favorite;
      case 'star':
        return Icons.star;
      case 'info':
        return Icons.info;
      case 'warning':
        return Icons.warning;
      case 'error':
        return Icons.error;
      case 'help':
        return Icons.help;
      case 'play':
        return Icons.play_arrow;
      case 'pause':
        return Icons.pause;
      case 'stop':
        return Icons.stop;
      case 'arrow_back':
        return Icons.arrow_back;
      case 'arrow_forward':
        return Icons.arrow_forward;
      default:
        return Icons.circle;
    }
  }
}
