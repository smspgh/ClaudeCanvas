/**
 * Claude Canvas Agent
 * Multi-provider LLM support for UI generation
 * Supports: Claude Code CLI (no API key), OpenAI, Gemini, Anthropic
 */

import { execSync, spawn, spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type {
  AgentToClientMessage,
  UserActionMessage,
  Surface,
  DataModel,
} from '@claude-canvas/core';
import { StreamingJsonParser, parseMessages } from '@claude-canvas/core';
import { getCompactPrompt, type PromptContext } from './prompts.js';
import {
  createProvider,
  generateWithProvider,
  type ProviderType,
  type LLMProvider,
} from './providers.js';

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
  /** LLM provider to use (defaults to claude-cli) */
  provider?: ProviderType;
  /** API key for the provider (not required for claude-cli) */
  apiKey?: string;
  /** Model to use (provider-specific) */
  model?: string;
  /** Custom base URL for API calls */
  baseUrl?: string;
  /** Working directory for Claude Code CLI */
  cwd?: string;
  /** Custom path to claude CLI executable (only for claude-cli provider) */
  claudePath?: string;
}

export interface GenerateUIOptions {
  /** User's request for what UI to generate */
  prompt: string;
  /** Optional existing data model to work with */
  dataModel?: DataModel;
  /** Optional context about the current surface */
  currentSurface?: Surface;
  /** Enable streaming mode for progressive UI updates */
  streaming?: boolean;
  /** Callback for streaming messages */
  onMessage?: (message: AgentToClientMessage) => void;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class ClaudeCanvasAgent {
  private options: ClaudeCanvasAgentOptions;
  private conversationHistory: ConversationMessage[] = [];
  private provider: LLMProvider | null = null;

  constructor(options: ClaudeCanvasAgentOptions = {}) {
    this.options = {
      provider: 'claude-cli',
      ...options,
    };

    // Initialize provider if not using CLI
    if (this.options.provider !== 'claude-cli') {
      this.provider = createProvider({
        provider: this.options.provider!,
        apiKey: this.options.apiKey,
        model: this.options.model,
        baseUrl: this.options.baseUrl,
      });
    }
  }

  /**
   * Generate UI based on a user prompt
   * Uses configured provider (OpenAI, Gemini, Anthropic, or Claude CLI)
   */
  async generateUI(options: GenerateUIOptions): Promise<AgentToClientMessage[]> {
    const { prompt, currentSurface, dataModel, streaming = false, onMessage } = options;

    // Build context for iterative updates
    const context: PromptContext | undefined = currentSurface
      ? { currentSurface, dataModel }
      : undefined;

    // Add to conversation history
    this.conversationHistory.push({ role: 'user', content: prompt });

    try {
      // Use API provider if configured
      if (this.provider) {
        console.log(`[ClaudeCanvas] Using ${this.options.provider} provider`);
        const messages = await generateWithProvider(this.provider, { prompt, context });
        this.conversationHistory.push({ role: 'assistant', content: JSON.stringify(messages) });
        return messages;
      }

      // Fall back to Claude CLI
      const fullPrompt = getCompactPrompt(prompt, context);

      if (streaming && onMessage) {
        // Use streaming mode
        const responseText = await this.callClaudeCLIStreaming(fullPrompt, onMessage);
        this.conversationHistory.push({ role: 'assistant', content: responseText });
        return this.parseMessages(responseText);
      } else {
        // Use synchronous mode
        const responseText = this.callClaudeCLI(fullPrompt);
        this.conversationHistory.push({ role: 'assistant', content: responseText });
        const messages = this.parseMessages(responseText);
        return messages;
      }
    } catch (error) {
      console.error('Error generating UI:', error);
      throw error;
    }
  }

  /**
   * Call Claude Code CLI with the given prompt (synchronous for reliability)
   * Uses stdin to avoid Windows command line length limits
   */
  private callClaudeCLI(fullPrompt: string): string {
    const cliPath = this.options.claudePath || getClaudePath();
    console.log(`[ClaudeCanvas] Calling Claude CLI at: ${cliPath}`);
    console.log(`[ClaudeCanvas] Prompt length: ${fullPrompt.length} chars`);

    // Use spawnSync with stdin to bypass command line length limits
    const systemPrompt = 'You are a JSON generator. Output ONLY valid JSON arrays. No text, no markdown, no explanations. Start with [ and end with ].';
    const args = [
      '--output-format', 'text',
      '--tools', '',
      '--system-prompt', systemPrompt,
    ];

    if (this.options.model) {
      args.push('--model', this.options.model);
    }

    console.log('[ClaudeCanvas] Using stdin for prompt (bypassing cmd line limit)');

    try {
      const result = spawnSync(cliPath, args, {
        input: fullPrompt,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB
        timeout: 120000, // 2 minute timeout
        cwd: this.options.cwd,
        shell: true,
      });

      if (result.error) {
        throw result.error;
      }

      if (result.status !== 0) {
        throw new Error(`CLI exited with status ${result.status}: ${result.stderr}`);
      }

      const output = result.stdout;
      console.log('[ClaudeCanvas] CLI response received');
      console.log('[ClaudeCanvas] Response preview:', output.substring(0, 200));
      return output;
    } catch (error) {
      console.error('[ClaudeCanvas] CLI error:', error);
      throw error;
    }
  }

  /**
   * Call Claude Code CLI with streaming support for progressive updates
   * Uses stdin to avoid Windows command line length limits
   */
  private callClaudeCLIStreaming(
    fullPrompt: string,
    onMessage: (message: AgentToClientMessage) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const cliPath = this.options.claudePath || getClaudePath();
      console.log(`[ClaudeCanvas] Calling Claude CLI (streaming) at: ${cliPath}`);
      console.log(`[ClaudeCanvas] Prompt length: ${fullPrompt.length} chars`);

      // Build arguments for spawn - no -p flag, we'll use stdin
      const systemPrompt = 'You are a JSON generator. Output ONLY valid JSON arrays. No text, no markdown, no explanations. Start with [ and end with ].';
      const args = [
        '--output-format', 'text',
        '--tools', '',
        '--system-prompt', systemPrompt,
      ];

      if (this.options.model) {
        args.push('--model', this.options.model);
      }

      console.log('[ClaudeCanvas] Using stdin for prompt (bypassing cmd line limit)');

      const child = spawn(cliPath, args, {
        cwd: this.options.cwd,
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'], // Enable stdin
      });

      // Write prompt to stdin and close it
      child.stdin.write(fullPrompt);
      child.stdin.end();

      let fullOutput = '';
      const parser = new StreamingJsonParser({
        onMessage: (msg) => {
          console.log('[ClaudeCanvas] Streaming message:', msg.type);
          onMessage(msg);
        },
        onError: (err) => {
          console.warn('[ClaudeCanvas] Streaming parse error:', err.message);
        },
      });

      child.stdout.on('data', (data: Buffer) => {
        const chunk = data.toString();
        fullOutput += chunk;
        parser.feed(chunk);
      });

      child.stderr.on('data', (data: Buffer) => {
        console.error('[ClaudeCanvas] CLI stderr:', data.toString());
      });

      child.on('close', (code) => {
        parser.finish();
        if (code === 0) {
          console.log('[ClaudeCanvas] CLI streaming complete');
          resolve(fullOutput);
        } else {
          reject(new Error(`Claude CLI exited with code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
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
    try {
      return parseMessages(responseText);
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

  return parseMessages(result);
}
