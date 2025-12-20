/**
 * Prompts for Claude Canvas UI generation
 */

/**
 * Get a compact prompt that includes instructions inline
 * This avoids Windows command line length limits
 */
export function getCompactPrompt(userRequest: string): string {
  return `IMPORTANT: You are a JSON-only UI generator. Output ONLY valid JSON, no text, no markdown, no explanations.

Generate a UI for: "${userRequest}"

Output format (JSON array only):
[{"type":"dataModelUpdate","path":"/","data":{}},{"type":"surfaceUpdate","surface":{"id":"main","title":"Title","components":[...]}}]

Available components:
- {"component":"Card","elevated":true,"children":[...]}
- {"component":"Column","gap":12,"children":[...]}
- {"component":"Row","gap":12,"children":[...]}
- {"component":"Text","content":"text","textStyle":"heading2"}
- {"component":"Text","content":"text","textStyle":"body"}
- {"component":"TextField","valuePath":"/form/name","label":"Name","placeholder":"Enter name"}
- {"component":"Button","label":"Submit","variant":"primary","action":{"type":"submit"}}
- {"component":"Checkbox","valuePath":"/form/checked","label":"Check me"}
- {"component":"Select","valuePath":"/form/country","label":"Country","options":[{"label":"USA","value":"us"},{"label":"UK","value":"uk"}]}
- {"component":"Slider","valuePath":"/form/volume","label":"Volume","min":0,"max":100,"step":1}
- {"component":"Image","src":"https://example.com/image.jpg","alt":"Description","fit":"cover"}
- {"component":"Icon","name":"settings","size":24,"color":"#333"}
- {"component":"Divider"} (horizontal line separator)

OUTPUT ONLY THE JSON ARRAY NOW:`;
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
`;

export function getSystemPrompt(): string {
  return UI_GENERATION_SYSTEM_PROMPT;
}
