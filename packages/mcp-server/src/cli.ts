#!/usr/bin/env node
/**
 * ClaudeCanvas MCP Server CLI
 * Run as: npx @claude-canvas/mcp-server
 * Or configure in Claude Code settings
 */

import { createServer } from './server.js';

async function main() {
  try {
    await createServer({
      name: 'claude-canvas-mcp',
      version: '0.1.0',
    });
  } catch (error) {
    console.error('[ClaudeCanvas MCP] Failed to start server:', error);
    process.exit(1);
  }
}

main();
