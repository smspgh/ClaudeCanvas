import type { Surface, DataModel } from '@claude-canvas/core';

/**
 * Prompts for Claude Canvas UI generation
 */

export interface PromptContext {
  /** Current surface being displayed (for iterative updates) */
  currentSurface?: Surface;
  /** Current data model state */
  dataModel?: DataModel;
}

/**
 * Get a compact prompt that includes instructions inline
 * This avoids Windows command line length limits
 */
export function getCompactPrompt(userRequest: string, context?: PromptContext): string {
  const iterationContext = buildIterationContext(context);

  return `You are a ClaudeCanvas UI generator. Output ONLY a JSON array. No text, no markdown, no explanations.

REQUEST: ${userRequest}
${iterationContext}

FORMAT: [{"type":"dataModelUpdate","path":"/","data":{}},{"type":"surfaceUpdate","surface":{"id":"main","title":"Title","components":[...]}}]

COMPONENTS:
Card: {"component":"Card","elevated":true,"style":{"backgroundColor":"#1A1C2E","padding":24},"children":[...]}
Column: {"component":"Column","gap":12,"children":[...]}
Row: {"component":"Row","gap":12,"justify":"center","children":[...]} (justify: start|center|end|spaceBetween)
Text: {"component":"Text","content":"text","textStyle":"heading2","style":{"color":"#fff"}} (secondary: #A0AEC0) - for dynamic count: {"component":"Text","contentPath":"/selectedRows","contentExpr":"length"}
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
List: {"component":"List","itemsPath":"/messages","itemTemplate":{"component":"Row","children":[{"component":"Text","contentPath":"/item/text"}]},"emptyMessage":"No items","alternateBackground":true}
DataTable: {"component":"DataTable","dataPath":"/employees","columns":[{"key":"avatar","label":"","type":"avatar"},{"key":"name","label":"Name","sortable":true},{"key":"status","label":"Status","type":"statusDot"}],"pagination":true,"pageSize":10,"searchable":true,"searchPlaceholder":"Search employees...","selectable":true,"selectionPath":"/selectedRows","alternateBackground":true}
DataTable props: columns (type: text|image|avatar|badge|statusDot), selectionPath (for selected rows), selectable, searchable, searchPlaceholder, pagination, pageSize, alternateBackground
Column types: badge (colored pill), statusDot (colored dot + label for active/away/offline/online/busy)
BULK ACTIONS BAR: To show selection count, use contentExpr: {"component":"Text","contentPath":"/selectedRows","contentExpr":"length"} then append " selected" as separate Text

IMPORTANT - CHOOSING List vs DataTable:
- Use DataTable for tabular data with sorting, pagination, search, selection (employee directories, product catalogs, data grids)
- Use List for simple repeated items (chat messages, todo items, cards, notifications)
DataTable has BUILT-IN: sorting, pagination, search, row selection - do NOT add separate TextField/buttons for these features!

LIST FEATURES:
- Inside itemTemplate: /item/fieldName for item data, /index for position
- Path interpolation: "/selectedItems/{item.id}" dynamically creates paths like "/selectedItems/123"
- alternateBackground: true for zebra striping

COMPUTED EXPRESSIONS (expr transforms value, then use eq/gt/etc to compare):
- Check if any selected: {"path":"/selected","expr":"any"} (returns true if any truthy)
- Check count > 0: {"path":"/selected","expr":"length","gt":0}
- Check all done: {"path":"/todos","expr":"all"} (returns true if all truthy)
Available expr: "length", "count", "any", "all", "none", "sum"

CHAT INTERFACE RULES:
- Wrap message List in Column with gap:12 for proper spacing between bubbles
- Message bubbles: padding 12, borderRadius 16, maxWidth "75%"
- Typing indicator: plain italic Text (NOT a card/bubble), color #A0AEC0
- Input bar: Row with TextField (flex:1) and Send Button
- IMPORTANT: For sent vs received styling, use TWO separate cards with visibleIf (no conditional styles!):
  {"component":"Row","justify":"end","visibleIf":"/item/isMe","children":[{"component":"Card","style":{"backgroundColor":"#3B82F6","padding":12,"borderRadius":16},"children":[...]}]}
  {"component":"Row","justify":"start","visibleIf":{"path":"/item/isMe","eq":false},"children":[{"component":"Card","style":{"backgroundColor":"#2D3748","padding":12,"borderRadius":16},"children":[...]}]}

CONDITIONAL VISIBILITY (show/hide based on state):
visibleIf string (truthy): {"component":"Button","visibleIf":"/ui/showButton",...}
visibleIf with eq: {"component":"Button","visibleIf":{"path":"/player/isPlaying","eq":false},...}
visibleIf with neq (not equal): {"component":"Button","visibleIf":{"path":"/dateRange","neq":"Week"},...}
Available operators: eq, neq, gt, gte, lt, lte. Do NOT use "not:true" - use neq instead.
WARNING: visibleIf is the ONLY conditional - do NOT use conditionals in style/justify/other props! Use duplicate components with visibleIf instead.

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
- ALWAYS add gap (8-16) to Column/Row containing repeated items for proper spacing
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

/**
 * Build context string for iterative UI updates
 * Provides Claude with the current state so it can modify rather than replace
 */
function buildIterationContext(context?: PromptContext): string {
  if (!context?.currentSurface) {
    return '';
  }

  const parts: string[] = [];

  parts.push(`
CURRENT UI STATE (modify this based on the request above):
Surface ID: ${context.currentSurface.id}
Title: ${context.currentSurface.title || 'Untitled'}`);

  // Include a compact representation of current components
  if (context.currentSurface.components?.length) {
    const componentSummary = summarizeComponents(context.currentSurface.components);
    parts.push(`Components: ${componentSummary}`);
  }

  // Include relevant data model state
  if (context.dataModel && Object.keys(context.dataModel).length > 0) {
    const compactData = JSON.stringify(context.dataModel);
    // Only include if not too large (keep prompt reasonable)
    if (compactData.length < 2000) {
      parts.push(`Data Model: ${compactData}`);
    } else {
      // Summarize large data models
      parts.push(`Data Model Keys: ${Object.keys(context.dataModel).join(', ')}`);
    }
  }

  parts.push(`
ITERATION RULES:
- Preserve existing components unless explicitly asked to remove them
- Maintain the same surface ID
- Keep existing data model paths that are still in use
- Add new components/data as requested
- You may reorganize layout if needed to accommodate changes`);

  return parts.join('\n');
}

/**
 * Create a compact summary of components for context
 */
function summarizeComponents(components: unknown[], depth = 0): string {
  if (depth > 2) return '[...]'; // Limit depth for brevity

  const summaries: string[] = [];

  for (const comp of components) {
    if (typeof comp !== 'object' || comp === null) continue;

    const c = comp as Record<string, unknown>;
    const type = c.component as string;

    if (!type) continue;

    let summary = type;

    // Add key identifying info based on component type
    if (c.label) summary += `(${c.label})`;
    else if (c.content && typeof c.content === 'string') summary += `("${(c.content as string).substring(0, 20)}...")`;
    else if (c.valuePath) summary += `[${c.valuePath}]`;
    else if (c.dataPath) summary += `[${c.dataPath}]`;

    // Recurse into children
    if (Array.isArray(c.children) && c.children.length > 0) {
      summary += `{${summarizeComponents(c.children as unknown[], depth + 1)}}`;
    }

    summaries.push(summary);
  }

  return summaries.join(', ');
}
