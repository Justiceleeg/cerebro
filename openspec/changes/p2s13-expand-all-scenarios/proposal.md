# Change: Slice 13 - Expand to All Scenarios

## Why
Currently, the system supports scenario activation but needs to validate that all pre-defined scenarios work correctly. This slice ensures all scenarios from the configuration can be activated, tested, and handles conflict resolution when multiple scenarios are attempted.

## What Changes
- Test and validate all pre-defined scenarios from configuration
- Implement scenario conflict resolution (prevent activating new scenario while one is active)
- Ensure all scenario types work correctly (exam-season-surge, supply-crisis, payment-outage, quality-crisis, support-overload, churn-pattern, recruiting-crisis, competitor-disruption, normal-operations)
- Add scenario listing endpoint to expose available scenarios

## Impact
- Affected specs: Modifies capability `scenario-management`
- Affected code:
  - Modified `/lib/scenarios/scenario-loader.ts` (scenario listing)
  - Modified `/lib/scenarios/scenario-engine.ts` (conflict resolution)
  - New `/routes/api/simulation/scenarios/+server.ts` (list scenarios endpoint)
- Dependencies: Uses all scenario definitions from `config/scenario-definitions.json`

