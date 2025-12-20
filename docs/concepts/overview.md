# Concepts Overview

ClaudeCanvas is built on several core concepts that enable safe, portable UI generation by AI agents.

## Core Architecture

```
┌─────────────────┐                    ┌─────────────────┐
│                 │   JSON Messages    │                 │
│   Claude Agent  │ ─────────────────▶ │     Client      │
│                 │                    │    Renderer     │
│  (LLM/Claude)   │                    │  (Lit/React)    │
│                 │ ◀───────────────── │                 │
│                 │   User Actions     │                 │
└─────────────────┘                    └─────────────────┘
```

## Key Concepts

### 1. Declarative UI

ClaudeCanvas uses declarative JSON to describe UIs. Instead of imperative code ("create a button, add it to the container"), agents describe what the UI should look like:

```json
{
  "component": "Button",
  "label": "Submit",
  "variant": "primary",
  "action": {"type": "submit"}
}
```

This approach is:
- **Safe**: No code execution, just data
- **LLM-friendly**: Easy for language models to generate
- **Portable**: Same description works across renderers

### 2. Surfaces

A **Surface** is a top-level UI container. Each surface has:
- A unique `id`
- An optional `title`
- An array of `components`

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

Multiple surfaces can coexist (e.g., a main content area and a sidebar).

### 3. Data Model

The **Data Model** is a JSON object that stores all dynamic state. Components bind to the data model using JSON Pointer paths:

```json
// Data model
{
  "form": {
    "name": "John",
    "email": "john@example.com"
  },
  "ui": {
    "showModal": false
  }
}

// Component bindings
{"component": "TextField", "valuePath": "/form/name"}
{"component": "Modal", "openPath": "/ui/showModal"}
```

This separation enables:
- Clear data flow
- Easy state updates
- Predictable behavior

### 4. Messages

Communication happens through typed JSON messages:

**Agent → Client:**
- `surfaceUpdate`: Create or update a UI surface
- `dataModelUpdate`: Update the data model
- `deleteSurface`: Remove a surface
- `beginRendering`: Signal for streaming render start

**Client → Agent:**
- `userAction`: Report user interactions (button clicks, form submits)
- `clientCapabilities`: Report supported features

### 5. Actions

Components can trigger **Actions** that are either:
- Handled locally (data model updates)
- Sent to the agent (form submissions, custom events)

```json
// Local action - updates data model directly
{"type": "update", "path": "/ui/showModal", "value": true}

// Agent action - sent to agent for processing
{"type": "submit"}

// Custom action with payload
{"type": "custom", "event": "itemSelected", "payload": {"id": 123}}
```

### 6. Component Tree

Components form a tree structure through container components:

```json
{
  "component": "Card",
  "children": [
    {
      "component": "Column",
      "children": [
        {"component": "Text", "content": "Title"},
        {"component": "TextField", "valuePath": "/form/name"},
        {"component": "Button", "label": "Submit", "action": {"type": "submit"}}
      ]
    }
  ]
}
```

## Data Flow

1. **Agent generates UI**: Outputs JSON messages describing surfaces and data
2. **Client processes messages**: Updates internal state and renders UI
3. **User interacts**: Clicks buttons, fills forms
4. **Client updates data model**: Input changes update bound values
5. **Client sends actions**: Submit/custom actions go to agent
6. **Agent responds**: Sends new UI updates based on user action

## Streaming

ClaudeCanvas supports streaming for progressive UI rendering:

1. Agent streams JSON as it generates
2. Client parses incrementally
3. UI updates progressively
4. `beginRendering` message signals when to start rendering

This creates responsive UIs even with slow generation.

## Security Model

ClaudeCanvas is secure by design:

- **No code execution**: Only declarative JSON, no eval/scripts
- **Component allowlist**: Only pre-defined component types render
- **Sandboxed rendering**: Components can't escape their container
- **Input validation**: All paths and values are validated

The agent can only request UI elements from the client's component catalog - it cannot inject arbitrary code or access client resources.
