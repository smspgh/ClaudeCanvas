/**
 * Claude Canvas Agent
 * Generates UI using Claude Code CLI
 * Uses your Claude Code subscription - no API key required!
 */

import { spawn } from 'child_process';
import type {
  AgentToClientMessage,
  UserActionMessage,
  Surface,
  DataModel,
} from '@claude-canvas/core';
import { getSystemPrompt } from './prompts.js';

export interface ClaudeCanvasAgentOptions {
  /** Working directory for Claude Code */
  cwd?: string;
  /** Model to use (defaults to sonnet) */
  model?: 'sonnet' | 'opus' | 'haiku';
  /** Custom system prompt to append */
  customPrompt?: string;
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
  private systemPrompt: string;
  private conversationHistory: ConversationMessage[] = [];

  constructor(options: ClaudeCanvasAgentOptions = {}) {
    this.options = options;
    this.systemPrompt = getSystemPrompt() + (options.customPrompt ? '\n\n' + options.customPrompt : '');
  }

  /**
   * Generate UI based on a user prompt using Claude Code CLI
   */
  async generateUI(options: GenerateUIOptions): Promise<AgentToClientMessage[]> {
    const { prompt, dataModel, currentSurface } = options;

    // Build context
    let contextInfo = '';
    if (dataModel && Object.keys(dataModel).length > 0) {
      contextInfo += `\nCurrent data model:\n\`\`\`json\n${JSON.stringify(dataModel, null, 2)}\n\`\`\`\n`;
    }
    if (currentSurface) {
      contextInfo += `\nCurrent surface:\n\`\`\`json\n${JSON.stringify(currentSurface, null, 2)}\n\`\`\`\n`;
    }

    const userMessage = contextInfo
      ? `${prompt}\n\n---\nContext:${contextInfo}`
      : prompt;

    // Add to conversation history
    this.conversationHistory.push({ role: 'user', content: userMessage });

    try {
      const responseText = await this.callClaudeCLI(userMessage);

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
   * Call Claude Code CLI with the given prompt
   */
  private callClaudeCLI(userPrompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Build CLI arguments
      const args = ['-p', userPrompt, '--output-format', 'text'];

      // Add system prompt
      args.push('--system-prompt', this.systemPrompt);

      // Add model if specified
      if (this.options.model) {
        args.push('--model', this.options.model);
      }

      const cliOptions: { shell: boolean; cwd?: string } = { shell: true };
      if (this.options.cwd) {
        cliOptions.cwd = this.options.cwd;
      }

      const claude = spawn('claude', args, cliOptions);

      let stdout = '';
      let stderr = '';

      claude.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      claude.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      claude.on('close', (code: number) => {
        if (code !== 0) {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
          return;
        }
        resolve(stdout);
      });

      claude.on('error', (error: Error) => {
        reject(new Error(`Failed to spawn Claude CLI: ${error.message}`));
      });
    });
  }

  /**
   * Handle a user action and generate appropriate response
   */
  async handleUserAction(action: UserActionMessage): Promise<AgentToClientMessage[]> {
    const prompt = `User performed action: ${JSON.stringify(action.action)}
Current data model: ${JSON.stringify(action.dataModel)}

Respond appropriately to this action. If it's a submit action, acknowledge the submission. If it's a custom action, handle it based on the event name.`;

    return this.generateUI({ prompt, dataModel: action.dataModel });
  }

  /**
   * Parse messages from Claude's response
   */
  private parseMessages(responseText: string): AgentToClientMessage[] {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : responseText;

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
      console.error('Response was:', responseText);

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
                content: 'Failed to generate UI. Please try again.',
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
export async function generateUIViaCLI(
  prompt: string,
  options: { systemPrompt?: string; model?: string; cwd?: string } = {}
): Promise<AgentToClientMessage[]> {
  const systemPrompt = options.systemPrompt ?? getSystemPrompt();

  return new Promise((resolve, reject) => {
    const args = ['-p', prompt, '--output-format', 'text', '--system-prompt', systemPrompt];

    if (options.model) {
      args.push('--model', options.model);
    }

    const cliOptions: { shell: boolean; cwd?: string } = { shell: true };
    if (options.cwd) {
      cliOptions.cwd = options.cwd;
    }

    const claude = spawn('claude', args, cliOptions);

    let stdout = '';
    let stderr = '';

    claude.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    claude.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    claude.on('close', (code: number) => {
      if (code !== 0) {
        reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
        return;
      }

      // Parse the response
      try {
        const jsonMatch = stdout.match(/```json\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : stdout;
        const parsed = JSON.parse(jsonString.trim());
        resolve(Array.isArray(parsed) ? parsed : [parsed]);
      } catch (error) {
        reject(new Error(`Failed to parse response: ${error}`));
      }
    });

    claude.on('error', (error: Error) => {
      reject(new Error(`Failed to spawn Claude CLI: ${error.message}`));
    });
  });
}
