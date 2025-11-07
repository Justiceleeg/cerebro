# Change: Slice 2 - Single Stream Event Generation

## Why
The simulator needs to generate individual stream events to validate that stream generation logic works correctly. This slice focuses on generating one stream type (`customer.tutor.search`) and exposing it via API to verify the generation pipeline.

## What Changes
- Build minimal `StreamGenerator` class to generate one `customer.tutor.search` event
- Build normalization function to convert raw stream values to 0-100 scale
- Build `GET /api/simulation/events` endpoint to return a single generated event
- Apply baseline metrics from config for this one stream

## Impact
- Affected specs: New capability `stream-generation`
- Affected code: 
  - New class `/lib/streams/stream-generator.ts`
  - New utility `/lib/streams/normalize.ts`
  - New API route `/routes/api/simulation/events/+server.ts`
- Dependencies: Uses types from `src/lib/types/stream-events.ts` and config from `src/lib/server/config/baseline-metrics.json`

