# Change: Dashboard Chunk 2 - Chart Foundation

## Why
The Operations Dashboard requires a basic chart display capability to visualize stream data. This chunk implements the foundational chart infrastructure using Apache ECharts, including a reusable chart component wrapper and a basic single-stream chart with hardcoded data. This establishes the charting foundation that enables all subsequent real-time data visualization features.

## What Changes
- **Slice 2: Single Stream Chart (Hardcoded)**
  - Create or enhance ECharts wrapper component (`lib/components/ECharts.svelte` or `lib/components/dashboard/TimeSeriesChart.svelte`)
  - Create basic time-series chart component with hardcoded data
  - Display normalized values (0-100 scale) for a single stream
  - Add baseline reference line at 50 (baseline mean)
  - Integrate chart into dashboard page placeholder section
  - Use hardcoded sample data (no WebSocket or API calls yet)

## Impact
- Affected specs: 
  - `dashboard-charting` (new capability)
- Affected code: 
  - `/lib/components/ECharts.svelte` (enhance existing or create new wrapper)
  - `/lib/components/dashboard/TimeSeriesChart.svelte` (new component)
  - `/routes/dashboard/+page.svelte` (replace chart placeholder with actual component)
- Dependencies: 
  - `echarts@^5.5.0` (already installed in Chunk 1)
- New files:
  - Chart component for dashboard
  - Hardcoded sample data for testing

## Related Changes
- Builds on: `dashboard-chunk1-foundation` (project setup, types, stores)
- Enables: `dashboard-chunk3-websocket-realtime` (real-time chart updates)

