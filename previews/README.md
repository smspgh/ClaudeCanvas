# ClaudeCanvas Preview Apps

This directory contains standalone preview applications for Angular, Flutter, and Android renderers. These apps run as separate servers and are embedded via iframes in the main demo (`samples/agent`).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Demo (port 5176)                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ Lit Renderer │ │React Renderer│ │ (iframe)    │            │
│  │ (direct)     │ │ (direct)     │ │             │            │
│  └─────────────┘ └─────────────┘ │  ┌─────────┐ │            │
│                                    │  │Angular  │ │            │
│  ┌─────────────┐ ┌─────────────┐ │  │:4201    │ │            │
│  │ (iframe)    │ │ (iframe)    │ │  └─────────┘ │            │
│  │ ┌─────────┐ │ │ ┌─────────┐ │ │  ┌─────────┐ │            │
│  │ │Flutter  │ │ │ │Android  │ │ │  │Flutter  │ │            │
│  │ │:4202    │ │ │ │:4203    │ │ │  │:4202    │ │            │
│  │ └─────────┘ │ │ └─────────┘ │ │  └─────────┘ │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Why Iframes?

Some frameworks (Angular, Flutter, Android) require their own runtime environment:

- **Angular**: Requires Angular's change detection and dependency injection system
- **Flutter**: Requires the Flutter Web runtime (dart2js compiled)
- **Android**: Simulated using a React-based emulator

Lit and React renderers run directly in the main demo page.

## Preview Apps

| App | Port | Framework | Description |
|-----|------|-----------|-------------|
| `angular/` | 4201 | Angular 19 | Full Angular app with standalone components |
| `flutter/` | 4202 | Flutter Web | Flutter app compiled to HTML renderer |
| `android/` | 4203 | React (simulation) | Android Compose simulation with Material 3 |

## Communication Protocol

The main demo communicates with iframe previews using `postMessage`:

### Messages from Main Demo to Iframe

```typescript
// Batch update
{
  type: 'claude-canvas-messages',
  messages: [
    { type: 'surfaceUpdate', surface: {...} },
    { type: 'dataModelUpdate', path: '/', data: {...} }
  ]
}

// Single update
{ type: 'surfaceUpdate', surface: {...} }
{ type: 'dataModelUpdate', path: '/form/name', data: 'John' }
{ type: 'deleteSurface', surfaceId: 'main' }
```

### Messages from Iframe to Main Demo

```typescript
// Ready notification
{ type: 'angular-preview-ready' }
{ type: 'flutter-preview-ready' }
{ type: 'android-preview-ready' }

// User actions
{ type: 'angular-preview-action', action: {...} }
{ type: 'flutter-preview-action', action: {...} }
{ type: 'android-preview-action', action: {...} }

// Data model changes
{ type: 'angular-preview-data-model-change', dataModel: {...} }
{ type: 'flutter-preview-data-model-change', dataModel: {...} }
{ type: 'android-preview-data-model-change', dataModel: {...} }
```

## Running Locally

### Start All Previews

From the repository root:

```bash
# Terminal 1: Angular preview
cd previews/angular && pnpm start

# Terminal 2: Flutter preview (requires Flutter SDK)
cd previews/flutter && flutter build web --release --web-renderer html
cd previews/flutter && pnpm dev

# Terminal 3: Android preview
cd previews/android && pnpm dev

# Terminal 4: Main demo
pnpm --filter @claude-canvas/sample-agent dev
```

### Individual Preview Development

**Angular** (port 4201):
```bash
cd previews/angular
pnpm install
pnpm start
```

**Flutter** (port 4202):
```bash
cd previews/flutter
flutter pub get
flutter build web --release --web-renderer html
pnpm dev
```

**Android** (port 4203):
```bash
cd previews/android
pnpm install
pnpm dev
```

## Troubleshooting

### Angular iframe shows "Waiting for UI specification..."

The Angular preview may not receive messages if:
1. The ready notification was sent before the iframe was fully attached
2. There's a port mismatch (ensure Angular runs on 4201)

The Angular preview sends ready notification with a 100ms delay to ensure the iframe is fully attached.

### Flutter iframe is blank

1. Ensure Flutter Web is built: `flutter build web --release --web-renderer html`
2. Check the serve port: `pnpm dev` should start on 4202
3. Look for errors in the browser console

### Android iframe shows blank

1. Check port 4203 is running: `pnpm dev`
2. Verify the Vite dev server started correctly

## Adding a New Preview

1. Create a new directory: `previews/your-framework/`
2. Implement the postMessage protocol:
   - Listen for `message` events on `window`
   - Handle `surfaceUpdate`, `dataModelUpdate`, `deleteSurface` messages
   - Send ready notification: `window.parent.postMessage({ type: 'your-framework-preview-ready' }, '*')`
   - Forward actions and data model changes to parent
3. Update `samples/agent/src/main.ts` to:
   - Add an iframe element
   - Listen for ready messages
   - Queue/send messages to the iframe
