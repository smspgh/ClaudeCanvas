/**
 * Prompts for Claude Canvas UI generation
 */

/**
 * Get a compact prompt that includes instructions inline
 * This avoids Windows command line length limits
 */
export function getCompactPrompt(userRequest: string): string {
  return `You are a ClaudeCanvas UI generator. Output ONLY a JSON array. No text, no markdown, no explanations.

REQUEST: ${userRequest}

FORMAT: [{"type":"dataModelUpdate","path":"/","data":{}},{"type":"surfaceUpdate","surface":{"id":"main","title":"Title","components":[...]}}]

COMPONENTS:
Card: {"component":"Card","elevated":true,"style":{"backgroundColor":"#1A1C2E","padding":24},"children":[...]}
Column: {"component":"Column","gap":12,"children":[...]}
Row: {"component":"Row","gap":12,"justify":"center","children":[...]} (justify: start|center|end|spaceBetween)
Text: {"component":"Text","content":"text","textStyle":"heading2","style":{"color":"#fff"}} (secondary: #A0AEC0)
Image: {"component":"Image","src":"https://...","srcPath":"/data/imageUrl","alt":"desc","fit":"cover","style":{"width":80,"height":80,"borderRadius":8}}
TextField: {"component":"TextField","valuePath":"/form/name","label":"Name","placeholder":"Enter"}
Button: {"component":"Button","label":"Go","variant":"primary","action":{"type":"update","path":"/state","value":true}}
Slider: {"component":"Slider","valuePath":"/val","min":0,"max":100,"trackColor":"#2D3748","fillColor":"#8b5cf6","showValue":false}
Checkbox: {"component":"Checkbox","valuePath":"/form/checked","label":"Check"}
Select: {"component":"Select","valuePath":"/form/choice","options":[{"label":"A","value":"a"}]}
Modal: {"component":"Modal","openPath":"/ui/showModal","title":"Title","children":[...]}
Divider: {"component":"Divider"}
Progress: {"component":"Progress","valuePath":"/loading","variant":"linear|circular","showLabel":true} (no value=indeterminate)
Badge: {"component":"Badge","content":"New","variant":"success|warning|error|info","pill":true}
Avatar: {"component":"Avatar","src":"url","initials":"JD","status":"online|offline|busy","size":"small|medium|large"}
Toast: {"component":"Toast","openPath":"/ui/toast","message":"Saved!","variant":"success","duration":5000}
Alert: {"component":"Alert","message":"Important","variant":"info|success|warning|error","title":"Note","dismissible":true}
Skeleton: {"component":"Skeleton","variant":"text|circular|rectangular","lines":3,"animation":"pulse|wave"}
Tooltip: {"component":"Tooltip","content":"Hover info","position":"top","children":[...]}
Accordion: {"component":"Accordion","items":[{"id":"s1","title":"Section","children":[...]}],"allowMultiple":false}
List: {"component":"List","itemsPath":"/messages","itemTemplate":{"component":"Row","children":[{"component":"Text","contentPath":"/item/text"}]},"emptyMessage":"No items"}

IMPORTANT - USE List FOR DYNAMIC DATA:
When rendering arrays (chat messages, todo items, product lists), use List component instead of hardcoding each item!
Example - Chat messages from /messages array:
{"component":"List","itemsPath":"/messages","itemTemplate":{"component":"Row","justify":{"path":"/item/isMe","eq":true},"children":[{"component":"Card","style":{"backgroundColor":"#3B82F6"},"visibleIf":"/item/isMe","children":[{"component":"Text","contentPath":"/item/text"}]},{"component":"Card","style":{"backgroundColor":"#2D3748"},"visibleIf":{"path":"/item/isMe","eq":false},"children":[{"component":"Text","contentPath":"/item/text"}]}]}}
Inside itemTemplate, use /item/fieldName to access each item's data, /index for position.

CONDITIONAL VISIBILITY (show/hide based on state):
visibleIf string (truthy): {"component":"Button","visibleIf":"/ui/showButton",...}
visibleIf with eq: {"component":"Button","visibleIf":{"path":"/player/isPlaying","eq":false},...}

DARK THEME PALETTE:
- Background: #1A1C2E (deep navy)
- Primary text: #FFFFFF (white for titles, main values)
- Secondary text: #A0AEC0 (soft blue-gray for labels)
- Nested cards: #2D3748 (lighter charcoal for depth)
- Accent: #8b5cf6 (purple) or #F6AD55 (warm amber)
- Dividers: rgba(255,255,255,0.2) (subtle, not solid gray)

DESIGN RULES:
- ALL text must be readable - NEVER use colors darker than #999 on dark backgrounds
- Use fontWeight 500-700 for headings on dark backgrounds
- Nested cards should be lighter than parent to create depth
- High contrast for important data (temps, prices, stats) - use #fff or bright accent
- Icons/action buttons: use bright colors (#fff, #F6AD55, #EF4444) for visibility
- For horizontal layouts (kanban, galleries): use style.overflowX:"auto" on parent Row
- Keep descriptions SHORT (under 50 chars) to reduce JSON size
- Prefer 2-3 sample items over many - keep output compact

EXAMPLE - Music Player (dark theme, play/pause toggle, time labels):
[{"type":"dataModelUpdate","path":"/","data":{"player":{"isPlaying":false,"progress":35,"volume":80,"currentTime":"1:24","totalTime":"4:02","track":{"title":"Song","artist":"Artist","album":"Album Name","albumArt":"https://picsum.photos/300"}}}},{"type":"surfaceUpdate","surface":{"id":"main","title":"Now Playing","components":[{"component":"Card","elevated":true,"style":{"backgroundColor":"#1A1C2E","padding":24,"borderRadius":16},"children":[{"component":"Column","gap":20,"children":[{"component":"Row","gap":16,"align":"center","children":[{"component":"Image","srcPath":"/player/track/albumArt","fit":"cover","style":{"width":80,"height":80,"borderRadius":8}},{"component":"Column","gap":4,"children":[{"component":"Text","contentPath":"/player/track/title","textStyle":"heading2","style":{"color":"#fff"}},{"component":"Text","contentPath":"/player/track/artist","textStyle":"body","style":{"color":"#A0AEC0"}},{"component":"Text","contentPath":"/player/track/album","textStyle":"caption","style":{"color":"#A0AEC0"}}]}]},{"component":"Column","gap":8,"children":[{"component":"Slider","valuePath":"/player/progress","min":0,"max":100,"trackColor":"#2D3748","fillColor":"#8b5cf6","showValue":false},{"component":"Row","justify":"spaceBetween","children":[{"component":"Text","contentPath":"/player/currentTime","textStyle":"caption","style":{"color":"#A0AEC0"}},{"component":"Text","contentPath":"/player/totalTime","textStyle":"caption","style":{"color":"#A0AEC0"}}]}]},{"component":"Row","gap":16,"justify":"center","children":[{"component":"Button","label":"⏮","variant":"ghost","style":{"color":"#A0AEC0"},"action":{"type":"update","path":"/player/cmd","value":"prev"}},{"component":"Button","label":"▶","variant":"primary","style":{"backgroundColor":"#8b5cf6","borderRadius":24,"width":56,"height":56},"visibleIf":{"path":"/player/isPlaying","eq":false},"action":{"type":"update","path":"/player/isPlaying","value":true}},{"component":"Button","label":"⏸","variant":"primary","style":{"backgroundColor":"#8b5cf6","borderRadius":24,"width":56,"height":56},"visibleIf":{"path":"/player/isPlaying","eq":true},"action":{"type":"update","path":"/player/isPlaying","value":false}},{"component":"Button","label":"⏭","variant":"ghost","style":{"color":"#A0AEC0"},"action":{"type":"update","path":"/player/cmd","value":"next"}}]},{"component":"Row","gap":12,"align":"center","children":[{"component":"Text","content":"🔈","style":{"color":"#A0AEC0"}},{"component":"Slider","valuePath":"/player/volume","min":0,"max":100,"trackColor":"#2D3748","fillColor":"#8b5cf6","showValue":false,"style":{"flex":1}},{"component":"Text","content":"🔊","style":{"color":"#A0AEC0"}}]}]}]}]}}]

OUTPUT JSON ARRAY NOW:`;
}

/**
 * Full system prompt (for reference, not used in CLI mode due to length limits)
 */
export const UI_GENERATION_SYSTEM_PROMPT = `You are a UI generation assistant. Generate ClaudeCanvas UI definitions in JSON format.

## Response Format
Always respond with a JSON array of messages:
[
  {"type": "dataModelUpdate", "path": "/", "data": {...}},
  {"type": "surfaceUpdate", "surface": {"id": "...", "components": [...]}}
]

## Components
- Row/Column: Layout containers with children, gap, align
- Card: Container with optional elevated shadow
- Text: Display text with textStyle (heading1/2/3, body, caption)
- TextField: Input with valuePath, label, placeholder, inputType
- Button: Clickable with label, variant, action
- Modal: Dialog overlay with openPath (boolean), title, size, dismissible, children
- Tabs: Tabbed interface with valuePath, tabs array containing label, value, children
- Divider: Horizontal or vertical separator line
- Progress: Linear/circular progress with valuePath or indeterminate
- Badge: Status label with variant (success/warning/error/info), pill shape
- Avatar: User image with initials fallback, status indicator
- Toast: Auto-dismissing notification with position, duration
- Alert: Inline alert message with variant, dismissible
- Skeleton: Loading placeholder with variant (text/circular/rectangular)
- Tooltip: Hover tooltip with position (top/bottom/left/right)
- Accordion: Expandable sections with items array, allowMultiple
- List: Iterate over array data with itemsPath and itemTemplate (use /item/field in template)
`;

export function getSystemPrompt(): string {
  return UI_GENERATION_SYSTEM_PROMPT;
}
