# Flutter Preview App

This Flutter Web app is used as an iframe preview in the ClaudeCanvas multi-renderer demo. It receives UI specifications via `postMessage` and renders them using the Flutter Material 3 renderer.

## Requirements

- Flutter SDK 3.x+
- Dart SDK 3.x+

## Building

```bash
# Get dependencies
flutter pub get

# Build for web (HTML renderer for better compatibility)
flutter build web --release --web-renderer html
```

## Running

```bash
# Start the serve server on port 4202
pnpm dev
```

Or manually:
```bash
npx serve build/web -l 4202 --cors
```

## How It Works

1. The app listens for `postMessage` events from the parent frame
2. When a `surfaceUpdate` message is received, it parses the surface JSON and renders it
3. When a `dataModelUpdate` message is received, it updates the data model
4. User actions are forwarded back to the parent frame via `postMessage`

### Message Protocol

**Incoming messages:**
```dart
// Batch messages
{ "type": "claude-canvas-messages", "messages": [...] }

// Single messages
{ "type": "surfaceUpdate", "surface": {...} }
{ "type": "dataModelUpdate", "path": "/", "data": {...} }
{ "type": "deleteSurface", "surfaceId": "main" }
```

**Outgoing messages:**
```dart
// Ready notification
{ "type": "flutter-preview-ready" }

// User actions
{ "type": "flutter-preview-action", "action": {...} }

// Data model changes
{ "type": "flutter-preview-data-model-change", "dataModel": {...} }
```

## Development

The main application code is in `lib/main.dart`. Key components:

- `PreviewApp` - Main app widget with message handling
- `_handleMessage()` - Processes incoming postMessage events
- Uses `claude_canvas_renderer` package for rendering

## Troubleshooting

### Blank iframe

1. Ensure the app is built: `flutter build web --release --web-renderer html`
2. Verify port 4202 is available and the server is running
3. Check browser console for errors

### Messages not received

1. Verify the Flutter app sends ready notification: `flutter-preview-ready`
2. Check that CORS is enabled on the serve server (`--cors` flag)
3. Look for JavaScript errors in the Flutter bootstrap

## Scripts

```bash
pnpm build:flutter  # Build Flutter web app
pnpm dev           # Serve on port 4202
pnpm preview       # Same as dev
```
