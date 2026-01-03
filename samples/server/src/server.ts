/**
 * ClaudeCanvas Server
 * Express server that uses LLM providers to generate UIs
 * Supports: Claude CLI (default), OpenAI, Gemini, Anthropic
 */

import express from 'express';
import cors from 'cors';
import { ClaudeCanvasAgent, generateUIViaCLI, type ProviderType } from '@claude-canvas/client';
import type { AgentToClientMessage, Surface, DataModel } from '@claude-canvas/core';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Determine provider from environment
function getProviderConfig(): { provider: ProviderType; apiKey?: string; model?: string } {
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o',
    };
  }
  if (process.env.GEMINI_API_KEY) {
    return {
      provider: 'gemini',
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
    };
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    };
  }
  // Default to Claude CLI (no API key required)
  return {
    provider: 'claude-cli',
    model: process.env.CLAUDE_MODEL || 'sonnet',
  };
}

const providerConfig = getProviderConfig();

// Create a shared agent instance
const agent = new ClaudeCanvasAgent({
  provider: providerConfig.provider,
  apiKey: providerConfig.apiKey,
  model: providerConfig.model,
});

// Track current state for iterative updates
let currentSurface: Surface | undefined;
let currentDataModel: DataModel = {};

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'claude-canvas' });
});

// Generate UI endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, dataModel: clientDataModel, currentSurface: clientSurface, useCLI } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Use client-provided state or fall back to server-tracked state
    const surfaceContext = clientSurface || currentSurface;
    const dataModelContext = clientDataModel || currentDataModel;

    const isIteration = !!surfaceContext;
    console.log(`[ClaudeCanvas] ${isIteration ? 'Iterating' : 'Generating'} UI for: "${prompt.substring(0, 50)}..."`);

    let messages: AgentToClientMessage[];

    if (useCLI) {
      // Use CLI fallback
      messages = await generateUIViaCLI(prompt);
    } else {
      // Use SDK with context for iteration
      messages = await agent.generateUI({
        prompt,
        dataModel: dataModelContext,
        currentSurface: surfaceContext,
      });
    }

    // Update tracked state from response
    for (const msg of messages) {
      if (msg.type === 'surfaceUpdate') {
        currentSurface = msg.surface;
      } else if (msg.type === 'dataModelUpdate') {
        if (msg.path === '/') {
          currentDataModel = msg.data as DataModel;
        } else {
          // Partial update - would need setByPointer here for full support
          currentDataModel = { ...currentDataModel, ...(msg.data as DataModel) };
        }
      }
    }

    console.log(`[ClaudeCanvas] Generated ${messages.length} message(s)`);
    res.json({ messages, isIteration });
  } catch (error) {
    console.error('[ClaudeCanvas] Error:', error);
    res.status(500).json({
      error: 'Failed to generate UI',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Handle user actions
app.post('/api/action', async (req, res) => {
  try {
    const { action, surfaceId, dataModel } = req.body;

    if (!action) {
      res.status(400).json({ error: 'Action is required' });
      return;
    }

    console.log(`[ClaudeCanvas] Handling action: ${action.type}`);

    const messages = await agent.handleUserAction({
      type: 'userAction',
      surfaceId: surfaceId || 'main',
      action,
      dataModel: dataModel || {},
    });

    res.json({ messages });
  } catch (error) {
    console.error('[ClaudeCanvas] Error:', error);
    res.status(500).json({
      error: 'Failed to handle action',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Clear conversation history and state
app.post('/api/clear', (_req, res) => {
  agent.clearHistory();
  currentSurface = undefined;
  currentDataModel = {};
  res.json({ success: true });
});

// Get current state (for debugging/client sync)
app.get('/api/state', (_req, res) => {
  res.json({
    hasSurface: !!currentSurface,
    surfaceId: currentSurface?.id,
    dataModelKeys: Object.keys(currentDataModel),
  });
});

// Start server
app.listen(PORT, () => {
  const providerInfo = providerConfig.provider === 'claude-cli'
    ? 'Claude Code CLI (no API key needed)'
    : `${providerConfig.provider.toUpperCase()} API (${providerConfig.model})`;

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎨 ClaudeCanvas Server                                  ║
║                                                           ║
║   Server running at http://localhost:${PORT}               ║
║                                                           ║
║   Endpoints:                                              ║
║   POST /api/generate  - Generate UI from prompt           ║
║   POST /api/action    - Handle user actions               ║
║   POST /api/clear     - Clear conversation history        ║
║   GET  /api/state     - Get current state                 ║
║   GET  /health        - Health check                      ║
║                                                           ║
║   Provider: ${providerInfo.padEnd(42)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
