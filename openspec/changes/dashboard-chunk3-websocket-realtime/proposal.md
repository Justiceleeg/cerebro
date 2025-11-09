# Change: Dashboard Chunk 3 - WebSocket & Real-time Data Infrastructure

## Why
The Operations Dashboard requires real-time data streaming from the AI Mock Simulator backend to display live updates in the chart and other visualizations. This chunk implements the complete WebSocket connection infrastructure, real-time event processing, and historical data loading with merge capabilities. This establishes the real-time data foundation that enables all subsequent live visualization features.

## What Changes
- **Slice 3: WebSocket Connection**
  - Create WebSocket connection manager (`src/lib/websocket/client.ts`)
  - Implement connection lifecycle (connect, disconnect, reconnect)
  - Handle auto-reconnect with exponential backoff
  - Manage subscription/unsubscription messages
  - Handle WebSocket protocol-level ping/pong heartbeat
  - Update connection status in websocket store
- **Slice 4: Real-time Updates (One Stream)**
  - Process incoming WebSocket events (single and batch)
  - Update stream data store with new events
  - Subscribe to a single stream (e.g., `customer.tutor.search`)
  - Update chart with real-time data (replace hardcoded data)
  - Handle catch-up events after reconnection
- **Slice 5: Historical Data Loading**
  - Create API client for historical data (`src/lib/api/history.ts`)
  - Fetch historical data on dashboard load (`GET /api/simulation/history`)
  - Merge historical data with real-time events
  - Populate chart with historical + real-time data
  - Handle time range parameters (default: last 7 days)

## Impact
- Affected specs:
  - `dashboard-websocket` (new capability)
  - `dashboard-charting` (enhanced with real-time updates)
- Affected code:
  - `/lib/websocket/client.ts` (new WebSocket connection manager)
  - `/lib/api/history.ts` (new historical data API client)
  - `/lib/stores/websocket.svelte.ts` (already exists, will be used)
  - `/lib/stores/streams.svelte.ts` (already exists, will be used)
  - `/routes/dashboard/+page.svelte` (integrate WebSocket connection and historical data loading)
  - `/lib/components/dashboard/TimeSeriesChart.svelte` (update to use real-time data from store)
- Dependencies:
  - WebSocket API (native browser API)
  - `ws` package (already installed for server-side)
  - REST API endpoint `/api/simulation/history` (must exist in backend)
- New files:
  - WebSocket client connection manager
  - Historical data API client
  - Integration logic in dashboard page

## Related Changes
- Builds on: `dashboard-chunk1-foundation` (stores, types), `dashboard-chunk2-chart-foundation` (chart component)
- Enables: `dashboard-chunk4-heatmap` (real-time heatmap updates), `dashboard-chunk5-events` (real-time event timeline)

