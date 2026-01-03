import 'package:flutter/material.dart';
import '../types.dart';
import '../utils/json_pointer.dart';

/// Toast notification component
class CcToast extends StatefulWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final void Function(String path, dynamic value) onInput;
  final void Function(Action action) onAction;

  const CcToast({
    super.key,
    required this.component,
    required this.dataModel,
    required this.onInput,
    required this.onAction,
  });

  @override
  State<CcToast> createState() => _CcToastState();
}

class _CcToastState extends State<CcToast> {
  bool _dismissed = false;

  @override
  void initState() {
    super.initState();
    _scheduleAutoDismiss();
  }

  void _scheduleAutoDismiss() {
    final duration = widget.component['duration'] as int? ?? 5000;
    if (duration > 0) {
      Future.delayed(Duration(milliseconds: duration), () {
        if (mounted && !_dismissed) {
          _dismiss();
        }
      });
    }
  }

  void _dismiss() {
    setState(() => _dismissed = true);
    final openPath = widget.component['openPath'] as String?;
    if (openPath != null) {
      widget.onInput(openPath, false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final openPath = widget.component['openPath'] as String?;
    bool isOpen = true;
    if (openPath != null) {
      final value = getByPointer(widget.dataModel, openPath);
      isOpen = value == true;
    }

    if (!isOpen || _dismissed) {
      return const SizedBox.shrink();
    }

    String? message = widget.component['message'] as String?;
    if (widget.component['messagePath'] != null) {
      final value = getByPointer(widget.dataModel, widget.component['messagePath'] as String);
      message = value?.toString();
    }

    final variant = widget.component['variant'] as String? ?? 'info';
    final dismissible = widget.component['dismissible'] as bool? ?? true;
    final actionLabel = widget.component['actionLabel'] as String?;

    final colors = _getVariantColors(variant);

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: colors.backgroundColor,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Icon(colors.icon, color: colors.iconColor, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message ?? '',
              style: TextStyle(color: colors.textColor),
            ),
          ),
          if (actionLabel != null)
            TextButton(
              onPressed: () {
                final actionData = widget.component['action'] as Map<String, dynamic>?;
                if (actionData != null) {
                  widget.onAction(Action.fromJson(actionData));
                }
              },
              child: Text(actionLabel),
            ),
          if (dismissible)
            IconButton(
              icon: const Icon(Icons.close, size: 18),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              color: colors.textColor.withOpacity(0.7),
              onPressed: _dismiss,
            ),
        ],
      ),
    );
  }

  _ToastColors _getVariantColors(String variant) {
    switch (variant) {
      case 'success':
        return _ToastColors(
          backgroundColor: const Color(0xFFDCFCE7),
          textColor: const Color(0xFF166534),
          iconColor: const Color(0xFF22C55E),
          icon: Icons.check_circle,
        );
      case 'warning':
        return _ToastColors(
          backgroundColor: const Color(0xFFFEF3C7),
          textColor: const Color(0xFF92400E),
          iconColor: const Color(0xFFF97316),
          icon: Icons.warning,
        );
      case 'error':
        return _ToastColors(
          backgroundColor: const Color(0xFFFEE2E2),
          textColor: const Color(0xFFB91C1C),
          iconColor: const Color(0xFFEF4444),
          icon: Icons.error,
        );
      case 'info':
      default:
        return _ToastColors(
          backgroundColor: const Color(0xFFDBEAFE),
          textColor: const Color(0xFF1E40AF),
          iconColor: const Color(0xFF3B82F6),
          icon: Icons.info,
        );
    }
  }
}

class _ToastColors {
  final Color backgroundColor;
  final Color textColor;
  final Color iconColor;
  final IconData icon;

  _ToastColors({
    required this.backgroundColor,
    required this.textColor,
    required this.iconColor,
    required this.icon,
  });
}
