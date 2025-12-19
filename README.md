# ClaudeCanvas

Declarative UI generation powered by **Claude Code**. Generate rich, interactive user interfaces using natural language prompts - no API key required, uses your Claude Code subscription!

## Overview

ClaudeCanvas is a framework that allows Claude to generate UIs declaratively using a JSON-based specification. Unlike the original A2UI project (which uses Gemini), ClaudeCanvas is built specifically for Claude Code.

### Key Features

- **No API Key Required** - Uses your Claude Code subscription
- **Declarative JSON Format** - UIs are defined as data, not code
- **Security-First** - Agents can only use pre-approved components
- **Type-Safe** - Full TypeScript support

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Web Frontend   │────▶│  Express Server  │────▶│   Claude Code   │
│  (Lit Renderer) │◀────│  (Node.js)       │◀────│   (Your Sub)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         │   HTTP/JSON           │  Claude Agent SDK
         │                       │  or CLI (-p flag)
         ▼                       ▼
    ┌─────────┐           ┌─────────────┐
    │ Browser │           │ ClaudeCanvas│
    │  (UI)   │           │   Messages  │
    └─────────┘           └─────────────┘
```

## Packages

| Package | Description |
|---------|-------------|
| `@claude-canvas/core` | Core types, schemas, and utilities |
| `@claude-canvas/renderer-lit` | Lit web components for rendering |
| `@claude-canvas/client` | Claude Code integration (SDK + CLI) |

## Quick Start

### 1. Install Dependencies

```bash
cd ClaudeCanvas
pnpm install
pnpm build
```

### 2. Start the Server (uses Claude Code)

```bash
cd samples/server
pnpm dev
```

### 3. Start the Web UI

```bash
# In another terminal
cd samples/agent
pnpm dev
```

### 4. Open the Demo

Visit http://localhost:5173 and describe the UI you want!

## How It Works

1. **You describe** what UI you want in natural language
2. **Server calls Claude Code** using your subscription (via SDK or CLI)
3. **Claude generates** ClaudeCanvas JSON messages
4. **Renderer displays** the UI using Lit web components
5. **User interactions** flow back to Claude for responses

## Using Claude Code

ClaudeCanvas uses the `claude` CLI under the hood - spawning `claude -p "..." --output-format text` with a system prompt for UI generation.

### Class-based Agent

```typescript
import { ClaudeCanvasAgent } from '@claude-canvas/client';

const agent = new ClaudeCanvasAgent({
  model: 'sonnet', // or 'opus', 'haiku'
});

const messages = await agent.generateUI({
  prompt: 'Create a login form',
});
```

### Standalone Function

```typescript
import { generateUIViaCLI } from '@claude-canvas/client';

const messages = await generateUIViaCLI('Create a contact form');
```

## Component Catalog

### Layout
- `Row` - Horizontal flex container
- `Column` - Vertical flex container
- `Card` - Container with border/shadow
- `Divider` - Separator line

### Display
- `Text` - Text with styles (heading1/2/3, body, caption, code)
- `Image` - Image display
- `Icon` - Icon display

### Input
- `TextField` - Text input (single/multiline)
- `Checkbox` - Boolean toggle
- `Select` - Dropdown selection
- `Slider` - Range input

### Interactive
- `Button` - Clickable button with actions
- `Link` - Text link

## Example Prompts

Try these in the demo:

- "Create a login form with email, password, and remember me checkbox"
- "Build a product card showing name, price, description, and add to cart button"
- "Make a settings panel with toggles for notifications, dark mode, and language selector"
- "Design a user profile card with avatar, name, bio, and follow button"

## Data Binding

Components bind to data using JSON Pointer paths:

```json
{
  "component": "Text",
  "contentPath": "/user/name"
}
```

## Project Structure

```
ClaudeCanvas/
├── packages/
│   ├── core/           # Types & schemas
│   ├── renderer-lit/   # Web components
│   └── client/         # Claude Code integration
├── samples/
│   ├── server/         # Express API server
│   └── agent/          # Web demo app
└── README.md
```

## Requirements

- Node.js 20+
- pnpm
- Claude Code CLI installed and authenticated

## License

MIT
