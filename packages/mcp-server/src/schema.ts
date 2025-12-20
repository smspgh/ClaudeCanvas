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

- **Slider**: Numeric range input
  \`{"component":"Slider","valuePath":"/form/volume","label":"Volume","min":0,"max":100,"step":1}\`

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

### Interactive Components
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
- \`visibleIf\`: Conditionally show component based on data model path (truthy value)

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

### Simple Form
\`\`\`json
[
  {"type": "dataModelUpdate", "path": "/", "data": {"form": {"name": "", "email": ""}}},
  {
    "type": "surfaceUpdate",
    "surface": {
      "id": "contact",
      "title": "Contact Form",
      "components": [
        {"component": "Card", "elevated": true, "children": [
          {"component": "Column", "gap": 16, "children": [
            {"component": "TextField", "valuePath": "/form/name", "label": "Name", "placeholder": "Your name"},
            {"component": "TextField", "valuePath": "/form/email", "label": "Email", "inputType": "email"},
            {"component": "Button", "label": "Submit", "variant": "primary", "action": {"type": "submit"}}
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
