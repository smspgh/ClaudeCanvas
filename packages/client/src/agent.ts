/**
 * Claude Canvas Agent
 * Generates UI using Claude Code CLI
 * Uses your Claude Code subscription - no API key required!
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type {
  AgentToClientMessage,
  UserActionMessage,
  Surface,
  DataModel,
} from '@claude-canvas/core';
import { getCompactPrompt } from './prompts.js';

/**
 * Find the claude CLI executable path
 * Checks common installation locations on Windows
 */
function findClaudeCLI(): string {
  const home = homedir();
  const username = home.split(/[/\\]/).pop() || '';

  // Common installation paths on Windows
  const possiblePaths = [
    // Custom npm global at C:\home\username\.npm-global (your setup)
    `C:\\home\\${username}\\.npm-global\\claude.cmd`,
    // Also check with 'h' suffix variant
    `C:\\home\\${username}h\\.npm-global\\claude.cmd`,
    // Standard npm global on Windows (AppData\Roaming\npm)
    join(process.env.APPDATA || '', 'npm', 'claude.cmd'),
    // pnpm global
    join(home, 'AppData', 'Local', 'pnpm', 'claude.cmd'),
    // User's home npm-global
    join(home, '.npm-global', 'claude.cmd'),
    // Local AppData npm
    join(home, 'AppData', 'Local', 'npm', 'claude.cmd'),
  ];

  console.log('[ClaudeCanvas] Searching for claude CLI in:', possiblePaths);

  for (const p of possiblePaths) {
    if (existsSync(p)) {
      console.log(`[ClaudeCanvas] Found claude CLI at: ${p}`);
      return p;
    }
  }

  // Fallback to just 'claude' and hope PATH is correct
  console.log('[ClaudeCanvas] Using claude from PATH');
  return 'claude';
}

// Cache the claude path
let claudePath: string | null = null;

function getClaudePath(): string {
  if (!claudePath) {
    claudePath = findClaudeCLI();
  }
  return claudePath;
}

export interface ClaudeCanvasAgentOptions {
  /** Working directory for Claude Code */
  cwd?: string;
  /** Model to use (defaults to sonnet) */
  model?: 'sonnet' | 'opus' | 'haiku';
  /** Custom path to claude CLI executable */
  claudePath?: string;
}

export interface GenerateUIOptions {
  /** User's request for what UI to generate */
  prompt: string;
  /** Optional existing data model to work with */
  dataModel?: DataModel;
  /** Optional context about the current surface */
  currentSurface?: Surface;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class ClaudeCanvasAgent {
  private options: ClaudeCanvasAgentOptions;
  private conversationHistory: ConversationMessage[] = [];

  constructor(options: ClaudeCanvasAgentOptions = {}) {
    this.options = options;
  }

  /**
   * Generate UI based on a user prompt using Claude Code CLI
   */
  async generateUI(options: GenerateUIOptions): Promise<AgentToClientMessage[]> {
    const { prompt } = options;

    // Build the full prompt with instructions embedded
    const fullPrompt = getCompactPrompt(prompt);

    // Add to conversation history
    this.conversationHistory.push({ role: 'user', content: prompt });

    try {
      const responseText = this.callClaudeCLI(fullPrompt);

      // Add assistant response to history
      this.conversationHistory.push({ role: 'assistant', content: responseText });

      // Parse the JSON from the response
      const messages = this.parseMessages(responseText);
      return messages;
    } catch (error) {
      console.error('Error generating UI:', error);
      throw error;
    }
  }

  /**
   * Call Claude Code CLI with the given prompt (synchronous for reliability)
   */
  private callClaudeCLI(fullPrompt: string): string {
    const cliPath = this.options.claudePath || getClaudePath();
    console.log(`[ClaudeCanvas] Calling Claude CLI at: ${cliPath}`);

    // Escape the prompt for shell - more aggressive escaping for cmd.exe
    const escapedPrompt = fullPrompt
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, ' ')
      .replace(/\r/g, '');

    // Build command with full path
    // Use --tools "" to disable tools (pure text generation)
    // Use --output-format text for simple text output
    let cmd = `"${cliPath}" -p "${escapedPrompt}" --output-format text --tools ""`;

    if (this.options.model) {
      cmd += ` --model ${this.options.model}`;
    }

    console.log('[ClaudeCanvas] Command:', cmd.substring(0, 200) + '...');

    try {
      const result = execSync(cmd, {
        encoding: 'utf-8' as BufferEncoding,
        maxBuffer: 10 * 1024 * 1024, // 10MB
        timeout: 120000, // 2 minute timeout
        cwd: this.options.cwd,
        shell: 'cmd.exe',
      });

      console.log('[ClaudeCanvas] CLI response received');
      console.log('[ClaudeCanvas] Response preview:', result.substring(0, 200));
      return result;
    } catch (error) {
      console.error('[ClaudeCanvas] CLI error:', error);
      throw error;
    }
  }

  /**
   * Handle a user action and generate appropriate response
   */
  async handleUserAction(action: UserActionMessage): Promise<AgentToClientMessage[]> {
    const prompt = `User clicked submit. Respond with a success message UI.`;
    return this.generateUI({ prompt, dataModel: action.dataModel });
  }

  /**
   * Parse messages from Claude's response
   */
  private parseMessages(responseText: string): AgentToClientMessage[] {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonString = jsonMatch ? jsonMatch[1] : responseText;

    // Also try to find raw JSON array
    if (!jsonMatch) {
      const arrayMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        jsonString = arrayMatch[0];
      }
    }

    try {
      const parsed = JSON.parse(jsonString.trim());

      // Handle both array and single message responses
      if (Array.isArray(parsed)) {
        return parsed as AgentToClientMessage[];
      } else {
        return [parsed] as AgentToClientMessage[];
      }
    } catch (error) {
      console.error('Failed to parse Claude response as JSON:', error);
      console.error('Response was:', responseText.substring(0, 500));

      // Return a fallback error surface
      return [
        {
          type: 'surfaceUpdate',
          surface: {
            id: 'error',
            title: 'Error',
            components: [
              {
                component: 'Text',
                content: 'Failed to parse UI response. Raw: ' + responseText.substring(0, 200),
                textStyle: 'body',
              },
            ],
          },
        },
      ];
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get current conversation history
   */
  getHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }
}

/**
 * Generate UI using Claude Code CLI directly (standalone function)
 */
export function generateUIViaCLI(
  prompt: string,
  options: { model?: string; cwd?: string; claudePath?: string } = {}
): AgentToClientMessage[] {
  const cliPath = options.claudePath || getClaudePath();
  const fullPrompt = getCompactPrompt(prompt);
  const escapedPrompt = fullPrompt
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '');

  let cmd = `"${cliPath}" -p "${escapedPrompt}" --output-format text --tools ""`;
  if (options.model) {
    cmd += ` --model ${options.model}`;
  }

  const result = execSync(cmd, {
    encoding: 'utf-8' as BufferEncoding,
    maxBuffer: 10 * 1024 * 1024,
    timeout: 120000,
    cwd: options.cwd,
    shell: 'cmd.exe',
  });

  const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
  let jsonString = jsonMatch ? jsonMatch[1] : result;

  if (!jsonMatch) {
    const arrayMatch = result.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      jsonString = arrayMatch[0];
    }
  }

  const parsed = JSON.parse(jsonString.trim());
  return Array.isArray(parsed) ? parsed : [parsed];
}
