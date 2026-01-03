# ClaudeCanvas

Declarative UI generation for AI agents. Generate rich, interactive user interfaces using natural language prompts with support for multiple LLM providers.

## Overview

ClaudeCanvas is a framework that allows AI agents to generate UIs declaratively using a JSON-based specification compatible with the [A2UI protocol](https://a2ui.org/). It supports multiple LLM providers and renders natively across web platforms.

### Key Features

- **Multi-Provider Support** - Use Claude, OpenAI, Gemini, or Claude Code CLI
- **A2A Protocol Compatible** - Works with Agent-to-Agent protocol transports
- **Dual Renderers** - Lit (Web Components) and React renderers included
- **Declarative JSON Format** - UIs are defined as data, not code
- **Security-First** - Agents can only use pre-approved components
- **Type-Safe** - Full TypeScript support
- **25+ Components** - Forms, charts, data tables, media players, and more

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Web Frontend   │────▶│  Express Server  │────▶│   LLM Provider  │
│ (Lit or React)  │◀────│  (Node.js)       │◀────│ Claude/OpenAI/  │
└─────────────────┘     └──────────────────┘     │ Gemini/Claude   │
         │                       │               │ Code CLI        │
         │   HTTP/JSON           │               └─────────────────┘
         │   or A2A Protocol     │
         ▼                       ▼
    ┌─────────┐           ┌─────────────┐
    │ Browser │           │ ClaudeCanvas│
    │  (UI)   │           │  Messages   │
    └─────────┘           └─────────────┘
```

## Packages

| Package | Description |
|---------|-------------|
| `@claude-canvas/core` | Core types, schemas, A2A protocol utilities |
| `@claude-canvas/renderer-lit` | Lit web components renderer |
| `@claude-canvas/renderer-react` | React components renderer |
| `@claude-canvas/client` | Multi-provider LLM client |
| `@claude-canvas/mcp-server` | MCP server for Claude Code integration |

## Quick Start

### Option 1: With Claude Code (No API Key Required)

```bash
# Install the MCP server globally
npm install -g @claude-canvas/mcp-server

# Add to ~/.claude.json
{
  "mcpServers": {
    "claude-canvas": {
      "command": "claude-canvas-mcp"
    }
  }
}
```

Then in Claude Code, just ask: "Generate a contact form with name, email, and message fields"

### Option 2: With API Keys (OpenAI, Gemini, Anthropic)

```typescript
import { ClaudeCanvasAgent } from '@claude-canvas/client';

// OpenAI
const agent = new ClaudeCanvasAgent({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o',
});

// Gemini
const agent = new ClaudeCanvasAgent({
  provider: 'gemini',
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-1.5-pro',
});

// Anthropic (direct API)
const agent = new ClaudeCanvasAgent({
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-4-20250514',
});

// Generate UI
const messages = await agent.generateUI({
  prompt: 'Create a login form with email and password',
});
```

### Option 3: Run the Demo

```bash
# Clone and install
git clone https://github.com/smspgh/ClaudeCanvas.git
cd ClaudeCanvas
pnpm install
pnpm build

# Start server (uses Claude Code CLI by default)
cd samples/server && pnpm dev

# Start web UI (in another terminal)
cd samples/agent && pnpm dev

# Open http://localhost:5173
```

## Renderers

### Lit (Web Components)

```html
<script type="module">
  import '@claude-canvas/renderer-lit';
</script>

<cc-surface id="app"></cc-surface>

<script type="module">
  const surface = document.getElementById('app');
  surface.processMessages(messages);

  surface.addEventListener('cc-user-action', (e) => {
    console.log('User action:', e.detail);
  });
</script>
```

### React

```tsx
import { CcSurface } from '@claude-canvas/renderer-react';
import '@claude-canvas/renderer-react/styles.css';

function App() {
  const [surface, setSurface] = useState(null);
  const [dataModel, setDataModel] = useState({});

  const handleAction = (action) => {
    console.log('User action:', action);
  };

  return (
    <CcSurface
      surface={surface}
      initialDataModel={dataModel}
      onAction={handleAction}
      onDataModelChange={setDataModel}
    />
  );
}
```

## A2A Protocol Support

ClaudeCanvas is compatible with the [A2A (Agent-to-Agent) protocol](https://google.github.io/A2A/):

```typescript
import { A2ATransportAdapter, createA2AMessage } from '@claude-canvas/core';

// Create A2A transport
const transport = new A2ATransportAdapter('https://your-agent.com/a2a');

// Send text query, receive UI messages
const messages = await transport.sendText('Create a dashboard');

// Send user action back to agent
await transport.sendAction({
  type: 'userAction',
  surfaceId: 'main',
  action: { type: 'submit' },
  dataModel: formData,
});
```

## Component Catalog

### Layout
- `Row` - Horizontal flex container
- `Column` - Vertical flex container
- `Card` - Container with border/shadow
- `Divider` - Separator line
- `Modal` - Dialog overlay
- `Tabs` - Tabbed interface
- `Accordion` - Expandable sections

### Display
- `Text` - Text with styles (heading1/2/3, body, caption, code)
- `Image` - Image display with fit options
- `Icon` - Icon display
- `Badge` - Status label
- `Avatar` - User profile image with status

### Input
- `TextField` - Text input (single/multiline)
- `Checkbox` - Boolean toggle
- `Select` - Dropdown selection
- `Slider` - Range input
- `DateTimeInput` - Date/time picker
- `MultipleChoice` - Multi-select options

### Data Visualization
- `Chart` - Bar, line, pie, doughnut charts
- `DataTable` - Sortable, paginated tables
- `RichTextEditor` - WYSIWYG editor

### Feedback
- `Progress` - Linear/circular progress
- `Toast` - Notification messages
- `Alert` - Inline alerts
- `Skeleton` - Loading placeholders
- `Tooltip` - Hover information

### Media
- `Video` - Video player
- `AudioPlayer` - Audio player

## Data Binding

Components bind to data using JSON Pointer paths:

```json
{
  "component": "Text",
  "contentPath": "/user/name"
}
```

### Conditional Visibility

```json
{
  "component": "Button",
  "label": "Play",
  "visibleIf": { "path": "/player/isPlaying", "eq": false }
}
```

### Dynamic Lists

```json
{
  "component": "List",
  "itemsPath": "/messages",
  "itemTemplate": {
    "component": "Text",
    "contentPath": "/item/text"
  }
}
```

## Iteration Support

ClaudeCanvas supports iterative UI refinement. After generating a UI, follow-up prompts include the current state:

```typescript
// First request - creates new UI
await agent.generateUI({ prompt: 'Create a contact form' });

// Second request - modifies existing UI
await agent.generateUI({
  prompt: 'Add a phone number field',
  currentSurface: existingSurface,
  dataModel: currentDataModel,
});
```

## Environment Variables

```bash
# For direct API access (optional)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...

# Server config
PORT=3001
```

## Project Structure

```
ClaudeCanvas/
├── packages/
│   ├── core/              # Types, schemas, A2A protocol
│   ├── renderer-lit/      # Lit web components
│   ├── renderer-react/    # React components
│   ├── client/            # Multi-provider LLM client
│   └── mcp-server/        # Claude Code MCP server
├── samples/
│   ├── server/            # Express API server
│   └── agent/             # Web demo app
├── docs/                  # Documentation
└── specification/         # Protocol specification
```

## Requirements

- Node.js 20+
- pnpm

For Claude Code integration:
- Claude Code CLI installed and authenticated

For API access:
- API key from OpenAI, Google, or Anthropic

## License

MIT
