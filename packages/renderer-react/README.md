# @claude-canvas/renderer-react

React renderer for ClaudeCanvas declarative UI.

## Installation

```bash
pnpm install @claude-canvas/renderer-react
```

**Peer Dependencies:** React 18 or 19

## Usage

```tsx
import { useState } from 'react';
import { CcSurface } from '@claude-canvas/renderer-react';
import '@claude-canvas/renderer-react/styles.css';  // Required!

function App() {
  const [surface, setSurface] = useState(null);
  const [dataModel, setDataModel] = useState({});

  const handleAction = (action) => {
    console.log('User action:', action);
    // Handle submit, custom events, etc.
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

## Props

| Prop | Type | Description |
|------|------|-------------|
| `surface` | `Surface \| null` | The surface definition to render |
| `initialDataModel` | `DataModel` | Initial data model state |
| `onAction` | `(action: UserActionMessage) => void` | Callback for user actions |
| `onDataModelChange` | `(dataModel: DataModel) => void` | Callback when data model changes |

## Processing Messages

```tsx
import { ClaudeCanvasAgent } from '@claude-canvas/client';

const agent = new ClaudeCanvasAgent({ provider: 'openai', apiKey: '...' });

// Generate UI
const messages = await agent.generateUI({
  prompt: 'Create a login form'
});

// Process messages to update state
for (const msg of messages) {
  if (msg.type === 'surfaceUpdate') {
    setSurface(msg.surface);
  } else if (msg.type === 'dataModelUpdate') {
    setDataModel(prev => ({ ...prev, ...msg.data }));
  }
}
```

## Styling / Theming

The renderer uses CSS custom properties for theming. Override these in your CSS:

```css
:root {
  --cc-primary: #0066cc;
  --cc-primary-light: rgba(0, 102, 204, 0.1);
  --cc-primary-hover: #0052a3;
  --cc-secondary: #f5f5f5;
  --cc-text: #333333;
  --cc-text-muted: #666666;
  --cc-border: #d1d5db;
  --cc-danger: #dc2626;
  --cc-success: #10b981;
  --cc-warning: #f59e0b;
  --cc-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

## Supported Components

All 31 ClaudeCanvas components are supported:

- **Layout**: Row, Column, Card, Modal, Tabs, Accordion, Divider, List
- **Display**: Text, Image, Icon, Badge, Avatar
- **Input**: TextField, Checkbox, Select, Slider, DateTimeInput, MultipleChoice
- **Data**: Chart, DataTable, RichTextEditor
- **Feedback**: Progress, Toast, Alert, Skeleton, Tooltip
- **Media**: Video, AudioPlayer
- **Interactive**: Button, Link

## License

MIT
