import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// Modal/Dialog component
class CcModal extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final void Function(String path, dynamic value) onInput;
  final Widget Function(Map<String, dynamic> component, {Key? key}) renderChild;

  const CcModal({
    super.key,
    required this.component,
    required this.dataModel,
    required this.onInput,
    required this.renderChild,
  });

  @override
  Widget build(BuildContext context) {
    final openPath = component['openPath'] as String?;
    final title = component['title'] as String?;
    final size = component['size'] as String? ?? 'medium';
    final dismissible = component['dismissible'] as bool? ?? true;
    final children = (component['children'] as List<dynamic>?)
            ?.map((e) => Map<String, dynamic>.from(e as Map))
            .toList() ??
        [];

    bool isOpen = false;
    if (openPath != null) {
      final value = getByPointer(dataModel, openPath);
      isOpen = value == true;
    }

    if (!isOpen) {
      return const SizedBox.shrink();
    }

    // Calculate modal width based on size
    double maxWidth;
    switch (size) {
      case 'small':
        maxWidth = 400;
        break;
      case 'large':
        maxWidth = 800;
        break;
      case 'fullscreen':
        maxWidth = double.infinity;
        break;
      case 'medium':
      default:
        maxWidth = 600;
    }

    return Dialog(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxWidth),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (title != null || dismissible)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (title != null)
                      Text(
                        title,
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                    if (dismissible)
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          if (openPath != null) {
                            onInput(openPath, false);
                          }
                        },
                      ),
                  ],
                ),
              if (title != null) const SizedBox(height: 16),
              ...children.asMap().entries.map((entry) {
                return renderChild(entry.value, key: ValueKey('modal-child-${entry.key}'));
              }),
            ],
          ),
        ),
      ),
    );
  }
}
