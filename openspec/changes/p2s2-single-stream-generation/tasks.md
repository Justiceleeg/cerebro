## 1. Implementation
- [x] 1.1 Build minimal `StreamGenerator` class
  - Create `/lib/streams/stream-generator.ts`
  - Generate one `customer.tutor.search` event
  - Use types from `$lib/types` (specifically `CustomerTutorSearchData`)
  - Apply baseline metrics from config for this one stream
  - Return typed `StreamEvent` object
- [x] 1.2 Build normalization function (minimal)
  - Create `/lib/streams/normalize.ts`
  - Input: raw stream value + hardcoded baseline stats for one stream
  - Output: normalized 0-100 score
  - Returns anomaly flag ('normal', 'warning', 'critical')
- [x] 1.3 Build `GET /api/simulation/events` endpoint
  - Create `/routes/api/simulation/events/+server.ts`
  - Generate one event using `StreamGenerator`
  - Return single `StreamEvent` in response
- [x] 1.4 Test endpoint
  - Test: `curl http://localhost:5173/api/simulation/events`
  - Verify: Event has correct structure, types are enforced

