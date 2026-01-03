# @claude-canvas/core

Core types, utilities, and protocol support for ClaudeCanvas.

## Installation

```bash
pnpm install @claude-canvas/core
```

## What's Included

- **TypeScript Types** - Full type definitions for all components and messages
- **JSON Pointer Utilities** - `getByPointer`, `setByPointer` for data binding
- **Streaming Parser** - Parse JSON messages as they stream in
- **A2A Protocol Support** - Adapters for Agent-to-Agent protocol integration

## Usage

### Types

```typescript
import type {
  Surface,
  Component,
  DataModel,
  AgentToClientMessage,
  UserActionMessage,
} from '@claude-canvas/core';
```

### JSON Pointer Utilities

```typescript
import { getByPointer, setByPointer } from '@claude-canvas/core';

const data = { user: { name: 'John' } };

// Get value
const name = getByPointer(data, '/user/name'); // 'John'

// Set value (immutable)
const updated = setByPointer(data, '/user/name', 'Jane');
```

### Streaming Parser

```typescript
import { StreamingJsonParser, parseMessages } from '@claude-canvas/core';

// Parse complete response
const messages = parseMessages(responseText);

// Or stream incrementally
const parser = new StreamingJsonParser({
  onMessage: (msg) => console.log('Received:', msg),
  onComplete: (msgs) => console.log('Done:', msgs.length),
});

parser.feed(chunk1);
parser.feed(chunk2);
parser.finish();
```

### A2A Protocol

```typescript
import {
  A2ATransportAdapter,
  createA2AMessage,
  wrapMessagesInA2AParts,
} from '@claude-canvas/core';

// Create A2A transport
const transport = new A2ATransportAdapter('https://agent.example.com/a2a');

// Send query, get UI messages
const messages = await transport.sendText('Create a form');

// Send user action
await transport.sendAction(userAction);
```

## Message Types

### Agent → Client

| Type | Description |
|------|-------------|
| `surfaceUpdate` | Create/update a UI surface |
| `dataModelUpdate` | Update data at a JSON Pointer path |
| `deleteSurface` | Remove a surface |
| `beginRendering` | Signal streaming render start |

### Client → Agent

| Type | Description |
|------|-------------|
| `userAction` | Report user interaction |
| `clientCapabilities` | Report supported features |

## Component Types

```typescript
type ComponentType =
  // Layout (8)
  | 'Row' | 'Column' | 'Card' | 'Divider' | 'Modal' | 'Tabs' | 'Accordion' | 'List'
  // Display (5)
  | 'Text' | 'Image' | 'Icon' | 'Badge' | 'Avatar'
  // Input (6)
  | 'TextField' | 'Checkbox' | 'Select' | 'Slider' | 'DateTimeInput' | 'MultipleChoice'
  // Interactive (2)
  | 'Button' | 'Link'
  // Data Visualization (3)
  | 'Chart' | 'DataTable' | 'RichTextEditor'
  // Feedback (5)
  | 'Progress' | 'Toast' | 'Alert' | 'Skeleton' | 'Tooltip'
  // Media (2)
  | 'Video' | 'AudioPlayer';
// Total: 31 components
```

## License

MIT
