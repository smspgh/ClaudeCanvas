/**
 * Streaming JSON Parser for ClaudeCanvas
 * Parses JSON messages incrementally as they stream in from the LLM
 */

import type { AgentToClientMessage } from './types.js';

export interface StreamingParserEvents {
  /** Called when a message is parsed */
  onMessage?: (message: AgentToClientMessage) => void;
  /** Called when a parsing error occurs */
  onError?: (error: Error) => void;
  /** Called when parsing is complete */
  onComplete?: (messages: AgentToClientMessage[]) => void;
  /** Called when beginRendering is received - signals UI should start rendering */
  onBeginRendering?: (surfaceId: string) => void;
  /** Called when surfaceUpdate is received - for progressive UI updates */
  onSurfaceUpdate?: (surface: AgentToClientMessage) => void;
  /** Called when dataModelUpdate is received - for data changes */
  onDataModelUpdate?: (update: AgentToClientMessage) => void;
}

export interface StreamingParserState {
  buffer: string;
  messages: AgentToClientMessage[];
  inArray: boolean;
  bracketDepth: number;
  inString: boolean;
  escapeNext: boolean;
  currentObjectStart: number;
}

/**
 * Streaming JSON parser for ClaudeCanvas messages
 * Emits complete message objects as soon as they are fully received
 */
export class StreamingJsonParser {
  private state: StreamingParserState;
  private events: StreamingParserEvents;

  constructor(events: StreamingParserEvents = {}) {
    this.events = events;
    this.state = this.createInitialState();
  }

  private createInitialState(): StreamingParserState {
    return {
      buffer: '',
      messages: [],
      inArray: false,
      bracketDepth: 0,
      inString: false,
      escapeNext: false,
      currentObjectStart: -1,
    };
  }

  /**
   * Feed a chunk of text to the parser
   */
  feed(chunk: string): void {
    this.state.buffer += chunk;
    this.parseBuffer();
  }

  /**
   * Parse the current buffer, extracting complete messages
   */
  private parseBuffer(): void {
    const { buffer } = this.state;

    for (let i = 0; i < buffer.length; i++) {
      const char = buffer[i];

      // Handle escape sequences in strings
      if (this.state.escapeNext) {
        this.state.escapeNext = false;
        continue;
      }

      if (char === '\\' && this.state.inString) {
        this.state.escapeNext = true;
        continue;
      }

      // Handle string boundaries
      if (char === '"' && !this.state.escapeNext) {
        this.state.inString = !this.state.inString;
        continue;
      }

      // Skip if inside string
      if (this.state.inString) {
        continue;
      }

      // Detect array start
      if (char === '[' && !this.state.inArray && this.state.bracketDepth === 0) {
        this.state.inArray = true;
        continue;
      }

      // Track object boundaries
      if (char === '{') {
        if (this.state.bracketDepth === 0) {
          this.state.currentObjectStart = i;
        }
        this.state.bracketDepth++;
      } else if (char === '}') {
        this.state.bracketDepth--;

        // Complete object found
        if (this.state.bracketDepth === 0 && this.state.currentObjectStart !== -1) {
          const objectStr = buffer.substring(this.state.currentObjectStart, i + 1);
          this.tryParseMessage(objectStr);
          this.state.currentObjectStart = -1;
        }
      }

      // Detect array end
      if (char === ']' && this.state.inArray && this.state.bracketDepth === 0) {
        this.state.inArray = false;
        // Trim the buffer up to this point
        this.state.buffer = buffer.substring(i + 1);
        this.complete();
        return;
      }
    }

    // Keep only unprocessed part of buffer (from current object start or from end)
    if (this.state.currentObjectStart !== -1) {
      this.state.buffer = buffer.substring(this.state.currentObjectStart);
      this.state.currentObjectStart = 0;
    } else if (!this.state.inArray) {
      // If not in array yet, keep looking for the start
      const arrayStart = buffer.lastIndexOf('[');
      if (arrayStart !== -1) {
        this.state.buffer = buffer.substring(arrayStart);
      }
    }
  }

  /**
   * Try to parse a message object
   */
  private tryParseMessage(jsonStr: string): void {
    try {
      const message = JSON.parse(jsonStr) as AgentToClientMessage;
      this.state.messages.push(message);

      // Call general message handler
      this.events.onMessage?.(message);

      // Call type-specific handlers for progressive rendering
      switch (message.type) {
        case 'beginRendering':
          this.events.onBeginRendering?.(message.surfaceId);
          break;
        case 'surfaceUpdate':
          this.events.onSurfaceUpdate?.(message);
          break;
        case 'dataModelUpdate':
          this.events.onDataModelUpdate?.(message);
          break;
      }
    } catch (error) {
      this.events.onError?.(new Error(`Failed to parse message: ${jsonStr.substring(0, 100)}`));
    }
  }

  /**
   * Signal that parsing is complete
   */
  complete(): void {
    this.events.onComplete?.(this.state.messages);
  }

  /**
   * Force completion and return all parsed messages
   */
  finish(): AgentToClientMessage[] {
    // Try to parse any remaining buffer
    if (this.state.buffer.trim()) {
      try {
        // Try to parse the entire buffer as JSON
        const parsed = JSON.parse(this.state.buffer.trim());
        const messages = Array.isArray(parsed) ? parsed : [parsed];
        for (const msg of messages) {
          if (!this.state.messages.some(m => JSON.stringify(m) === JSON.stringify(msg))) {
            this.state.messages.push(msg);
            this.events.onMessage?.(msg);
          }
        }
      } catch {
        // Ignore parse errors on finish
      }
    }

    this.complete();
    return this.state.messages;
  }

  /**
   * Reset the parser state
   */
  reset(): void {
    this.state = this.createInitialState();
  }

  /**
   * Get currently parsed messages
   */
  getMessages(): AgentToClientMessage[] {
    return [...this.state.messages];
  }
}

/**
 * Parse a complete JSON string containing ClaudeCanvas messages
 * Handles various formats (array, single object, markdown-wrapped)
 */
export function parseMessages(text: string): AgentToClientMessage[] {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  let jsonString = jsonMatch ? jsonMatch[1] : text;

  // Also try to find raw JSON array
  if (!jsonMatch) {
    const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      jsonString = arrayMatch[0];
    }
  }

  try {
    const parsed = JSON.parse(jsonString.trim());
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    throw new Error('Failed to parse ClaudeCanvas messages');
  }
}

/**
 * Buffered Surface Manager for progressive rendering
 * Buffers updates until beginRendering is received, then renders progressively
 */
export class BufferedSurfaceManager {
  private componentBuffer: Map<string, Map<string, unknown>> = new Map(); // surfaceId -> components
  private dataModelBuffer: Map<string, unknown> = new Map(); // path -> data
  private readySurfaces: Set<string> = new Set();

  private events: {
    onReady?: (surfaceId: string) => void;
    onUpdate?: (surfaceId: string, components: Map<string, unknown>, data: Map<string, unknown>) => void;
  };

  constructor(events: BufferedSurfaceManager['events'] = {}) {
    this.events = events;
  }

  /**
   * Process a surfaceUpdate message
   */
  processSurfaceUpdate(message: AgentToClientMessage): void {
    if (message.type !== 'surfaceUpdate') return;

    const surfaceId = message.surface.id;
    if (!this.componentBuffer.has(surfaceId)) {
      this.componentBuffer.set(surfaceId, new Map());
    }

    // Store surface components (in real impl would store by component ID)
    this.componentBuffer.get(surfaceId)!.set('surface', message.surface);

    // If surface is ready, emit update immediately
    if (this.readySurfaces.has(surfaceId)) {
      this.emitUpdate(surfaceId);
    }
  }

  /**
   * Process a dataModelUpdate message
   */
  processDataModelUpdate(message: AgentToClientMessage): void {
    if (message.type !== 'dataModelUpdate') return;
    this.dataModelBuffer.set(message.path, message.data);

    // Emit updates for all ready surfaces
    for (const surfaceId of this.readySurfaces) {
      this.emitUpdate(surfaceId);
    }
  }

  /**
   * Process a beginRendering message
   */
  processBeginRendering(surfaceId: string): void {
    this.readySurfaces.add(surfaceId);
    this.events.onReady?.(surfaceId);
    this.emitUpdate(surfaceId);
  }

  /**
   * Process any message
   */
  processMessage(message: AgentToClientMessage): void {
    switch (message.type) {
      case 'surfaceUpdate':
        this.processSurfaceUpdate(message);
        break;
      case 'dataModelUpdate':
        this.processDataModelUpdate(message);
        break;
      case 'beginRendering':
        this.processBeginRendering(message.surfaceId);
        break;
      case 'deleteSurface':
        this.componentBuffer.delete(message.surfaceId);
        this.readySurfaces.delete(message.surfaceId);
        break;
    }
  }

  private emitUpdate(surfaceId: string): void {
    const components = this.componentBuffer.get(surfaceId);
    if (components) {
      this.events.onUpdate?.(surfaceId, components, this.dataModelBuffer);
    }
  }

  /**
   * Check if a surface is ready to render
   */
  isReady(surfaceId: string): boolean {
    return this.readySurfaces.has(surfaceId);
  }

  /**
   * Get buffered surface data
   */
  getSurface(surfaceId: string): unknown | undefined {
    return this.componentBuffer.get(surfaceId)?.get('surface');
  }

  /**
   * Get current data model
   */
  getDataModel(): Record<string, unknown> {
    const model: Record<string, unknown> = {};
    for (const [path, data] of this.dataModelBuffer) {
      if (path === '/') {
        Object.assign(model, data);
      } else {
        // Simple path assignment (could be enhanced with full JSON pointer support)
        const keys = path.split('/').filter(Boolean);
        let current: Record<string, unknown> = model;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]] as Record<string, unknown>;
        }
        if (keys.length > 0) {
          current[keys[keys.length - 1]] = data;
        }
      }
    }
    return model;
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.componentBuffer.clear();
    this.dataModelBuffer.clear();
    this.readySurfaces.clear();
  }
}

/**
 * Create an async generator that parses streaming text into messages
 */
export async function* parseStreamingMessages(
  stream: AsyncIterable<string>,
  onMessage?: (message: AgentToClientMessage) => void
): AsyncGenerator<AgentToClientMessage, void, unknown> {
  const parser = new StreamingJsonParser({
    onMessage: (msg) => onMessage?.(msg),
  });

  for await (const chunk of stream) {
    const messagesBefore = parser.getMessages().length;
    parser.feed(chunk);
    const messagesAfter = parser.getMessages();

    // Yield any new messages
    for (let i = messagesBefore; i < messagesAfter.length; i++) {
      yield messagesAfter[i];
    }
  }

  // Finish and yield any remaining messages
  const finalMessages = parser.finish();
  const yieldedCount = parser.getMessages().length;
  for (let i = yieldedCount; i < finalMessages.length; i++) {
    yield finalMessages[i];
  }
}
