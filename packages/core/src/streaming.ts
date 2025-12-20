/**
 * Streaming JSON Parser for ClaudeCanvas
 * Parses JSON messages incrementally as they stream in from the LLM
 */

import type { AgentToClientMessage } from './types.js';

export interface StreamingParserEvents {
  onMessage?: (message: AgentToClientMessage) => void;
  onError?: (error: Error) => void;
  onComplete?: (messages: AgentToClientMessage[]) => void;
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
      this.events.onMessage?.(message);
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
