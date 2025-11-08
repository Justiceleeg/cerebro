# Change: Slice 14 - Dynamic Historical Regeneration

## Why
Currently, historical data is generated from baseline only. To support scenario testing and analysis, historical data should be regeneratable with scenario modifications applied, allowing users to see how scenarios would have affected past data.

## What Changes
- Build `regenerateHistoricalWindow()` function that regenerates historical data with scenario modifications
- Support regenerating specific time windows with active scenario modifiers applied
- Maintain coherence with unchanged portions of historical data
- Update historical data endpoint to apply active scenario modifiers when generating data

## Impact
- Affected specs: Modifies capability `historical-data`
- Affected code:
  - Modified `/lib/streams/generate-history.ts` (add regeneration with modifiers)
  - Modified `/routes/api/simulation/history/+server.ts` (apply active scenario modifiers)
- Dependencies: Uses `ScenarioEngine` to get active modifiers and external events

