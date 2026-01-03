import 'dart:convert';
import 'dart:html' as html;
import 'package:flutter/material.dart';

import 'types.dart';
import 'renderer.dart';

void main() {
  runApp(const ClaudeCanvasPreviewApp());
}

class ClaudeCanvasPreviewApp extends StatelessWidget {
  const ClaudeCanvasPreviewApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Preview',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const PreviewPage(),
    );
  }
}

class PreviewPage extends StatefulWidget {
  const PreviewPage({super.key});

  @override
  State<PreviewPage> createState() => _PreviewPageState();
}

class _PreviewPageState extends State<PreviewPage> {
  Surface? _surface;
  Map<String, dynamic> _dataModel = {};

  @override
  void initState() {
    super.initState();
    _setupMessageListener();
    // Delay ready notification to ensure page is fully loaded
    Future.delayed(const Duration(milliseconds: 100), _notifyReady);
  }

  void _setupMessageListener() {
    html.window.addEventListener('message', (event) {
      final messageEvent = event as html.MessageEvent;
      _handleMessage(messageEvent);
    });
  }

  void _notifyReady() {
    try {
      html.window.parent?.postMessage({'type': 'flutter-preview-ready'}, '*');
      debugPrint('[Flutter Preview] Ready and listening for messages');
    } catch (e) {
      debugPrint('[Flutter Preview] Error notifying ready: $e');
    }
  }

  void _handleMessage(html.MessageEvent event) {
    try {
      final data = event.data;
      if (data == null) return;

      // Convert JS object to Dart map
      Map<String, dynamic>? dataMap;
      if (data is Map) {
        dataMap = Map<String, dynamic>.from(data);
      } else {
        // Try to parse as JSON string
        try {
          final jsonStr = jsonEncode(data);
          dataMap = jsonDecode(jsonStr) as Map<String, dynamic>;
        } catch (e) {
          debugPrint('[Flutter Preview] Could not parse message data: $e');
          return;
        }
      }

      // Handle batch messages
      if (dataMap['type'] == 'claude-canvas-messages' && dataMap['messages'] is List) {
        final messages = (dataMap['messages'] as List);
        debugPrint('[Flutter Preview] Received ${messages.length} messages');
        for (final msg in messages) {
          if (msg is Map) {
            _processMessage(Map<String, dynamic>.from(msg));
          }
        }
        return;
      }

      // Handle single messages
      if (dataMap['type'] == 'surfaceUpdate' ||
          dataMap['type'] == 'dataModelUpdate' ||
          dataMap['type'] == 'deleteSurface') {
        debugPrint('[Flutter Preview] Received single message: ${dataMap['type']}');
        _processMessage(dataMap);
      }
    } catch (e, stack) {
      debugPrint('[Flutter Preview] Error handling message: $e');
      debugPrint('[Flutter Preview] Stack: $stack');
    }
  }

  /// Recursively converts a dynamic map/list to proper Dart types
  dynamic _deepConvert(dynamic value) {
    if (value is Map) {
      return Map<String, dynamic>.fromEntries(
        value.entries.map((e) => MapEntry(e.key.toString(), _deepConvert(e.value))),
      );
    } else if (value is List) {
      return value.map((e) => _deepConvert(e)).toList();
    }
    return value;
  }

  void _processMessage(Map<String, dynamic> message) {
    debugPrint('[Flutter Preview] Processing message type: ${message['type']}');
    setState(() {
      switch (message['type']) {
        case 'surfaceUpdate':
          final surfaceRaw = message['surface'];
          debugPrint('[Flutter Preview] surfaceRaw is null: ${surfaceRaw == null}');
          if (surfaceRaw != null) {
            try {
              final surfaceData = _deepConvert(surfaceRaw) as Map<String, dynamic>;
              debugPrint('[Flutter Preview] Converted surface data: $surfaceData');
              _surface = Surface.fromJson(surfaceData);
              debugPrint('[Flutter Preview] Surface created: ${_surface?.id}');
            } catch (e, stack) {
              debugPrint('[Flutter Preview] Error creating surface: $e');
              debugPrint('[Flutter Preview] Stack: $stack');
            }
          }
          break;
        case 'dataModelUpdate':
          final path = message['path'] as String? ?? '/';
          final data = message['data'];
          if (path == '/') {
            _dataModel = _deepConvert(data) as Map<String, dynamic>;
          } else {
            _dataModel = _setByPointer(_dataModel, path, _deepConvert(data));
          }
          break;
        case 'deleteSurface':
          final surfaceId = message['surfaceId'] as String?;
          if (_surface?.id == surfaceId) {
            _surface = null;
          }
          break;
      }
    });
  }

  Map<String, dynamic> _setByPointer(Map<String, dynamic> obj, String path, dynamic value) {
    final parts = path.split('/').where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return value is Map ? Map<String, dynamic>.from(value) : obj;

    final result = Map<String, dynamic>.from(obj);
    Map<String, dynamic> current = result;

    for (int i = 0; i < parts.length - 1; i++) {
      final part = parts[i];
      if (!current.containsKey(part) || current[part] is! Map) {
        current[part] = <String, dynamic>{};
      }
      current[part] = Map<String, dynamic>.from(current[part] as Map);
      current = current[part] as Map<String, dynamic>;
    }

    current[parts.last] = value;
    return result;
  }

  void _handleAction(CCAction action) {
    debugPrint('[Flutter Preview] Action: ${action.type}');
    try {
      html.window.parent?.postMessage({
        'type': 'flutter-preview-action',
        'action': action.toJson(),
      }, '*');
    } catch (e) {
      debugPrint('[Flutter Preview] Error posting action: $e');
    }
  }

  void _handleDataModelChange(Map<String, dynamic> dataModel) {
    setState(() {
      _dataModel = dataModel;
    });
    try {
      html.window.parent?.postMessage({
        'type': 'flutter-preview-data-model-change',
        'dataModel': dataModel,
      }, '*');
    } catch (e) {
      debugPrint('[Flutter Preview] Error posting data model change: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_surface == null) {
      return const Scaffold(
        body: Center(
          child: Text(
            'Waiting for UI specification...',
            style: TextStyle(color: Colors.black54, fontSize: 14),
          ),
        ),
      );
    }

    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: CCSurfaceRenderer(
          surface: _surface!,
          dataModel: _dataModel,
          onAction: _handleAction,
          onDataModelChange: _handleDataModelChange,
        ),
      ),
    );
  }
}
