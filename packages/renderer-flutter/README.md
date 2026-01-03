# @claude-canvas/renderer-flutter

Flutter renderer for ClaudeCanvas declarative UI framework. Renders AI-generated UIs from JSON specifications with full component support.

## Features

- **31 Components** - Layout, input, display, data visualization, feedback, and media
- **JSON Pointer Data Binding** - RFC 6901 compliant path-based data access
- **Conditional Visibility** - Show/hide components based on data state
- **Two-Way Binding** - Automatic data model updates on user input
- **Computed Expressions** - Derived values (count, sum, any, all, none)
- **Theme Support** - Material Design integration

## Installation

Add to your `pubspec.yaml`:

```yaml
dependencies:
  claude_canvas_renderer: ^0.1.0
```

Or install via command line:

```bash
flutter pub add claude_canvas_renderer
```

## Quick Start

```dart
import 'package:flutter/material.dart';
import 'package:claude_canvas_renderer/claude_canvas_renderer.dart';

class MyApp extends StatefulWidget {
  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  Surface? _surface;
  Map<String, dynamic> _dataModel = {};

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: Text('ClaudeCanvas Demo')),
        body: CcSurface(
          surface: _surface,
          initialDataModel: _dataModel,
          onAction: (message) {
            print('User action: ${message.action.type}');
            print('Data: ${message.dataModel}');
          },
          onDataModelChange: (dataModel) {
            setState(() => _dataModel = dataModel);
          },
        ),
      ),
    );
  }
}
```

## Component Catalog

### Layout Components (7)
- **Row** - Horizontal flex container with gap, alignment, wrapping
- **Column** - Vertical flex container with gap, alignment
- **Card** - Container with elevation/shadow
- **Divider** - Horizontal or vertical separator
- **Modal** - Dialog overlay with size options
- **Tabs** - Tabbed interface navigation
- **Accordion** - Expandable sections

### Display Components (5)
- **Text** - Text with styles (heading1/2/3, body, caption, code)
- **Image** - Image display with fit options
- **Icon** - Material icon display
- **Badge** - Status indicators with variants
- **Avatar** - User profile with status

### Form/Input Components (8)
- **TextField** - Text input (text, email, password, etc.)
- **Checkbox** - Boolean toggle
- **Select** - Dropdown selection
- **Slider** - Range input with min/max/step
- **DateTimeInput** - Date/time picker
- **MultipleChoice** - Multi-select options
- **RichTextEditor** - WYSIWYG text editor
- **Button** - Action button with variants

### Interactive Components (2)
- **Tooltip** - Hover information
- **List** - Dynamic list with templates

### Media Components (2)
- **Video** - Video player
- **AudioPlayer** - Audio player

### Data Visualization (3)
- **Chart** - Bar, line, pie, doughnut charts
- **DataTable** - Sortable, paginated tables
- **Progress** - Linear/circular indicators

### Feedback Components (3)
- **Toast** - Notification popups
- **Alert** - Inline alerts
- **Skeleton** - Loading placeholders

## Data Binding

Components bind to data using JSON Pointer paths (RFC 6901):

```dart
// Data model
final dataModel = {
  'user': {
    'name': 'John',
    'email': 'john@example.com',
  },
  'settings': {
    'volume': 50,
    'notifications': true,
  },
};

// Component definition
final component = {
  'component': 'TextField',
  'valuePath': '/user/name',  // Binds to dataModel['user']['name']
  'label': 'Name',
};
```

## Conditional Visibility

Show/hide components based on data:

```dart
// Simple truthy check
{
  'component': 'Button',
  'label': 'Submit',
  'visibleIf': '/form/isValid',
}

// Comparison operators
{
  'component': 'Text',
  'content': 'Premium content',
  'visibleIf': {
    'path': '/user/tier',
    'eq': 'premium',
  },
}
```

Supported operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`

## Processing Messages

Handle agent messages with the controller:

```dart
final controller = CcSurfaceController();

// Process a single message
controller.processMessage(SurfaceUpdateMessage(
  surface: Surface.fromJson(surfaceJson),
));

// Process multiple messages
controller.processMessages([
  DataModelUpdateMessage(path: '/', data: initialData),
  SurfaceUpdateMessage(surface: surface),
]);

// Listen to changes
controller.addListener(() {
  print('Surface: ${controller.surface}');
  print('Data: ${controller.dataModel}');
});
```

## Styling

Components support inline styling:

```dart
{
  'component': 'Card',
  'style': {
    'padding': 16,
    'backgroundColor': '#f0f0f0',
    'borderRadius': 8,
    'opacity': 0.9,
  },
  'children': [...],
}
```

## Actions

Handle user interactions:

```dart
{
  'component': 'Button',
  'label': 'Submit',
  'action': {
    'type': 'submit',  // or 'custom', 'update', 'navigate', 'dismiss'
    'payload': {'source': 'form'},
  },
}
```

Action types:
- `submit` - Submit form data
- `custom` - Custom event with payload
- `update` - Update data model
- `navigate` - Navigation action
- `dismiss` - Close dialog/modal

## Requirements

- Flutter SDK >= 3.10.0
- Dart SDK >= 3.0.0

## Dependencies

- `fl_chart` - Chart rendering
- `intl` - Date/time formatting
- `flutter_html` - HTML content rendering (optional)
- `url_launcher` - External links
- `video_player` - Video playback
- `audioplayers` - Audio playback

## License

MIT
