# ClaudeCanvas Documentation

ClaudeCanvas is a declarative UI protocol for Claude AI agents to generate rich, interactive user interfaces.

## What is ClaudeCanvas?

ClaudeCanvas enables AI agents (like Claude) to generate user interfaces by outputting declarative JSON descriptions. The client application renders these descriptions using native UI components, creating a safe and portable way for agents to present rich interfaces.

## Key Features

- **Declarative JSON Format**: Simple, structured format optimized for LLM generation
- **Claude Code Integration**: Native MCP server for seamless Claude Code CLI integration
- **Cross-Platform Renderers**: Lit (Web Components) and React implementations
- **Streaming Support**: Progressive UI updates as content generates
- **Rich Component Library**: 31 components for forms, layout, media, and more

## Quick Links

- [Getting Started](./quickstart.md)
- [Component Reference](./reference/components.md)
- [Concepts](./concepts/overview.md)
- [Protocol Specification](../specification/0.1/docs/protocol.md)

## Installation

```bash
# Install core types
pnpm install @claude-canvas/core

# Install renderer (choose one)
pnpm install @claude-canvas/renderer-lit  # Web Components
pnpm install @claude-canvas/renderer-react # React

# Optional: MCP server for Claude Code
pnpm install @claude-canvas/mcp-server
```

## Basic Example

```json
[
  {
    "type": "dataModelUpdate",
    "path": "/",
    "data": { "form": { "name": "" } }
  },
  {
    "type": "surfaceUpdate",
    "surface": {
      "id": "hello",
      "title": "Hello World",
      "components": [
        {
          "component": "Card",
          "elevated": true,
          "children": [
            {
              "component": "Column",
              "gap": 16,
              "children": [
                { "component": "Text", "content": "Welcome!", "textStyle": "heading2" },
                { "component": "TextField", "valuePath": "/form/name", "label": "Your name" },
                { "component": "Button", "label": "Submit", "variant": "primary", "action": { "type": "submit" } }
              ]
            }
          ]
        }
      ]
    }
  }
]
```

## License

MIT
