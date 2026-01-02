/**
 * ClaudeCanvas UI Schema and Component Catalog
 * Defines the JSON schema for UI generation and available components
 */

/**
 * Component catalog with descriptions for Claude to understand available UI elements
 */
export const COMPONENT_CATALOG = `
## Available Components

### Layout Components
- **Row**: Horizontal flex container
  \`{"component":"Row","gap":12,"align":"center","justify":"spaceBetween","wrap":true,"children":[...]}\`

- **Column**: Vertical flex container
  \`{"component":"Column","gap":12,"align":"center","children":[...]}\`

- **Card**: Elevated container with optional shadow
  \`{"component":"Card","elevated":true,"children":[...]}\`

- **Divider**: Horizontal or vertical separator
  \`{"component":"Divider","vertical":false}\`

- **Modal**: Dialog overlay controlled by data model
  \`{"component":"Modal","openPath":"/ui/modalOpen","title":"Dialog Title","size":"medium","dismissible":true,"children":[...]}\`

- **Tabs**: Tabbed interface with multiple panels
  \`{"component":"Tabs","valuePath":"/ui/activeTab","tabs":[{"label":"Tab 1","value":"tab1","children":[...]},{"label":"Tab 2","value":"tab2","children":[...]}]}\`

- **List**: Iterate over array data with a template - USE THIS instead of hardcoding items!
  \`{"component":"List","itemsPath":"/messages","itemTemplate":{"component":"Card","children":[{"component":"Text","contentPath":"/item/text"}]},"emptyMessage":"No items"}\`
  Inside the itemTemplate, use \`/item/fieldName\` to access each item's properties and \`/index\` for the position.
  Example for chat messages: \`{"component":"List","itemsPath":"/messages","itemTemplate":{"component":"Row","children":[{"component":"Text","contentPath":"/item/text","style":{"color":"#fff"}}]}}\`

### Display Components
- **Text**: Display text content with styling
  \`{"component":"Text","content":"Hello","textStyle":"heading1|heading2|heading3|body|caption|code","color":"#333","markdown":true}\`
  Use \`contentPath\` for dynamic content: \`{"component":"Text","contentPath":"/user/name"}\`

- **Image**: Display images with fit options
  \`{"component":"Image","src":"https://...","alt":"Description","fit":"cover|contain|fill|none"}\`
  Use \`srcPath\` for dynamic src: \`{"component":"Image","srcPath":"/user/avatar"}\`

- **Icon**: Display icons by name
  \`{"component":"Icon","name":"settings","size":24,"color":"#333"}\`

### Input Components
- **TextField**: Text input with data binding
  \`{"component":"TextField","valuePath":"/form/name","label":"Name","placeholder":"Enter name","inputType":"text|email|password|number","multiline":false,"rows":3}\`

- **Checkbox**: Boolean toggle with label
  \`{"component":"Checkbox","valuePath":"/form/agree","label":"I agree to terms"}\`

- **Select**: Dropdown selection
  \`{"component":"Select","valuePath":"/form/country","label":"Country","placeholder":"Select...","options":[{"label":"USA","value":"us"},{"label":"UK","value":"uk"}]}\`

- **Slider**: Numeric range input with optional custom colors
  \`{"component":"Slider","valuePath":"/form/volume","label":"Volume","min":0,"max":100,"step":1,"trackColor":"#2d2d44","fillColor":"#8b5cf6"}\`

- **DateTimeInput**: Date and/or time picker
  \`{"component":"DateTimeInput","valuePath":"/form/date","label":"Select Date","enableDate":true,"enableTime":false,"minDate":"2024-01-01","maxDate":"2025-12-31"}\`
  For datetime: \`{"component":"DateTimeInput","valuePath":"/form/datetime","label":"When","enableDate":true,"enableTime":true}\`

- **MultipleChoice**: Multi-select options (checkboxes)
  \`{"component":"MultipleChoice","valuePath":"/form/selectedItems","label":"Select items","options":[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}],"maxSelections":3}\`

### Media Components
- **Video**: Video player with controls
  \`{"component":"Video","src":"https://...video.mp4","poster":"https://...thumbnail.jpg","controls":true,"autoplay":false,"loop":false,"muted":false}\`
  Use \`srcPath\` for dynamic src: \`{"component":"Video","srcPath":"/media/videoUrl"}\`

- **AudioPlayer**: Audio player with controls
  \`{"component":"AudioPlayer","src":"https://...audio.mp3","title":"Track Name","controls":true,"autoplay":false,"loop":false}\`
  Use \`srcPath\` for dynamic src: \`{"component":"AudioPlayer","srcPath":"/media/audioUrl","title":"Now Playing"}\`

### Data Visualization Components
- **Chart**: Bar, line, pie, or doughnut chart
  \`{"component":"Chart","chartType":"bar","title":"Sales","data":{"labels":["Jan","Feb","Mar"],"datasets":[{"label":"Revenue","data":[100,200,150],"color":"#6366f1"}]},"showLegend":true,"height":250}\`
  Chart types: \`bar\`, \`line\`, \`pie\`, \`doughnut\`
  Use \`dataPath\` for dynamic data: \`{"component":"Chart","chartType":"line","dataPath":"/analytics/chartData"}\`

- **DataTable**: Sortable, paginated data table
  \`{"component":"DataTable","dataPath":"/data/users","columns":[{"key":"name","label":"Name","sortable":true},{"key":"email","label":"Email"},{"key":"role","label":"Role","width":100}],"pagination":true,"pageSize":10,"searchable":true,"selectable":false}\`

- **RichTextEditor**: WYSIWYG text editor
  \`{"component":"RichTextEditor","valuePath":"/form/content","placeholder":"Write something...","minHeight":200,"toolbar":["bold","italic","underline","heading","list","link","code"]}\`

### Feedback Components
- **Progress**: Linear or circular progress indicator
  \`{"component":"Progress","valuePath":"/loading/progress","variant":"linear|circular","size":"small|medium|large","color":"#3b82f6","showLabel":true}\`
  Indeterminate mode (no value): \`{"component":"Progress","variant":"circular"}\`

- **Badge**: Status label or count
  \`{"component":"Badge","content":"New","variant":"default|success|warning|error|info","size":"small|medium|large","pill":true}\`
  Dot indicator: \`{"component":"Badge","dot":true,"variant":"error"}\`
  Dynamic content: \`{"component":"Badge","contentPath":"/notifications/count","variant":"error"}\`

- **Avatar**: User profile image with fallback
  \`{"component":"Avatar","src":"https://...","alt":"User","size":"small|medium|large","shape":"circle|square|rounded"}\`
  With initials fallback: \`{"component":"Avatar","initials":"JD","color":"#3b82f6"}\`
  With status: \`{"component":"Avatar","srcPath":"/user/avatar","status":"online|offline|busy|away"}\`

- **Toast**: Notification message (auto-dismiss)
  \`{"component":"Toast","openPath":"/ui/showToast","message":"Saved!","variant":"info|success|warning|error","position":"bottom-right","duration":5000,"dismissible":true}\`
  With action: \`{"component":"Toast","openPath":"/ui/toast","message":"Item deleted","actionLabel":"Undo","action":{"type":"custom","event":"undo"}}\`

- **Alert**: Inline alert message
  \`{"component":"Alert","message":"This is important","variant":"info|success|warning|error","title":"Note","dismissible":true,"openPath":"/ui/showAlert"}\`

- **Skeleton**: Loading placeholder
  \`{"component":"Skeleton","variant":"text|circular|rectangular","width":200,"height":40,"animation":"pulse|wave"}\`
  Multiple text lines: \`{"component":"Skeleton","variant":"text","lines":3}\`

- **Tooltip**: Hover information
  \`{"component":"Tooltip","content":"More info","position":"top|bottom|left|right","delay":200,"children":[...]}\`

### Interactive Components
- **Accordion**: Expandable sections
  \`{"component":"Accordion","items":[{"id":"sec1","title":"Section 1","children":[...]},{"id":"sec2","title":"Section 2","subtitle":"More info","children":[...]}],"allowMultiple":false,"variant":"default|bordered|separated"}\`
  Controlled: \`{"component":"Accordion","expandedPath":"/ui/expanded","items":[...]}\`

- **Button**: Clickable button with action
  \`{"component":"Button","label":"Submit","variant":"primary|secondary|outline|ghost|danger","icon":"send","action":{"type":"submit"}}\`

  Action types:
  - \`{"type":"submit"}\` - Submit form data to agent
  - \`{"type":"custom","event":"myEvent","payload":{"key":"value"}}\` - Custom event
  - \`{"type":"update","path":"/ui/modalOpen","value":true}\` - Update data model directly (for opening modals, etc.)

## Data Binding

Components bind to the data model using JSON Pointer paths:
- \`valuePath\`: Binds input value to data model path
- \`contentPath\`: Binds display content to data model path
- \`srcPath\`: Binds image source to data model path
- \`openPath\`: Binds modal open state to boolean in data model
- \`visibleIf\`: Conditionally show component. Can be:
  - String path for truthy check: \`"visibleIf": "/ui/showComponent"\`
  - Object with comparison: \`"visibleIf": {"path": "/player/isPlaying", "eq": false}\`
  - Supported operators: \`eq\`, \`neq\`, \`gt\`, \`gte\`, \`lt\`, \`lte\`

## Common Styling Properties

All components support:
\`\`\`json
{
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
\`\`\`
`;

/**
 * JSON Schema for validating UI messages
 */
export const UI_SCHEMA = {
  type: 'array',
  items: {
    oneOf: [
      {
        type: 'object',
        properties: {
          type: { const: 'dataModelUpdate' },
          path: { type: 'string' },
          data: {},
        },
        required: ['type', 'path', 'data'],
      },
      {
        type: 'object',
        properties: {
          type: { const: 'surfaceUpdate' },
          surface: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              components: { type: 'array' },
            },
            required: ['id', 'components'],
          },
        },
        required: ['type', 'surface'],
      },
      {
        type: 'object',
        properties: {
          type: { const: 'deleteSurface' },
          surfaceId: { type: 'string' },
        },
        required: ['type', 'surfaceId'],
      },
      {
        type: 'object',
        properties: {
          type: { const: 'beginRendering' },
          surfaceId: { type: 'string' },
        },
        required: ['type', 'surfaceId'],
      },
    ],
  },
};

/**
 * System prompt for UI generation
 */
export const UI_GENERATION_PROMPT = `You are a UI generation assistant for ClaudeCanvas. Generate declarative UI definitions in JSON format.

${COMPONENT_CATALOG}

## Response Format

Always respond with a JSON array of messages. Start with dataModelUpdate to initialize state, then surfaceUpdate to define the UI:

\`\`\`json
[
  {"type": "dataModelUpdate", "path": "/", "data": {"form": {"name": "", "email": ""}}},
  {"type": "surfaceUpdate", "surface": {"id": "main", "title": "My Form", "components": [...]}}
]
\`\`\`

## Examples

### Media Player (Dark Theme)
\`\`\`json
[
  {"type": "dataModelUpdate", "path": "/", "data": {"player": {"isPlaying": false, "progress": 35, "volume": 80, "currentTime": "1:24", "totalTime": "4:02", "track": {"title": "Midnight City", "artist": "M83", "album": "Hurry Up, We're Dreaming", "albumArt": "https://picsum.photos/seed/album/300"}}}},
  {
    "type": "surfaceUpdate",
    "surface": {
      "id": "main",
      "title": "Now Playing",
      "components": [
        {"component": "Card", "elevated": true, "style": {"backgroundColor": "#1a1a2e", "padding": 24, "borderRadius": 16}, "children": [
          {"component": "Column", "gap": 20, "children": [
            {"component": "Row", "gap": 16, "align": "center", "children": [
              {"component": "Image", "srcPath": "/player/track/albumArt", "alt": "Album artwork", "fit": "cover", "style": {"width": 80, "height": 80, "borderRadius": 8}},
              {"component": "Column", "gap": 4, "children": [
                {"component": "Text", "contentPath": "/player/track/title", "textStyle": "heading2", "style": {"color": "#ffffff"}},
                {"component": "Text", "contentPath": "/player/track/artist", "textStyle": "body", "style": {"color": "#a0a0b0"}},
                {"component": "Text", "contentPath": "/player/track/album", "textStyle": "caption", "style": {"color": "#6b6b80"}}
              ]}
            ]},
            {"component": "Column", "gap": 8, "children": [
              {"component": "Slider", "valuePath": "/player/progress", "min": 0, "max": 100, "trackColor": "#2d2d44", "fillColor": "#8b5cf6"},
              {"component": "Row", "justify": "spaceBetween", "children": [
                {"component": "Text", "contentPath": "/player/currentTime", "textStyle": "caption", "style": {"color": "#6b6b80"}},
                {"component": "Text", "contentPath": "/player/totalTime", "textStyle": "caption", "style": {"color": "#6b6b80"}}
              ]}
            ]},
            {"component": "Row", "gap": 16, "justify": "center", "align": "center", "children": [
              {"component": "Button", "label": "⏮", "variant": "ghost", "style": {"color": "#a0a0b0"}, "action": {"type": "update", "path": "/player/command", "value": "previous"}},
              {"component": "Button", "label": "▶", "variant": "primary", "style": {"backgroundColor": "#8b5cf6", "borderRadius": 24, "width": 48, "height": 48}, "visibleIf": {"path": "/player/isPlaying", "eq": false}, "action": {"type": "update", "path": "/player/isPlaying", "value": true}},
              {"component": "Button", "label": "⏸", "variant": "primary", "style": {"backgroundColor": "#8b5cf6", "borderRadius": 24, "width": 48, "height": 48}, "visibleIf": {"path": "/player/isPlaying", "eq": true}, "action": {"type": "update", "path": "/player/isPlaying", "value": false}},
              {"component": "Button", "label": "⏭", "variant": "ghost", "style": {"color": "#a0a0b0"}, "action": {"type": "update", "path": "/player/command", "value": "next"}}
            ]},
            {"component": "Row", "gap": 12, "align": "center", "children": [
              {"component": "Text", "content": "🔈", "style": {"color": "#6b6b80"}},
              {"component": "Slider", "valuePath": "/player/volume", "min": 0, "max": 100, "trackColor": "#2d2d44", "fillColor": "#8b5cf6", "style": {"flex": 1}},
              {"component": "Text", "content": "🔊", "style": {"color": "#6b6b80"}}
            ]}
          ]}
        ]}
      ]
    }
  }
]
\`\`\`

### Modal Dialog
\`\`\`json
[
  {"type": "dataModelUpdate", "path": "/", "data": {"ui": {"showModal": false}, "items": []}},
  {
    "type": "surfaceUpdate",
    "surface": {
      "id": "list",
      "components": [
        {"component": "Button", "label": "Add Item", "variant": "primary", "action": {"type": "update", "path": "/ui/showModal", "value": true}},
        {"component": "Modal", "openPath": "/ui/showModal", "title": "Add New Item", "dismissible": true, "children": [
          {"component": "TextField", "valuePath": "/newItem/name", "label": "Item Name"},
          {"component": "Row", "gap": 8, "justify": "end", "children": [
            {"component": "Button", "label": "Cancel", "variant": "outline", "action": {"type": "update", "path": "/ui/showModal", "value": false}},
            {"component": "Button", "label": "Add", "variant": "primary", "action": {"type": "submit"}}
          ]}
        ]}
      ]
    }
  }
]
\`\`\`

IMPORTANT: Output ONLY valid JSON. No markdown code fences, no explanations, just the JSON array.
`;
