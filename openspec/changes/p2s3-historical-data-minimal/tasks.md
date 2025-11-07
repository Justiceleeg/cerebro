## 1. Implementation
- [ ] 1.1 Build minimal `generateBaselineHistory()` function
  - Create `/lib/streams/generate-history.ts`
  - Generate 1 day × 2 intervals (12-hour blocks) = 2 data points for `customer.tutor.search`
  - Apply basic patterns (weekday/weekend variance)
  - Return array of `StreamEvent` objects
- [ ] 1.2 Build minimal baseline statistics calculator
  - Create `/lib/streams/calculate-baseline.ts`
  - Calculate mean, median, std dev for the 2 data points
  - Return `StreamBaseline` for one stream
- [ ] 1.3 Build `GET /api/simulation/history` endpoint
  - Create `/routes/api/simulation/history/+server.ts`
  - Parameters: `start`, `end`, `streams` (optional, defaults to `customer.tutor.search`)
  - Generate historical data on-demand
  - Return data in format suitable for charting
- [ ] 1.4 Test endpoint
  - Test: `curl "http://localhost:5173/api/simulation/history?start=2025-01-15T00:00:00Z&end=2025-01-16T00:00:00Z"`
  - Verify: Historical data has correct structure

