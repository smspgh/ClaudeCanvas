# ClaudeCanvas Project Instructions

## Project Overview
ClaudeCanvas is a declarative UI framework for Claude AI agents. It enables AI to generate cross-platform UIs from JSON specifications.

## Code Quality Requirements

### Before Committing Code Changes
1. **TypeScript Type Checking**: Run `pnpm build` to ensure all TypeScript code passes type checking
2. **Build Verification**: Ensure the build completes successfully without errors
3. **Test Affected Packages**: If tests exist, run them for affected packages

### Commit Standards
- Use Conventional Commits format (feat:, fix:, chore:, docs:, refactor:, test:)
- Write meaningful commit messages explaining "why" not "what"
- Include co-authored-by footer for AI-assisted commits

## Project Structure
```
packages/
  core/           - Core types, utilities, and schemas
  renderer-lit/   - Lit/Web Components renderer (live)
  renderer-react/ - React renderer (live)
  renderer-angular/ - Angular renderer (builds as library)
samples/
  agent/          - Demo application showing all renderers
  server/         - Backend server for AI integration
```

## Development Commands
- `pnpm install` - Install dependencies
- `pnpm build` - Build all packages (includes type checking)
- `pnpm dev` - Start development servers
- `pnpm --filter <package> build` - Build specific package

## Type Naming Conventions
- Use `Component` (not `ComponentDefinition`) from `@claude-canvas/core`
- Use `Surface` for top-level UI containers
- Use `DataModel` for state/data binding
- Use `AgentToClientMessage` for server-to-client messages

## Angular Renderer Notes
- Uses ng-packagr for library builds
- Output is in `dist/renderer-angular`
- Currently not integrated into Vite demo due to bundle format compatibility
- Can be used directly in Angular applications
