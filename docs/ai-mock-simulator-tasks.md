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

---

## Phase 1: Foundation & Architecture (Days 1-2)

### 1.1 Project Setup
- [ ] Initialize SvelteKit project with TypeScript
- [ ] Set up Railway.app deployment configuration
- [ ] Install dependencies:
  - `ws`: `^8.18.0` (WebSocket server)
  - `@types/ws`: `^8.5.0` (TypeScript types for ws)
- [ ] Configure environment variables (port, etc.)
- [ ] Set up backend project structure:
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
- [ ] Create `config/baseline-metrics.json` - Define baseline rates for all 50 streams
  - Session confirmation rates (~70-80%)
  - Tutor no-show rates (~2-5%)
  - Student churn rates by cohort
  - Support ticket resolution times
  - First session success rates
  - Growth rates, seasonal multipliers
  - Volume targets (tens of thousands of students, 1-8 students per tutor, ~3 sessions/tutor/day)
  
- [ ] Create `config/stream-relationships.json` - Document interconnections
  - Event chains (booking.requested → confirmed/declined/expired with timing)
  - Cascading effects (payment failure → support ticket → potential churn with delays)
  - Supply/demand correlations (tutor availability ↔ booking success)
  - Temporal dependencies (tutor must be approved before availability can be set)
  - Cross-domain relationships (low ratings → increased support contacts → churn risk)
  - Probability matrices for event outcomes
  
- [ ] Create `config/stream-cadences.json` - Define update frequencies for each stream
  - **High frequency (seconds-minutes)**: session events, API logs, live chat
  - **Medium frequency (minutes-hours)**: searches, bookings, availability changes
  - **Low frequency (hours-daily)**: ad spend, payouts, platform snapshots, subscriptions
  - Include jitter/variance to avoid synchronized bursts
    
- [ ] Create `config/scenario-definitions.json` - Define pre-defined scenarios (see `SCENARIO_DEFINITIONS.md` for structure)
  - For each scenario: id, name, description, affected streams with multipliers, cascade rules, expected duration, settlement behavior
  - Scenarios: exam-season-surge, supply-crisis, payment-outage, quality-crisis, support-overload, churn-pattern, recruiting-crisis, competitor-disruption, normal-operations
  - Include external events to inject for each scenario
  - Each scenario must be fully defined with all modifiers and events

- [ ] Create `config/external-events-library.json` - Define external event types and templates
  - **Marketing/Growth**: Blog viral, TikTok mention, podcast sponsorship, ad campaigns, competitor launch, influencer endorsement
  - **Product/Platform**: App launch, feature release, UI redesign, pricing change, new payment method
  - **External/Infrastructure**: AWS outage, Stripe rate limiting, weather events, school holidays, internet outages
  - **Academic Calendar**: IB exam season, SAT exams, school year start, finals week, summer break
  - **Competitive/Market**: Competitor funding, competitor shutdown, industry reports, regulatory changes
  - **Internal Operational**: Tutor training completion, support hours change, new pricing tier, referral program launch
  - For each: type, expected impact (streams, direction, magnitude, duration), severity, icon, typical timing patterns

### 1.3 Data Models & Types
- [ ] Define TypeScript interfaces for all 50 stream event types (reference STREAM_DEFINITIONS.md)
  
- [ ] Create core data type definitions:
  ```typescript
  interface StreamEvent {
    stream: string;
    timestamp: string;
    data: Record<string, any>;
    normalizedValue?: number; // 0-100 based on baseline
    anomalyFlag?: 'normal' | 'warning' | 'critical';
  }
  
  interface ExternalEvent {
    id: string;
    timestamp: string;
    type: 'marketing' | 'product' | 'infrastructure' | 'academic' | 'competitive' | 'operational';
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'critical';
    expectedImpact: {
      streams: string[];
      direction: 'increase' | 'decrease' | 'mixed';
      magnitude: 'low' | 'medium' | 'high';
      duration: string;
    };
    icon: string;
    externalLink?: string;
    injectedByAI?: boolean;
  }
  
  interface ScenarioModifier {
    id: string;
    type: string;
    description: string;
    startTime: string;
    duration?: string;
    affectedStreams: Record<string, StreamModification>;
    cascadeEffects: CascadeRule[];
    relatedEvents: string[];
    status: 'active' | 'settling' | 'settled';
    settlementDuration?: string;
  }
  
  interface BaselineStatistics {
    calculatedFrom: string;
    streams: Record<string, StreamBaseline>;
  }
  
  interface StreamBaseline {
    name: string;
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    percentiles: { p25: number; p50: number; p75: number; p90: number; p95: number };
    patterns: {
      weekdayAvg: number;
      weekendAvg: number;
      trend: string;
      seasonality: string;
    };
  }
  
  interface SimulationState {
    baselineState: 'normal' | 'custom';
    activeModifiers: ScenarioModifier[];
    activeEvents: ExternalEvent[];
    historicalMode: 'baseline' | 'modified';
    currentSimulationTime: string;
    lastModified: string;
  }
  ```

---

## Phase 2: Historical Data Generation (Days 2-3)

### 2.1 Baseline Historical Generator
- [ ] Build `generateBaselineHistory()` function
  - Generate 30 days × 2 intervals (12-hour blocks) = 60 data points per stream
  - Apply realistic patterns:
    - Academic calendar awareness (exam seasons in May and Nov-Dec, holiday breaks)
    - Weekday/weekend variance (30-50% more sessions on weekends)
    - Time-of-day patterns (8am-10pm peak, 11pm-7am minimal)
  - Add slow growth trend (2-5% monthly)
  - Include minor realistic anomalies (5-10% of intervals have small variance spikes)
  - Ensure data relationships are coherent using relationship graph from config
    
- [ ] Generate baseline external events for 30-day period
  - 2-5 events per day (60-150 events total)
  - Distributed realistically: academic events on predictable schedule, marketing events clustered, infrastructure events random
  - 60-70% of events should correlate with stream changes (causal)
  - 30-40% should be "red herrings" (no actual correlation)
  - Store with timestamps, expected impact metadata, and actual impact flag
    
- [ ] Build baseline statistics calculator
  - Calculate for each stream: mean, median, std dev, min, max, percentiles
  - Identify patterns: weekday vs weekend averages, time-of-day patterns, growth trends
  - Detect seasonality and cyclical patterns
  - Output to `baseline-statistics.json` (~50KB)
  
- [ ] Build normalization function
  - Input: raw stream value + baseline statistics
  - Output: normalized 0-100 score where:
    - 50 = baseline mean
    - 0 = mean - 3σ (very low, critical)
    - 30 = mean - 1σ (low, warning)
    - 70 = mean + 1σ (high, warning)
    - 100 = mean + 3σ (very high, critical)
  - Handles outliers gracefully (clamp to 0-100)
  - Returns anomaly flag ('normal', 'warning', 'critical')
  
- [ ] Create pre-generated baseline files
  - `/lib/data/baseline-full-30day.json` (~3-4MB) - Full granular data
  - `/lib/data/baseline-statistics.json` (~50KB) - Statistics for AI context
  - `/lib/data/baseline-events-30day.json` (~20KB) - External events
  - Include generation metadata and checksums
  
- [ ] Build data loader for app startup
  - Load all baseline files into memory
  - Validate data integrity
  - Create efficient in-memory structures (Maps, indexed by timestamp)
  - Pre-calculate frequently accessed aggregations

### 2.2 Dynamic Historical Regeneration
- [ ] Build `regenerateHistoricalWindow()` function
  - Takes: time range (start, end), scenario modifiers, events to inject
  - Regenerates specific time window with modifications applied
  - Maintains coherence with unchanged portions (smooth transitions at boundaries)
  - Returns modified historical dataset
  - Keeps original baseline untouched (non-destructive)
  
- [ ] Build temporal parser for date ranges (optional, for future features)
  - Parse: "last week", "past 3 days", "yesterday", "3 weeks ago"
  - Convert to date ranges relative to current simulation time
  - Handle edge cases: "before X event", "after campaign started"
  - Note: Not needed for pre-defined scenarios, but useful for future features
  
- [ ] Implement historical data state management
  - Keep baseline in memory (immutable reference)
  - Track modified versions separately (versioned)
  - Allow reset to baseline
  - Provide diff view (what changed vs baseline)

---

## Phase 3: Real-time Stream Engine (Days 3-5)

### 3.1 Core Stream Generator
- [ ] Build `StreamGenerator` class
  - Manages event generation for all 50 streams
  - Respects cadence definitions from config
  - Applies baseline metrics as starting point
  - Supports configurable seed for reproducibility (useful for demos)
  - Tracks internal state (pending events, in-flight transactions)
  
- [ ] Implement event scheduling system
  - Separate timers for different cadence groups (high/medium/low frequency)
  - High-frequency: check every 1-10 seconds with randomized jitter
  - Medium-frequency: check every 1-5 minutes with jitter
  - Low-frequency: check every 30-60 minutes with jitter
  - Prevent synchronized bursts (stagger checks across streams)
  
- [ ] Implement relationship enforcement engine
  - Track pending events requiring resolution (e.g., booking.requested awaiting response)
  - Enforce event chains with realistic timing:
    - `booking.requested` → `confirmed/declined/expired` within 2-24 hours
    - `payment.failure` → `support.ticket.created` within 1-6 hours (probabilistic)
    - `session.completed` → `rating.submitted` within 0-48 hours (40-60% probability)
  - Apply cascading effects using cascade rules from config
  - Maintain causal ordering (events must happen in logical sequence)
  
- [ ] Build time-aware variance system
  - Time-of-day modulation (peak 8am-10pm, minimal 11pm-7am)
  - Day-of-week patterns (weekends +30-50% higher for sessions)
  - Academic calendar integration:
    - Exam seasons (May, Nov-Dec): +40-60% demand
    - Summer (Jun-Aug): -20-30% demand
    - Holiday weeks: -50% demand
  - Handle timezone considerations (use UTC internally)

### 3.2 Scenario Modifier System
- [ ] Build `ScenarioModifier` class
  - Applies multipliers/overrides to base stream parameters
  - Handles direct effects (↑ volume) and cascades (↑ volume → ↓ quality)
  - Tracks modifier lifecycle with state machine (active → settling → settled)
  - Supports temporal modifiers (affects historical + real-time)
  - Calculates expected end time based on duration
  
- [ ] Implement modifier application logic
  - For each stream event generation:
    1. Start with baseline parameters
    2. Apply time-of-day/day-of-week modifiers
    3. Apply each active scenario modifier in sequence
    4. Apply external event impacts (if within impact window)
    5. Calculate final probability/rate/value
    6. Generate event with realistic variance
  - Support multiple modifier types:
    - Multiplier (1.5x volume)
    - Additive (+ 20 events/hour)
    - Override (force 95% failure rate)
    - Probabilistic shift (change outcome probabilities)
  
- [ ] Implement settling behavior
  - Define settling curves for each scenario type:
    - **Demand surge**: Gradual linear return over 6-12 hours
    - **Payment outage**: Immediate return when "fixed" + 2-hour backlog processing spike
    - **Quality crisis**: Exponential improvement over days/weeks
  - Scenario definition specifies settlement duration and curve type
  - Settling modifiers slowly reduce multipliers back to 1.0
  - Mark scenario as 'settled' when within 5% of baseline
  
- [ ] Build conflict resolution system
  - When multiple modifiers affect same stream parameter:
    - Apply multiplicatively by default (1.5x * 1.2x = 1.8x)
    - Support override precedence if specified in scenario definition
    - Log warnings for potential conflicts
  - Scenario definitions can specify explicit precedence rules

### 3.3 External Events System
- [ ] Build `ExternalEventsManager` class
  - Maintains timeline of external events
  - Tracks event impact windows (when event affects streams)
  - Correlates events with stream changes for causation analysis
  - Supports event injection by scenarios during simulations
  
- [ ] Implement event impact calculation
  - For each external event, calculate:
    - Which streams are affected (from expectedImpact)
    - When impact starts (event timestamp + delay)
    - How long impact lasts (duration)
    - Magnitude of impact (multiplier or additive change)
  - Track actual vs expected impact for red herrings
  
- [ ] Build event injection API
  - Scenarios can inject events at specific timestamps (past or future)
  - Events can be scheduled (future) or retroactive (past, requires historical regen)
  - Support event templates from library or custom events
  - Validate event parameters and impact specifications
  
- [ ] Implement event-stream correlation tracking
  - For each event, track which streams actually changed
  - Calculate correlation strength (did stream change as expected?)
  - Store results for dashboard AI analysis and causation reasoning
  - Support queries: "which events affected this stream?" and "which streams were affected by this event?"

### 3.4 WebSocket Server
- [ ] Set up WebSocket server in SvelteKit hooks (`src/hooks.server.ts`)
  - Integrate with SvelteKit request handling
  - Handle WebSocket upgrade requests
  - Maintain connection pool with metadata per client
  
- [ ] Implement connection management
  - Track connected clients with unique IDs
  - Store client subscription preferences
  - Handle disconnect/reconnect gracefully (resume from last event)
  - Send catch-up events on connection (events after client's lastTimestamp)
  - If client provides lastTimestamp, send events from buffer after that timestamp
  - If no lastTimestamp, send last 10 events per subscribed stream as initial snapshot
  
- [ ] Create topic-based subscription system
  - Clients can subscribe to:
    - All streams (`*`)
    - Domain-specific (`customer.*`, `tutor.*`, `session.*`, etc.)
    - Frequency-based (`high-frequency`, `medium-frequency`, `low-frequency`)
    - Individual streams by name (`customer.tutor.search`)
    - Anomalies only (`anomalies`)
  - Client sends subscription message after connection
  - Server filters outgoing events based on subscriptions
  
- [ ] Implement efficient broadcasting
  - Don't send events to clients not subscribed
  - Batch events when possible (send array every 100ms for high-frequency)
  - Compression for large payloads (optional)
  - Rate limiting per client to prevent overload
  
- [ ] Build rolling event buffer (for data continuity)
  - Maintain last 60 seconds of events in memory (even when no clients connected)
  - Buffer events by stream for efficient lookup
  - Auto-purge events older than 60 seconds
  - Low memory overhead (~240KB for 60 seconds of 50 streams)
  
- [ ] Add heartbeat and keepalive
  - Server sends ping every 30 seconds
  - Client must respond with pong within 10 seconds
  - Disconnect stale connections after 90 seconds no response
  - Support manual ping from client to test connection

---

## Phase 4: Scenario System & API Endpoints (Days 4-5)

### 4.1 Scenario Definitions Loader
- [ ] Build `ScenarioLoader` class
  - Loads scenario definitions from `config/scenario-definitions.json`
  - Validates scenario structure (required fields, valid stream names, valid multipliers)
  - Provides lookup by scenario ID
  - Returns scenario metadata (name, description, duration)
  
- [ ] Build scenario validation function
  - Validates all stream names exist in stream definitions
  - Validates multipliers are positive numbers
  - Validates external events match event library structure
  - Validates cascade rules are logical
  - Returns validation errors if any

### 4.2 Scenario Application Engine
- [ ] Build `ScenarioEngine` class
  - Applies scenario modifiers to StreamGenerator
  - Injects external events into ExternalEventsManager
  - Tracks active scenarios and their status
  - Handles scenario lifecycle (active → settling → settled)
  - Manages scenario conflicts (only one active at a time)
  
- [ ] Implement scenario application logic
  - Takes scenario ID and applies pre-defined modifiers
  - Applies stream multipliers/overrides to StreamGenerator
  - Injects external events with timestamps
  - Calculates settlement duration based on scenario definition
  - Updates simulation state
  
- [ ] Build settling behavior system
  - Define settling curves for each scenario type:
    - **Demand surge**: Gradual linear return over 6-12 hours
    - **Payment outage**: Immediate return when "fixed" + 2-hour backlog processing spike
    - **Quality crisis**: Exponential improvement over days/weeks
  - Settling modifiers slowly reduce multipliers back to 1.0
  - Mark scenario as 'settled' when within 5% of baseline

### 4.3 API Endpoints
- [ ] Build `POST /api/simulation/scenario` endpoint
  - Accepts: `{ scenarioId: string }`
  - Loads scenario definition by ID
  - Validates scenario exists and is valid
  - Applies scenario to StreamGenerator
  - Injects external events
  - Returns: `{ success: boolean, scenario: ScenarioModifier, events: ExternalEvent[], estimatedDuration: string }`
  
- [ ] Build `POST /api/simulation/reset` endpoint
  - Clears all active modifiers
  - Clears all injected external events
  - Restores original historical baseline
  - Resets simulation time to "now"
  - Returns: `{ success: boolean, message: string }`
  
- [ ] Build `GET /api/simulation/state` endpoint
  - Returns current simulation state:
    - Active modifiers with time remaining
    - Active external events
    - Recent significant anomalies (last 20)
    - Current system time
    - Historical mode (baseline or modified)
  
- [ ] Build `POST /api/simulation/stop` endpoint
  - Manually stops current scenario (triggers settling)
  - Marks all active modifiers as 'settling'
  - Calculates settlement duration
  - Returns: `{ success: boolean, settlingUntil: string }`
  
- [ ] Build `GET /api/simulation/history` endpoint
  - Returns historical data for specified time range
  - Parameters: `start`, `end`, `streams` (optional filter)
  - If `end` is "now" or in the future, generate data up to current time (on-demand)
  - Returns data in format suitable for charting:
    ```json
    {
      "timeRange": { "start": "...", "end": "..." },
      "streams": {
        "customer.tutor.search": [
          { "timestamp": "...", "value": 120, "normalized": 52 },
          ...
        ]
      },
      "events": [
        { "id": "evt_1", "timestamp": "...", "title": "IB Exam Season", ... }
      ]
    }
    ```

- [ ] Build `GET /api/simulation/scenarios` endpoint
  - Returns list of all available scenarios
  - Returns: `{ scenarios: Array<{ id: string, name: string, description: string, duration: string }> }`

---

## Phase 5: Admin Interface (Days 5-6)

### 5.1 Admin UI Routes
- [ ] Create `/admin` page for simulation control
  - Display current simulation state prominently
  - Show active scenarios and events
  - Scenario selection interface with buttons
  - Current state display panel
  
- [ ] Build scenario selection UI
  - Fetch available scenarios from `GET /api/simulation/scenarios`
  - Display scenario cards with name, description, and duration
  - Each card has "Activate" button
  - Visual feedback on click (loading state)
  - Disable buttons when scenario is already active

### 5.2 Simulation Control UI
- [ ] Build scenario button section
  - Pre-defined scenario buttons loaded from API:
    - "Exam Season Surge"
    - "Supply Crisis"
    - "Payment Gateway Outage"
    - "Quality Crisis"
    - "Support Overload"
    - "Churn Pattern"
    - "Recruiting Crisis"
    - "Competitor Disruption"
    - "Normal Operations"
  - Each button calls `POST /api/simulation/scenario` with scenario ID
  - Visual feedback on click (loading state)
  - Show success/error messages
  
- [ ] Build "Reset to Baseline" button
  - Prominent placement (red/warning color)
  - Confirmation dialog before reset
  - Shows what will be cleared (modifiers, events)
  - Executes reset and displays success message
  
- [ ] Build "Stop Current Scenario" button
  - Only enabled when scenario is active
  - Triggers settling behavior
  - Shows estimated time until settled
  
- [ ] Create current state display panel
  - Active scenarios: name, started time, time remaining, status
  - Active external events: title, timestamp, severity, impact
  - Recent modifiers: list of stream names being modified
  - System status: "Running", "Settling", "Baseline"

### 5.3 Advanced Controls (Optional)
- [ ] Build event injection form
  - Manual event creation without AI
  - Fields: type, title, description, timestamp, impact parameters
  - Preview event before injection
  - Validate and inject
  
- [ ] Build stream modifier form
  - Manual stream adjustment without AI
  - Select stream, multiplier/override, duration
  - Preview impact before applying
  - Validate and apply
  
- [ ] Build scenario save/load feature
  - Save current modifiers + events as named scenario
  - Store in browser localStorage
  - Load saved scenarios
  - Export/import as JSON

---

## Phase 6: API Documentation & Integration (Days 6-7)

### 6.1 API Documentation
- [ ] Create `API.md` document
  - List all endpoints with full specifications:
    - Method, path, parameters
    - Request body schema
    - Response schema
    - Example requests/responses
    - Error codes and handling
  - WebSocket protocol documentation:
    - Connection handshake
    - Message formats (subscription, data events, heartbeat)
    - Reconnection strategy
  
- [ ] Document data formats
  - StreamEvent format
  - ExternalEvent format
  - ScenarioModifier format
  - Subscription message format
  - Error response format

### 6.2 Integration Testing Utilities
- [ ] Build test client script
  - Command-line tool to test API endpoints
  - Send simulation prompts and verify responses
  - Inject events and verify stream changes
  - Reset simulation
  
- [ ] Build WebSocket test client
  - Connect and subscribe to streams
  - Log received events
  - Verify event format and timing
  - Test reconnection handling
  
- [ ] Create mock data inspector tool
  - Web UI to browse generated data
  - View stream timelines
  - View external events
  - View baseline statistics
  - Verify data relationships

---

## Phase 7: Testing & Refinement (Days 7-8)

### 7.1 Scenario System Testing
- [ ] Test all pre-defined scenarios
  - Activate each scenario and verify modifiers are applied correctly
  - Verify external events are injected with correct timestamps
  - Test scenario conflicts (cannot activate new scenario while one is active)
  - Test reset functionality clears all scenarios
  - Test stop functionality triggers settling
  
- [ ] Validate scenario application
  - Ensure modifiers are correctly applied to streams
  - Verify cascading effects are logical
  - Check settling behavior works as expected
  - Test event injection timing
  - Verify scenario metadata (duration, description) is correct
  
- [ ] Test scenario lifecycle
  - Active → settling → settled transitions
  - Manual stop functionality
  - Reset to baseline
  - Multiple scenarios in sequence (not concurrent)

### 7.2 Data Quality Validation
- [ ] Verify stream relationships
  - Booking flow: requested → confirmed/declined/expired (sum matches)
  - Payment failures trigger support tickets (correlation exists)
  - Session completions lead to ratings (probabilistic, ~40-60%)
  - Supply/demand balance feels realistic
  - No orphaned events (events without parent events)
  
- [ ] Check temporal patterns
  - Academic calendar effects visible (exam seasons spike demand)
  - Weekday/weekend variance present (~30-50% more on weekends)
  - Time-of-day patterns correct (peak 8am-10pm, low 11pm-7am)
  - Growth trends smooth and realistic (2-5% monthly)
  
- [ ] Validate baseline metrics
  - Confirmation rates match config (~70-80%)
  - No-show rates match config (~2-5% students, ~1-2% tutors)
  - Volume targets achieved (tens of thousands students, 1-8 per tutor, ~3 sessions/tutor/day)
  - Normalized values distribute reasonably (most between 30-70)

### 7.3 External Events Testing
- [ ] Test event-stream correlation
  - Events with expected impact actually cause stream changes
  - Red herring events don't cause stream changes
  - Event impact timing is correct (starts at event time + delay)
  - Event impact magnitude matches expected impact
  
- [ ] Test event injection
  - Scenario-injected events appear in timeline
  - Retroactive events trigger historical regeneration
  - Future events are scheduled correctly
  - Event metadata is preserved (injectedByAI flag set to false for scenario-injected events, links, etc.)
  
- [ ] Validate causation analysis
  - System correctly identifies correlated events
  - Correlation scores are reasonable
  - Can query: "which events affected stream X?"
  - Can query: "which streams were affected by event Y?"

### 7.4 Performance Testing
- [ ] Load test WebSocket server
  - Simulate 10-20 concurrent connections
  - Verify no lag or dropped events
  - Check memory usage over time (should be stable)
  - Test reconnection handling under load
  
- [ ] Measure scenario activation performance
  - Scenario activation: <500ms
  - Historical data loading: <1 second
  - WebSocket event broadcasting: <100ms latency
  
- [ ] Optimize data structures
  - Baseline data loads quickly (<1 second)
  - Stream generation has no noticeable lag
  - Historical queries return quickly (<500ms)

### 7.5 Edge Cases & Error Handling
- [ ] Test error scenarios
  - Invalid scenario ID (show user-friendly error)
  - Scenario already active (prevent activation, show message)
  - WebSocket connection drops (client reconnects automatically)
  - Invalid scenario definition (validate on load, show error)
  - Conflicting modifiers (apply conflict resolution, log warning)
  
- [ ] Verify graceful degradation
  - If WebSocket fails, events continue generating (just not broadcast)
  - If scenario definition invalid, show error but simulation continues
  - Clear error messages to users with suggested actions
  
- [ ] Test boundary conditions
  - Very long scenarios (24+ hours)
  - Extreme modifiers (10x multipliers)
  - Rapid scenario changes (new scenario every minute)
  - Historical regeneration of full 30 days
  - Many simultaneous subscriptions (50+ streams)

---

## Phase 8: Documentation & Deployment (Days 8-9)

### 8.1 Code Documentation
- [ ] Add JSDoc comments to all major functions/classes
  - Include parameter descriptions
  - Include return value descriptions
  - Include usage examples where helpful
  
- [ ] Document configuration files
  - Add inline comments explaining each field
  - Provide examples of valid values
  - Explain impact of changing values
  
- [ ] Create README.md
  - Project overview and architecture
  - Setup instructions (local development)
  - Environment variables needed
  - Running the simulator
  - API endpoint summary (link to API.md)
  
- [ ] Create SIMULATOR.md guide
  - How the simulator works (high-level)
  - How to create new scenarios
  - How to add new stream types
  - How to modify baseline data
  - Troubleshooting guide

### 8.2 Deployment Setup
- [ ] Configure Railway deployment
  - Set up environment variables (port, NODE_ENV, etc.)
  - Configure build command: `npm run build`
  - Configure start command: `npm run preview` (or Railway's default)
  - Set up custom domain (optional)
  - Configure resource limits (memory, CPU)
  
- [ ] Set up deployment monitoring
  - Railway logs integration
  - Error tracking (console errors visible in logs)
  - Uptime monitoring (Railway built-in)
  
- [ ] Test deployed application
  - Verify WebSockets work on Railway (they do)
  - Test all API endpoints on production URL
  - Run through demo scenarios on prod
  - Check performance under load (simulate multiple clients)

### 8.3 Demo Preparation
- [ ] Create demo script
  - 5-10 example scenarios to showcase
  - Expected outcomes for each
  - Recovery/reset steps between scenarios
  - Talking points for explaining what's happening
  
- [ ] Prepare demo data
  - Pre-generate interesting baseline history
  - Test all pre-defined scenario buttons
  - Verify event correlations are clear
  - Ensure anomalies are visually obvious
  
- [ ] Create demo video/walkthrough (optional)
  - Show admin UI interaction
  - Show scenario execution
  - Show data impact on streams
  - Explain scenario orchestration benefits

### 8.4 Handoff Materials
- [ ] Create system architecture diagram
  - Scenario Engine ↔ Stream Engine ↔ WebSocket Server
  - External Events Manager
  - Data flow visualization
  - Component relationships
  
- [ ] Document extension points
  - How to add new streams (step-by-step)
  - How to add new scenarios (templates and examples)
  - How to modify baseline metrics (safe edits)
  - How to customize event types
  
- [ ] Create troubleshooting guide
  - Common issues and solutions
  - How to reset system
  - How to debug scenario application
  - Performance optimization tips
  - WebSocket connection issues

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

- **Days 1-2**: Foundation, setup, configuration files
- **Days 2-3**: Historical data generation
- **Days 3-5**: Core stream engine and real-time generation with external events
- **Days 4-5**: Scenario system and API endpoints
- **Days 5-6**: Admin UI for simulation control
- **Days 6-7**: API documentation and integration utilities
- **Days 7-8**: Testing and refinement
- **Days 8-9**: Documentation and deployment

**Total Estimated Time**: 9 days for full feature set

**MVP Timeline**: 6-7 days (Phases 1-5 only)

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
