/**
 * Core types for ClaudeCanvas Angular renderer
 */

export interface Surface {
  id: string;
  title?: string;
  components: ComponentDefinition[];
}

export interface ComponentDefinition {
  component: string;
  id?: string;
  style?: ComponentStyle;
  visibleIf?: string | VisibilityCondition;
  [key: string]: unknown;
}

export interface ComponentStyle {
  padding?: number | SpacingObject;
  margin?: number | SpacingObject;
  backgroundColor?: string;
  background?: string;
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  flex?: number;
  borderRadius?: number | string;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
}

export interface SpacingObject {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface VisibilityCondition {
  path: string;
  expr?: string;
  eq?: unknown;
  neq?: unknown;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
}

export interface Action {
  type: 'submit' | 'custom' | 'update' | 'updateData' | 'navigate' | 'dismiss';
  event?: string;
  path?: string;
  value?: unknown;
  payload?: Record<string, unknown>;
}

export interface UserActionMessage {
  type: 'userAction';
  surfaceId: string;
  action: Action;
  dataModel: DataModel;
}

export type DataModel = Record<string, unknown>;

export interface SurfaceUpdateMessage {
  type: 'surfaceUpdate';
  surface: Surface;
}

export interface DataModelUpdateMessage {
  type: 'dataModelUpdate';
  path: string;
  data: unknown;
}

export interface DeleteSurfaceMessage {
  type: 'deleteSurface';
  surfaceId: string;
}

export interface BeginRenderingMessage {
  type: 'beginRendering';
  surfaceId?: string;
}

export type AgentToClientMessage =
  | SurfaceUpdateMessage
  | DataModelUpdateMessage
  | DeleteSurfaceMessage
  | BeginRenderingMessage;

export type TextStyle = 'heading1' | 'heading2' | 'heading3' | 'body' | 'caption' | 'code';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type FeedbackVariant = 'info' | 'success' | 'warning' | 'error';
export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut';
export type ProgressVariant = 'linear' | 'circular';
export type AvatarShape = 'circle' | 'square' | 'rounded';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';
export type ToastPosition = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
export type AccordionVariant = 'default' | 'bordered' | 'separated';
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none';
