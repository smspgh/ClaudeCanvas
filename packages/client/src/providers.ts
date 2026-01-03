/**
 * Multi-Provider LLM Support for ClaudeCanvas
 * Supports OpenAI, Gemini, Anthropic API, and Claude Code CLI
 */

import type { AgentToClientMessage } from '@claude-canvas/core';
import { parseMessages } from '@claude-canvas/core';
import { getCompactPrompt, getSystemPrompt, type PromptContext } from './prompts.js';

export type ProviderType = 'openai' | 'gemini' | 'anthropic' | 'claude-cli';

export interface ProviderConfig {
  provider: ProviderType;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export interface GenerateRequest {
  prompt: string;
  context?: PromptContext;
}

/**
 * Base provider interface
 */
export interface LLMProvider {
  generate(request: GenerateRequest): Promise<string>;
}

/**
 * OpenAI Provider (GPT-4, GPT-4o, etc.)
 */
export class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: { apiKey: string; model?: string; baseUrl?: string }) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-4o';
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  }

  async generate(request: GenerateRequest): Promise<string> {
    const fullPrompt = getCompactPrompt(request.prompt, request.context);
    const systemPrompt = getSystemPrompt();

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullPrompt },
        ],
        temperature: 0.7,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
}

/**
 * Google Gemini Provider
 */
export class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: { apiKey: string; model?: string; baseUrl?: string }) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-1.5-pro';
    this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
  }

  async generate(request: GenerateRequest): Promise<string> {
    const fullPrompt = getCompactPrompt(request.prompt, request.context);
    const systemPrompt = getSystemPrompt();

    const response = await fetch(
      `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              parts: [{ text: fullPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 16000,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}

/**
 * Anthropic API Provider (Direct API, not Claude CLI)
 */
export class AnthropicProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: { apiKey: string; model?: string; baseUrl?: string }) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'claude-sonnet-4-20250514';
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
  }

  async generate(request: GenerateRequest): Promise<string> {
    const fullPrompt = getCompactPrompt(request.prompt, request.context);
    const systemPrompt = getSystemPrompt();

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 16000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: fullPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const content = data.content?.[0];
    return content?.type === 'text' ? content.text : '';
  }
}

/**
 * Create a provider instance based on configuration
 */
export function createProvider(config: ProviderConfig): LLMProvider | null {
  switch (config.provider) {
    case 'openai':
      if (!config.apiKey) throw new Error('OpenAI requires an API key');
      return new OpenAIProvider({
        apiKey: config.apiKey,
        model: config.model,
        baseUrl: config.baseUrl,
      });

    case 'gemini':
      if (!config.apiKey) throw new Error('Gemini requires an API key');
      return new GeminiProvider({
        apiKey: config.apiKey,
        model: config.model,
        baseUrl: config.baseUrl,
      });

    case 'anthropic':
      if (!config.apiKey) throw new Error('Anthropic requires an API key');
      return new AnthropicProvider({
        apiKey: config.apiKey,
        model: config.model,
        baseUrl: config.baseUrl,
      });

    case 'claude-cli':
      // Return null to signal using CLI mode
      return null;

    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

/**
 * Generate UI messages using a provider
 */
export async function generateWithProvider(
  provider: LLMProvider,
  request: GenerateRequest
): Promise<AgentToClientMessage[]> {
  const responseText = await provider.generate(request);
  return parseMessages(responseText);
}
