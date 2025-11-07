# Change: Slice 1 - Minimal Testable API

## Why
The simulator needs a basic API endpoint to verify that types work end-to-end and that the simulation state can be queried. This is the first testable feature that validates the foundation is working correctly.

## What Changes
- Build `GET /api/simulation/state` endpoint
- Return hardcoded `SimulationState` object using types from `$lib/types`
- Verify types are enforced and response matches `SimulationState` interface

## Impact
- Affected specs: New capability `simulation-api`
- Affected code: New API route `/routes/api/simulation/state/+server.ts`
- Dependencies: Uses types from `src/lib/types/core.ts` (SimulationState interface)

