import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// Video player component
/// Note: For a full implementation, use the video_player package
class CcVideo extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;

  const CcVideo({
    super.key,
    required this.component,
    required this.dataModel,
  });

  @override
  Widget build(BuildContext context) {
    String? src = component['src'] as String?;

    // Support srcPath binding
    if (component['srcPath'] != null) {
      final value = getByPointer(dataModel, component['srcPath'] as String);
      src = value?.toString();
    }

    final poster = component['poster'] as String?;
    final controls = component['controls'] as bool? ?? true;
    final autoplay = component['autoplay'] as bool? ?? false;
    final loop = component['loop'] as bool? ?? false;
    final muted = component['muted'] as bool? ?? false;

    if (src == null || src.isEmpty) {
      return Container(
        height: 200,
        color: Colors.grey[900],
        child: const Center(
          child: Icon(Icons.videocam_off, color: Colors.grey, size: 48),
        ),
      );
    }

    // Placeholder implementation - shows poster or video icon
    // For actual video playback, integrate video_player package
    return Container(
      constraints: const BoxConstraints(minHeight: 200),
      color: Colors.grey[900],
      child: Stack(
        alignment: Alignment.center,
        children: [
          if (poster != null)
            Image.network(
              poster,
              fit: BoxFit.cover,
              width: double.infinity,
              errorBuilder: (context, error, stackTrace) {
                return const SizedBox.shrink();
              },
            ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.black54,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.play_circle_fill, color: Colors.white, size: 64),
                const SizedBox(height: 8),
                Text(
                  'Video: ${src.split('/').last}',
                  style: const TextStyle(color: Colors.white),
                ),
                const SizedBox(height: 4),
                Text(
                  'Controls: $controls, Autoplay: $autoplay, Loop: $loop, Muted: $muted',
                  style: TextStyle(color: Colors.grey[400], fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
