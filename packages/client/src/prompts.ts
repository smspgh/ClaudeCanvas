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

FORMAT: [{"type":"dataModelUpdate","path":"/","data":{"form":{}}},{"type":"surfaceUpdate","surface":{"id":"main","title":"Title","components":[...]}}]

COMPONENTS:
Card: {"component":"Card","elevated":true,"children":[...]}
Column: {"component":"Column","gap":12,"children":[...]}
Row: {"component":"Row","gap":12,"children":[...]}
Text: {"component":"Text","content":"text","textStyle":"heading2"} (or body, caption)
TextField: {"component":"TextField","valuePath":"/form/name","label":"Name","placeholder":"Enter"}
Button: {"component":"Button","label":"Submit","variant":"primary","action":{"type":"submit"}}
Checkbox: {"component":"Checkbox","valuePath":"/form/checked","label":"Check"}
Select: {"component":"Select","valuePath":"/form/choice","label":"Choose","options":[{"label":"A","value":"a"}]}
Slider: {"component":"Slider","valuePath":"/form/value","label":"Value","min":0,"max":100}
DateTimeInput: {"component":"DateTimeInput","valuePath":"/form/date","label":"Date","enableDate":true,"enableTime":false}
MultipleChoice: {"component":"MultipleChoice","valuePath":"/form/selected","label":"Select","options":[{"label":"A","value":"a"}]}
Video: {"component":"Video","src":"https://...","controls":true}
AudioPlayer: {"component":"AudioPlayer","src":"https://...","title":"Audio"}
Modal: {"component":"Modal","openPath":"/ui/showModal","title":"Title","children":[...]}
Tabs: {"component":"Tabs","valuePath":"/ui/tab","tabs":[{"label":"Tab1","value":"t1","children":[...]}]}
Divider: {"component":"Divider"}

Modal open button: {"component":"Button","label":"Open","action":{"type":"update","path":"/ui/showModal","value":true}}

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
`;

export function getSystemPrompt(): string {
  return UI_GENERATION_SYSTEM_PROMPT;
}
