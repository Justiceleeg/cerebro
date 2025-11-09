## Slice 2: Single Stream Chart (Hardcoded)

- [ ] 2.1 Review existing ECharts component (`lib/components/ECharts.svelte`):
  - [ ] Verify it works with Svelte 5 runes
  - [ ] Check if it needs updates for dashboard use case
  - [ ] Ensure it supports dynamic option updates

- [ ] 2.2 Create time-series chart component (`lib/components/dashboard/TimeSeriesChart.svelte`):
  - [ ] Create component that uses ECharts wrapper
  - [ ] Accept stream name and data as props
  - [ ] Configure ECharts option for time-series chart:
    - [ ] X-axis: timestamp (time scale)
    - [ ] Y-axis: normalized value (0-100 scale)
    - [ ] Line series for stream data
    - [ ] Baseline reference line at y=50
    - [ ] Proper styling and colors
  - [ ] Handle empty data state
  - [ ] Add loading state support

- [ ] 2.3 Create hardcoded sample data:
  - [ ] Create sample data for one stream (e.g., `customer.tutor.search`)
  - [ ] Generate 24 hours of hourly data points
  - [ ] Include timestamps and normalized values
  - [ ] Values should vary around baseline (50) to show realistic pattern
  - [ ] Store in component or separate data file

- [ ] 2.4 Integrate chart into dashboard page:
  - [ ] Replace chart placeholder section in `/routes/dashboard/+page.svelte`
  - [ ] Import and use `TimeSeriesChart` component
  - [ ] Pass hardcoded sample data to chart
  - [ ] Verify chart displays correctly
  - [ ] Verify baseline line is visible at y=50

- [ ] 2.5 Test chart display:
  - [ ] Navigate to `/dashboard`
  - [ ] Verify chart renders without errors
  - [ ] Verify chart shows time-series data
  - [ ] Verify baseline reference line is visible
  - [ ] Verify chart is responsive (resizes with container)
  - [ ] Verify chart styling matches dashboard design

