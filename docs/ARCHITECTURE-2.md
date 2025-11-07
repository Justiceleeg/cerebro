# System Architecture: AI Mock Simulator + Operations Dashboard

## Overview

This document describes the complete system architecture for the pre-defined scenario marketplace simulation and operations dashboard. The system consists of two major components that share a single SvelteKit application but serve different purposes. The simulator uses pre-defined scenarios (no AI), while the dashboard uses AI for analysis and recommendations.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SvelteKit Application                         │
│                      (Deployed on Railway.app)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐│
│  │   AI MOCK SIMULATOR          │  │   OPERATIONS DASHBOARD        ││
│  │   (Backend/Data Generation)  │  │   (Frontend/Visualization)    ││
│  │                              │  │                                ││
│  │  • Stream Generator          │  │  • Time-Series Chart          ││
│  │  • External Events Manager   │  │  • Interactive Heatmap        ││
│  │  • Pre-defined Scenario System│  │  • Events Timeline            ││
│  │  • WebSocket Server          │←─┼─→• WebSocket Client          ││
│  │  • API Endpoints             │  │  • Dashboard AI Contextualizer││
│  │  • Historical Data           │  │  • Recommendations Panel      ││
│  │                              │  │                                ││
│  │  Admin UI: /admin            │  │  Main UI: /dashboard          ││
│  └──────────────────────────────┘  └──────────────────────────────┘│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                                          │
                                                          ↓
                                                   OpenAI API
                                          (Dashboard AI Contextualizer)
                                            - Analyzes data patterns
                                            - Generates recommendations
                                            - Explains causation
```

---

## Component Breakdown

### 1. AI Mock Simulator (Backend)

**Purpose**: Generate realistic marketplace data streams, respond to scenario activation requests, and stream data to clients.

**Key Components**:

#### 1.1 Stream Generator
- Generates events for 50 marketplace streams
- Respects cadence definitions (high/medium/low frequency)
- Enforces stream relationships (booking chains, cascading effects)
- Applies time-aware variance (weekday/weekend, academic calendar)
- Outputs normalized data (0-100 scale based on baseline)

#### 1.2 External Events Manager
- Maintains timeline of marketplace events
- Tracks event impact on streams
- Correlates events with stream changes
- Supports event injection (past and future)
- Manages both causal and non-causal events (red herrings)

#### 1.3 Pre-defined Scenario System
- Loads scenario definitions from config files
- Applies pre-defined modifiers to streams
- Injects external events from scenario definitions
- Manages scenario lifecycle (active → settling → settled)
- Can modify historical data (temporal awareness)
- No AI required - scenarios are pre-defined JSON configurations

#### 1.4 WebSocket Server
- Broadcasts stream events to connected clients
- Supports topic-based subscriptions
- Handles client connection management
- Sends batched updates for high-frequency streams

#### 1.5 Historical Data Storage
- Pre-generated 30-day baseline (3MB)
- Calculated baseline statistics (50KB)
- External events timeline (20KB)
- In-memory with fast lookups

#### 1.6 API Endpoints
- `POST /api/simulation/scenario` - Activate scenario by ID
- `GET /api/simulation/scenarios` - Get list of available scenarios
- `POST /api/simulation/reset` - Reset to baseline
- `GET /api/simulation/state` - Get current state
- `POST /api/simulation/stop` - Stop active scenario
- `GET /api/simulation/history` - Fetch historical data

---

### 2. Operations Dashboard (Frontend)

**Purpose**: Visualize data streams, display AI-generated insights, and provide interactive analysis tools.

**Key Components**:

#### 2.1 Normalized Time-Series Chart (Apache ECharts)
- Displays selected streams on 0-100 normalized scale
- Shows 7-day rolling window (with 30-day zoom option)
- External event markers (vertical lines)
- Baseline reference and variance bands
- Real-time updates with smooth animations

#### 2.2 Interactive Heatmap
- 50 cells (one per stream) organized by domain
- Color-coded by variance from baseline
- Pulsing animation for critical anomalies
- Click to add/remove streams from chart
- Filterable by status and domain

#### 2.3 External Events Timeline
- Chronological list of marketplace events
- Clickable to plot on chart
- Filterable by type and impact
- Links to external sources (blog posts, articles)
- Shows correlation with stream changes

#### 2.4 Dashboard AI Contextualizer
- Separate OpenAI-powered analysis system
- Analyzes patterns across streams
- Generates proactive recommendations
- Explains causation (which events caused which changes)
- Different from Simulator AI (analysis vs orchestration)

#### 2.5 Recommendations Panel
- Prioritized alerts (Critical/Warning/Normal)
- Actionable recommendations with confidence scores
- "Take action" workflow (fake execution)
- Resolved recommendations (greyed out at bottom)
- Links to affected streams and related events

#### 2.6 WebSocket Client
- Connects to simulator WebSocket server
- Subscribes to relevant stream topics
- Handles reconnection automatically
- Aggregates data for visualization

---

## Data Flow

### Real-Time Data Flow

```
Stream Generator → WebSocket Server → WebSocket Client → Dashboard UI
                        ↓
                  (broadcasts to all
                   connected clients)
```

**Steps**:
1. Stream Generator creates new event based on cadence and modifiers
2. Event is normalized (0-100 scale)
3. WebSocket Server broadcasts event to subscribed clients
4. Dashboard WebSocket Client receives event
5. Event is aggregated into appropriate data structures
6. UI components reactively update (chart, heatmap, etc.)

### Historical Data Flow

```
User loads dashboard → API call → Historical Data → Dashboard UI
```

**Steps**:
1. Dashboard component mounts
2. Calls `GET /api/simulation/history?start=X&end=Y`
3. Backend returns 7 days of historical data + events
4. Dashboard populates initial state
5. WebSocket connection established for real-time updates

### Simulation Control Flow

```
Admin selects scenario → Scenario Engine → Pre-defined Modifiers → Stream Generator
                              ↓                    ↓
                        External Events    Historical Regen (if temporal)
```

**Steps**:
1. Admin selects scenario from button/card (e.g., "exam-season-surge")
2. Scenario Engine loads pre-defined scenario by ID from config
3. Scenario Engine applies pre-defined modifiers + events to inject
4. Modifiers applied to Stream Generator
5. External events injected into timeline
6. If temporal ("last week"), historical data regenerated
7. Streams start reflecting scenario changes
8. Dashboard sees real-time impact

### Recommendation Generation Flow

```
Anomaly detected → Dashboard AI Context → OpenAI → Recommendations → UI
        ↓
  Recent streams
  Recent events
  Baseline stats
  Correlations
```

**Steps**:
1. Dashboard detects anomaly (stream >2σ from baseline)
2. Prepares AI context with relevant data
3. Calls Dashboard AI Contextualizer (OpenAI)
4. AI analyzes patterns and causation
5. AI generates recommendations with actions
6. Recommendations appear in panel
7. User can "take action" (fake execution, moves to resolved)

---

## Scenario System (Backend)

### Pre-defined Scenario System

**Purpose**: Apply pre-defined scenarios to data generation

**How it works**:
- Scenarios are defined in `config/scenario-definitions.json`
- Each scenario includes:
  - Stream modifiers (multipliers, overrides)
  - External events to inject
  - Cascade rules
  - Settlement behavior
- Admin selects scenario by ID from UI
- Scenario Engine applies modifiers and injects events
- No AI required - scenarios are pre-defined JSON configurations

**Example Scenario**:
```json
{
  "id": "exam-season-surge",
  "name": "Exam Season Surge",
  "description": "Simulates increased demand during exam season",
  "duration": "3 hours",
  "modifiers": {
    "customer.tutor.search": { "multiplier": 1.6 },
    "session.booking.requested": { "multiplier": 1.5 }
  },
  "events": [
    {
      "type": "academic",
      "title": "IB Exam Season begins",
      "timestamp": "now"
    }
  ]
}
```

---

### Dashboard AI Contextualizer (Frontend)

**Purpose**: Analyze data and provide actionable insights

**System Prompt**:
```
You are an AI analyzing marketplace operations data to provide insights.
You identify patterns, explain causation, and recommend actions.
You reference specific data points and external events in your analysis.
```

**Context Provided**:
- Current anomalies (high-variance streams)
- Recent external events (last 7 days)
- Stream baseline statistics (30-day)
- Recent stream values (last 7 days)
- Stream correlation data

**Output**:
- Recommendations (JSON array)
  - Priority, title, description
  - Impact, cause, confidence
  - Recommended actions
  - Related streams and events

**Example Interaction**:
```
Trigger: customer.booking.expired spike detected (3.2σ above baseline)
AI Context: {
  "anomalies": ["booking.expired: +180%", "tutor.availability: -35%"],
  "events": ["IB Exam Season (3 days ago)", "Blog Viral (2 hours ago)"],
  ...
}
AI Response: {
  "priority": "critical",
  "title": "Math Tutor Supply Crisis",
  "description": "Active Math tutors dropped 40% while searches increased 60%...",
  "cause": "IB Exam season driving demand, but supply hasn't caught up...",
  "actions": [
    { "label": "Emergency recruiting", "impact": "5-day lead time", ... }
  ],
  "confidence": 94
}
```

---

## Data Models

### StreamEvent (Real-Time)

```typescript
interface StreamEvent {
  stream: string;                    // e.g., "customer.tutor.search"
  timestamp: string;                 // ISO 8601
  data: Record<string, any>;         // Stream-specific payload
  normalizedValue?: number;          // 0-100 scale
  anomalyFlag?: 'normal' | 'warning' | 'critical';
}
```

**Example**:
```json
{
  "stream": "customer.tutor.search",
  "timestamp": "2025-01-15T14:30:00Z",
  "data": {
    "user_id": "student_12345",
    "subject": "calculus",
    "availability_start": "2025-01-16T14:00:00Z",
    "availability_end": "2025-01-16T18:00:00Z"
  },
  "normalizedValue": 85,
  "anomalyFlag": "critical"
}
```

---

### ExternalEvent

```typescript
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
```

**Example**:
```json
{
  "id": "evt_001",
  "timestamp": "2025-01-16T10:00:00Z",
  "type": "academic",
  "title": "IB Exam Season begins",
  "description": "International Baccalaureate exam period starts...",
  "severity": "warning",
  "expectedImpact": {
    "streams": ["customer.tutor.search", "session.booking.requested"],
    "direction": "increase",
    "magnitude": "high",
    "duration": "3 weeks"
  },
  "icon": "📅",
  "externalLink": "https://ibo.org/exam-schedule",
  "injectedByAI": false
}
```

---

### Recommendation (Dashboard AI Output)

```typescript
interface Recommendation {
  id: string;
  priority: 'critical' | 'warning' | 'normal';
  title: string;
  description: string;
  impact: string;
  cause: string;
  actions: RecommendedAction[];
  affectedStreams: string[];
  relatedEvents: string[];
  confidence: number;
  timestamp: string;
  status: 'active' | 'resolved';
  resolvedAt?: string;
}

interface RecommendedAction {
  id: string;
  label: string;
  description: string;
  expectedImpact: string;
  timeToEffect: string;
}
```

**Example**:
```json
{
  "id": "rec_001",
  "priority": "critical",
  "title": "Math Tutor Supply Crisis",
  "description": "Active Math tutors dropped 40% (15 → 9) while Math searches increased 60%.",
  "impact": "50+ students unable to book in next 48h. Est. revenue loss: $12K/week.",
  "cause": "IB Exam season + Viral blog post (STEM-focused) creating unexpected surge.",
  "actions": [
    {
      "id": "act_001",
      "label": "Emergency tutor recruiting",
      "description": "Allocate $2K budget, expedite onboarding (5 days instead of 3 weeks)",
      "expectedImpact": "6-8 new Math tutors active within 1 week",
      "timeToEffect": "5-7 days"
    }
  ],
  "affectedStreams": ["customer.tutor.search", "session.booking.expired", "tutor.availability.set"],
  "relatedEvents": ["evt_001", "evt_005"],
  "confidence": 94,
  "timestamp": "2025-01-16T14:35:00Z",
  "status": "active"
}
```

---

## API Contracts

### WebSocket Protocol

**Connection**:
```
Client → Server: WebSocket upgrade request
Server → Client: Upgrade accepted
Client → Server: { "type": "subscribe", "topics": ["customer.*", "session.*"] }
Server → Client: { "type": "subscribed", "topics": [...] }
```

**Data Stream**:
```
Server → Client: { "type": "event", "data": <StreamEvent> }
Server → Client: { "type": "batch", "events": [<StreamEvent>, ...] }
```

**Heartbeat**:
```
Server → Client: { "type": "ping" }
Client → Server: { "type": "pong" }
```

---

### REST API Endpoints

#### POST /api/simulation/scenario

**Request**:
```json
{
  "scenarioId": "exam-season-surge"
}
```

**Response**:
```json
{
  "success": true,
  "scenario": {
    "id": "mod_001",
    "type": "exam-season-surge",
    "description": "Exam season demand increase",
    "startTime": "2025-01-16T14:30:00Z",
    "duration": "3 hours",
    "affectedStreams": {
      "customer.tutor.search": { "multiplier": 1.6 },
      "session.booking.requested": { "multiplier": 1.5 }
    },
    "status": "active",
    "settlementDuration": "6 hours"
  },
  "events": [
    {
      "id": "evt_exam_season_ib",
      "type": "academic",
      "title": "IB Exam Season begins",
      "timestamp": "2025-01-16T14:30:00Z",
      "injectedByAI": false
    }
  ],
  "estimatedDuration": "3 hours"
}
```

#### GET /api/simulation/scenarios

**Request**: No body

**Response**:
```json
{
  "scenarios": [
    {
      "id": "exam-season-surge",
      "name": "Exam Season Surge",
      "description": "Simulates increased demand during exam season",
      "duration": "3 hours"
    },
    {
      "id": "supply-crisis",
      "name": "Supply Crisis",
      "description": "Simulates tutor supply shortage",
      "duration": "2 hours"
    }
  ]
}
```

---

#### GET /api/simulation/history

**Request**:
```
GET /api/simulation/history?start=2025-01-09T00:00:00Z&end=2025-01-16T00:00:00Z&streams=customer.tutor.search,session.booking.confirmed
```

**Response**:
```json
{
  "timeRange": {
    "start": "2025-01-09T00:00:00Z",
    "end": "2025-01-16T00:00:00Z"
  },
  "streams": {
    "customer.tutor.search": [
      { "timestamp": "2025-01-09T00:00:00Z", "value": 118, "normalized": 48 },
      { "timestamp": "2025-01-09T12:00:00Z", "value": 122, "normalized": 51 },
      ...
    ],
    "session.booking.confirmed": [...]
  },
  "events": [
    {
      "id": "evt_001",
      "timestamp": "2025-01-15T10:00:00Z",
      "title": "IB Exam Season",
      "type": "academic"
    }
  ],
  "baselineStats": {
    "customer.tutor.search": {
      "mean": 120,
      "stdDev": 15,
      ...
    }
  }
}
```

---

## Deployment Architecture

### Single SvelteKit Application on Railway

```
Railway Container
├── SvelteKit Server (Node.js)
│   ├── API Routes (/api/*)
│   │   ├── /api/simulation/* (simulator control)
│   │   └── /api/dashboard/* (dashboard utilities)
│   ├── WebSocket Handler (via hooks.server.ts)
│   ├── Admin UI (/admin)
│   └── Dashboard UI (/dashboard)
├── Static Assets (bundled)
└── Data Files
    ├── baseline-full-30day.json (3MB)
    ├── baseline-statistics.json (50KB)
    └── baseline-events-30day.json (20KB)
```

**Environment Variables**:
- `OPENAI_API_KEY` - For Dashboard AI only (simulator uses pre-defined scenarios)
- `PORT` - Railway auto-assigns
- `NODE_ENV` - production

**Resource Requirements**:
- Memory: 1-2GB (mostly for in-memory historical data)
- CPU: 1 core (sufficient for real-time generation)
- WebSocket support: Native on Railway

---

## Performance Considerations

### Simulator Backend

**Stream Generation**:
- 50 streams with varying cadences
- High frequency: 5-10 events/second
- Medium frequency: 1-5 events/minute
- Low frequency: 1-2 events/hour
- Total: ~20-30 events/second peak load

**WebSocket Broadcasting**:
- Support 10-20 concurrent connections
- Batch high-frequency events (send every 100ms)
- Use topic filtering to reduce unnecessary sends

**Memory Usage**:
- 30-day historical data: ~3MB
- In-memory structures: ~10-20MB
- Per-connection overhead: ~1MB
- Total: ~50MB baseline + 1MB per connection

### Dashboard Frontend

**Chart Rendering**:
- ECharts handles 1000s of data points efficiently
- 7-day view: ~700 points per stream × 5 streams = 3500 points (fast)
- Smooth animations with requestAnimationFrame

**State Management**:
- Svelte runes provide fine-grained reactivity
- Only re-render components with changed dependencies
- Debounce high-frequency updates (100-200ms)

**Network Usage**:
- WebSocket: ~10-50KB/second during active scenarios
- Initial historical load: ~500KB-1MB
- Reasonable for desktop users

---

## Security Considerations

### Current (Demo) Implementation

**No Authentication**: Admin UI (`/admin`) and API endpoints have no auth.

**Why**: This is a demo/mockgenerated data system. No real user data or sensitive operations.

**For Production**: Would need:
- Admin authentication (JWT, OAuth, etc.)
- API key authentication for simulation control
- Rate limiting on API endpoints
- WebSocket connection limits
- CORS configuration

### Data Privacy

**No PII**: All generated data is fake. No real user information.

**OpenAI API**: Context sent to OpenAI contains only synthetic data patterns, no real user data.

---

## Monitoring & Debugging

### Logs

**Backend Logs**:
- Stream generation events (debug level)
- Scenario activation events
- WebSocket connections/disconnections
- API endpoint calls
- Errors and warnings

**Frontend Logs**:
- WebSocket connection status
- Dashboard AI Context requests/responses
- User interactions (chart selections, recommendations)
- Errors and warnings

**Railway Logs**:
- Stdout/stderr from Node.js process
- Deployment logs
- Resource usage metrics

### Debugging Tools

**Stream Inspector** (built-in utility):
- View raw stream data
- Verify relationships and timing
- Check normalization calculations

**WebSocket Test Client** (CLI tool):
- Connect and subscribe to streams
- Log received events
- Verify event format

**API Test Client** (CLI tool):
- Activate scenarios by ID
- Test all endpoints
- Verify responses

---

## Extension Points

### Adding New Streams

1. Define stream in `STREAM_DEFINITIONS.md`
2. Add to `config/baseline-metrics.json`
3. Add relationships to `config/stream-relationships.json`
4. Regenerate baseline historical data
5. Update Stream Generator to handle new stream
6. Update Dashboard heatmap layout

### Adding New Scenarios

1. Define in `config/scenario-definitions.json`
2. Specify affected streams and multipliers
3. Add quick action button in Admin UI (optional)
4. Scenario Engine will handle automatically

### Adding New Event Types

1. Define in `config/external-events-library.json`
2. Specify expected impact on streams
3. External Events Manager handles automatically
4. Dashboard timeline will display automatically

### Custom Scenarios

**Simulator**: Add new scenario definitions to `config/scenario-definitions.json` (no AI required)

**Dashboard AI**: Update system prompt in Dashboard AI Contextualizer to change analysis style

---

## Technology Choices Rationale

### SvelteKit
- Modern, performant framework
- Excellent for real-time UIs (fine-grained reactivity)
- SSR + SPA capabilities
- Easy API routes and WebSocket integration

### Apache ECharts
- Powerful time-series charting
- Excellent performance with large datasets
- Rich interaction features (zoom, pan, markers)
- Professional appearance

### Railway.app
- Native WebSocket support
- Easy deployment from Git
- Affordable for demos
- Good DX (developer experience)

### OpenAI (for Dashboard AI only)
- State-of-the-art language understanding
- Reliable API
- Good JSON output formatting
- Cost-effective for demo usage
- Simulator uses pre-defined scenarios (no AI required)

### Svelte Runes
- Modern reactive state management
- Better than stores for complex apps
- Fine-grained reactivity (performance)
- Clean syntax

---

## Future Enhancements

### Phase 2 Features (Beyond MVP)

1. **Multi-Scenario Support**: Run multiple scenarios concurrently
2. **Scenario Library**: Save and replay interesting scenarios
3. **Time Travel**: Scrub through historical simulations
4. **Custom Dashboards**: User-configurable layouts
5. **Alert Rules**: User-defined alert thresholds
6. **Data Export**: Export historical data as CSV
7. **Collaboration**: Multiple users in same session
8. **Mobile Support**: Responsive design for tablets/phones

### AI Enhancements

1. **Predictive Recommendations**: "In 2 hours, you'll have a supply shortage"
2. **Root Cause Analysis**: Multi-step causal chains
3. **What-If Scenarios**: "What if we had 20% more tutors?"
4. **Learning from Feedback**: Track which recommendations are helpful
5. **Natural Language Queries**: Chat interface for ad-hoc analysis

---

## Conclusion

This architecture provides a robust foundation for demonstrating AI-powered operations monitoring with:

✅ Realistic data generation (50 interconnected streams)
✅ Pre-defined scenario orchestration (Scenario Engine)
✅ Intelligent analysis and recommendations (Dashboard AI)
✅ Real-time visualization (normalized charts, interactive heatmap)
✅ Causation analysis (external events correlated with data changes)
✅ Extensible design (easy to add streams, scenarios, features)

The hybrid approach (Pre-defined scenarios + Dashboard AI) provides reliable scenario orchestration while maintaining intelligent analysis capabilities. The system is both impressive to demo and educational about marketplace dynamics.
