import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// RichTextEditor component (simplified implementation)
/// For a full WYSIWYG editor, consider using packages like flutter_quill
class CcRichTextEditor extends StatefulWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final void Function(String path, dynamic value) onInput;

  const CcRichTextEditor({
    super.key,
    required this.component,
    required this.dataModel,
    required this.onInput,
  });

  @override
  State<CcRichTextEditor> createState() => _CcRichTextEditorState();
}

class _CcRichTextEditorState extends State<CcRichTextEditor> {
  late TextEditingController _controller;
  bool _isBold = false;
  bool _isItalic = false;
  bool _isUnderline = false;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController();
    _loadContent();
  }

  void _loadContent() {
    final valuePath = widget.component['valuePath'] as String?;
    if (valuePath != null) {
      final value = getByPointer(widget.dataModel, valuePath);
      // Strip HTML tags for plain text editing
      if (value is String) {
        _controller.text = _stripHtml(value);
      }
    }
  }

  String _stripHtml(String html) {
    return html
        .replaceAll(RegExp(r'<[^>]*>'), '')
        .replaceAll('&nbsp;', ' ')
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>');
  }

  @override
  void didUpdateWidget(CcRichTextEditor oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.dataModel != oldWidget.dataModel) {
      _loadContent();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  List<String> get _toolbar {
    final toolbar = widget.component['toolbar'] as List<dynamic>?;
    if (toolbar == null) {
      return ['bold', 'italic', 'underline'];
    }
    return toolbar.map((e) => e.toString()).toList();
  }

  @override
  Widget build(BuildContext context) {
    final placeholder = widget.component['placeholder'] as String?;
    final minHeight = (widget.component['minHeight'] as num?)?.toDouble() ?? 200;
    final disabled = widget.component['disabled'] as bool? ?? false;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Toolbar
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            border: Border.all(color: Colors.grey[300]!),
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(8),
              topRight: Radius.circular(8),
            ),
          ),
          child: Wrap(
            spacing: 4,
            children: [
              if (_toolbar.contains('bold'))
                _ToolbarButton(
                  icon: Icons.format_bold,
                  isActive: _isBold,
                  onPressed: disabled
                      ? null
                      : () => setState(() => _isBold = !_isBold),
                ),
              if (_toolbar.contains('italic'))
                _ToolbarButton(
                  icon: Icons.format_italic,
                  isActive: _isItalic,
                  onPressed: disabled
                      ? null
                      : () => setState(() => _isItalic = !_isItalic),
                ),
              if (_toolbar.contains('underline'))
                _ToolbarButton(
                  icon: Icons.format_underlined,
                  isActive: _isUnderline,
                  onPressed: disabled
                      ? null
                      : () => setState(() => _isUnderline = !_isUnderline),
                ),
              if (_toolbar.contains('heading'))
                _ToolbarButton(
                  icon: Icons.title,
                  isActive: false,
                  onPressed: disabled ? null : () {},
                ),
              if (_toolbar.contains('list'))
                _ToolbarButton(
                  icon: Icons.format_list_bulleted,
                  isActive: false,
                  onPressed: disabled ? null : () {},
                ),
              if (_toolbar.contains('link'))
                _ToolbarButton(
                  icon: Icons.link,
                  isActive: false,
                  onPressed: disabled ? null : () {},
                ),
              if (_toolbar.contains('code'))
                _ToolbarButton(
                  icon: Icons.code,
                  isActive: false,
                  onPressed: disabled ? null : () {},
                ),
            ],
          ),
        ),
        // Editor area
        Container(
          constraints: BoxConstraints(minHeight: minHeight),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[300]!),
            borderRadius: const BorderRadius.only(
              bottomLeft: Radius.circular(8),
              bottomRight: Radius.circular(8),
            ),
          ),
          child: TextField(
            controller: _controller,
            maxLines: null,
            minLines: (minHeight / 24).round(),
            enabled: !disabled,
            decoration: InputDecoration(
              hintText: placeholder,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.all(16),
            ),
            style: TextStyle(
              fontWeight: _isBold ? FontWeight.bold : FontWeight.normal,
              fontStyle: _isItalic ? FontStyle.italic : FontStyle.normal,
              decoration: _isUnderline ? TextDecoration.underline : TextDecoration.none,
            ),
            onChanged: (value) {
              final valuePath = widget.component['valuePath'] as String?;
              if (valuePath != null) {
                // Wrap in basic HTML
                String html = value;
                if (_isBold) html = '<strong>$html</strong>';
                if (_isItalic) html = '<em>$html</em>';
                if (_isUnderline) html = '<u>$html</u>';
                widget.onInput(valuePath, html);
              }
            },
          ),
        ),
      ],
    );
  }
}

class _ToolbarButton extends StatelessWidget {
  final IconData icon;
  final bool isActive;
  final VoidCallback? onPressed;

  const _ToolbarButton({
    required this.icon,
    required this.isActive,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(icon),
      iconSize: 20,
      padding: const EdgeInsets.all(4),
      constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
      color: isActive ? Theme.of(context).primaryColor : Colors.grey[700],
      onPressed: onPressed,
    );
  }
}
