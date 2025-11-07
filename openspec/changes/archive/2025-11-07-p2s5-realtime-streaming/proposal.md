# Change: Slice 5 - Real-time Streaming (Minimal)

## Why
The simulator needs to stream real-time events to clients via WebSocket. This slice implements minimal WebSocket functionality to send one stream event every 5 seconds, validating the WebSocket infrastructure before expanding to full streaming capabilities.

## What Changes
- Set up WebSocket server in SvelteKit hooks (`src/hooks.server.ts`)
- Implement minimal WebSocket handler to send one `customer.tutor.search` event every 5 seconds
- Track connected clients
- Use `StreamGenerator` from Slice 2 to generate events

## Impact
- Affected specs: New capability `websocket-streaming`
- Affected code:
  - Modified `/src/hooks.server.ts` (WebSocket upgrade handling)
  - New WebSocket handler logic
- Dependencies: Uses `ws` package, `StreamGenerator` from Slice 2, and types from `$lib/types`

