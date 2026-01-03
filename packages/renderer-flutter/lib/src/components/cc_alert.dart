import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// Alert component for inline notifications
class CcAlert extends StatefulWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final void Function(String path, dynamic value) onInput;

  const CcAlert({
    super.key,
    required this.component,
    required this.dataModel,
    required this.onInput,
  });

  @override
  State<CcAlert> createState() => _CcAlertState();
}

class _CcAlertState extends State<CcAlert> {
  bool _dismissed = false;

  @override
  Widget build(BuildContext context) {
    final openPath = widget.component['openPath'] as String?;
    bool isOpen = true;
    if (openPath != null) {
      final value = getByPointer(widget.dataModel, openPath);
      isOpen = value != false;
    }

    if (!isOpen || _dismissed) {
      return const SizedBox.shrink();
    }

    String? message = widget.component['message'] as String?;
    if (widget.component['messagePath'] != null) {
      final value = getByPointer(widget.dataModel, widget.component['messagePath'] as String);
      message = value?.toString();
    }

    final title = widget.component['title'] as String?;
    final variant = widget.component['variant'] as String? ?? 'info';
    final showIcon = widget.component['showIcon'] as bool? ?? true;
    final dismissible = widget.component['dismissible'] as bool? ?? false;

    final colors = _getVariantColors(variant);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.backgroundColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: colors.borderColor),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showIcon)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Icon(colors.icon, color: colors.iconColor, size: 20),
            ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (title != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text(
                      title,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: colors.textColor,
                      ),
                    ),
                  ),
                if (message != null)
                  Text(
                    message,
                    style: TextStyle(color: colors.textColor),
                  ),
              ],
            ),
          ),
          if (dismissible)
            IconButton(
              icon: const Icon(Icons.close, size: 18),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              color: colors.textColor.withOpacity(0.7),
              onPressed: () {
                setState(() => _dismissed = true);
                if (openPath != null) {
                  widget.onInput(openPath, false);
                }
              },
            ),
        ],
      ),
    );
  }

  _AlertColors _getVariantColors(String variant) {
    switch (variant) {
      case 'success':
        return _AlertColors(
          backgroundColor: const Color(0xFFDCFCE7),
          borderColor: const Color(0xFF86EFAC),
          textColor: const Color(0xFF166534),
          iconColor: const Color(0xFF22C55E),
          icon: Icons.check_circle,
        );
      case 'warning':
        return _AlertColors(
          backgroundColor: const Color(0xFFFEF3C7),
          borderColor: const Color(0xFFFCD34D),
          textColor: const Color(0xFF92400E),
          iconColor: const Color(0xFFF97316),
          icon: Icons.warning,
        );
      case 'error':
        return _AlertColors(
          backgroundColor: const Color(0xFFFEE2E2),
          borderColor: const Color(0xFFFCA5A5),
          textColor: const Color(0xFFB91C1C),
          iconColor: const Color(0xFFEF4444),
          icon: Icons.error,
        );
      case 'info':
      default:
        return _AlertColors(
          backgroundColor: const Color(0xFFDBEAFE),
          borderColor: const Color(0xFF93C5FD),
          textColor: const Color(0xFF1E40AF),
          iconColor: const Color(0xFF3B82F6),
          icon: Icons.info,
        );
    }
  }
}

class _AlertColors {
  final Color backgroundColor;
  final Color borderColor;
  final Color textColor;
  final Color iconColor;
  final IconData icon;

  _AlertColors({
    required this.backgroundColor,
    required this.borderColor,
    required this.textColor,
    required this.iconColor,
    required this.icon,
  });
}
