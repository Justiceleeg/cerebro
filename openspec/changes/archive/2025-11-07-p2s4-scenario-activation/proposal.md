# Change: Slice 4 - Scenario Activation (Minimal)

## Why
The simulator needs to load and activate pre-defined scenarios to modify stream behavior. This slice implements the minimal scenario management system to load scenarios, activate them, and track state changes.

## What Changes
- Build `ScenarioLoader` class to load scenario definitions from config
- Build `ScenarioEngine` class to track active scenario state and apply modifiers
- Build `POST /api/simulation/scenario` endpoint to activate scenarios
- Update `GET /api/simulation/state` endpoint to return actual state from `ScenarioEngine`

## Impact
- Affected specs: New capability `scenario-management`
- Affected code:
  - New class `/lib/scenarios/scenario-loader.ts`
  - New class `/lib/scenarios/scenario-engine.ts`
  - New API route `/routes/api/simulation/scenario/+server.ts`
  - Modified API route `/routes/api/simulation/state/+server.ts`
- Dependencies: Uses config from `src/lib/server/config/scenario-definitions.json` and types from `$lib/types`

