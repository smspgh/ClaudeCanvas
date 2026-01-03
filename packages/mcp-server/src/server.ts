/**
 * ClaudeCanvas MCP Server Implementation
 * Provides tools for generating declarative UI via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { AgentToClientMessage, DataModel } from '@claude-canvas/core';
import { UI_GENERATION_PROMPT, COMPONENT_CATALOG, UI_SCHEMA } from './schema.js';

export interface ServerOptions {
  name?: string;
  version?: string;
}

/**
 * State management for surfaces and data models
 */
interface ServerState {
  surfaces: Map<string, { surface: unknown; dataModel: DataModel }>;
  currentSurfaceId: string | null;
}

/**
 * ClaudeCanvas MCP Server
 */
export class ClaudeCanvasMCPServer {
  private server: Server;
  private state: ServerState;

  constructor(options: ServerOptions = {}) {
    const { name = 'claude-canvas', version = '0.1.0' } = options;

    this.state = {
      surfaces: new Map(),
      currentSurfaceId: null,
    };

    this.server = new Server(
      { name, version },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_ui',
          description:
            'Generate a declarative UI surface based on user requirements. Returns ClaudeCanvas JSON messages that can be rendered by compatible clients.',
          inputSchema: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description: 'Description of the UI to generate (e.g., "a contact form with name and email fields")',
              },
              surfaceId: {
                type: 'string',
                description: 'Optional ID for the surface. Defaults to "main".',
              },
              dataModel: {
                type: 'object',
                description: 'Optional initial data model state',
              },
            },
            required: ['description'],
          },
        },
        {
          name: 'update_data_model',
          description: 'Update the data model at a specific path. Used to populate form data or update UI state.',
          inputSchema: {
            type: 'object',
            properties: {
              surfaceId: {
                type: 'string',
                description: 'ID of the surface to update',
              },
              path: {
                type: 'string',
                description: 'JSON Pointer path to update (e.g., "/form/name" or "/")',
              },
              data: {
                description: 'Data to set at the path',
              },
            },
            required: ['path', 'data'],
          },
        },
        {
          name: 'delete_surface',
          description: 'Delete a surface by ID',
          inputSchema: {
            type: 'object',
            properties: {
              surfaceId: {
                type: 'string',
                description: 'ID of the surface to delete',
              },
            },
            required: ['surfaceId'],
          },
        },
        {
          name: 'get_component_catalog',
          description: 'Get the catalog of available UI components with examples and usage instructions',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'generate_ui':
          return this.handleGenerateUI(args as { description: string; surfaceId?: string; dataModel?: DataModel });

        case 'update_data_model':
          return this.handleUpdateDataModel(args as { surfaceId?: string; path: string; data: unknown });

        case 'delete_surface':
          return this.handleDeleteSurface(args as { surfaceId: string });

        case 'get_component_catalog':
          return {
            content: [
              {
                type: 'text',
                text: COMPONENT_CATALOG,
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

    // List resources (component catalog and current surfaces)
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'claude-canvas://catalog/components',
          name: 'Component Catalog',
          description: 'Available UI components and their properties',
          mimeType: 'text/markdown',
        },
        {
          uri: 'claude-canvas://schema/ui',
          name: 'UI Schema',
          description: 'JSON Schema for validating UI messages',
          mimeType: 'application/json',
        },
        {
          uri: 'claude-canvas://prompt/generation',
          name: 'UI Generation Prompt',
          description: 'System prompt for UI generation',
          mimeType: 'text/plain',
        },
      ],
    }));

    // Read resources
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'claude-canvas://catalog/components':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: COMPONENT_CATALOG,
              },
            ],
          };

        case 'claude-canvas://schema/ui':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(UI_SCHEMA, null, 2),
              },
            ],
          };

        case 'claude-canvas://prompt/generation':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/plain',
                text: UI_GENERATION_PROMPT,
              },
            ],
          };

        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });
  }

  private handleGenerateUI(args: { description: string; surfaceId?: string; dataModel?: DataModel }): {
    content: Array<{ type: string; text: string }>;
  } {
    const { description, surfaceId = 'main', dataModel = {} } = args;

    // Check if we have existing state for this surface
    const existingState = this.state.surfaces.get(surfaceId);
    const isIteration = !!existingState;

    // Build iteration context if modifying existing UI
    let iterationContext = '';
    if (isIteration && existingState) {
      const surface = existingState.surface as { id: string; title?: string; components?: unknown[] };
      iterationContext = `
CURRENT UI STATE (modify this based on the request above):
Surface ID: ${surface.id}
Title: ${surface.title || 'Untitled'}
${surface.components?.length ? `Current components: ${this.summarizeComponents(surface.components)}` : ''}

ITERATION RULES:
- Preserve existing components unless explicitly asked to remove them
- Maintain the same surface ID
- Keep existing data model paths that are still in use
- Add new components/data as requested
- You may reorganize layout if needed to accommodate changes
`;
    }

    // Return the generation prompt with the user's description
    // The LLM will use this to generate the actual UI JSON
    const prompt = `${UI_GENERATION_PROMPT}

Generate a UI for the following request:
"${description}"
${iterationContext}
${dataModel && Object.keys(dataModel).length > 0 ? `\nExisting data model:\n${JSON.stringify(dataModel, null, 2)}` : ''}

Surface ID: ${surfaceId}

Output ONLY the JSON array. No markdown, no explanations.`;

    return {
      content: [
        {
          type: 'text',
          text: prompt,
        },
      ],
    };
  }

  /**
   * Create a compact summary of components for context
   */
  private summarizeComponents(components: unknown[], depth = 0): string {
    if (depth > 2) return '[...]';

    const summaries: string[] = [];

    for (const comp of components) {
      if (typeof comp !== 'object' || comp === null) continue;

      const c = comp as Record<string, unknown>;
      const type = c.component as string;

      if (!type) continue;

      let summary = type;

      if (c.label) summary += `(${c.label})`;
      else if (c.content && typeof c.content === 'string') summary += `("${(c.content as string).substring(0, 20)}...")`;
      else if (c.valuePath) summary += `[${c.valuePath}]`;
      else if (c.dataPath) summary += `[${c.dataPath}]`;

      if (Array.isArray(c.children) && c.children.length > 0) {
        summary += `{${this.summarizeComponents(c.children as unknown[], depth + 1)}}`;
      }

      summaries.push(summary);
    }

    return summaries.join(', ');
  }

  private handleUpdateDataModel(args: { surfaceId?: string; path: string; data: unknown }): {
    content: Array<{ type: string; text: string }>;
  } {
    const { surfaceId = 'main', path, data } = args;

    const message: AgentToClientMessage = {
      type: 'dataModelUpdate',
      path,
      data,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify([message]),
        },
      ],
    };
  }

  private handleDeleteSurface(args: { surfaceId: string }): {
    content: Array<{ type: string; text: string }>;
  } {
    const { surfaceId } = args;
    this.state.surfaces.delete(surfaceId);

    const message: AgentToClientMessage = {
      type: 'deleteSurface',
      surfaceId,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify([message]),
        },
      ],
    };
  }

  /**
   * Start the server with stdio transport
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[ClaudeCanvas MCP] Server started');
  }

  /**
   * Get the underlying MCP server instance
   */
  getServer(): Server {
    return this.server;
  }
}

/**
 * Create and start a ClaudeCanvas MCP server
 */
export async function createServer(options?: ServerOptions): Promise<ClaudeCanvasMCPServer> {
  const server = new ClaudeCanvasMCPServer(options);
  await server.start();
  return server;
}
