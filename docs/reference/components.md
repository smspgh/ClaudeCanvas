# Component Reference

This page documents all ClaudeCanvas components with their properties and usage examples.

## Layout Components

### Row

Horizontal flex container for arranging children side by side.

```json
{
  "component": "Row",
  "gap": 12,
  "align": "center",
  "justify": "spaceBetween",
  "wrap": true,
  "children": [...]
}
```

**Properties:**
- `children` (required): Array of child components
- `gap`: Space between children in pixels
- `align`: Cross-axis alignment (`start`, `center`, `end`, `stretch`)
- `justify`: Main-axis distribution (`start`, `center`, `end`, `spaceBetween`, `spaceAround`)
- `wrap`: Whether children wrap to next line

### Column

Vertical flex container for stacking children vertically.

```json
{
  "component": "Column",
  "gap": 16,
  "align": "stretch",
  "children": [...]
}
```

**Properties:**
- `children` (required): Array of child components
- `gap`: Space between children in pixels
- `align`: Cross-axis alignment (`start`, `center`, `end`, `stretch`)

### Card

Container with optional elevation/shadow for grouping content.

```json
{
  "component": "Card",
  "elevated": true,
  "children": [...]
}
```

**Properties:**
- `children` (required): Array of child components
- `elevated`: Whether to show drop shadow

### Divider

Visual separator line.

```json
{
  "component": "Divider",
  "vertical": false
}
```

**Properties:**
- `vertical`: If true, renders as vertical line

### Modal

Overlay dialog controlled by data model binding.

```json
{
  "component": "Modal",
  "openPath": "/ui/showModal",
  "title": "Dialog Title",
  "size": "medium",
  "dismissible": true,
  "children": [...]
}
```

**Properties:**
- `openPath` (required): JSON pointer to boolean controlling visibility
- `children` (required): Content to show in modal
- `title`: Modal title text
- `size`: `small`, `medium`, `large`, or `fullscreen`
- `dismissible`: Whether clicking backdrop closes modal

### Tabs

Tabbed interface with multiple panels.

```json
{
  "component": "Tabs",
  "valuePath": "/ui/activeTab",
  "tabs": [
    {"label": "Tab 1", "value": "tab1", "children": [...]},
    {"label": "Tab 2", "value": "tab2", "children": [...]}
  ]
}
```

**Properties:**
- `valuePath` (required): JSON pointer to store active tab value
- `tabs` (required): Array of tab definitions with `label`, `value`, and `children`

### Accordion

Collapsible content sections.

```json
{
  "component": "Accordion",
  "items": [
    {
      "id": "section1",
      "title": "Section 1",
      "subtitle": "Optional subtitle",
      "icon": "info",
      "defaultExpanded": true,
      "children": [...]
    }
  ],
  "allowMultiple": false,
  "expandedPath": "/ui/expandedSections",
  "variant": "bordered"
}
```

**Properties:**
- `items` (required): Array of accordion items
- `allowMultiple`: Allow multiple sections to be expanded simultaneously
- `expandedPath`: JSON pointer to store expanded item IDs
- `variant`: `default`, `bordered`, or `separated`

**Item Properties:**
- `id` (required): Unique item identifier
- `title` (required): Header text
- `subtitle`: Optional subtitle text
- `icon`: Optional icon name
- `children` (required): Content components
- `defaultExpanded`: Initially expanded state
- `disabled`: Disable interaction

### List

Dynamic list with template rendering.

```json
{
  "component": "List",
  "itemsPath": "/data/items",
  "itemTemplate": {
    "component": "Text",
    "contentPath": "/item/name"
  },
  "emptyMessage": "No items",
  "alternateBackground": true,
  "gap": 8
}
```

**Properties:**
- `itemsPath` (required): JSON pointer to array data
- `itemTemplate` (required): Component template for each item
- `emptyMessage`: Message when list is empty
- `alternateBackground`: Enable zebra striping (alternating row colors)
- `gap`: Space between items in pixels

## Display Components

### Text

Display text content with styling options.

```json
{
  "component": "Text",
  "content": "Hello World",
  "textStyle": "heading2",
  "color": "#333",
  "markdown": false
}
```

**Properties:**
- `content`: Static text content
- `contentPath`: JSON pointer for dynamic content
- `contentExpr`: Computed expression to apply to contentPath value (see below)
- `textStyle`: `heading1`, `heading2`, `heading3`, `body`, `caption`, `code`
- `color`: Text color
- `markdown`: Enable markdown rendering

**Computed Expressions (`contentExpr`):**
Use `contentExpr` with `contentPath` to compute values from arrays:
- `count` / `length`: Array length (e.g., "3 items")
- `sum`: Sum of numeric array values
- `any`: True if any item is truthy
- `all`: True if all items are truthy
- `none`: True if no items are truthy

```json
{
  "component": "Text",
  "contentPath": "/cart/items",
  "contentExpr": "count",
  "content": " items in cart"
}
```

### Image

Display images with fit options.

```json
{
  "component": "Image",
  "src": "https://example.com/image.jpg",
  "alt": "Description",
  "fit": "cover"
}
```

**Properties:**
- `src`: Image URL
- `srcPath`: JSON pointer for dynamic source
- `alt`: Alt text for accessibility
- `fit`: `cover`, `contain`, `fill`, `none`

### Icon

Display icons by name (Material Icons).

```json
{
  "component": "Icon",
  "name": "settings",
  "size": 24,
  "color": "#333"
}
```

**Properties:**
- `name` (required): Icon name
- `size`: Icon size in pixels
- `color`: Icon color

## Input Components

### TextField

Text input with data binding.

```json
{
  "component": "TextField",
  "valuePath": "/form/email",
  "label": "Email",
  "placeholder": "Enter email",
  "inputType": "email",
  "multiline": false,
  "rows": 3
}
```

**Properties:**
- `valuePath` (required): JSON pointer for value binding
- `label`: Field label
- `placeholder`: Placeholder text
- `inputType`: `text`, `email`, `password`, `number`, `tel`, `url`, `search`
- `multiline`: Enable textarea mode
- `rows`: Number of rows for multiline
- `required`, `disabled`: Validation/state

### Checkbox

Boolean toggle with label.

```json
{
  "component": "Checkbox",
  "valuePath": "/form/agree",
  "label": "I agree to terms"
}
```

**Properties:**
- `valuePath` (required): JSON pointer for boolean value
- `label`: Checkbox label
- `disabled`: Disable interaction

### Select

Dropdown selection.

```json
{
  "component": "Select",
  "valuePath": "/form/country",
  "label": "Country",
  "placeholder": "Select...",
  "options": [
    {"label": "USA", "value": "us"},
    {"label": "UK", "value": "uk"}
  ]
}
```

**Properties:**
- `valuePath` (required): JSON pointer for selected value
- `options` (required): Array of `{label, value}` objects
- `label`: Field label
- `placeholder`: Placeholder text
- `disabled`: Disable interaction

### Slider

Numeric range input.

```json
{
  "component": "Slider",
  "valuePath": "/form/volume",
  "label": "Volume",
  "min": 0,
  "max": 100,
  "step": 1
}
```

**Properties:**
- `valuePath` (required): JSON pointer for numeric value
- `label`: Field label
- `min`, `max`: Value range
- `step`: Increment amount
- `disabled`: Disable interaction

### DateTimeInput

Date and/or time picker.

```json
{
  "component": "DateTimeInput",
  "valuePath": "/form/date",
  "label": "Select Date",
  "enableDate": true,
  "enableTime": false,
  "minDate": "2024-01-01",
  "maxDate": "2025-12-31"
}
```

**Properties:**
- `valuePath` (required): JSON pointer for value (ISO format)
- `label`: Field label
- `enableDate`: Show date picker (default: true)
- `enableTime`: Show time picker (default: false)
- `minDate`, `maxDate`: Date range constraints
- `disabled`: Disable interaction

### MultipleChoice

Multi-select options (checkboxes).

```json
{
  "component": "MultipleChoice",
  "valuePath": "/form/selectedItems",
  "label": "Select items",
  "options": [
    {"label": "Option A", "value": "a"},
    {"label": "Option B", "value": "b"}
  ],
  "maxSelections": 3
}
```

**Properties:**
- `valuePath` (required): JSON pointer for array of selected values
- `options` (required): Array of `{label, value}` objects
- `label`: Field label
- `maxSelections`: Limit number of selections
- `disabled`: Disable interaction

## Media Components

### Video

Video player with controls.

```json
{
  "component": "Video",
  "src": "https://example.com/video.mp4",
  "poster": "https://example.com/thumbnail.jpg",
  "controls": true,
  "autoplay": false,
  "loop": false,
  "muted": false
}
```

**Properties:**
- `src`: Video URL
- `srcPath`: JSON pointer for dynamic source
- `poster`: Thumbnail image URL
- `controls`: Show player controls (default: true)
- `autoplay`, `loop`, `muted`: Playback options

### AudioPlayer

Audio player with controls.

```json
{
  "component": "AudioPlayer",
  "src": "https://example.com/audio.mp3",
  "title": "Track Name",
  "controls": true,
  "autoplay": false,
  "loop": false
}
```

**Properties:**
- `src`: Audio URL
- `srcPath`: JSON pointer for dynamic source
- `title`: Display title
- `controls`: Show player controls (default: true)
- `autoplay`, `loop`: Playback options

## Interactive Components

### Button

Clickable button with action.

```json
{
  "component": "Button",
  "label": "Submit",
  "variant": "primary",
  "icon": "send",
  "action": {"type": "submit"}
}
```

**Properties:**
- `label` (required): Button text
- `action` (required): Action to perform on click
- `variant`: `primary`, `secondary`, `outline`, `ghost`, `danger`
- `icon`: Icon name to show
- `disabled`, `loading`: State options

**Action Types:**
- `{"type": "submit"}` - Submit form data to agent
- `{"type": "custom", "event": "myEvent", "payload": {...}}` - Custom event
- `{"type": "update", "path": "/ui/modal", "value": true}` - Update data model

### Link

Navigation link.

```json
{
  "component": "Link",
  "label": "Learn more",
  "href": "https://example.com",
  "external": true
}
```

**Properties:**
- `label` (required): Link text
- `href`: URL to navigate to
- `hrefPath`: JSON pointer for dynamic URL
- `external`: Open in new tab

## Data Visualization Components

### Chart

Display bar, line, pie, or doughnut charts.

```json
{
  "component": "Chart",
  "chartType": "bar",
  "title": "Monthly Sales",
  "data": {
    "labels": ["Jan", "Feb", "Mar"],
    "datasets": [
      {"label": "Revenue", "data": [100, 200, 150], "color": "#4CAF50"}
    ]
  },
  "showLegend": true,
  "height": 300
}
```

**Properties:**
- `chartType` (required): `bar`, `line`, `pie`, or `doughnut`
- `data`: Inline chart data with `labels` and `datasets`
- `dataPath`: JSON pointer to chart data
- `title`: Chart title
- `showLegend`: Show legend
- `height`: Chart height in pixels

### DataTable

Sortable, paginated data tables.

```json
{
  "component": "DataTable",
  "dataPath": "/data/users",
  "columns": [
    {"key": "status", "label": "Status", "type": "statusDot"},
    {"key": "avatar", "label": "", "type": "avatar", "width": 50},
    {"key": "name", "label": "Name", "sortable": true},
    {"key": "role", "label": "Role", "type": "badge"}
  ],
  "pagination": true,
  "pageSize": 10,
  "searchable": true,
  "searchPlaceholder": "Search users...",
  "alternateBackground": true,
  "emptyMessage": "No users found"
}
```

**Properties:**
- `dataPath` (required): JSON pointer to row data array
- `columns` (required): Column definitions
- `pagination`: Enable pagination
- `pageSize`: Rows per page (default: 10)
- `searchable`: Show search input
- `searchPlaceholder`: Custom search placeholder text
- `alternateBackground`: Enable zebra striping (alternating row colors)
- `selectable`: Enable row selection
- `selectionPath`: JSON pointer for selected row IDs
- `emptyMessage`: Message when no data

**Column Types:**
- `text` (default): Plain text
- `image`: Display as image
- `avatar`: Display as avatar
- `badge`: Display as badge
- `statusDot`: Colored status indicator dot

### RichTextEditor

WYSIWYG rich text editor.

```json
{
  "component": "RichTextEditor",
  "valuePath": "/content/html",
  "placeholder": "Start writing...",
  "minHeight": 200,
  "toolbar": ["bold", "italic", "heading", "list", "link"]
}
```

**Properties:**
- `valuePath` (required): JSON pointer for HTML content
- `placeholder`: Placeholder text
- `minHeight`: Minimum height in pixels
- `toolbar`: Array of enabled tools (`bold`, `italic`, `underline`, `strike`, `heading`, `list`, `link`, `image`, `code`)
- `disabled`: Disable editing

## Feedback Components

### Progress

Linear or circular progress indicator.

```json
{
  "component": "Progress",
  "value": 75,
  "variant": "linear",
  "showLabel": true,
  "color": "#4CAF50"
}
```

**Properties:**
- `value`: Progress value (0-100), omit for indeterminate
- `valuePath`: JSON pointer to progress value
- `variant`: `linear` or `circular`
- `size`: Size for circular (`small`, `medium`, `large`)
- `color`: Progress indicator color
- `trackColor`: Background track color
- `showLabel`: Show percentage label
- `label`: Custom label text

### Badge

Status indicator label or chip.

```json
{
  "component": "Badge",
  "content": "New",
  "variant": "success",
  "pill": true,
  "icon": "check"
}
```

**Properties:**
- `content`: Badge text
- `contentPath`: JSON pointer for dynamic content
- `variant`: `default`, `success`, `warning`, `error`, `info`
- `size`: `small`, `medium`, `large`
- `color`: Custom background color
- `textColor`: Custom text color
- `pill`: Fully rounded shape
- `dot`: Show as dot indicator only (no text)
- `icon`: Icon name before text

### Avatar

User profile image or initials.

```json
{
  "component": "Avatar",
  "src": "https://example.com/photo.jpg",
  "alt": "John Doe",
  "initials": "JD",
  "size": "medium",
  "shape": "circle",
  "status": "online"
}
```

**Properties:**
- `src`: Image URL
- `srcPath`: JSON pointer for dynamic source
- `alt`: Alt text
- `initials`: Fallback initials
- `initialsPath`: JSON pointer for dynamic initials
- `size`: `small`, `medium`, `large`, or number
- `shape`: `circle`, `square`, `rounded`
- `color`: Background color for initials
- `status`: `online`, `offline`, `busy`, `away`

### Toast

Notification message popup.

```json
{
  "component": "Toast",
  "openPath": "/ui/showToast",
  "message": "Changes saved successfully",
  "variant": "success",
  "position": "bottom-right",
  "duration": 3000,
  "dismissible": true
}
```

**Properties:**
- `openPath` (required): JSON pointer to boolean visibility
- `message`: Toast message text
- `messagePath`: JSON pointer for dynamic message
- `variant`: `info`, `success`, `warning`, `error`
- `position`: `top`, `top-left`, `top-right`, `bottom`, `bottom-left`, `bottom-right`
- `duration`: Auto-dismiss time in ms (0 = no auto-dismiss)
- `dismissible`: Show close button
- `actionLabel`: Action button text
- `action`: Action to perform on button click

### Alert

Inline alert/callout message.

```json
{
  "component": "Alert",
  "title": "Warning",
  "message": "This action cannot be undone",
  "variant": "warning",
  "showIcon": true,
  "dismissible": true
}
```

**Properties:**
- `message` (required): Alert message
- `messagePath`: JSON pointer for dynamic message
- `title`: Alert title
- `variant`: `info`, `success`, `warning`, `error`
- `showIcon`: Show variant icon
- `dismissible`: Show dismiss button
- `openPath`: JSON pointer to control visibility
- `actions`: Array of action button components

### Skeleton

Loading placeholder.

```json
{
  "component": "Skeleton",
  "variant": "text",
  "lines": 3,
  "animation": "pulse"
}
```

**Properties:**
- `variant`: `text`, `circular`, `rectangular`
- `width`: Width (default: 100%)
- `height`: Height
- `lines`: Number of text lines
- `animation`: `pulse`, `wave`, `none`

### Tooltip

Hover information popup.

```json
{
  "component": "Tooltip",
  "content": "Click to save",
  "position": "top",
  "delay": 300,
  "children": [
    {"component": "Button", "label": "Save", "action": {"type": "submit"}}
  ]
}
```

**Properties:**
- `content` (required): Tooltip text
- `position`: `top`, `bottom`, `left`, `right`
- `delay`: Show delay in ms
- `children` (required): Component to wrap

## Common Properties

All components support these common properties:

```json
{
  "id": "unique-id",
  "visibleIf": "/ui/showComponent",
  "style": {
    "padding": 16,
    "margin": {"top": 8, "bottom": 8},
    "backgroundColor": "#f5f5f5",
    "borderRadius": 8,
    "borderColor": "#ddd",
    "borderWidth": 1,
    "width": "100%",
    "height": 200,
    "flex": 1,
    "opacity": 0.8
  }
}
```

- `id`: Unique component identifier
- `visibleIf`: JSON pointer for conditional visibility (show if value is truthy)
- `style`: CSS-like styling object
