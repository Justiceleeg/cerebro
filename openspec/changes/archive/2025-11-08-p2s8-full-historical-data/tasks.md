## 1. Implementation
- [x] 1.1 Expand historical generation to full 30 days
  - Update `/lib/streams/generate-history.ts`
  - Generate 30 days × 2 intervals = 60 data points per stream
  - Apply all patterns: academic calendar, weekday/weekend, time-of-day
  - Include realistic anomalies (occasional spikes/dips)
  - Test: Generate 30-day data, verify patterns are present

- [x] 1.2 Generate baseline external events
  - Create function to generate external events for 30-day period
  - Distribute 2-5 events per day (60-150 events total)
  - Use external events library from config
  - Distribute events realistically (not uniform)
  - Test: Verify events are distributed across the 30-day period

- [x] 1.3 Build data loader for app startup
  - Create `/lib/data/load-baseline.ts`
  - Load baseline historical data into memory
  - Load baseline statistics into memory
  - Load external events timeline into memory
  - Create efficient in-memory structures (maps, indexes)
  - Pre-calculate aggregations (daily totals, weekly averages)
  - Test: Verify data loads on startup, check memory usage

- [x] 1.4 Update historical data endpoint
  - Modify `/routes/api/simulation/history/+server.ts`
  - Return full 30-day historical data from in-memory structures
  - Support filtering by stream (query parameter)
  - Support time range filtering (start/end parameters)
  - Return data in format suitable for charting
  - Test: Request 7-day window, verify data quality and performance

