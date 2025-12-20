// Main surface component and hook
export { CcSurface, useCcSurface } from './CcSurface.js';
export type { CcSurfaceProps } from './CcSurface.js';

// Individual components for custom usage
export * from './components/index.js';

// Re-export core types for convenience
export type {
  Surface,
  Component,
  DataModel,
  AgentToClientMessage,
  UserActionMessage,
  Action,
  // Component types
  RowComponent,
  ColumnComponent,
  CardComponent,
  DividerComponent,
  TextComponent,
  ImageComponent,
  IconComponent,
  TextFieldComponent,
  CheckboxComponent,
  SelectComponent,
  SliderComponent,
  ButtonComponent,
} from '@claude-canvas/core';
