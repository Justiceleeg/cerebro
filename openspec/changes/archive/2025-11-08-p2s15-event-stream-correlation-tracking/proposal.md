# Change: Slice 15 - Event-Stream Correlation Tracking

## Why
To enable the dashboard AI to analyze which external events affected which streams, the system needs to track correlations between external events and stream changes. This provides data for AI analysis and helps understand causal relationships.

## What Changes
- Implement event-stream correlation tracking system
- Track which streams changed when external events are active
- Calculate correlation strength between events and stream changes
- Store correlation data for dashboard AI analysis
- Expose correlation data via API endpoint

## Impact
- Affected specs: New capability `event-correlation-tracking`
- Affected code:
  - New `/lib/correlations/correlation-tracker.ts` (correlation tracking logic)
  - New `/routes/api/simulation/correlations/+server.ts` (correlation query endpoint)
  - Modified `/lib/scenarios/scenario-engine.ts` (track correlations when events are active)
- Dependencies: Uses external events and stream generation data

