# Task List: AI Mock Simulator (Backend/Data Generation)

## Project Overview
Building the backend mock data generation service that simulates 50+ marketplace data streams with pre-defined scenario orchestration. This service generates realistic historical data, streams real-time events via WebSocket, manages external events, and responds to simulation control via pre-defined scenarios from an admin interface.

**Tech Stack**: SvelteKit + TypeScript, Railway.app deployment, WebSockets

**Key Features**:
- 50 interconnected data streams across Customer, Tutor, Session, Support, Marketing, and System domains
- Pre-defined scenario system that applies stream modifications and external events
- 30-day historical baseline (for statistics) displayed as 7-day rolling window
- Normalized data generation (0-100 scale based on baseline statistics)
- External events system (marketing, product, infrastructure, academic, competitive, operational)
- Real-time streaming with appropriate cadences per stream type
- Automatic settling behavior after scenarios complete

**Note**: This document covers the BACKEND/SIMULATOR only. See `dashboard-tasks.md` for frontend/UI tasks and `ARCHITECTURE-2.md` for system integration details.

**Development Approach**: Vertical slices - each slice is a fully testable, end-to-end feature that can be tested immediately after completion.

---

## Phase 1: Foundation & Architecture (Days 1-2)

### 1.1 Project Setup
- [x] Initialize SvelteKit project with TypeScript
- [x] Set up Railway.app deployment configuration
- [x] Install dependencies:
  - `ws`: `^8.18.0` (WebSocket server)
  - `@types/ws`: `^8.5.0` (TypeScript types for ws)
- [x] Configure environment variables (port, etc.)
- [x] Set up backend project structure:
  ```
  /lib
    /streams         - Stream generation logic
    /scenarios       - Pre-defined scenario definitions and application
    /config          - Configuration files
    /data            - Pre-generated baseline data
  /routes
    /api             - API endpoints
      /simulation    - Simulation control endpoints
      /streams       - Stream data endpoints
    /admin           - Admin UI for simulation control
  ```

### 1.2 Configuration & Documentation Files
- [x] Create `config/baseline-metrics.json` - Define baseline rates for all 50 streams
  - Session confirmation rates (~70-80%)
  - Tutor no-show rates (~2-5%)
  - Student churn rates by cohort
  - Support ticket resolution times
  - First session success rates
  - Growth rates, seasonal multipliers
  - Volume targets (tens of thousands of students, 1-8 students per tutor, ~3 sessions/tutor/day)
  
- [x] Create `config/stream-relationships.json` - Document interconnections
  - Event chains (booking.requested → confirmed/declined/expired with timing)
  - Cascading effects (payment failure → support ticket → potential churn with delays)
  - Supply/demand correlations (tutor availability ↔ booking success)
  - Temporal dependencies (tutor must be approved before availability can be set)
  - Cross-domain relationships (low ratings → increased support contacts → churn risk)
  - Probability matrices for event outcomes
  
- [x] Create `config/stream-cadences.json` - Define update frequencies for each stream
  - **High frequency (seconds-minutes)**: session events, API logs, live chat
  - **Medium frequency (minutes-hours)**: searches, bookings, availability changes
  - **Low frequency (hours-daily)**: ad spend, payouts, platform snapshots, subscriptions
  - Include jitter/variance to avoid synchronized bursts
    
- [x] Create `config/scenario-definitions.json` - Define pre-defined scenarios (see `SCENARIO_DEFINITIONS.md` for structure)
  - For each scenario: id, name, description, affected streams with multipliers, cascade rules, expected duration, settlement behavior
  - Scenarios: exam-season-surge, supply-crisis, payment-outage, quality-crisis, support-overload, churn-pattern, recruiting-crisis, competitor-disruption, normal-operations
  - Include external events to inject for each scenario
  - Each scenario must be fully defined with all modifiers and events

- [x] Create `config/external-events-library.json` - Define external event types and templates
  - **Marketing/Growth**: Blog viral, TikTok mention, podcast sponsorship, ad campaigns, competitor launch, influencer endorsement
  - **Product/Platform**: App launch, feature release, UI redesign, pricing change, new payment method
  - **External/Infrastructure**: AWS outage, Stripe rate limiting, weather events, school holidays, internet outages
  - **Academic Calendar**: IB exam season, SAT exams, school year start, finals week, summer break
  - **Competitive/Market**: Competitor funding, competitor shutdown, industry reports, regulatory changes
  - **Internal Operational**: Tutor training completion, support hours change, new pricing tier, referral program launch
  - For each: type, expected impact (streams, direction, magnitude, duration), severity, icon, typical timing patterns

### 1.3 Data Models & Types
- [x] Define TypeScript interfaces for all 50 stream event types (reference STREAM_DEFINITIONS.md)
- [x] Create core data type definitions:
  - `StreamEvent` interface
  - `ExternalEvent` interface
  - `ScenarioModifier` interface
  - `BaselineStatistics` interface
  - `StreamBaseline` interface
  - `SimulationState` interface
- [x] Organize types in TypeScript files (`src/lib/types/`)

---

## Phase 2: Vertical Slices - Build Testable Features Incrementally

### Slice 1: Minimal Testable API (Day 2)
**Goal**: Create a simple API endpoint that returns typed data - verify types work end-to-end.

- [x] Build `GET /api/simulation/state` endpoint
  - Return hardcoded `SimulationState` object
  - Use types from `$lib/types`
  - Test: `curl http://localhost:5173/api/simulation/state`
  - Verify: Response matches `SimulationState` interface
  - **Testable**: ✅ Can test immediately with HTTP request
  - **Status**: ✅ Complete - Deployed and tested on Railway

---

### Slice 2: Single Stream Event Generation (Day 2-3)
**Goal**: Generate one stream event and expose it via API - verify stream generation works.

- [x] Build minimal `StreamGenerator` class
  - Generate one `customer.tutor.search` event
  - Use types from `$lib/types` (specifically `CustomerTutorSearchData`)
  - Apply baseline metrics from config for this one stream
  - Return typed `StreamEvent` object
  
- [x] Build normalization function (minimal)
  - Input: raw stream value + hardcoded baseline stats for one stream
  - Output: normalized 0-100 score
  - Returns anomaly flag ('normal', 'warning', 'critical')
  
- [x] Build `GET /api/simulation/events` endpoint
  - Generate one event using `StreamGenerator`
  - Return single `StreamEvent` in response
  - Test: `curl http://localhost:5173/api/simulation/events`
  - Verify: Event has correct structure, types are enforced
  - **Testable**: ✅ Can test immediately with HTTP request
  - **Status**: ✅ Complete - Deployed and tested on Railway

---

### Slice 3: Historical Data (Minimal) (Day 3)
**Goal**: Generate 1 day of historical data for 1 stream and expose via API.

- [x] Build minimal `generateBaselineHistory()` function
  - Generate 1 day × 2 intervals (12-hour blocks) = 2 data points for `customer.tutor.search`
  - Apply basic patterns (weekday/weekend variance)
  - Return array of `StreamEvent` objects
  
- [x] Build minimal baseline statistics calculator
  - Calculate mean, median, std dev for the 2 data points
  - Return `StreamBaseline` for one stream
  
- [x] Build `GET /api/simulation/history` endpoint
  - Parameters: `start`, `end`, `streams` (optional, defaults to `customer.tutor.search`)
  - Generate historical data on-demand
  - Return data in format suitable for charting
  - Test: `curl "http://localhost:5173/api/simulation/history?start=2025-01-15T00:00:00Z&end=2025-01-16T00:00:00Z"`
  - Verify: Historical data has correct structure
  - **Testable**: ✅ Can test immediately with HTTP request
  - **Status**: ✅ Complete - Deployed and tested on Railway

---

### Slice 4: Scenario Activation (Minimal) (Day 3-4)
**Goal**: Load one scenario, activate it, and see state change via API.

- [x] Build `ScenarioLoader` class (minimal)
  - Load scenario definitions from `config/scenario-definitions.json`
  - Provide lookup by scenario ID
  - Return scenario metadata for one scenario
  
- [x] Build `ScenarioEngine` class (minimal)
  - Track active scenario state
  - Apply scenario modifiers (just store them, don't apply to generation yet)
  - Inject external events (just store them)
  - Update `SimulationState`
  
- [x] Build `POST /api/simulation/scenario` endpoint
  - Accept: `{ scenarioId: string }`
  - Load scenario by ID
  - Activate scenario (store in state)
  - Return: `{ success: boolean, scenario: ScenarioModifier, events: ExternalEvent[] }`
  - Test: `curl -X POST http://localhost:5173/api/simulation/scenario -d '{"scenarioId":"exam-season-surge"}'`
  - Verify: State endpoint shows active scenario
  - **Testable**: ✅ Can test immediately with HTTP requests

- [x] Update `GET /api/simulation/state` endpoint
  - Return actual state from `ScenarioEngine`
  - Include active modifiers and events
  - Test: Verify state reflects active scenario
  - **Testable**: ✅ Can test immediately with HTTP request
  - **Status**: ✅ Complete - Deployed and tested on Railway

---

### Slice 5: Real-time Streaming (Minimal) (Day 4)
**Goal**: WebSocket that sends one stream event every 5 seconds.

- [x] Set up WebSocket server in SvelteKit hooks (`src/hooks.server.ts`)
  - Handle WebSocket upgrade requests
  - Track connected clients
  
- [x] Implement minimal WebSocket handler
  - Accept connections
  - Send one `customer.tutor.search` event every 5 seconds
  - Use `StreamGenerator` from Slice 2
  - Message format: `{ type: "event", data: StreamEvent }`
  
- [x] Test WebSocket connection
  - Connect: `wscat -c ws://localhost:5173/ws`
  - Verify: Receive events every 5 seconds
  - Verify: Event structure matches `StreamEvent` type
  - **Testable**: ✅ Can test immediately with WebSocket client
  - **Status**: ✅ Complete - Deployed and tested on Railway (wss://cerebro-production-3075.up.railway.app/ws)

---

### Slice 6: Apply Scenario to Stream Generation (Day 4-5)
**Goal**: Active scenarios actually modify stream generation.

- [x] Integrate `ScenarioEngine` with `StreamGenerator`
  - When generating events, check for active scenario modifiers
  - Apply multipliers/overrides to stream generation
  - Test: Activate scenario, generate events, verify values are modified
  - **Testable**: ✅ Can test via API + WebSocket

- [x] Apply external event impacts
  - Check if external events are active
  - Apply event impacts to stream generation
  - Test: Activate scenario with events, verify impacts
  - **Testable**: ✅ Can test via API + WebSocket
  - **Status**: ✅ Complete - Deployed and tested on Railway (verified scenario modifiers apply correctly)

---

### Slice 7: Expand to All Streams (Day 5)
**Goal**: Generate all 50 streams instead of just one.

- [x] Expand `StreamGenerator` to all 50 streams
  - Generate events for all stream types
  - Use appropriate cadences from config
  - Apply time-of-day and day-of-week patterns
  
- [x] Expand historical generation to all streams
  - Generate 1 day of data for all 50 streams
  - Calculate baseline statistics for all streams
  
- [x] Update WebSocket to stream all events
  - Send events for all streams based on their cadences
  - Filter by subscription (start with all streams)
  - Test: Connect WebSocket, receive events for multiple streams
  - **Testable**: ✅ Can test via WebSocket
  - **Status**: ✅ Complete - All 50 streams generating with appropriate cadences

---

### Slice 8: Full Historical Data (Day 5-6)
**Goal**: Generate full 30-day historical baseline.

- [x] Expand `generateBaselineHistory()` to full 30 days
  - Generate 30 days × 2 intervals = 60 data points per stream
  - Apply all patterns (academic calendar, weekday/weekend, time-of-day)
  - Include realistic anomalies
  
- [x] Generate baseline external events for 30-day period
  - 2-5 events per day (60-150 events total)
  - Distributed realistically
  
- [x] Build data loader for app startup
  - Load baseline files into memory
  - Create efficient in-memory structures
  - Pre-calculate aggregations
  
- [x] Update `GET /api/simulation/history` endpoint
  - Return full 30-day historical data
  - Support filtering by stream
  - Test: Request 7-day window, verify data quality
  - **Testable**: ✅ Can test via API
  - **Status**: ✅ Complete - 30-day baseline data loaded into memory on startup

---

### Slice 9: WebSocket Subscription System (Day 6)
**Goal**: Clients can subscribe to specific streams.

- [ ] Implement topic-based subscription system
  - Clients can subscribe to: `*`, `customer.*`, `session.*`, or specific streams
  - Store subscription preferences per client
  - Filter outgoing events based on subscriptions
  
- [ ] Implement subscription message handling
  - Client sends: `{ type: "subscribe", topics: ["customer.*"] }`
  - Server responds: `{ type: "subscribed", topics: ["customer.*"] }`
  - Test: Subscribe to specific streams, verify only those events are received
  - **Testable**: ✅ Can test via WebSocket client
  
- [ ] Add heartbeat and keepalive
  - Server sends ping every 30 seconds
  - Client responds with pong
  - Test: Verify connection stays alive
  - **Testable**: ✅ Can test via WebSocket client

---

### Slice 10: Scenario Settling & Reset (Day 6)
**Goal**: Scenarios can settle and simulation can reset.

- [ ] Implement settling behavior
  - Scenarios transition from 'active' → 'settling' → 'settled'
  - Settling modifiers slowly reduce multipliers back to 1.0
  - Test: Activate scenario, wait for settling, verify multipliers decrease
  - **Testable**: ✅ Can test via API + WebSocket
  
- [ ] Build `POST /api/simulation/reset` endpoint
  - Clear all active modifiers
  - Clear all injected external events
  - Reset simulation state to baseline
  - Test: Activate scenario, reset, verify state is baseline
  - **Testable**: ✅ Can test via API
  
- [ ] Build `POST /api/simulation/stop` endpoint
  - Manually stop current scenario (triggers settling)
  - Test: Activate scenario, stop it, verify settling starts
  - **Testable**: ✅ Can test via API

---

### Slice 11: Relationship Enforcement (Day 6-7)
**Goal**: Events follow realistic chains and relationships.

- [ ] Implement relationship enforcement engine
  - Track pending events requiring resolution (e.g., `booking.requested` awaiting response)
  - Enforce event chains with realistic timing
  - Apply cascading effects using cascade rules from config
  - Test: Generate booking request, verify confirmation/decline follows
  - **Testable**: ✅ Can test via WebSocket (observe event chains)

---

### Slice 12: Admin UI (Day 7)
**Goal**: Basic admin interface for scenario control.

- [ ] Create `/admin` page
  - Display current simulation state
  - Show active scenarios and events
  
- [ ] Build scenario selection UI
  - Fetch available scenarios from `GET /api/simulation/scenarios`
  - Display scenario cards with "Activate" buttons
  - Call `POST /api/simulation/scenario` on click
  
- [ ] Build "Reset to Baseline" button
  - Call `POST /api/simulation/reset`
  - Show confirmation dialog
  
- [ ] Build "Stop Current Scenario" button
  - Call `POST /api/simulation/stop`
  - Only enabled when scenario is active
  - **Testable**: ✅ Can test via browser UI

**TESTING CHECKPOINT**: After completing Slice 12, test all unarchived openspec changes:
- ✅ **p2s9 (WebSocket Subscriptions)**: Test subscription patterns (`*`, `customer.*`, specific streams), heartbeat/keepalive
- ✅ **p2s10 (Scenario Settling)**: Test scenario lifecycle (active → settling → settled), reset endpoint, stop endpoint
- ✅ **p2s11 (Relationship Enforcement)**: Test event chains (booking.requested → confirmed/declined), cascading effects, temporal dependencies
- Use Admin UI to activate scenarios and observe WebSocket streams with subscriptions

---

### Slice 13: Expand to All Scenarios (Day 7-8)
**Goal**: Support all pre-defined scenarios.

- [ ] Test all pre-defined scenarios
  - Activate each scenario and verify it works
  - Test scenario conflicts (cannot activate new scenario while one is active)
  - Test reset functionality
  - **Testable**: ✅ Can test via Admin UI

---

### Slice 14: Dynamic Historical Regeneration (Day 8)
**Goal**: Historical data can be regenerated with scenario modifications.

- [ ] Build `regenerateHistoricalWindow()` function
  - Takes: time range, scenario modifiers, events to inject
  - Regenerates specific time window with modifications applied
  - Maintains coherence with unchanged portions
  - Test: Activate scenario, request historical data, verify modifications are applied
  - **Testable**: ✅ Can test via API

---

### Slice 15: Event-Stream Correlation Tracking (Day 8)
**Goal**: Track which events affected which streams.

- [ ] Implement event-stream correlation tracking
  - For each event, track which streams actually changed
  - Calculate correlation strength
  - Store results for dashboard AI analysis
  - Test: Activate scenario with events, verify correlation tracking
  - **Testable**: ✅ Can test via API (query correlations)

---

## Phase 2.5: WebSocket Protocol Enhancements (Day 6-7)
**Goal**: Add missing WebSocket features for production readiness and API contract compliance.

**Estimated Time**: 6-8 hours

**Context**: These features complete the WebSocket protocol to match the API contract specification. They improve performance (batching), reliability (catchup), and efficiency (unsubscribe, anomalies pattern).

### 2.5.1 Unsubscribe Message Handler
**Complexity**: Low (30-60 min)

- [ ] Implement `unsubscribe` message handler
  - Add handler for `{ type: "unsubscribe", topics: string[] }` message in WebSocket message router
  - Remove topics from client's `subscriptions` array
  - Update stream intervals by calling `setupStreamIntervals()` to remove unsubscribed streams
  - Send confirmation: `{ type: "unsubscribed", topics: string[] }`
  - Test: Subscribe to multiple streams, unsubscribe from some, verify only remaining streams are received
  - **Testable**: ✅ Can test via WebSocket client
  - **Location**: `src/lib/websocket/server.ts`

### 2.5.2 Anomalies Topic Pattern
**Complexity**: Low (30-60 min)

- [ ] Implement `anomalies` special topic pattern
  - Update `matchesSubscription()` function to handle `"anomalies"` pattern
  - Check `event.anomalyFlag === 'warning' || event.anomalyFlag === 'critical'`
  - Filter events before sending based on anomaly flag when pattern matches
  - Test: Subscribe to `"anomalies"`, verify only warning/critical events are received
  - Test: Subscribe to `"customer.*"` and `"anomalies"`, verify both patterns work together
  - **Testable**: ✅ Can test via WebSocket client
  - **Location**: `src/lib/websocket/server.ts` - `matchesSubscription()` and event sending logic

### 2.5.3 Batch Message Type
**Complexity**: Medium (2-3 hours)

- [ ] Implement event batching for high-frequency streams
  - Add `eventBuffer: StreamEvent[]` to `ClientState` interface
  - Buffer events instead of sending immediately when generated
  - Add batch timer (100ms interval) per client connection
  - Flush buffer every 100ms: send `{ type: "batch", events: StreamEvent[] }`
  - Handle empty batches (don't send if buffer is empty)
  - Send remaining buffered events on disconnect (cleanup)
  - Test: Subscribe to high-frequency streams (e.g., `api.request.log`), verify events are batched
  - Test: Verify batch messages contain multiple events
  - Test: Verify no events are lost during batching
  - **Testable**: ✅ Can test via WebSocket client (observe message types)
  - **Location**: `src/lib/websocket/server.ts` - `ClientState` interface and event sending logic
  - **Performance Impact**: Reduces WebSocket overhead for high-frequency streams (11+ events/second)

### 2.5.4 Catchup / LastTimestamp Support
**Complexity**: Medium-High (3-4 hours)

- [ ] Implement recent event buffer for catchup
  - Add global recent event buffer: `Map<stream, StreamEvent[]>` or time-based structure
  - Store events in buffer when generated (limit: last 5 minutes or last 1000 events per stream)
  - Add buffer cleanup mechanism (remove events older than 5 minutes, run every minute)
  - Estimate memory: ~50 streams × ~10 events/min × 5 min = ~2500 events ≈ 1.25MB (acceptable)

- [ ] Implement `lastTimestamp` parameter in subscribe
  - Update `handleSubscribe()` to check for optional `lastTimestamp` parameter
  - Parse `lastTimestamp` as ISO 8601 timestamp
  - Query buffer for events after `lastTimestamp` matching subscription patterns
  - Handle edge case: if `lastTimestamp` is too old (beyond buffer), return empty catchup or error

- [ ] Implement `catchup` message type
  - Send `{ type: "catchup", events: StreamEvent[], catchUpEndTime: string }` message
  - `catchUpEndTime` should be current time (ISO 8601) when catchup completes
  - Send catchup message immediately after subscription confirmation
  - Test: Subscribe with `lastTimestamp` from 2 minutes ago, verify catchup events are received
  - Test: Disconnect, wait 3 minutes, reconnect with `lastTimestamp`, verify gap is filled
  - Test: Subscribe with very old `lastTimestamp`, verify empty catchup or error
  - **Testable**: ✅ Can test via WebSocket client
  - **Location**: `src/lib/websocket/server.ts` - global buffer, `handleSubscribe()` function
  - **Reliability Impact**: Critical for production (fills gaps after reconnection, no data loss)

**Notes**:
- These features align with API contract expectations (`docs/API_CONTRACT.md`)
- All features are backward compatible (optional parameters/patterns)
- Batch reduces bandwidth/CPU for high-frequency streams
- Catchup is essential for reliable reconnection (no data gaps)
- Unsubscribe and anomalies pattern improve efficiency for focused monitoring

**Status**: ⏳ Pending - Required before frontend development begins

---

## Phase 3: Testing & Refinement (Days 8-9)

### 3.1 Data Quality Validation
- [ ] Verify stream relationships
  - Booking flow: requested → confirmed/declined/expired (sum matches)
  - Payment failures trigger support tickets (correlation exists)
  - Session completions lead to ratings (probabilistic, ~40-60%)
  - Supply/demand balance feels realistic
  
- [ ] Check temporal patterns
  - Academic calendar effects visible (exam seasons spike demand)
  - Weekday/weekend variance present (~30-50% more on weekends)
  - Time-of-day patterns correct (peak 8am-10pm, low 11pm-7am)
  - Growth trends smooth and realistic (2-5% monthly)
  
- [ ] Validate baseline metrics
  - Confirmation rates match config (~70-80%)
  - No-show rates match config (~2-5% students, ~1-2% tutors)
  - Volume targets achieved
  - Normalized values distribute reasonably (most between 30-70)

### 3.2 Performance Testing
- [ ] Load test WebSocket server
  - Simulate 10-20 concurrent connections
  - Verify no lag or dropped events
  - Check memory usage over time (should be stable)
  
- [ ] Measure API performance
  - Scenario activation: <500ms
  - Historical data loading: <1 second
  - WebSocket event broadcasting: <100ms latency
  
### 3.3 Edge Cases & Error Handling
- [ ] Test error scenarios
  - Invalid scenario ID (show user-friendly error)
  - Scenario already active (prevent activation, show message)
  - WebSocket connection drops (client reconnects automatically)
  - Invalid scenario definition (validate on load, show error)
  
- [ ] Test boundary conditions
  - Very long scenarios (24+ hours)
  - Extreme modifiers (10x multipliers)
  - Rapid scenario changes
  - Historical regeneration of full 30 days

---

## Phase 4: Documentation & Deployment (Days 9-10)

### 4.1 API Documentation
- [ ] Create `API.md` document
  - List all endpoints with full specifications
  - WebSocket protocol documentation
  - Data formats documentation

### 4.2 Code Documentation
- [ ] Add JSDoc comments to all major functions/classes
- [ ] Document configuration files
- [ ] Create README.md
- [ ] Create SIMULATOR.md guide

### 4.3 Deployment Setup
- [ ] Configure Railway deployment
- [ ] Set up deployment monitoring
- [ ] Test deployed application

### 4.4 Demo Preparation
- [ ] Create demo script
- [ ] Prepare demo data
- [ ] Test all pre-defined scenario buttons

---

## Success Criteria

### Minimum Viable Product (MVP)
- ✅ 50 streams generating realistic, interconnected data
- ✅ 30-day historical baseline with proper patterns and statistics
- ✅ Normalized data output (0-100 scale)
- ✅ Pre-defined scenario system with button-based activation
- ✅ Scenarios modify real-time data streams
- ✅ External events system with injection capability
- ✅ WebSocket server streams data to clients
- ✅ Admin UI with scenario selection buttons
- ✅ Reset to baseline functionality
- ✅ Deployed and accessible on Railway

### Full Feature Set
- ✅ All MVP features
- ✅ Comprehensive scenario library (8-10 pre-defined scenarios)
- ✅ Event-stream correlation tracking
- ✅ Settling behavior for all scenarios
- ✅ Conflict resolution (only one scenario active at a time)
- ✅ Complete API documentation
- ✅ Performance testing completed
- ✅ Deployment monitoring in place

---

## Timeline Summary

- **Days 1-2**: Foundation, setup, configuration files, types
- **Days 2-4**: Vertical slices 1-6 (minimal testable features)
- **Days 4-6**: Vertical slices 7-10 (expand to full functionality)
- **Days 6-8**: Vertical slices 11-15 (advanced features)
- **Day 7**: Phase 2.5 - WebSocket Protocol Enhancements (6-8 hours)
- **Days 8-9**: Testing and refinement
- **Days 9-10**: Documentation and deployment

**Total Estimated Time**: 10-11 days for full feature set (includes Phase 2.5)

**MVP Timeline**: 7-8 days (through Slice 12, before Phase 2.5)

---

## Notes

- This backend is designed to work independently but integrates with dashboard via WebSocket and API
- Scenario system uses pre-defined scenarios (no AI required for simulator)
- All data is ephemeral (regenerated on restart) except baseline JSON files
- Configuration files are source of truth for baseline behavior
- Railway deployment required for native WebSocket support
- Admin UI (`/admin`) has no authentication (for demo purposes only)
- Scenarios auto-settle based on scenario definition or manual stop
- External events are injected as part of scenario definitions
- Only one scenario can be active at a time (conflict resolution)
- **Each slice is fully testable** - you can verify it works before moving to the next slice
