## 1. Implementation
- [x] 1.1 Implement topic-based subscription system
  - Modify `/lib/websocket/server.ts`
  - Store subscription preferences per client connection
  - Support subscription patterns: `*` (all), `customer.*`, `session.*`, or specific streams
  - Implement topic matching logic (wildcard support)
  - Test: Subscribe to different patterns, verify matching works

- [x] 1.2 Implement subscription message handling
  - Add message handler for `{ type: "subscribe", topics: ["customer.*"] }`
  - Server responds with `{ type: "subscribed", topics: ["customer.*"] }`
  - Update client subscription state
  - Test: Send subscription message, verify response and state update

- [x] 1.3 Filter outgoing events based on subscriptions
  - Before sending event, check if client is subscribed to the stream
  - Match stream ID against subscription patterns
  - Only send events that match client subscriptions
  - Test: Subscribe to specific streams, verify only matching events are received

- [x] 1.4 Add heartbeat and keepalive
  - Server sends ping every 30 seconds
  - Client responds with pong
  - Track last ping/pong time per client
  - Close connection if no pong received within timeout
  - Test: Verify connection stays alive, verify timeout works

