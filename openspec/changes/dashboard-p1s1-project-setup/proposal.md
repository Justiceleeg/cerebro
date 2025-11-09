# Change: Dashboard Phase 1.1 - Project Setup

## Why
The Operations Dashboard requires proper project foundation with frontend dependencies, project structure, and routing before implementing visualization and real-time features. This establishes the base infrastructure for all dashboard development.

## What Changes
- Verify SvelteKit project is initialized with TypeScript (already done with simulator)
- Install frontend dependencies:
  - `echarts@^5.5.0` (Apache ECharts for charting)
  - `@ai-sdk/openai@^2.0.64` (OpenAI SDK for Dashboard AI Contextualizer)
  - `ai@^5.0.0` (AI SDK core)
  - `shadcn-svelte` (UI component library with Radix primitives)
  - Lucide icons (comes with shadcn-svelte)
- Set up frontend project structure:
  - `/routes/dashboard` - Main operations dashboard route
  - `/lib/components/dashboard` - Dashboard-specific components
  - `/lib/components/ui` - shadcn-svelte UI components
  - `/lib/stores` - Svelte runes stores for state management
  - `/lib/ai-contextualizer` - Dashboard AI logic and prompts
  - `/lib/utils` - Utility functions

## Impact
- Affected specs: New capability `dashboard-infrastructure`
- Affected code: `package.json`, project directory structure
- New dependencies: `echarts@^5.5.0`, `@ai-sdk/openai@^2.0.64`, `ai@^5.0.0`, `shadcn-svelte`, `lucide-svelte`
- New directories: `/routes/dashboard`, `/lib/components/dashboard`, `/lib/components/ui`, `/lib/stores`, `/lib/ai-contextualizer`

