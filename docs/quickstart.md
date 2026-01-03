# Quickstart

Get started with ClaudeCanvas in minutes.

## Option 1: With Claude Code (No API Key Required)

If you have Claude Code CLI installed, ClaudeCanvas integrates natively via MCP:

### 1. Install the MCP Server

```bash
pnpm install -g @claude-canvas/mcp-server
```

### 2. Add to Claude Code Config

Add to your `~/.claude.json`:

```json
{
  "mcpServers": {
    "claude-canvas": {
      "command": "claude-canvas-mcp"
    }
  }
}
```

### 3. Restart Claude Code

The `generate_ui` tool is now available! Try:

```
Generate a contact form with name, email, and message fields
```

## Option 2: With API Key (OpenAI, Gemini, Anthropic)

Use ClaudeCanvas with your preferred LLM provider:

### 1. Install Dependencies

```bash
pnpm install @claude-canvas/core @claude-canvas/client @claude-canvas/renderer-lit
```

### 2. Configure Your Provider

```typescript
import { ClaudeCanvasAgent } from '@claude-canvas/client';

// OpenAI
const agent = new ClaudeCanvasAgent({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o',  // or 'gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'
});

// Google Gemini
const agent = new ClaudeCanvasAgent({
  provider: 'gemini',
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-1.5-pro',  // or 'gemini-1.5-flash', 'gemini-pro'
});

// Anthropic (Direct API)
const agent = new ClaudeCanvasAgent({
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-4-20250514',  // or other Claude models
});

// Claude Code CLI (default, no API key)
const agent = new ClaudeCanvasAgent({
  provider: 'claude-cli',
  model: 'sonnet',  // or 'opus', 'haiku'
});
```

### 3. Generate UI

```typescript
const messages = await agent.generateUI({
  prompt: 'Create a login form with email and password fields'
});

// Process messages in your renderer
surface.processMessages(messages);
```

## Option 3: Run the Demo App

### 1. Clone and Install

```bash
git clone https://github.com/smspgh/ClaudeCanvas.git
cd ClaudeCanvas
pnpm install
pnpm build
```

### 2. Configure Provider (Optional)

Create a `.env` file in `samples/server/` to use a different provider:

```bash
# Use one of these (server auto-detects):
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

# Or Gemini:
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-1.5-pro

# Or Anthropic:
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# If none set, falls back to Claude Code CLI (no key needed)
```

### 3. Start the Server

```bash
cd samples/server
pnpm dev
```

### 4. Start the Web UI

```bash
# In another terminal
cd samples/agent
pnpm dev
```

### 5. Open the Demo

Visit http://localhost:5173 and describe the UI you want!

## Renderer Usage

### Lit (Web Components)

```bash
pnpm install @claude-canvas/renderer-lit
```

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import '@claude-canvas/renderer-lit';
  </script>
</head>
<body>
  <cc-surface id="app"></cc-surface>

  <script type="module">
    const surface = document.getElementById('app');

    // Process messages from your agent
    surface.processMessages([
      {
        type: 'dataModelUpdate',
        path: '/',
        data: { form: { name: '' } }
      },
      {
        type: 'surfaceUpdate',
        surface: {
          id: 'demo',
          title: 'Hello ClaudeCanvas',
          components: [
            {
              component: 'Card',
              elevated: true,
              children: [
                {
                  component: 'Column',
                  gap: 16,
                  children: [
                    { component: 'Text', content: 'Welcome!', textStyle: 'heading2' },
                    { component: 'TextField', valuePath: '/form/name', label: 'Name' },
                    { component: 'Button', label: 'Submit', variant: 'primary', action: { type: 'submit' } }
                  ]
                }
              ]
            }
          ]
        }
      }
    ]);

    // Handle user actions
    surface.addEventListener('cc-user-action', (e) => {
      console.log('User action:', e.detail);
    });
  </script>
</body>
</html>
```

### React

```bash
pnpm install @claude-canvas/renderer-react
```

```tsx
import { useState, useEffect } from 'react';
import { CcSurface } from '@claude-canvas/renderer-react';
import '@claude-canvas/renderer-react/styles.css';

function App() {
  const [surface, setSurface] = useState(null);
  const [dataModel, setDataModel] = useState({});

  useEffect(() => {
    // Set initial data model
    setDataModel({ form: { name: '' } });

    // Set surface
    setSurface({
      id: 'demo',
      title: 'Hello ClaudeCanvas',
      components: [
        { component: 'Text', content: 'Welcome!', textStyle: 'heading2' },
        { component: 'TextField', valuePath: '/form/name', label: 'Name' },
        { component: 'Button', label: 'Submit', variant: 'primary', action: { type: 'submit' } }
      ]
    });
  }, []);

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

## Environment Variables Reference

| Variable | Provider | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | OpenAI | Your OpenAI API key |
| `OPENAI_MODEL` | OpenAI | Model to use (default: `gpt-4o`) |
| `GEMINI_API_KEY` | Gemini | Your Google AI API key |
| `GEMINI_MODEL` | Gemini | Model to use (default: `gemini-1.5-pro`) |
| `ANTHROPIC_API_KEY` | Anthropic | Your Anthropic API key |
| `ANTHROPIC_MODEL` | Anthropic | Model to use (default: `claude-sonnet-4-20250514`) |
| `CLAUDE_MODEL` | Claude CLI | Model for CLI (default: `sonnet`) |
| `PORT` | Server | Server port (default: `3001`) |

The server automatically detects which provider to use based on which API key is set.

## Next Steps

- [Component Reference](./reference/components.md) - All available components
- [Concepts](./concepts/overview.md) - Understand the architecture
- [Protocol Specification](../specification/0.1/docs/protocol.md) - Technical details
