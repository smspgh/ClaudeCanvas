import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// Audio player component
/// Note: For a full implementation, use the audioplayers package
class CcAudioPlayer extends StatefulWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;

  const CcAudioPlayer({
    super.key,
    required this.component,
    required this.dataModel,
  });

  @override
  State<CcAudioPlayer> createState() => _CcAudioPlayerState();
}

class _CcAudioPlayerState extends State<CcAudioPlayer> {
  bool _isPlaying = false;
  double _progress = 0;

  @override
  Widget build(BuildContext context) {
    String? src = widget.component['src'] as String?;

    // Support srcPath binding
    if (widget.component['srcPath'] != null) {
      final value = getByPointer(widget.dataModel, widget.component['srcPath'] as String);
      src = value?.toString();
    }

    final title = widget.component['title'] as String?;
    final controls = widget.component['controls'] as bool? ?? true;

    if (src == null || src.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Row(
          children: [
            Icon(Icons.music_off, color: Colors.grey),
            SizedBox(width: 12),
            Text('No audio source', style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (title != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
          if (controls)
            Row(
              children: [
                IconButton(
                  icon: Icon(_isPlaying ? Icons.pause : Icons.play_arrow),
                  onPressed: () {
                    setState(() {
                      _isPlaying = !_isPlaying;
                    });
                    // Actual audio playback would be handled here
                  },
                ),
                Expanded(
                  child: Slider(
                    value: _progress,
                    onChanged: (value) {
                      setState(() {
                        _progress = value;
                      });
                    },
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.volume_up),
                  onPressed: () {},
                ),
              ],
            ),
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              src.split('/').last,
              style: TextStyle(color: Colors.grey[600], fontSize: 12),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
