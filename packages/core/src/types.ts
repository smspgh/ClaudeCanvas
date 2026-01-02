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
// Conditional Visibility
// =============================================================================

/** Comparison operators for conditional visibility */
export type VisibilityOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';

/** Computed expression types for dynamic values */
export type ComputedExpr = 'count' | 'length' | 'any' | 'all' | 'none' | 'sum';

/** Object-based visibility condition with comparison operator */
export interface VisibilityCondition {
  /** JSON pointer to the value to check */
  path: JsonPointer;
  /** Computed expression to apply to the value before comparison */
  expr?: ComputedExpr;
  /** Comparison operator (default: truthy check if omitted) */
  eq?: unknown;
  neq?: unknown;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
}

/** Visibility can be a simple path (truthy check) or a condition object */
export type VisibleIf = JsonPointer | VisibilityCondition;

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
  /** CSS background property (supports gradients) */
  background?: string;
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
  /** Conditional rendering based on data model - can be a path (truthy check) or condition object */
  visibleIf?: VisibleIf;
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
  /** Custom track color (unfilled portion) */
  trackColor?: string;
  /** Custom fill color (filled portion and thumb) */
  fillColor?: string;
  /** Show value label (default: true) */
  showValue?: boolean;
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
  /** Column type for special rendering: 'text' (default), 'image', 'avatar', 'badge' */
  type?: 'text' | 'image' | 'avatar' | 'badge';
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
  /** Template to render for each item. Use "/item" prefix for item data, /index for position */
  itemTemplate: Component;
  /** Message to show when array is empty */
  emptyMessage?: string;
  /** Enable alternating row backgrounds (zebra striping) */
  alternateBackground?: boolean;
  /** Gap between items in pixels */
  gap?: number;
}

// Progress/Spinner Components
export interface ProgressComponent extends BaseComponent {
  component: 'Progress';
  /** Progress value (0-100), omit for indeterminate */
  value?: number;
  /** JSON pointer to progress value */
  valuePath?: JsonPointer;
  /** Progress variant */
  variant?: 'linear' | 'circular';
  /** Size for circular variant */
  size?: 'small' | 'medium' | 'large';
  /** Color of the progress indicator */
  color?: string;
  /** Track/background color */
  trackColor?: string;
  /** Show percentage label */
  showLabel?: boolean;
  /** Label text (defaults to percentage) */
  label?: string;
}

// Badge/Chip Components
export interface BadgeComponent extends BaseComponent {
  component: 'Badge';
  /** Badge text content */
  content?: string;
  /** JSON pointer to dynamic content */
  contentPath?: JsonPointer;
  /** Badge variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Badge size */
  size?: 'small' | 'medium' | 'large';
  /** Custom background color (overrides variant) */
  color?: string;
  /** Custom text color */
  textColor?: string;
  /** Make badge pill-shaped (fully rounded) */
  pill?: boolean;
  /** Show dot indicator only (no text) */
  dot?: boolean;
  /** Icon name to show before text */
  icon?: string;
}

// Avatar Components
export interface AvatarComponent extends BaseComponent {
  component: 'Avatar';
  /** Image source URL */
  src?: string;
  /** JSON pointer to dynamic image source */
  srcPath?: JsonPointer;
  /** Alt text for image */
  alt?: string;
  /** Fallback initials when no image */
  initials?: string;
  /** JSON pointer to dynamic initials */
  initialsPath?: JsonPointer;
  /** Avatar size */
  size?: 'small' | 'medium' | 'large' | number;
  /** Avatar shape */
  shape?: 'circle' | 'square' | 'rounded';
  /** Background color for initials fallback */
  color?: string;
  /** Show online/offline status indicator */
  status?: 'online' | 'offline' | 'busy' | 'away';
}

// Toast/Snackbar Components
export interface ToastComponent extends BaseComponent {
  component: 'Toast';
  /** JSON pointer to boolean controlling visibility */
  openPath: JsonPointer;
  /** Toast message */
  message?: string;
  /** JSON pointer to dynamic message */
  messagePath?: JsonPointer;
  /** Toast type/severity */
  variant?: 'info' | 'success' | 'warning' | 'error';
  /** Position on screen */
  position?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  /** Auto-dismiss duration in milliseconds (0 = no auto-dismiss) */
  duration?: number;
  /** Show close button */
  dismissible?: boolean;
  /** Action button label */
  actionLabel?: string;
  /** Action to perform when action button clicked */
  action?: Action;
}

// Accordion Components
export interface AccordionItem {
  /** Unique identifier for the item */
  id: string;
  /** Header/title text */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional icon */
  icon?: string;
  /** Content components */
  children: Component[];
  /** Initially expanded */
  defaultExpanded?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

export interface AccordionComponent extends BaseComponent {
  component: 'Accordion';
  /** Accordion items */
  items: AccordionItem[];
  /** Allow multiple items to be expanded */
  allowMultiple?: boolean;
  /** JSON pointer to store expanded item IDs */
  expandedPath?: JsonPointer;
  /** Visual variant */
  variant?: 'default' | 'bordered' | 'separated';
}

// Skeleton/Loading Placeholder
export interface SkeletonComponent extends BaseComponent {
  component: 'Skeleton';
  /** Skeleton variant */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Width (defaults to 100%) */
  width?: string | number;
  /** Height (required for rectangular, optional for others) */
  height?: string | number;
  /** Number of text lines (for text variant) */
  lines?: number;
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
}

// Tooltip Component
export interface TooltipComponent extends BaseComponent {
  component: 'Tooltip';
  /** Tooltip content text */
  content: string;
  /** Position relative to children */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing (ms) */
  delay?: number;
  /** Child component to wrap */
  children: Component[];
}

// Alert/Callout Component
export interface AlertComponent extends BaseComponent {
  component: 'Alert';
  /** Alert title */
  title?: string;
  /** Alert message/description */
  message: string;
  /** JSON pointer to dynamic message */
  messagePath?: JsonPointer;
  /** Alert severity/variant */
  variant?: 'info' | 'success' | 'warning' | 'error';
  /** Show icon */
  showIcon?: boolean;
  /** Dismissible */
  dismissible?: boolean;
  /** JSON pointer to control visibility */
  openPath?: JsonPointer;
  /** Optional action buttons */
  actions?: Component[];
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
  | ListComponent
  | ProgressComponent
  | BadgeComponent
  | AvatarComponent
  | ToastComponent
  | AccordionComponent
  | SkeletonComponent
  | TooltipComponent
  | AlertComponent;

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
