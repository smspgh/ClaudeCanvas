# @claude-canvas/mcp-server

MCP (Model Context Protocol) server for ClaudeCanvas integration with Claude Code CLI.

## Installation

```bash
pnpm install -g @claude-canvas/mcp-server
```

## Setup

### 1. Add to Claude Code Configuration

Add to your `~/.claude.json`:

```json
{
  "mcpServers": {
    "claude-canvas": {
      "command": "claude-canvas-mcp"
    }
  }
}
```

### 2. Restart Claude Code

After updating the config, restart Claude Code for changes to take effect.

## Usage

Once configured, Claude Code gains access to the `generate_ui` tool. Simply ask Claude to generate a UI:

```
Generate a contact form with name, email, and message fields
```

```
Create a dashboard with a chart showing monthly sales data
```

```
Build a settings panel with toggles for notifications and dark mode
```

## Available Tools

### generate_ui

Generates a declarative UI from a natural language description.

**Parameters:**
- `description` (required): Description of the UI to generate
- `surfaceId` (optional): ID for the surface (default: "main")
- `dataModel` (optional): Initial data model

### update_data_model

Updates the data model at a specific path.

**Parameters:**
- `path` (required): JSON Pointer path (e.g., "/form/name")
- `data` (required): Data to set at the path
- `surfaceId` (optional): Surface ID (default: "main")

### delete_surface

Removes a surface from the UI.

**Parameters:**
- `surfaceId` (required): ID of the surface to delete

### get_component_catalog

Returns the list of available UI components.

## How It Works

1. You describe the UI you want in natural language
2. Claude Code calls the `generate_ui` tool
3. The MCP server returns a prompt with component documentation
4. Claude generates the declarative JSON UI specification
5. The JSON can be rendered by any ClaudeCanvas renderer (Lit, React)

## Component Categories (31 Total)

- **Layout** (8): Row, Column, Card, Divider, Modal, Tabs, Accordion, List
- **Display** (5): Text, Image, Icon, Badge, Avatar
- **Input** (6): TextField, Checkbox, Select, Slider, DateTimeInput, MultipleChoice
- **Interactive** (2): Button, Link
- **Data** (3): Chart, DataTable, RichTextEditor
- **Feedback** (5): Progress, Toast, Alert, Skeleton, Tooltip
- **Media** (2): Video, AudioPlayer

## License

MIT
