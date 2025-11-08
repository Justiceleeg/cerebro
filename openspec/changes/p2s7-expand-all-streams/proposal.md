# Change: Slice 7 - Expand to All Streams

## Why
Currently, the system only generates events for a single stream (`customer.tutor.search`). To provide a complete marketplace simulation, we need to generate events for all 50 streams across Customer, Tutor, Session, Support, Marketing, and System domains.

## What Changes
- Expand `StreamGenerator` to generate events for all 50 stream types
- Apply appropriate cadences from configuration for each stream type
- Apply time-of-day and day-of-week patterns to all streams
- Expand historical generation to all 50 streams
- Update WebSocket to stream events for all streams based on their cadences
- Calculate baseline statistics for all streams

## Impact
- Affected specs: Modifies capability `stream-generation` and `historical-data`
- Affected code:
  - Modified `/lib/streams/stream-generator.ts` (expand to all 50 streams)
  - Modified `/lib/streams/generate-history.ts` (expand to all streams)
  - Modified `/lib/streams/calculate-baseline.ts` (calculate for all streams)
  - Modified `/lib/websocket/server.ts` (stream all events)
- Dependencies: Uses stream definitions from `STREAM_DEFINITIONS.md` and cadences from `config/stream-cadences.json`

