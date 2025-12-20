/**
 * ClaudeCanvas Core Types
 * Declarative UI specification for Claude AI agents
 */

// =============================================================================
// Base Types
// =============================================================================

/** JSON Pointer path for data binding (e.g., "/user/name") */
export type JsonPointer = string;

/** Unique identifier for surfaces */
export type SurfaceId = string;

/** Unique identifier for components */
export type ComponentId = string;

// =============================================================================
// Styling
// =============================================================================

export type FlexAlignment = 'start' | 'center' | 'end' | 'stretch' | 'spaceBetween' | 'spaceAround';

export type TextStyle = 'heading1' | 'heading2' | 'heading3' | 'body' | 'caption' | 'code';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

export interface Spacing {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface ComponentStyle {
  padding?: Spacing | number;
  margin?: Spacing | number;
  backgroundColor?: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  flex?: number;
  opacity?: number;
}

// =============================================================================
// Actions
// =============================================================================

export type ActionType = 'submit' | 'navigate' | 'dismiss' | 'custom' | 'updateData' | 'update';

export interface Action {
  type: ActionType;
  /** For custom actions, the event name to emit */
  event?: string;
  /** Data to include with the action */
  payload?: Record<string, unknown>;
  /** JSON pointer to data to include */
  dataPath?: JsonPointer;
  /** For updateData action: path to update */
  path?: JsonPointer;
  /** For updateData action: value to set */
  value?: unknown;
}

// =============================================================================
// Components
// =============================================================================

interface BaseComponent {
  id?: ComponentId;
  style?: ComponentStyle;
  /** Conditional rendering based on data model */
  visibleIf?: JsonPointer;
}

// Layout Components
export interface RowComponent extends BaseComponent {
  component: 'Row';
  children: Component[];
  gap?: number;
  align?: FlexAlignment;
  justify?: FlexAlignment;
  wrap?: boolean;
}

export interface ColumnComponent extends BaseComponent {
  component: 'Column';
  children: Component[];
  gap?: number;
  align?: FlexAlignment;
}

export interface CardComponent extends BaseComponent {
  component: 'Card';
  children: Component[];
  elevated?: boolean;
}

export interface DividerComponent extends BaseComponent {
  component: 'Divider';
  vertical?: boolean;
}

export interface ModalComponent extends BaseComponent {
  component: 'Modal';
  /** JSON pointer to boolean controlling visibility */
  openPath: JsonPointer;
  title?: string;
  children: Component[];
  /** Size of the modal */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  /** Whether clicking backdrop closes the modal */
  dismissible?: boolean;
}

export interface TabsComponent extends BaseComponent {
  component: 'Tabs';
  /** JSON pointer to store active tab value */
  valuePath: JsonPointer;
  tabs: Array<{
    label: string;
    value: string;
    icon?: string;
    disabled?: boolean;
    children: Component[];
  }>;
}

// Display Components
export interface TextComponent extends BaseComponent {
  component: 'Text';
  /** Static text content */
  content?: string;
  /** JSON pointer to dynamic content */
  contentPath?: JsonPointer;
  textStyle?: TextStyle;
  color?: string;
  /** Support markdown rendering */
  markdown?: boolean;
}

export interface ImageComponent extends BaseComponent {
  component: 'Image';
  src?: string;
  srcPath?: JsonPointer;
  alt?: string;
  fit?: 'cover' | 'contain' | 'fill' | 'none';
}

export interface IconComponent extends BaseComponent {
  component: 'Icon';
  name: string;
  size?: number;
  color?: string;
}

// Input Components
export interface TextFieldComponent extends BaseComponent {
  component: 'TextField';
  /** JSON pointer to bind value */
  valuePath: JsonPointer;
  label?: string;
  placeholder?: string;
  inputType?: InputType;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}

export interface CheckboxComponent extends BaseComponent {
  component: 'Checkbox';
  valuePath: JsonPointer;
  label?: string;
  disabled?: boolean;
}

export interface SelectComponent extends BaseComponent {
  component: 'Select';
  valuePath: JsonPointer;
  label?: string;
  placeholder?: string;
  options: Array<{ label: string; value: string }>;
  disabled?: boolean;
}

export interface SliderComponent extends BaseComponent {
  component: 'Slider';
  valuePath: JsonPointer;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export interface DateTimeInputComponent extends BaseComponent {
  component: 'DateTimeInput';
  valuePath: JsonPointer;
  label?: string;
  /** Enable date selection (default: true) */
  enableDate?: boolean;
  /** Enable time selection (default: false) */
  enableTime?: boolean;
  /** Minimum selectable date (ISO format) */
  minDate?: string;
  /** Maximum selectable date (ISO format) */
  maxDate?: string;
  disabled?: boolean;
}

export interface VideoComponent extends BaseComponent {
  component: 'Video';
  /** Video source URL */
  src?: string;
  /** JSON pointer to dynamic video source */
  srcPath?: JsonPointer;
  /** Poster image URL */
  poster?: string;
  /** Auto-play video */
  autoplay?: boolean;
  /** Show video controls (default: true) */
  controls?: boolean;
  /** Loop video playback */
  loop?: boolean;
  /** Mute video audio */
  muted?: boolean;
}

export interface AudioPlayerComponent extends BaseComponent {
  component: 'AudioPlayer';
  /** Audio source URL */
  src?: string;
  /** JSON pointer to dynamic audio source */
  srcPath?: JsonPointer;
  /** Title/description of the audio */
  title?: string;
  /** Auto-play audio */
  autoplay?: boolean;
  /** Show audio controls (default: true) */
  controls?: boolean;
  /** Loop audio playback */
  loop?: boolean;
}

export interface MultipleChoiceComponent extends BaseComponent {
  component: 'MultipleChoice';
  /** JSON pointer to array of selected values */
  valuePath: JsonPointer;
  label?: string;
  options: Array<{ label: string; value: string }>;
  /** Maximum number of selections allowed */
  maxSelections?: number;
  disabled?: boolean;
}

// Data Visualization Components
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  color?: string;
}

export interface ChartComponent extends BaseComponent {
  component: 'Chart';
  /** Chart type */
  chartType: 'bar' | 'line' | 'pie' | 'doughnut';
  /** JSON pointer to chart data or inline data */
  dataPath?: JsonPointer;
  /** Inline data for simple charts */
  data?: {
    labels: string[];
    datasets: ChartDataset[];
  };
  /** Chart title */
  title?: string;
  /** Show legend */
  showLegend?: boolean;
  /** Chart height in pixels */
  height?: number;
}

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string | number;
}

export interface DataTableComponent extends BaseComponent {
  component: 'DataTable';
  /** JSON pointer to array of row data */
  dataPath: JsonPointer;
  /** Column definitions */
  columns: DataTableColumn[];
  /** Enable pagination */
  pagination?: boolean;
  /** Rows per page (default: 10) */
  pageSize?: number;
  /** Enable row selection */
  selectable?: boolean;
  /** JSON pointer to store selected row IDs */
  selectionPath?: JsonPointer;
  /** Show search/filter input */
  searchable?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}

export interface RichTextEditorComponent extends BaseComponent {
  component: 'RichTextEditor';
  /** JSON pointer for content binding (HTML string) */
  valuePath: JsonPointer;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum height in pixels */
  minHeight?: number;
  /** Available toolbar options */
  toolbar?: ('bold' | 'italic' | 'underline' | 'strike' | 'heading' | 'list' | 'link' | 'image' | 'code')[];
  disabled?: boolean;
}

// Interactive Components
export interface ButtonComponent extends BaseComponent {
  component: 'Button';
  label: string;
  variant?: ButtonVariant;
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  action: Action;
}

export interface LinkComponent extends BaseComponent {
  component: 'Link';
  label: string;
  href?: string;
  hrefPath?: JsonPointer;
  external?: boolean;
}

// List Components
export interface ListComponent extends BaseComponent {
  component: 'List';
  /** JSON pointer to array data */
  itemsPath: JsonPointer;
  /** Template to render for each item. Use "/item" prefix for item data */
  itemTemplate: Component;
  emptyMessage?: string;
}

// Union of all components
export type Component =
  | RowComponent
  | ColumnComponent
  | CardComponent
  | DividerComponent
  | ModalComponent
  | TabsComponent
  | TextComponent
  | ImageComponent
  | IconComponent
  | TextFieldComponent
  | CheckboxComponent
  | SelectComponent
  | SliderComponent
  | DateTimeInputComponent
  | VideoComponent
  | AudioPlayerComponent
  | MultipleChoiceComponent
  | ChartComponent
  | DataTableComponent
  | RichTextEditorComponent
  | ButtonComponent
  | LinkComponent
  | ListComponent;

// =============================================================================
// Surface (Top-level UI container)
// =============================================================================

export interface Surface {
  id: SurfaceId;
  title?: string;
  components: Component[];
}

// =============================================================================
// Data Model
// =============================================================================

export interface DataModel {
  [key: string]: unknown;
}

// =============================================================================
// Messages (Agent <-> Client Communication)
// =============================================================================

/** Sent by agent to update/create a surface */
export interface SurfaceUpdateMessage {
  type: 'surfaceUpdate';
  surface: Surface;
}

/** Sent by agent to update the data model */
export interface DataModelUpdateMessage {
  type: 'dataModelUpdate';
  /** JSON pointer to update location, or "/" for root */
  path: JsonPointer;
  data: unknown;
}

/** Sent by agent to delete a surface */
export interface DeleteSurfaceMessage {
  type: 'deleteSurface';
  surfaceId: SurfaceId;
}

/** Sent by agent to signal rendering should begin (for streaming) */
export interface BeginRenderingMessage {
  type: 'beginRendering';
  surfaceId: SurfaceId;
}

/** Union of all agent-to-client messages */
export type AgentToClientMessage =
  | SurfaceUpdateMessage
  | DataModelUpdateMessage
  | DeleteSurfaceMessage
  | BeginRenderingMessage;

/** Sent by client when user performs an action */
export interface UserActionMessage {
  type: 'userAction';
  surfaceId: SurfaceId;
  componentId?: ComponentId;
  action: Action;
  /** Current state of the data model */
  dataModel: DataModel;
}

/** Sent by client to report capabilities */
export interface ClientCapabilitiesMessage {
  type: 'clientCapabilities';
  supportedComponents: string[];
  supportsMarkdown: boolean;
  supportsStreaming: boolean;
}

/** Union of all client-to-agent messages */
export type ClientToAgentMessage =
  | UserActionMessage
  | ClientCapabilitiesMessage;

/** All message types */
export type Message = AgentToClientMessage | ClientToAgentMessage;
