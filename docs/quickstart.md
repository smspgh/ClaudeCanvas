# Quickstart

Get started with ClaudeCanvas in minutes.

## Option 1: With Claude Code (Recommended)

If you have Claude Code CLI installed, ClaudeCanvas integrates natively via MCP:

### 1. Install the MCP Server

```bash
npm install -g @claude-canvas/mcp-server
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

## Option 2: Programmatic Usage

### 1. Install Dependencies

```bash
npm install @claude-canvas/core @claude-canvas/renderer-lit
```

### 2. Add to Your HTML

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

### 3. React Usage

```tsx
import { CcSurface, useCcSurface } from '@claude-canvas/renderer-react';
import '@claude-canvas/renderer-react/styles.css';

function App() {
  const { surface, dataModel, processMessages } = useCcSurface();

  useEffect(() => {
    processMessages([
      { type: 'dataModelUpdate', path: '/', data: { form: { name: '' } } },
      {
        type: 'surfaceUpdate',
        surface: {
          id: 'demo',
          title: 'Hello ClaudeCanvas',
          components: [
            { component: 'Text', content: 'Welcome!', textStyle: 'heading2' },
            { component: 'TextField', valuePath: '/form/name', label: 'Name' },
            { component: 'Button', label: 'Submit', variant: 'primary', action: { type: 'submit' } }
          ]
        }
      }
    ]);
  }, []);

  const handleAction = (action) => {
    console.log('User action:', action);
  };

  return (
    <CcSurface
      surface={surface}
      initialDataModel={dataModel}
      onAction={handleAction}
    />
  );
}
```

## Using the Client Agent

For server-side generation with Claude Code CLI:

```typescript
import { ClaudeCanvasAgent } from '@claude-canvas/client';

const agent = new ClaudeCanvasAgent({
  model: 'sonnet'
});

// Generate UI from a prompt
const messages = await agent.generateUI({
  prompt: 'Create a login form with email and password fields'
});

// Process messages in your renderer
surface.processMessages(messages);
```

## Next Steps

- [Component Reference](./reference/components.md) - All available components
- [Concepts](./concepts/overview.md) - Understand the architecture
- [Protocol Specification](../specification/0.1/docs/protocol.md) - Technical details
