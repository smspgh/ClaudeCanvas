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
- `textStyle`: `heading1`, `heading2`, `heading3`, `body`, `caption`, `code`
- `color`: Text color
- `markdown`: Enable markdown rendering

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
  "emptyMessage": "No items"
}
```

**Properties:**
- `itemsPath` (required): JSON pointer to array data
- `itemTemplate` (required): Component template for each item
- `emptyMessage`: Message when list is empty

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
