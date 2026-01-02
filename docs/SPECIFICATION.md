# ClaudeCanvas Specification

**Version:** 1.0.0
**Status:** Draft
**Last Updated:** 2026-01-02

## Abstract

ClaudeCanvas is a declarative UI specification for AI agents. It enables AI agents to generate user interfaces through structured JSON messages, without executing arbitrary code. This document defines the protocol, component catalog, and security model.

## 1. Introduction

### 1.1 Purpose

ClaudeCanvas allows AI agents to create rich, interactive user interfaces by describing what the UI should look like (declarative), rather than how to build it (imperative). The client renders these descriptions into actual UI components.

### 1.2 Goals

- **Safety**: No code execution - only declarative JSON
- **Portability**: Same specification works across Lit, React, Flutter, etc.
- **LLM-Friendly**: Easy for language models to generate
- **Extensibility**: Custom components can be registered

### 1.3 Comparison with A2UI

ClaudeCanvas is compatible with Google's A2UI (Agent-to-User Interface) specification, with additional features:

| Feature | ClaudeCanvas | A2UI |
|---------|-------------|------|
| Declarative JSON | Yes | Yes |
| React Renderer | Yes | No |
| Lit Renderer | Yes | Planned |
| Flutter Renderer | Planned | Yes |
| Conditional Visibility | Yes (visibleIf) | Limited |
| Charts/DataTable | Yes | No |
| Rich Text Editor | Yes | No |
| A2A Protocol | Planned | Yes |

## 2. Protocol

### 2.1 Message Types

#### 2.1.1 Agent-to-Client Messages

**surfaceUpdate** - Create or update a UI surface:
```json
{
  "type": "surfaceUpdate",
  "surface": {
    "id": "main",
    "title": "My App",
    "components": [...]
  }
}
```

**dataModelUpdate** - Update the data model:
```json
{
  "type": "dataModelUpdate",
  "path": "/form/name",
  "data": "John Doe"
}
```

**deleteSurface** - Remove a surface:
```json
{
  "type": "deleteSurface",
  "surfaceId": "main"
}
```

**beginRendering** - Signal streaming render start:
```json
{
  "type": "beginRendering",
  "surfaceId": "main"
}
```

#### 2.1.2 Client-to-Agent Messages

**userAction** - Report user interactions:
```json
{
  "type": "userAction",
  "surfaceId": "main",
  "action": {"type": "submit"},
  "dataModel": {...}
}
```

**clientCapabilities** - Report supported features:
```json
{
  "type": "clientCapabilities",
  "supportedComponents": ["Text", "Button", "TextField", ...],
  "supportsMarkdown": true,
  "supportsStreaming": true
}
```

### 2.2 Data Binding

Components bind to the data model using JSON Pointer paths (RFC 6901):

- `/form/name` - Access nested property
- `/items/0/title` - Access array element
- `/` - Root of data model

### 2.3 Actions

```typescript
interface Action {
  type: 'submit' | 'navigate' | 'dismiss' | 'custom' | 'update';
  event?: string;        // For custom actions
  payload?: object;      // Additional data
  path?: string;         // For update actions
  value?: unknown;       // For update actions
}
```

## 3. Component Catalog

### 3.1 Layout Components

#### Row
Horizontal flex container.
```json
{
  "component": "Row",
  "gap": 12,
  "align": "center",
  "justify": "spaceBetween",
  "wrap": true,
  "children": [...]
}
```

#### Column
Vertical flex container.
```json
{
  "component": "Column",
  "gap": 12,
  "align": "center",
  "children": [...]
}
```

#### Card
Elevated container with optional shadow.
```json
{
  "component": "Card",
  "elevated": true,
  "children": [...]
}
```

#### Divider
Horizontal or vertical separator.
```json
{
  "component": "Divider",
  "vertical": false
}
```

#### Modal
Dialog overlay.
```json
{
  "component": "Modal",
  "openPath": "/ui/showModal",
  "title": "Dialog Title",
  "size": "medium",
  "dismissible": true,
  "children": [...]
}
```

#### Tabs
Tabbed interface.
```json
{
  "component": "Tabs",
  "valuePath": "/ui/activeTab",
  "tabs": [
    {"label": "Tab 1", "value": "tab1", "children": [...]},
    {"label": "Tab 2", "value": "tab2", "children": [...]}
  ]
}
```

#### List
Iterate over array data with a template. **Use this instead of hardcoding repeated items!**
```json
{
  "component": "List",
  "itemsPath": "/messages",
  "itemTemplate": {
    "component": "Card",
    "children": [
      {"component": "Text", "contentPath": "/item/text"}
    ]
  },
  "emptyMessage": "No messages yet"
}
```
Inside the `itemTemplate`, use `/item/fieldName` to access each item's properties and `/index` for the position.

### 3.2 Display Components

#### Text
Display text content.
```json
{
  "component": "Text",
  "content": "Hello World",
  "textStyle": "heading1",
  "color": "#333",
  "markdown": false
}
```
Dynamic: `{"contentPath": "/user/name"}`

#### Image
Display images.
```json
{
  "component": "Image",
  "src": "https://example.com/image.jpg",
  "alt": "Description",
  "fit": "cover"
}
```

#### Icon
Display icons.
```json
{
  "component": "Icon",
  "name": "settings",
  "size": 24,
  "color": "#666"
}
```

### 3.3 Input Components

#### TextField
Text input with data binding.
```json
{
  "component": "TextField",
  "valuePath": "/form/name",
  "label": "Name",
  "placeholder": "Enter name",
  "inputType": "text",
  "multiline": false,
  "required": true
}
```

#### Checkbox
Boolean toggle.
```json
{
  "component": "Checkbox",
  "valuePath": "/form/agree",
  "label": "I agree to terms"
}
```

#### Select
Dropdown selection.
```json
{
  "component": "Select",
  "valuePath": "/form/country",
  "label": "Country",
  "options": [
    {"label": "USA", "value": "us"},
    {"label": "UK", "value": "uk"}
  ]
}
```

#### Slider
Numeric range input.
```json
{
  "component": "Slider",
  "valuePath": "/form/volume",
  "label": "Volume",
  "min": 0,
  "max": 100,
  "step": 1,
  "trackColor": "#e5e7eb",
  "fillColor": "#3b82f6"
}
```

#### DateTimeInput
Date and/or time picker.
```json
{
  "component": "DateTimeInput",
  "valuePath": "/form/date",
  "label": "Select Date",
  "enableDate": true,
  "enableTime": false
}
```

#### MultipleChoice
Multi-select options.
```json
{
  "component": "MultipleChoice",
  "valuePath": "/form/items",
  "label": "Select items",
  "options": [...],
  "maxSelections": 3
}
```

### 3.4 Interactive Components

#### Button
Clickable button with action.
```json
{
  "component": "Button",
  "label": "Submit",
  "variant": "primary",
  "icon": "send",
  "action": {"type": "submit"}
}
```

Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`

#### Accordion
Expandable sections.
```json
{
  "component": "Accordion",
  "items": [
    {
      "id": "section1",
      "title": "Section 1",
      "subtitle": "More info",
      "children": [...]
    }
  ],
  "allowMultiple": false,
  "variant": "bordered"
}
```

### 3.5 Feedback Components

#### Progress
Linear or circular progress indicator.
```json
{
  "component": "Progress",
  "valuePath": "/loading/progress",
  "variant": "circular",
  "size": "medium",
  "showLabel": true
}
```

#### Badge
Status label or count.
```json
{
  "component": "Badge",
  "content": "New",
  "variant": "success",
  "pill": true
}
```

#### Avatar
User profile image with fallback.
```json
{
  "component": "Avatar",
  "src": "https://example.com/user.jpg",
  "initials": "JD",
  "size": "medium",
  "status": "online"
}
```

#### Toast
Notification message.
```json
{
  "component": "Toast",
  "openPath": "/ui/toast",
  "message": "Saved successfully!",
  "variant": "success",
  "position": "bottom-right",
  "duration": 5000
}
```

#### Alert
Inline alert message.
```json
{
  "component": "Alert",
  "message": "This is important",
  "variant": "warning",
  "title": "Warning",
  "dismissible": true
}
```

#### Skeleton
Loading placeholder.
```json
{
  "component": "Skeleton",
  "variant": "text",
  "lines": 3,
  "animation": "pulse"
}
```

#### Tooltip
Hover information.
```json
{
  "component": "Tooltip",
  "content": "More info",
  "position": "top",
  "children": [...]
}
```

### 3.6 Media Components

#### Video
Video player.
```json
{
  "component": "Video",
  "src": "https://example.com/video.mp4",
  "poster": "https://example.com/thumb.jpg",
  "controls": true,
  "autoplay": false
}
```

#### AudioPlayer
Audio player.
```json
{
  "component": "AudioPlayer",
  "src": "https://example.com/audio.mp3",
  "title": "Track Name",
  "controls": true
}
```

### 3.7 Data Visualization Components

#### Chart
Bar, line, pie, or doughnut chart.
```json
{
  "component": "Chart",
  "chartType": "bar",
  "dataPath": "/analytics/data",
  "title": "Sales",
  "showLegend": true,
  "height": 250
}
```

#### DataTable
Sortable, paginated data table.
```json
{
  "component": "DataTable",
  "dataPath": "/data/users",
  "columns": [
    {"key": "name", "label": "Name", "sortable": true},
    {"key": "email", "label": "Email"}
  ],
  "pagination": true,
  "pageSize": 10,
  "searchable": true
}
```

#### RichTextEditor
WYSIWYG text editor.
```json
{
  "component": "RichTextEditor",
  "valuePath": "/content",
  "placeholder": "Start writing...",
  "toolbar": ["bold", "italic", "heading", "list"]
}
```

## 4. Conditional Visibility

Components can be conditionally shown using `visibleIf`:

### 4.1 Simple Truthy Check
```json
{
  "component": "Button",
  "visibleIf": "/ui/showButton",
  "label": "Click Me"
}
```

### 4.2 Comparison Operators
```json
{
  "component": "Button",
  "visibleIf": {
    "path": "/player/isPlaying",
    "eq": false
  },
  "label": "Play"
}
```

Supported operators:
- `eq` - Equal
- `neq` - Not equal
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal

## 5. Styling

### 5.1 Component Style
```json
{
  "style": {
    "padding": 16,
    "margin": {"top": 8, "bottom": 8},
    "backgroundColor": "#f5f5f5",
    "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "borderRadius": 8,
    "borderColor": "#ddd",
    "borderWidth": 1,
    "width": "100%",
    "height": 200,
    "flex": 1,
    "opacity": 0.8
  }
}
```

### 5.2 CSS Custom Properties

Renderers support theming via CSS custom properties:

```css
:root {
  --cc-primary: #6366f1;
  --cc-text: #1e293b;
  --cc-border: #e2e8f0;
  --cc-font: -apple-system, BlinkMacSystemFont, sans-serif;
}
```

## 6. Security Model

### 6.1 No Code Execution
- Only declarative JSON is processed
- No `eval()`, `Function()`, or script injection
- Component properties are sanitized

### 6.2 Component Allowlist
- Only registered component types render
- Unknown component types are ignored with warning
- Custom components must be explicitly registered

### 6.3 Input Validation
- JSON Pointer paths are validated
- Action types are constrained
- URLs in images/media are sanitized

### 6.4 Sandboxed Rendering
- Components cannot access parent DOM
- No arbitrary HTML injection
- Markdown rendering is sanitized

## 7. Renderers

### 7.1 Lit Web Components
```html
<script type="module">
  import '@claude-canvas/renderer-lit';
</script>
<cc-surface id="main"></cc-surface>
```

### 7.2 React
```tsx
import { CcSurface } from '@claude-canvas/renderer-react';

<CcSurface
  surface={surface}
  initialDataModel={data}
  onAction={handleAction}
/>
```

### 7.3 Future Renderers
- Flutter (planned)
- React Native (planned)
- SwiftUI (planned)

## 8. MCP Server Integration

ClaudeCanvas provides an MCP server for Claude Code:

```bash
claude mcp add claude-canvas
```

This adds tools for:
- `generate_ui` - Generate declarative UI
- `update_data_model` - Update surface data
- `delete_surface` - Remove surfaces

## Appendix A: Type Definitions

See `packages/core/src/types.ts` for complete TypeScript definitions.

## Appendix B: JSON Schema

See `packages/mcp-server/src/schema.ts` for component JSON schemas.

## Appendix C: Changelog

### 1.0.0 (2026-01-02)
- Initial specification
- 25+ component types
- Lit and React renderers
- MCP server integration
- Conditional visibility (visibleIf)
- Chart, DataTable, RichTextEditor components
