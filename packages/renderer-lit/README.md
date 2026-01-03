# @claude-canvas/renderer-lit

Lit (Web Components) renderer for ClaudeCanvas declarative UI.

## Installation

```bash
pnpm install @claude-canvas/renderer-lit
```

## Usage

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
          title: 'Hello',
          components: [
            { component: 'Text', content: 'Welcome!', textStyle: 'heading2' },
            { component: 'TextField', valuePath: '/form/name', label: 'Name' },
            { component: 'Button', label: 'Submit', action: { type: 'submit' } }
          ]
        }
      }
    ]);

    // Handle user actions
    surface.addEventListener('cc-user-action', (e) => {
      console.log('Action:', e.detail.action);
      console.log('Data:', e.detail.dataModel);
    });
  </script>
</body>
</html>
```

## API

### `<cc-surface>` Element

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `surface` | `Surface \| null` | The surface definition to render |

#### Methods

| Method | Description |
|--------|-------------|
| `processMessage(msg)` | Process a single agent message |
| `processMessages(msgs)` | Process multiple agent messages |
| `updateDataModel(path, value)` | Update data model at path |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `cc-user-action` | `{ action, dataModel, surfaceId }` | Fired on user interactions |

## Styling / Theming

Override CSS custom properties:

```css
cc-surface {
  --cc-primary: #0066cc;
  --cc-primary-light: rgba(0, 102, 204, 0.1);
  --cc-text: #333333;
  --cc-border: #d1d5db;
  --cc-font: system-ui, sans-serif;
}
```

## Framework Integration

### With Vanilla JS

```javascript
import '@claude-canvas/renderer-lit';

const surface = document.createElement('cc-surface');
document.body.appendChild(surface);
surface.processMessages(messages);
```

### With React (via Web Components)

```tsx
import '@claude-canvas/renderer-lit';
import { useRef, useEffect } from 'react';

function App({ messages }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && messages) {
      ref.current.processMessages(messages);
    }
  }, [messages]);

  return <cc-surface ref={ref} />;
}
```

### With Vue

```vue
<template>
  <cc-surface ref="surface" />
</template>

<script setup>
import '@claude-canvas/renderer-lit';
import { ref, onMounted } from 'vue';

const surface = ref(null);

onMounted(() => {
  surface.value.processMessages(messages);
});
</script>
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
