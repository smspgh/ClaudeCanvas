/**
 * A2A (Agent-to-Agent) Protocol Integration for ClaudeCanvas
 * Provides compatibility layer for A2A protocol transports
 */

import type { AgentToClientMessage, UserActionMessage } from './types.js';

/**
 * MIME type for A2UI messages in A2A protocol
 */
export const A2UI_MIME_TYPE = 'application/json+a2ui';

/**
 * A2A extension URI for A2UI
 */
export const A2UI_EXTENSION_URI = 'https://a2ui.org/a2a-extension/a2ui/v0.8';

/**
 * ClaudeCanvas extension URI (our own namespace)
 */
export const CLAUDE_CANVAS_EXTENSION_URI = 'https://claude-canvas.dev/a2a-extension/v0.1';

/**
 * A2A DataPart structure for UI messages
 */
export interface A2ADataPart {
  kind: 'data';
  data: AgentToClientMessage | UserActionMessage;
  metadata: {
    mimeType: typeof A2UI_MIME_TYPE;
    [key: string]: unknown;
  };
}

/**
 * A2A TextPart for regular text messages
 */
export interface A2ATextPart {
  kind: 'text';
  text: string;
}

/**
 * Union of A2A part types
 */
export type A2APart = A2ADataPart | A2ATextPart;

/**
 * A2A Message structure
 */
export interface A2AMessage {
  messageId: string;
  role: 'user' | 'agent';
  parts: A2APart[];
  kind: 'message';
  metadata?: {
    a2uiClientCapabilities?: A2UIClientCapabilities;
    [key: string]: unknown;
  };
}

/**
 * A2UI Client Capabilities for catalog negotiation
 */
export interface A2UIClientCapabilities {
  /** List of catalog URIs the client supports */
  supportedCatalogIds?: string[];
  /** Whether client can accept inline catalog definitions */
  acceptsInlineCatalogs?: boolean;
  /** Client-specific extensions */
  extensions?: Record<string, unknown>;
}

/**
 * A2A Agent Card extension parameters for A2UI support
 */
export interface A2UIAgentCardParams {
  /** Catalog URIs the agent can generate */
  supportedCatalogIds?: string[];
  /** Whether agent accepts inline catalogs from client */
  acceptsInlineCatalogs?: boolean;
}

/**
 * A2A Agent Extension block
 */
export interface A2AAgentExtension {
  uri: string;
  description?: string;
  required?: boolean;
  params?: A2UIAgentCardParams;
}

/**
 * Wrap ClaudeCanvas messages in A2A DataPart format
 */
export function wrapInA2ADataPart(message: AgentToClientMessage | UserActionMessage): A2ADataPart {
  return {
    kind: 'data',
    data: message,
    metadata: {
      mimeType: A2UI_MIME_TYPE,
    },
  };
}

/**
 * Wrap multiple ClaudeCanvas messages in A2A DataParts
 */
export function wrapMessagesInA2AParts(messages: AgentToClientMessage[]): A2ADataPart[] {
  return messages.map(wrapInA2ADataPart);
}

/**
 * Extract ClaudeCanvas messages from A2A parts
 */
export function extractMessagesFromA2AParts(parts: A2APart[]): AgentToClientMessage[] {
  return parts
    .filter((part): part is A2ADataPart =>
      part.kind === 'data' &&
      part.metadata?.mimeType === A2UI_MIME_TYPE
    )
    .map(part => part.data as AgentToClientMessage);
}

/**
 * Check if an A2A part is an A2UI message
 */
export function isA2UIPart(part: A2APart): part is A2ADataPart {
  return part.kind === 'data' && part.metadata?.mimeType === A2UI_MIME_TYPE;
}

/**
 * Check if an A2A part is a text message
 */
export function isTextPart(part: A2APart): part is A2ATextPart {
  return part.kind === 'text';
}

/**
 * Create an A2A message with A2UI data
 */
export function createA2AMessage(
  messages: AgentToClientMessage[],
  role: 'user' | 'agent' = 'agent',
  messageId?: string
): A2AMessage {
  return {
    messageId: messageId ?? generateMessageId(),
    role,
    parts: wrapMessagesInA2AParts(messages),
    kind: 'message',
  };
}

/**
 * Create an A2A user action message
 */
export function createA2AUserAction(
  action: UserActionMessage,
  messageId?: string,
  clientCapabilities?: A2UIClientCapabilities
): A2AMessage {
  return {
    messageId: messageId ?? generateMessageId(),
    role: 'user',
    parts: [wrapInA2ADataPart(action)],
    kind: 'message',
    metadata: clientCapabilities ? { a2uiClientCapabilities: clientCapabilities } : undefined,
  };
}

/**
 * Create A2UI agent extension block for Agent Card
 */
export function createA2UIAgentExtension(
  params?: A2UIAgentCardParams
): A2AAgentExtension {
  return {
    uri: A2UI_EXTENSION_URI,
    description: 'Ability to render A2UI declarative UI',
    required: false,
    params,
  };
}

/**
 * Create ClaudeCanvas agent extension block for Agent Card
 */
export function createClaudeCanvasAgentExtension(
  params?: A2UIAgentCardParams
): A2AAgentExtension {
  return {
    uri: CLAUDE_CANVAS_EXTENSION_URI,
    description: 'ClaudeCanvas declarative UI support',
    required: false,
    params,
  };
}

/**
 * HTTP header name for A2A extension activation
 */
export const A2A_EXTENSIONS_HEADER = 'X-A2A-Extensions';

/**
 * Create HTTP headers for A2A extension activation
 */
export function createA2AExtensionHeaders(): Record<string, string> {
  return {
    [A2A_EXTENSIONS_HEADER]: A2UI_EXTENSION_URI,
  };
}

/**
 * Generate a unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * A2A Transport adapter for ClaudeCanvas
 * Provides methods for sending/receiving messages over A2A protocol
 */
export class A2ATransportAdapter {
  private baseUrl: string;
  private clientCapabilities?: A2UIClientCapabilities;

  constructor(baseUrl: string, clientCapabilities?: A2UIClientCapabilities) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.clientCapabilities = clientCapabilities;
  }

  /**
   * Send a text query to the agent
   */
  async sendText(text: string): Promise<AgentToClientMessage[]> {
    const message: A2AMessage = {
      messageId: generateMessageId(),
      role: 'user',
      parts: [{ kind: 'text', text }],
      kind: 'message',
      metadata: this.clientCapabilities ? { a2uiClientCapabilities: this.clientCapabilities } : undefined,
    };

    return this.send(message);
  }

  /**
   * Send a user action to the agent
   */
  async sendAction(action: UserActionMessage): Promise<AgentToClientMessage[]> {
    const message = createA2AUserAction(action, undefined, this.clientCapabilities);
    return this.send(message);
  }

  /**
   * Send an A2A message and extract A2UI responses
   */
  private async send(message: A2AMessage): Promise<AgentToClientMessage[]> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createA2AExtensionHeaders(),
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`A2A request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle A2A response format (array of parts or task result)
    if (Array.isArray(data)) {
      return extractMessagesFromA2AParts(data as A2APart[]);
    }

    // Handle task result format
    if (data.status?.message?.parts) {
      return extractMessagesFromA2AParts(data.status.message.parts as A2APart[]);
    }

    return [];
  }

  /**
   * Update client capabilities
   */
  setClientCapabilities(capabilities: A2UIClientCapabilities): void {
    this.clientCapabilities = capabilities;
  }
}

/**
 * Parse incoming A2A request body
 * Returns either text content or user action
 */
export function parseA2ARequest(body: string | A2AMessage): {
  type: 'text' | 'action';
  text?: string;
  action?: UserActionMessage;
} {
  // If it's a string that's not JSON, treat as text
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      if (parsed.kind === 'message' && parsed.parts) {
        return parseA2AMessage(parsed as A2AMessage);
      }
      // If it's a UserActionMessage directly
      if (parsed.type === 'userAction') {
        return { type: 'action', action: parsed as UserActionMessage };
      }
      return { type: 'text', text: body };
    } catch {
      return { type: 'text', text: body };
    }
  }

  return parseA2AMessage(body);
}

/**
 * Parse A2A message to extract content
 */
function parseA2AMessage(message: A2AMessage): {
  type: 'text' | 'action';
  text?: string;
  action?: UserActionMessage;
} {
  for (const part of message.parts) {
    if (isTextPart(part)) {
      return { type: 'text', text: part.text };
    }
    if (isA2UIPart(part) && (part.data as UserActionMessage).type === 'userAction') {
      return { type: 'action', action: part.data as UserActionMessage };
    }
  }
  return { type: 'text', text: '' };
}
