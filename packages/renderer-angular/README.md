# @anthropic/claude-canvas-renderer-angular

Angular renderer for ClaudeCanvas declarative UI surfaces. This package provides all 31 ClaudeCanvas components as Angular components, enabling seamless integration of AI-generated UIs into Angular applications.

## Features

- **31 Components**: Complete implementation of all ClaudeCanvas components
- **Angular 17/18 Support**: Built with modern Angular features including standalone components and control flow syntax
- **Two-Way Data Binding**: Automatic synchronization between UI and data model
- **JSON Pointer Support**: RFC 6901 compliant data binding paths
- **Conditional Visibility**: Show/hide components based on data model conditions
- **Custom Components**: Register custom Angular components for extensibility
- **OnPush Change Detection**: Optimized performance with OnPush change detection strategy

## Installation

```bash
npm install @anthropic/claude-canvas-renderer-angular
# or
pnpm add @anthropic/claude-canvas-renderer-angular
```

## Quick Start

### Module-based Applications

```typescript
import { NgModule } from '@angular/core';
import { ClaudeCanvasModule } from '@anthropic/claude-canvas-renderer-angular';

@NgModule({
  imports: [ClaudeCanvasModule]
})
export class AppModule { }
```

### Standalone Applications

```typescript
import { Component } from '@angular/core';
import { CcSurfaceComponent } from '@anthropic/claude-canvas-renderer-angular';
import { Surface } from '@anthropic/claude-canvas-renderer-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CcSurfaceComponent],
  template: `
    <cc-surface
      [surface]="surface"
      [dataModel]="dataModel"
      (dataModelChange)="onDataModelChange($event)"
      (action)="onAction($event)">
    </cc-surface>
  `
})
export class AppComponent {
  surface: Surface = {
    version: '1.0',
    components: [
      {
        type: 'Text',
        content: 'Hello from ClaudeCanvas!'
      }
    ]
  };

  dataModel: Record<string, unknown> = {};

  onDataModelChange(newModel: Record<string, unknown>) {
    this.dataModel = newModel;
  }

  onAction(action: { type: string; payload?: unknown }) {
    console.log('Action received:', action);
  }
}
```

## Components

### Layout Components (7)

| Component | Description |
|-----------|-------------|
| `CcRowComponent` | Horizontal flex container with gap and alignment options |
| `CcColumnComponent` | Vertical flex container with gap and alignment options |
| `CcCardComponent` | Container with padding, shadow, and optional header/footer |
| `CcDividerComponent` | Visual separator (horizontal/vertical) |
| `CcModalComponent` | Overlay dialog with header, body, and actions |
| `CcTabsComponent` | Tabbed content container |
| `CcAccordionComponent` | Collapsible content sections |

### Display Components (8)

| Component | Description |
|-----------|-------------|
| `CcTextComponent` | Text display with variants (body, heading, caption, code) |
| `CcImageComponent` | Image display with alt text and sizing options |
| `CcIconComponent` | Icon display (emoji/unicode based) |
| `CcBadgeComponent` | Status indicator with variants |
| `CcAvatarComponent` | User avatar with image or initials fallback |
| `CcCodeBlockComponent` | Syntax-highlighted code display |
| `CcMarkdownComponent` | Markdown content renderer |
| `CcLinkComponent` | Hyperlink with navigation actions |

### Form/Input Components (9)

| Component | Description |
|-----------|-------------|
| `CcTextFieldComponent` | Single-line text input |
| `CcTextAreaComponent` | Multi-line text input |
| `CcSelectComponent` | Dropdown selection |
| `CcCheckboxComponent` | Boolean checkbox input |
| `CcRadioGroupComponent` | Single selection from options |
| `CcSwitchComponent` | Toggle switch control |
| `CcSliderComponent` | Numeric range slider |
| `CcDatePickerComponent` | Date selection input |
| `CcFileUploadComponent` | File upload with drag-and-drop |

### Interactive Components (3)

| Component | Description |
|-----------|-------------|
| `CcButtonComponent` | Action button with variants |
| `CcButtonGroupComponent` | Grouped action buttons |
| `CcChipComponent` | Selectable/deletable chip |

### Media Components (2)

| Component | Description |
|-----------|-------------|
| `CcVideoComponent` | Video player with controls |
| `CcAudioComponent` | Audio player with controls |

### Data Visualization Components (3)

| Component | Description |
|-----------|-------------|
| `CcChartComponent` | Charts (line, bar, pie, doughnut) - Canvas-based |
| `CcDataTableComponent` | Sortable data table with headers |
| `CcListComponent` | Templated list with empty state |

### Feedback Components (4)

| Component | Description |
|-----------|-------------|
| `CcProgressComponent` | Linear or circular progress indicator |
| `CcSkeletonComponent` | Loading placeholder with animation |
| `CcAlertComponent` | Dismissible alert messages |
| `CcToastComponent` | Temporary notification with auto-dismiss |

## Data Binding

ClaudeCanvas uses JSON Pointer (RFC 6901) for data binding:

```typescript
const surface: Surface = {
  version: '1.0',
  components: [
    {
      type: 'TextField',
      label: 'Username',
      valuePath: '/user/name',  // Binds to dataModel.user.name
      placeholder: 'Enter username'
    },
    {
      type: 'Text',
      contentPath: '/user/name'  // Displays value from dataModel.user.name
    }
  ]
};

const dataModel = {
  user: {
    name: 'John Doe'
  }
};
```

## Conditional Visibility

Show or hide components based on data model values:

```typescript
{
  type: 'Text',
  content: 'Premium feature',
  visibleIf: {
    path: '/user/isPremium',
    operator: 'eq',
    value: true
  }
}
```

### Supported Operators

- `eq` - Equal
- `neq` - Not equal
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal
- `contains` - String/array contains
- `startsWith` - String starts with
- `endsWith` - String ends with
- `empty` - Value is empty/null/undefined
- `notEmpty` - Value is not empty

### Compound Conditions

```typescript
{
  type: 'Button',
  label: 'Submit',
  visibleIf: {
    and: [
      { path: '/form/isValid', operator: 'eq', value: true },
      { path: '/form/isSubmitting', operator: 'eq', value: false }
    ]
  }
}
```

## Actions

Components can emit actions for handling:

```typescript
{
  type: 'Button',
  label: 'Submit',
  action: {
    type: 'submit',
    payload: { formId: 'contactForm' }
  }
}
```

Handle actions in your component:

```typescript
onAction(action: Action) {
  switch (action.type) {
    case 'submit':
      this.submitForm(action.payload);
      break;
    case 'navigate':
      this.router.navigate([action.payload.path]);
      break;
  }
}
```

## Custom Components

Register custom components for extensibility:

```typescript
import { Component, inject } from '@angular/core';
import { ComponentRegistryService } from '@anthropic/claude-canvas-renderer-angular';

@Component({
  // ...
})
export class AppComponent {
  private registry = inject(ComponentRegistryService);

  constructor() {
    // Register a custom component
    this.registry.register('CustomWidget', MyCustomWidgetComponent);
  }
}
```

## Services

### DataModelService

Manages the data model state with immutable updates:

```typescript
import { DataModelService } from '@anthropic/claude-canvas-renderer-angular';

@Component({
  providers: [DataModelService]
})
export class MyComponent {
  private dataModelService = inject(DataModelService);

  constructor() {
    // Subscribe to changes
    this.dataModelService.model$.subscribe(model => {
      console.log('Data model updated:', model);
    });

    // Update a value
    this.dataModelService.setValue('/user/name', 'Jane Doe');

    // Get a value
    const name = this.dataModelService.getValue('/user/name');
  }
}
```

### ComponentRegistryService

Register custom components:

```typescript
import { ComponentRegistryService } from '@anthropic/claude-canvas-renderer-angular';

@Component({
  providers: [ComponentRegistryService]
})
export class MyComponent {
  private registry = inject(ComponentRegistryService);

  constructor() {
    this.registry.register('MyWidget', MyWidgetComponent);
  }
}
```

## Styling

Components use scoped CSS with sensible defaults. Override styles using CSS custom properties or by targeting component classes:

```css
/* Global overrides */
.cc-button-primary {
  background-color: #your-brand-color;
}

.cc-card {
  border-radius: 12px;
}
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import {
  Surface,
  ComponentDefinition,
  DataModel,
  Action,
  VisibleIfCondition,
} from '@anthropic/claude-canvas-renderer-angular';
```

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

## Peer Dependencies

- Angular 17.0.0 or 18.0.0+
- RxJS 7.0.0+

## License

MIT

## Related Packages

- `@anthropic/claude-canvas` - Core specification and types
- `@anthropic/claude-canvas-renderer-lit` - Lit/Web Components renderer
- `@anthropic/claude-canvas-renderer-react` - React renderer
- `@anthropic/claude-canvas-renderer-flutter` - Flutter renderer
- `@anthropic/claude-canvas-renderer-android` - Android/Jetpack Compose renderer
