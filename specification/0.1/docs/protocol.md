# ClaudeCanvas Protocol v0.1

A declarative UI protocol for Claude AI agents to generate rich, interactive user interfaces.

## Design Requirements

The ClaudeCanvas protocol is designed with the following core requirements:

### 1. LLM-Optimized Generation
- Declarative JSON structure that LLMs can generate reliably
- Nested component trees for intuitive hierarchical UI description
- Simple, predictable patterns for common UI patterns

### 2. Progressive Rendering
- Streaming support via JSONL for real-time UI updates
- `beginRendering` signal to prevent flash of incomplete content
- Incremental data model updates

### 3. Platform Agnostic
- Abstract component definitions render to native widgets
- Client-defined widget registry maps components to implementations
- Supports Lit, React, and future renderers

### 4. Claude Code Integration
- Native MCP server for Claude Code CLI
- No API key required - uses Claude Code subscription
- Streaming and synchronous generation modes

## Protocol Overview

### Communication Flow

```
┌─────────────────┐                    ┌─────────────────┐
│                 │   surfaceUpdate    │                 │
│   Claude Agent  │ ────────────────▶  │     Client      │
│                 │  dataModelUpdate   │    Renderer     │
│                 │  beginRendering    │                 │
│                 │                    │                 │
│                 │ ◀──────────────── │                 │
│                 │    userAction      │                 │
└─────────────────┘                    └─────────────────┘
```

### Message Types

#### Agent → Client

| Message | Description |
|---------|-------------|
| `surfaceUpdate` | Create or update a UI surface with components |
| `dataModelUpdate` | Update the data model at a specific path |
| `deleteSurface` | Remove a surface from the UI |
| `beginRendering` | Signal that initial render can begin |

#### Client → Agent

| Message | Description |
|---------|-------------|
| `userAction` | Report a user interaction (button click, form submit) |
| `clientCapabilities` | Report supported components and features |

## Components

### Layout Components

| Component | Description |
|-----------|-------------|
| `Row` | Horizontal layout container |
| `Column` | Vertical layout container |
| `Card` | Container with optional elevation |
| `Modal` | Overlay dialog controlled by data binding |
| `Tabs` | Tabbed interface |
| `Divider` | Visual separator |

### Display Components

| Component | Description |
|-----------|-------------|
| `Text` | Text display with styling |
| `Image` | Image display |
| `Icon` | Icon display |
| `Video` | Video player |
| `AudioPlayer` | Audio player |

### Input Components

| Component | Description |
|-----------|-------------|
| `TextField` | Text input field |
| `Checkbox` | Boolean toggle |
| `Select` | Dropdown selection |
| `Slider` | Numeric range input |
| `DateTimeInput` | Date and time picker |
| `MultipleChoice` | Multi-select options |

### Interactive Components

| Component | Description |
|-----------|-------------|
| `Button` | Clickable button with action |
| `Link` | Navigation link |
| `List` | Dynamic list with template |

## Data Binding

Components bind to the data model using JSON Pointer paths:

```json
{
  "component": "TextField",
  "valuePath": "/form/email",
  "label": "Email Address"
}
```

The data model is a JSON object that stores all dynamic state:

```json
{
  "form": {
    "email": "user@example.com",
    "name": "John Doe"
  },
  "ui": {
    "showModal": false
  }
}
```

## Actions

Components can trigger actions that are sent to the agent:

```json
{
  "component": "Button",
  "label": "Submit",
  "action": {
    "type": "submit"
  }
}
```

### Action Types

| Type | Description |
|------|-------------|
| `submit` | Submit form data to agent |
| `navigate` | Navigate to a new location |
| `dismiss` | Close a modal or surface |
| `update` | Update data model value |
| `custom` | Custom event with payload |

## Example

A complete example of a contact form:

```json
[
  {
    "type": "dataModelUpdate",
    "path": "/",
    "data": {
      "form": {
        "name": "",
        "email": ""
      }
    }
  },
  {
    "type": "surfaceUpdate",
    "surface": {
      "id": "contact-form",
      "title": "Contact Us",
      "components": [
        {
          "component": "Card",
          "elevated": true,
          "children": [
            {
              "component": "Column",
              "gap": 16,
              "children": [
                {
                  "component": "Text",
                  "content": "Contact Form",
                  "textStyle": "heading2"
                },
                {
                  "component": "TextField",
                  "valuePath": "/form/name",
                  "label": "Name",
                  "placeholder": "Enter your name"
                },
                {
                  "component": "TextField",
                  "valuePath": "/form/email",
                  "label": "Email",
                  "inputType": "email",
                  "placeholder": "Enter your email"
                },
                {
                  "component": "Button",
                  "label": "Submit",
                  "variant": "primary",
                  "action": { "type": "submit" }
                }
              ]
            }
          ]
        }
      ]
    }
  }
]
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2024-12 | Initial specification with core components |

## License

MIT
