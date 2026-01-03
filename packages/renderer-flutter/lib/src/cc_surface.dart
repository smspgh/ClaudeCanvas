/// Main CcSurface widget for rendering ClaudeCanvas UIs
library;

import 'package:flutter/material.dart';
import 'types.dart';
import 'data_model.dart';
import 'utils/json_pointer.dart';

// Import all components
import 'components/cc_text.dart';
import 'components/cc_button.dart';
import 'components/cc_text_field.dart';
import 'components/cc_checkbox.dart';
import 'components/cc_select.dart';
import 'components/cc_slider.dart';
import 'components/cc_image.dart';
import 'components/cc_icon.dart';
import 'components/cc_row.dart';
import 'components/cc_column.dart';
import 'components/cc_card.dart';
import 'components/cc_divider.dart';
import 'components/cc_modal.dart';
import 'components/cc_tabs.dart';
import 'components/cc_accordion.dart';
import 'components/cc_badge.dart';
import 'components/cc_avatar.dart';
import 'components/cc_datetime_input.dart';
import 'components/cc_multiple_choice.dart';
import 'components/cc_rich_text_editor.dart';
import 'components/cc_tooltip.dart';
import 'components/cc_video.dart';
import 'components/cc_audio_player.dart';
import 'components/cc_chart.dart';
import 'components/cc_data_table.dart';
import 'components/cc_progress.dart';
import 'components/cc_toast.dart';
import 'components/cc_alert.dart';
import 'components/cc_skeleton.dart';
import 'components/cc_list.dart';

/// Main surface widget for rendering ClaudeCanvas UIs
class CcSurface extends StatefulWidget {
  /// The surface definition to render
  final Surface? surface;

  /// Initial data model state
  final DataModel initialDataModel;

  /// Called when user performs an action (button click, etc.)
  final void Function(UserActionMessage message)? onAction;

  /// Called when the data model changes (input changes)
  final void Function(DataModel dataModel)? onDataModelChange;

  /// Child widget to show when no surface is provided
  final Widget? child;

  const CcSurface({
    super.key,
    this.surface,
    this.initialDataModel = const {},
    this.onAction,
    this.onDataModelChange,
    this.child,
  });

  @override
  State<CcSurface> createState() => _CcSurfaceState();
}

class _CcSurfaceState extends State<CcSurface> {
  late DataModel _dataModel;

  @override
  void initState() {
    super.initState();
    _dataModel = Map<String, dynamic>.from(widget.initialDataModel);
  }

  @override
  void didUpdateWidget(CcSurface oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialDataModel != oldWidget.initialDataModel) {
      setState(() {
        _dataModel = Map<String, dynamic>.from(widget.initialDataModel);
      });
    }
  }

  void _handleInput(String path, dynamic value) {
    setState(() {
      _dataModel = setByPointer(_dataModel, path, value);
    });
    widget.onDataModelChange?.call(_dataModel);
  }

  void _handleAction(Action action) {
    if (widget.surface == null) return;

    // Handle update/updateData action locally
    if ((action.type == 'updateData' || action.type == 'update') &&
        action.path != null) {
      _handleInput(action.path!, action.value);
      return;
    }

    final message = UserActionMessage(
      surfaceId: widget.surface!.id,
      action: action,
      dataModel: _dataModel,
    );

    widget.onAction?.call(message);
  }

  bool _isVisible(Map<String, dynamic> component) {
    final visibleIf = component['visibleIf'];
    if (visibleIf == null) return true;

    if (visibleIf is String) {
      final value = getByPointer(_dataModel, visibleIf);
      return value == true || (value != null && value != 0 && value != '');
    }

    if (visibleIf is Map<String, dynamic>) {
      final condition = VisibilityCondition.fromJson(visibleIf);
      dynamic value = getByPointer(_dataModel, condition.path);

      if (condition.expr != null) {
        value = evaluateExpression(condition.expr!, value);
      }

      if (condition.eq != null) return value == condition.eq;
      if (condition.neq != null) return value != condition.neq;
      if (condition.gt != null && value is num) return value > condition.gt!;
      if (condition.gte != null && value is num) return value >= condition.gte!;
      if (condition.lt != null && value is num) return value < condition.lt!;
      if (condition.lte != null && value is num) return value <= condition.lte!;

      return value == true || (value != null && value != 0 && value != '');
    }

    return true;
  }

  Widget _renderComponent(Map<String, dynamic> component, {Key? key}) {
    if (!_isVisible(component)) {
      return const SizedBox.shrink();
    }

    final componentType = component['component'] as String?;
    final style = ComponentStyle.fromJson(
      component['style'] as Map<String, dynamic>?,
    );

    Widget child;

    switch (componentType) {
      case 'Text':
        child = CcText(component: component, dataModel: _dataModel);
        break;

      case 'Button':
        child = CcButton(
          component: component,
          dataModel: _dataModel,
          onAction: _handleAction,
        );
        break;

      case 'TextField':
        child = CcTextField(
          component: component,
          dataModel: _dataModel,
          onInput: _handleInput,
        );
        break;

      case 'Checkbox':
        child = CcCheckbox(
          component: component,
          dataModel: _dataModel,
          onInput: _handleInput,
        );
        break;

      case 'Select':
        child = CcSelect(
          component: component,
          dataModel: _dataModel,
          onInput: _handleInput,
        );
        break;

      case 'Slider':
        child = CcSlider(
          component: component,
          dataModel: _dataModel,
          onInput: _handleInput,
        );
        break;

      case 'Image':
        child = CcImage(component: component, dataModel: _dataModel);
        break;

      case 'Icon':
        child = CcIcon(component: component, dataModel: _dataModel);
        break;

      case 'Row':
        child = CcRow(
          component: component,
          dataModel: _dataModel,
          renderChild: _renderComponent,
        );
        break;

      case 'Column':
        child = CcColumn(
          component: component,
          dataModel: _dataModel,
          renderChild: _renderComponent,
        );
        break;

      case 'Card':
        child = CcCard(
          component: component,
          dataModel: _dataModel,
          renderChild: _renderComponent,
        );
        break;

      case 'Divider':
        child = CcDivider(component: component, dataModel: _dataModel);
        break;

      case 'Modal':
        child = CcModal(
          component: component,
          dataModel: _dataModel,
          onInput: _handleInput,
          renderChild: _renderComponent,
        );
        break;

      case 'Tabs':
        child = CcTabs(
          component: component,
          dataModel: _dataModel,
          onInput: _handleInput,
          renderChild: _renderComponent,
        );
        break;

      case 'Accordion':
        child = CcAccordion(
          component: component,
          dataModel: _dataModel,
          onInput: _handleInput,
          renderChild: _renderComponent,
        );
        break;

      case 'Badge':
        child = CcBadge(component: component, dataModel: _dataModel);
        break;

      case 'Avatar':
        child = CcAvatar(component: component, dataModel: _dataModel);
        break;

      case 'DateTimeInput':
        child = CcDateTimeInput(
          component: component,
          dataModel: _dataModel,
          onInput: _handleInput,
        );
        break;

      case 'MultipleChoice':
        child = CcMultipleChoice(
          component: component,
          dataModel: _dataModel,
          onInput: _handleInput,
        );
        break;

      case 'RichTextEditor':
        child = CcRichTextEditor(
          component: component,
          dataModel: _dataModel,
          onInput: _handleInput,
        );
        break;

      case 'Tooltip':
        child = CcTooltip(
          component: component,
          dataModel: _dataModel,
          renderChild: _renderComponent,
        );
        break;

      case 'Video':
        child = CcVideo(component: component, dataModel: _dataModel);
        break;

      case 'AudioPlayer':
        child = CcAudioPlayer(component: component, dataModel: _dataModel);
        break;

      case 'Chart':
        child = CcChart(component: component, dataModel: _dataModel);
        break;

      case 'DataTable':
        child = CcDataTable(
          component: component,
          dataModel: _dataModel,
          onInput: _handleInput,
        );
        break;

      case 'Progress':
        child = CcProgress(component: component, dataModel: _dataModel);
        break;

      case 'Toast':
        child = CcToast(
          component: component,
          dataModel: _dataModel,
          onInput: _handleInput,
          onAction: _handleAction,
        );
        break;

      case 'Alert':
        child = CcAlert(
          component: component,
          dataModel: _dataModel,
          onInput: _handleInput,
        );
        break;

      case 'Skeleton':
        child = CcSkeleton(component: component, dataModel: _dataModel);
        break;

      case 'List':
        child = CcList(
          component: component,
          dataModel: _dataModel,
          renderChild: _renderComponent,
        );
        break;

      default:
        child = Text('Unknown component: $componentType');
    }

    // Apply container styling
    return _applyStyle(child, style, key: key);
  }

  Widget _applyStyle(Widget child, ComponentStyle style, {Key? key}) {
    Widget result = child;

    // Apply opacity
    if (style.opacity != null) {
      result = Opacity(opacity: style.opacity!.toDouble(), child: result);
    }

    // Apply container decorations
    if (style.backgroundColorValue != null ||
        style.borderRadiusValue != null ||
        style.borderColorValue != null) {
      result = Container(
        decoration: BoxDecoration(
          color: style.backgroundColorValue,
          borderRadius: style.borderRadiusValue,
          border: style.borderColorValue != null
              ? Border.all(
                  color: style.borderColorValue!,
                  width: style.borderWidth?.toDouble() ?? 1,
                )
              : null,
        ),
        child: result,
      );
    }

    // Apply padding
    if (style.paddingEdgeInsets != null) {
      result = Padding(padding: style.paddingEdgeInsets!, child: result);
    }

    // Apply margin
    if (style.marginEdgeInsets != null) {
      result = Padding(padding: style.marginEdgeInsets!, child: result);
    }

    // Apply size constraints
    if (style.width != null ||
        style.height != null ||
        style.minWidth != null ||
        style.maxWidth != null ||
        style.minHeight != null ||
        style.maxHeight != null) {
      result = ConstrainedBox(
        constraints: BoxConstraints(
          minWidth: (style.minWidth as num?)?.toDouble() ?? 0,
          maxWidth: (style.maxWidth as num?)?.toDouble() ?? double.infinity,
          minHeight: (style.minHeight as num?)?.toDouble() ?? 0,
          maxHeight: (style.maxHeight as num?)?.toDouble() ?? double.infinity,
        ),
        child: SizedBox(
          width: (style.width as num?)?.toDouble(),
          height: (style.height as num?)?.toDouble(),
          child: result,
        ),
      );
    }

    return KeyedSubtree(key: key, child: result);
  }

  @override
  Widget build(BuildContext context) {
    if (widget.surface == null) {
      return widget.child ?? const SizedBox.shrink();
    }

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (widget.surface!.title != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Text(
                widget.surface!.title!,
                style: Theme.of(context).textTheme.headlineMedium,
              ),
            ),
          ...widget.surface!.components.asMap().entries.map((entry) {
            return _renderComponent(
              entry.value,
              key: ValueKey('component-${entry.key}'),
            );
          }),
        ],
      ),
    );
  }
}

/// Hook-like class for managing surface state
class CcSurfaceController extends ChangeNotifier {
  Surface? _surface;
  DataModel _dataModel;

  CcSurfaceController({Surface? surface, DataModel? dataModel})
      : _surface = surface,
        _dataModel = dataModel ?? {};

  Surface? get surface => _surface;
  DataModel get dataModel => _dataModel;

  void setSurface(Surface? surface) {
    _surface = surface;
    notifyListeners();
  }

  void setDataModel(DataModel dataModel) {
    _dataModel = dataModel;
    notifyListeners();
  }

  void updateDataModel(String path, dynamic value) {
    _dataModel = setByPointer(_dataModel, path, value);
    notifyListeners();
  }

  void processMessage(AgentToClientMessage message) {
    if (message is SurfaceUpdateMessage) {
      _surface = message.surface;
    } else if (message is DataModelUpdateMessage) {
      _dataModel = setByPointer(_dataModel, message.path, message.data);
    } else if (message is DeleteSurfaceMessage) {
      if (_surface?.id == message.surfaceId) {
        _surface = null;
      }
    }
    notifyListeners();
  }

  void processMessages(List<AgentToClientMessage> messages) {
    for (final message in messages) {
      processMessage(message);
    }
  }
}
