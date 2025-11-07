## 1. Implementation
- [x] 1.1 Set up WebSocket server in SvelteKit hooks
  - Modify `/src/hooks.server.ts`
  - Handle WebSocket upgrade requests
  - Track connected clients
- [x] 1.2 Implement minimal WebSocket handler
  - Accept connections
  - Send one `customer.tutor.search` event every 5 seconds
  - Use `StreamGenerator` from Slice 2
  - Message format: `{ type: "event", data: StreamEvent }`
- [x] 1.3 Test WebSocket connection
  - Connect: `wscat -c ws://localhost:5173/ws`
  - Verify: Receive events every 5 seconds
  - Verify: Event structure matches `StreamEvent` type

