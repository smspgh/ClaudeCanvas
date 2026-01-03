# @claude-canvas/client

Multi-provider LLM client for ClaudeCanvas UI generation.

## Installation

```bash
pnpm install @claude-canvas/client
```

## Supported Providers

| Provider | API Key Required | Model Examples |
|----------|-----------------|----------------|
| `claude-cli` | No (uses Claude Code subscription) | `sonnet`, `opus`, `haiku` |
| `openai` | Yes | `gpt-4o`, `gpt-4`, `gpt-4-turbo` |
| `gemini` | Yes | `gemini-1.5-pro`, `gemini-1.5-flash` |
| `anthropic` | Yes | `claude-sonnet-4-20250514` |

## Usage

### Claude Code CLI (Default - No API Key)

```typescript
import { ClaudeCanvasAgent } from '@claude-canvas/client';

const agent = new ClaudeCanvasAgent({
  provider: 'claude-cli',
  model: 'sonnet',
});

const messages = await agent.generateUI({
  prompt: 'Create a contact form'
});
```

### OpenAI

```typescript
const agent = new ClaudeCanvasAgent({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o',
});
```

### Google Gemini

```typescript
const agent = new ClaudeCanvasAgent({
  provider: 'gemini',
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-1.5-pro',
});
```

### Anthropic (Direct API)

```typescript
const agent = new ClaudeCanvasAgent({
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-4-20250514',
});
```

## Configuration Options

```typescript
interface ClaudeCanvasAgentOptions {
  provider?: 'openai' | 'gemini' | 'anthropic' | 'claude-cli';
  apiKey?: string;
  model?: string;
  baseUrl?: string;  // Custom API endpoint
  cwd?: string;      // Working directory for Claude CLI
  claudePath?: string;  // Custom path to claude CLI
}
```

## Iteration Support

The agent supports iterative UI refinement by passing current state:

```typescript
// First request
const messages1 = await agent.generateUI({
  prompt: 'Create a contact form'
});

// Iterate on existing UI
const messages2 = await agent.generateUI({
  prompt: 'Add a phone number field',
  currentSurface: existingSurface,
  dataModel: currentDataModel,
});
```

## License

MIT
