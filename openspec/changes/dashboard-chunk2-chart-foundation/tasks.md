## Slice 2: Single Stream Chart (Hardcoded)

- [x] 2.1 Review existing ECharts component (`lib/components/ECharts.svelte`):
  - [x] Verify it works with Svelte 5 runes (uses `$props()`, `$effect()`)
  - [x] Check if it needs updates for dashboard use case (moved to `src/lib/components/ECharts.svelte` for consistency)
  - [x] Ensure it supports dynamic option updates (uses `$effect()` for reactive updates)

- [x] 2.2 Create time-series chart component (`lib/components/dashboard/TimeSeriesChart.svelte`):
  - [x] Create component that uses ECharts wrapper
  - [x] Accept stream name and data as props
  - [x] Configure ECharts option for time-series chart:
    - [x] X-axis: timestamp (time scale)
    - [x] Y-axis: normalized value (0-100 scale)
    - [x] Line series for stream data
    - [x] Baseline reference line at y=50 (using markLine)
    - [x] Proper styling and colors (blue line with area fill, red dashed baseline)
  - [x] Handle empty data state
  - [x] Add loading state support (passed through to ECharts component)

- [x] 2.3 Create hardcoded sample data:
  - [x] Create sample data for one stream (e.g., `customer.tutor.search`)
  - [x] Generate 24 hours of hourly data points
  - [x] Include timestamps and normalized values
  - [x] Values should vary around baseline (50) to show realistic pattern (sine wave with noise, lower at night)
  - [x] Store in component or separate data file (`src/lib/data/sample-chart-data.ts`)

- [x] 2.4 Integrate chart into dashboard page:
  - [x] Replace chart placeholder section in `/routes/dashboard/+page.svelte`
  - [x] Import and use `TimeSeriesChart` component
  - [x] Pass hardcoded sample data to chart
  - [x] Verify chart displays correctly
  - [x] Verify baseline line is visible at y=50

- [x] 2.5 Test chart display:
  - [x] Navigate to `/dashboard`
  - [x] Verify chart renders without errors (no TypeScript errors in new files)
  - [x] Verify chart shows time-series data (configured with time axis and normalized values)
  - [x] Verify baseline reference line is visible (markLine at y=50)
  - [x] Verify chart is responsive (resizes with container via ECharts wrapper)
  - [x] Verify chart styling matches dashboard design (blue theme, proper spacing)

