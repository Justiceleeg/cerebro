# Change: Phase 2.5 - WebSocket Protocol Enhancements

## Why
The WebSocket server currently supports basic subscription functionality, but lacks several features required for production readiness and API contract compliance. These enhancements improve performance (batching), reliability (catchup), and efficiency (unsubscribe, anomalies pattern) as specified in `docs/API_CONTRACT.md`.

## What Changes
- Implement `unsubscribe` message handler to allow clients to remove specific subscriptions
- Add `anomalies` topic pattern to filter events by anomaly flag (warning/critical)
- Implement batch message type for high-frequency streams to reduce WebSocket overhead
- Add catchup/lastTimestamp support to fill gaps after reconnection and prevent data loss
- Update WebSocket message protocol to match API contract specification

## Impact
- Affected specs: Modifies capability `websocket-streaming`
- Affected code:
  - Modified `/lib/websocket/server.ts` (unsubscribe handler, anomalies pattern, batching, catchup buffer)
  - Updated `ClientState` interface to include event buffer
  - Added global recent event buffer for catchup functionality
- References: `docs/API_CONTRACT.md` - Source of truth for WebSocket protocol specification
- Dependencies: Uses existing stream generation and subscription infrastructure

