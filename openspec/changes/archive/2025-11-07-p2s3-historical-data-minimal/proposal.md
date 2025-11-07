# Change: Slice 3 - Historical Data (Minimal)

## Why
The simulator needs to generate historical baseline data for visualization and analysis. This slice implements minimal historical data generation (1 day for 1 stream) to validate the historical data pipeline before expanding to full 30-day baseline.

## What Changes
- Build minimal `generateBaselineHistory()` function to generate 1 day of data for `customer.tutor.search`
- Build minimal baseline statistics calculator
- Build `GET /api/simulation/history` endpoint with query parameters
- Apply basic patterns (weekday/weekend variance)

## Impact
- Affected specs: New capability `historical-data`
- Affected code:
  - New function `/lib/streams/generate-history.ts`
  - New utility `/lib/streams/calculate-baseline.ts`
  - New API route `/routes/api/simulation/history/+server.ts`
- Dependencies: Uses `StreamGenerator` from Slice 2 and types from `$lib/types`

