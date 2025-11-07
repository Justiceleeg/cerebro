# Change: Setup Simulator Project Foundation

## Why
The AI Mock Simulator backend requires a proper project foundation with SvelteKit, TypeScript, Railway deployment configuration, and project structure before implementing data generation and streaming capabilities.

## What Changes
- Initialize SvelteKit project with TypeScript configuration
- Set up Railway.app deployment configuration
- Install WebSocket dependencies (`ws`, `@types/ws`)
- Configure environment variables and project structure
- Create backend directory structure for streams, scenarios, config, and data

## Impact
- Affected specs: New capability `simulator-infrastructure`
- Affected code: Project root, `package.json`, `svelte.config.js`, `vite.config.ts`, Railway configuration files
- New dependencies: `ws@^8.18.0`, `@types/ws@^8.5.0`

