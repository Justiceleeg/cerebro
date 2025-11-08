# Change: Slice 8 - Full Historical Data

## Why
The system currently generates minimal historical data (1 day for 1 stream). To provide a complete baseline for statistics and visualization, we need to generate a full 30-day historical baseline for all 50 streams with realistic patterns, anomalies, and external events.

## What Changes
- Expand `generateBaselineHistory()` to generate full 30-day historical data
- Generate baseline external events for the 30-day period
- Build data loader for app startup to load baseline files into memory
- Pre-calculate aggregations for efficient querying
- Update `GET /api/simulation/history` endpoint to return full 30-day data

## Impact
- Affected specs: Modifies capability `historical-data`
- Affected code:
  - Modified `/lib/streams/generate-history.ts` (expand to 30 days, all streams)
  - Modified `/lib/streams/calculate-baseline.ts` (pre-calculate statistics)
  - New `/lib/data/load-baseline.ts` (data loader for startup)
  - Modified `/routes/api/simulation/history/+server.ts` (return full 30-day data)
- Dependencies: Uses stream definitions, baseline metrics, and external events library

