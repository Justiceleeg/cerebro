## Slice 3: WebSocket Connection

- [ ] 3.1 Create WebSocket connection manager (`src/lib/websocket/client.ts`):
  - [ ] Define WebSocket client class or module
  - [ ] Implement `connect()` method:
    - [ ] Determine WebSocket URL (dev vs prod)
    - [ ] Create WebSocket connection
    - [ ] Set up event handlers (open, message, error, close)
    - [ ] Update connection state in websocket store
  - [ ] Implement `disconnect()` method:
    - [ ] Close WebSocket connection gracefully
    - [ ] Update connection state
    - [ ] Clear subscriptions
  - [ ] Implement `reconnect()` method:
    - [ ] Exponential backoff (1s, 2s, 4s, 8s, 16s, max 30s)
    - [ ] Respect maxReconnectAttempts from store
    - [ ] Update connection state to 'reconnecting'
    - [ ] Re-subscribe to previous topics after reconnection
  - [ ] Handle WebSocket protocol-level ping/pong:
    - [ ] Browser handles ping/pong automatically, but verify
    - [ ] Monitor connection health
  - [ ] Implement `subscribe(topics: string[], lastTimestamp?: string)`:
    - [ ] Send subscribe message to server
    - [ ] Update topics in websocket store
    - [ ] Handle lastTimestamp for catch-up events
  - [ ] Implement `unsubscribe(topics: string[])`:
    - [ ] Send unsubscribe message to server
    - [ ] Remove topics from websocket store

- [ ] 3.2 Handle WebSocket messages:
  - [ ] Parse incoming JSON messages
  - [ ] Handle message types:
    - [ ] `event` - single StreamEvent
    - [ ] `batch` - multiple StreamEvents
    - [ ] `subscribed` - subscription confirmation
    - [ ] `catchup` - catch-up events after reconnection
    - [ ] `error` - error messages
  - [ ] Route events to appropriate handlers (will be used in Slice 4)

- [ ] 3.3 Integrate WebSocket connection into dashboard:
  - [ ] Import WebSocket client in `/routes/dashboard/+page.svelte`
  - [ ] Connect on component mount
  - [ ] Disconnect on component unmount
  - [ ] Display connection status from websocket store
  - [ ] Handle connection errors gracefully

## Slice 4: Real-time Updates (One Stream)

- [ ] 4.1 Process incoming WebSocket events:
  - [ ] Handle `event` messages:
    - [ ] Extract StreamEvent from message
    - [ ] Add event to stream data store using `addEvent()`
  - [ ] Handle `batch` messages:
    - [ ] Extract StreamEvent[] from message
    - [ ] Add events to stream data store using `addEvents()`
  - [ ] Handle `catchup` messages:
    - [ ] Extract StreamEvent[] and catchUpEndTime
    - [ ] Add events to stream data store
    - [ ] Note: catch-up events may overlap with historical data (handle deduplication if needed)

- [ ] 4.2 Subscribe to a single stream:
  - [ ] Subscribe to `customer.tutor.search` stream on connection
  - [ ] Update websocket store with subscription
  - [ ] Verify subscription confirmation message received

- [ ] 4.3 Update chart with real-time data:
  - [ ] Modify `TimeSeriesChart.svelte` to accept data from stream store:
    - [ ] Read from `streamDataStore.events.get(streamName)`
    - [ ] Convert StreamEvent[] to ChartDataPoint[]
    - [ ] Use `$derived` to reactively update chart when events change
  - [ ] Replace hardcoded sample data with real-time data
  - [ ] Handle empty data state (show placeholder or loading)
  - [ ] Update chart smoothly as new events arrive

- [ ] 4.4 Test real-time updates:
  - [ ] Start simulator backend (if available)
  - [ ] Navigate to `/dashboard`
  - [ ] Verify WebSocket connection establishes
  - [ ] Verify subscription message sent
  - [ ] Verify events received and displayed in chart
  - [ ] Verify chart updates in real-time

## Slice 5: Historical Data Loading

- [ ] 5.1 Create historical data API client (`src/lib/api/history.ts`):
  - [ ] Implement `fetchHistoricalData(start: string, end: string)`:
    - [ ] Call `GET /api/simulation/history?start={start}&end={end}`
    - [ ] Parse response (HistoricalDataResponse)
    - [ ] Return historical events and external events
  - [ ] Handle errors (network, API errors)
  - [ ] Add TypeScript types for API response

- [ ] 5.2 Load historical data on dashboard mount:
  - [ ] Calculate time range (default: last 7 days)
  - [ ] Call `fetchHistoricalData()` in dashboard page
  - [ ] Store historical data in stream store using `setHistoricalData()`
  - [ ] Store external events (will be used in Chunk 5)

- [ ] 5.3 Merge historical and real-time data:
  - [ ] Combine historical events with real-time events:
    - [ ] Use `getHistoricalEvents(streamName)` for historical
    - [ ] Use `getStreamEvents(streamName)` for real-time
    - [ ] Merge and sort by timestamp
    - [ ] Handle deduplication (events may overlap)
  - [ ] Update chart to display merged data:
    - [ ] Modify chart component to merge historical + real-time
    - [ ] Ensure smooth transition from historical to real-time
    - [ ] Maintain chronological order

- [ ] 5.4 Test historical data loading:
  - [ ] Navigate to `/dashboard`
  - [ ] Verify historical data API call made
  - [ ] Verify historical data displayed in chart
  - [ ] Verify real-time events append to historical data
  - [ ] Verify no duplicate events in chart

