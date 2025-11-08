# Change: Slice 10 - Scenario Settling & Reset

## Why
Scenarios currently activate and remain active indefinitely. To provide realistic simulation behavior, scenarios should transition through a settling phase where modifiers gradually return to baseline, and the simulation should support resetting to baseline state.

## What Changes
- Implement settling behavior for scenarios (active → settling → settled)
- Settling modifiers gradually reduce multipliers back to 1.0
- Build `POST /api/simulation/reset` endpoint to reset simulation to baseline
- Build `POST /api/simulation/stop` endpoint to manually stop current scenario
- Update `ScenarioEngine` to track scenario lifecycle states

## Impact
- Affected specs: Modifies capability `scenario-management`
- Affected code:
  - Modified `/lib/scenarios/scenario-engine.ts` (settling logic, lifecycle states)
  - New `/routes/api/simulation/reset/+server.ts` (reset endpoint)
  - New `/routes/api/simulation/stop/+server.ts` (stop endpoint)
- Dependencies: Uses scenario definitions with settlement duration and type

