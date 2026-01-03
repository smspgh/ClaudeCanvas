/// ClaudeCanvas Flutter Renderer
///
/// A Flutter implementation of the ClaudeCanvas declarative UI framework.
/// Renders AI-generated UIs from JSON specifications with full component support.
///
/// ## Features
/// - 31 component types (layout, input, display, data visualization, feedback, media)
/// - JSON Pointer data binding (RFC 6901)
/// - Conditional visibility (visibleIf)
/// - Two-way data binding
/// - Computed expressions
/// - Theme customization
///
/// ## Usage
/// ```dart
/// import 'package:claude_canvas_renderer/claude_canvas_renderer.dart';
///
/// CcSurface(
///   surface: mySurface,
///   dataModel: myDataModel,
///   onAction: (action) => print('Action: $action'),
///   onDataModelChange: (model) => setState(() => myDataModel = model),
/// )
/// ```
library claude_canvas_renderer;

// Core exports
export 'src/cc_surface.dart';
export 'src/types.dart';
export 'src/data_model.dart';
export 'src/utils/json_pointer.dart';

// Component exports
export 'src/components/cc_text.dart';
export 'src/components/cc_button.dart';
export 'src/components/cc_text_field.dart';
export 'src/components/cc_checkbox.dart';
export 'src/components/cc_select.dart';
export 'src/components/cc_slider.dart';
export 'src/components/cc_image.dart';
export 'src/components/cc_icon.dart';
export 'src/components/cc_row.dart';
export 'src/components/cc_column.dart';
export 'src/components/cc_card.dart';
export 'src/components/cc_divider.dart';
export 'src/components/cc_modal.dart';
export 'src/components/cc_tabs.dart';
export 'src/components/cc_accordion.dart';
export 'src/components/cc_badge.dart';
export 'src/components/cc_avatar.dart';
export 'src/components/cc_datetime_input.dart';
export 'src/components/cc_multiple_choice.dart';
export 'src/components/cc_rich_text_editor.dart';
export 'src/components/cc_tooltip.dart';
export 'src/components/cc_video.dart';
export 'src/components/cc_audio_player.dart';
export 'src/components/cc_chart.dart';
export 'src/components/cc_data_table.dart';
export 'src/components/cc_progress.dart';
export 'src/components/cc_toast.dart';
export 'src/components/cc_alert.dart';
export 'src/components/cc_skeleton.dart';
export 'src/components/cc_list.dart';
