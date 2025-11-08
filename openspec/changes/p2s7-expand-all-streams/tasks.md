## 1. Implementation
- [ ] 1.1 Expand `StreamGenerator` to all 50 streams
  - Update `/lib/streams/stream-generator.ts`
  - Add generation logic for all stream types (Customer, Tutor, Session, Support, Marketing, System)
  - Use appropriate baseline metrics from config for each stream
  - Apply time-of-day and day-of-week patterns
  - Test: Generate events for each stream type, verify structure matches stream definitions

- [ ] 1.2 Apply stream cadences
  - Load cadences from `config/stream-cadences.json`
  - Implement cadence-based generation timing
  - Add jitter/variance to avoid synchronized bursts
  - Test: Verify events are generated at appropriate frequencies

- [ ] 1.3 Expand historical generation to all streams
  - Update `/lib/streams/generate-history.ts`
  - Generate 1 day of data for all 50 streams
  - Apply patterns (weekday/weekend, time-of-day) to all streams
  - Test: Request historical data, verify all streams are included

- [ ] 1.4 Calculate baseline statistics for all streams
  - Update `/lib/streams/calculate-baseline.ts`
  - Calculate mean, median, std dev for all 50 streams
  - Return `StreamBaseline` objects for all streams
  - Test: Verify baseline statistics are calculated correctly

- [ ] 1.5 Update WebSocket to stream all events
  - Modify `/lib/websocket/server.ts`
  - Send events for all streams based on their cadences
  - Start with all streams subscribed (filtering comes in Slice 9)
  - Test: Connect WebSocket, receive events for multiple streams
  - Verify: Events match their stream types and cadences

