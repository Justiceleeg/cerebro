## 1. Implementation

### 1.1 Unsubscribe Message Handler
- [x] 1.1.1 Add `handleUnsubscribe()` function in `/lib/websocket/server.ts`
  - Accept `{ type: "unsubscribe", topics: string[] }` message
  - Remove topics from client's `subscriptions` array
  - Update stream intervals by calling `setupStreamIntervals()` to remove unsubscribed streams
  - Send confirmation: `{ type: "unsubscribed", topics: string[] }`
  - Test: Subscribe to multiple streams, unsubscribe from some, verify only remaining streams are received

- [x] 1.1.2 Add unsubscribe handler to WebSocket message router
  - Update message handler to route `unsubscribe` messages to `handleUnsubscribe()`
  - Test: Send unsubscribe message, verify response and state update

### 1.2 Anomalies Topic Pattern
- [x] 1.2.1 Update `matchesSubscription()` function to handle `"anomalies"` pattern
  - Check if pattern is `"anomalies"`
  - When pattern matches, check `event.anomalyFlag === 'warning' || event.anomalyFlag === 'critical'`
  - Test: Subscribe to `"anomalies"`, verify only warning/critical events are received

- [x] 1.2.2 Update event filtering logic
  - Filter events before sending based on anomaly flag when pattern matches
  - Test: Subscribe to `"customer.*"` and `"anomalies"`, verify both patterns work together

### 1.3 Batch Message Type
- [x] 1.3.1 Add `eventBuffer: StreamEvent[]` to `ClientState` interface
  - Update interface definition in `/lib/websocket/server.ts`
  - Initialize empty array for each client connection

- [x] 1.3.2 Implement event buffering
  - Buffer events instead of sending immediately when generated
  - Add batch timer (100ms interval) per client connection
  - Flush buffer every 100ms: send `{ type: "batch", events: StreamEvent[] }`
  - Handle empty batches (don't send if buffer is empty)
  - Send remaining buffered events on disconnect (cleanup)
  - Test: Subscribe to high-frequency streams (e.g., `api.request.log`), verify events are batched
  - Test: Verify batch messages contain multiple events
  - Test: Verify no events are lost during batching

### 1.4 Catchup / LastTimestamp Support
- [x] 1.4.1 Implement recent event buffer
  - Add global recent event buffer: `Map<string, StreamEvent[]>` or time-based structure
  - Store events in buffer when generated (limit: last 5 minutes or last 1000 events per stream)
  - Add buffer cleanup mechanism (remove events older than 5 minutes, run every minute)
  - Estimate memory: ~50 streams × ~10 events/min × 5 min = ~2500 events ≈ 1.25MB (acceptable)

- [x] 1.4.2 Implement `lastTimestamp` parameter in subscribe
  - Update `handleSubscribe()` to check for optional `lastTimestamp` parameter
  - Parse `lastTimestamp` as ISO 8601 timestamp
  - Query buffer for events after `lastTimestamp` matching subscription patterns
  - Handle edge case: if `lastTimestamp` is too old (beyond buffer), return empty catchup or error

- [x] 1.4.3 Implement `catchup` message type
  - Send `{ type: "catchup", events: StreamEvent[], catchUpEndTime: string }` message
  - `catchUpEndTime` should be current time (ISO 8601) when catchup completes
  - Send catchup message immediately after subscription confirmation
  - Test: Subscribe with `lastTimestamp` from 2 minutes ago, verify catchup events are received
  - Test: Disconnect, wait 3 minutes, reconnect with `lastTimestamp`, verify gap is filled
  - Test: Subscribe with very old `lastTimestamp`, verify empty catchup or error

