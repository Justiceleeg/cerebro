# API Contract Specification

**Purpose**: Define the contract between frontend and backend to enable parallel development.

**Status**: Contract - DO NOT BREAK without coordination

**Last Updated**: 2025-01-16

---

## Overview

This document defines the complete API contract between the AI Mock Simulator (backend) and Operations Dashboard (frontend). Both teams can develop independently once this contract is agreed upon.

---

## WebSocket Protocol

### Connection

**Endpoint**: `ws://localhost:5173/ws` (dev) or `wss://your-domain.railway.app/ws` (prod)

**Connection Flow**:
```
1. Client → Server: WebSocket upgrade request
2. Server → Client: Upgrade accepted (HTTP 101)
3. Client → Server: Subscribe message
4. Server → Client: Subscription confirmation
```

### Message Types

#### Client → Server Messages

**Subscribe**:
```typescript
{
  type: "subscribe",
  topics: string[],  // e.g., ["customer.*", "session.*", "customer.tutor.search"]
  lastTimestamp?: string  // Optional: ISO 8601 timestamp for catch-up events
}
```

**Unsubscribe**:
```typescript
{
  type: "unsubscribe",
  topics: string[]
}
```

**Ping** (heartbeat response):
```typescript
{
  type: "pong"
}
```

#### Server → Client Messages

**Event** (single stream event):
```typescript
{
  type: "event",
  data: StreamEvent
}
```

**Batch** (multiple events):
```typescript
{
  type: "batch",
  events: StreamEvent[]
}
```

**Ping** (heartbeat):
```typescript
{
  type: "ping"
}
```

**Subscribed** (confirmation):
```typescript
{
  type: "subscribed",
  topics: string[]
}
```

**Catchup** (events after lastTimestamp):
```typescript
{
  type: "catchup",
  events: StreamEvent[],
  catchUpEndTime: string  // ISO 8601 timestamp when catch-up ends
}
```

**Error**:
```typescript
{
  type: "error",
  code: string,
  message: string
}
```

### Topic Patterns

- `*` - All streams
- `customer.*` - All customer streams
- `tutor.*` - All tutor streams
- `session.*` - All session streams
- `support.*` - All support streams
- `marketing.*` - All marketing streams
- `system.*` - All system streams
- `customer.tutor.search` - Specific stream
- `anomalies` - Only events with `anomalyFlag: 'warning' | 'critical'`

### Heartbeat

- Server sends `ping` every 30 seconds
- Client must respond with `pong` within 10 seconds
- Server disconnects if no `pong` received within 90 seconds

---

## REST API Endpoints

### Base URL

- Development: `http://localhost:5173/api`
- Production: `https://your-domain.railway.app/api`

### Authentication

**Current**: None (demo only)  
**Future**: TBD (API key or JWT)

---

### 1. GET /api/simulation/state

Get current simulation state.

**Request**: No body

**Response**:
```typescript
{
  baselineState: "normal" | "custom",
  activeModifiers: ScenarioModifier[],
  activeEvents: ExternalEvent[],
  historicalMode: "baseline" | "modified",
  currentSimulationTime: string,  // ISO 8601
  lastModified: string  // ISO 8601
}
```

**Example**:
```json
{
  "baselineState": "normal",
  "activeModifiers": [],
  "activeEvents": [],
  "historicalMode": "baseline",
  "currentSimulationTime": "2025-01-16T14:30:00Z",
  "lastModified": "2025-01-16T14:00:00Z"
}
```

---

### 2. GET /api/simulation/history

Get historical data for specified time range.

**Query Parameters**:
- `start` (required): ISO 8601 timestamp
- `end` (required): ISO 8601 timestamp
- `streams` (optional): Comma-separated stream names (e.g., `customer.tutor.search,session.booking.confirmed`)

**Request**:
```
GET /api/simulation/history?start=2025-01-09T00:00:00Z&end=2025-01-16T00:00:00Z&streams=customer.tutor.search
```

**Response**:
```typescript
{
  timeRange: {
    start: string,  // ISO 8601
    end: string     // ISO 8601
  },
  streams: {
    [streamName: string]: Array<{
      timestamp: string,  // ISO 8601
      value: number,     // Raw value
      normalized: number // 0-100 scale
    }>
  },
  events: ExternalEvent[],
  baselineStats?: {
    [streamName: string]: StreamBaseline
  }
}
```

**Example**:
```json
{
  "timeRange": {
    "start": "2025-01-09T00:00:00Z",
    "end": "2025-01-16T00:00:00Z"
  },
  "streams": {
    "customer.tutor.search": [
      {
        "timestamp": "2025-01-09T00:00:00Z",
        "value": 118,
        "normalized": 48
      },
      {
        "timestamp": "2025-01-09T12:00:00Z",
        "value": 122,
        "normalized": 51
      }
    ]
  },
  "events": [
    {
      "id": "evt_001",
      "timestamp": "2025-01-15T10:00:00Z",
      "type": "academic",
      "title": "IB Exam Season begins",
      "description": "International Baccalaureate exam period starts",
      "severity": "warning",
      "expectedImpact": {
        "streams": ["customer.tutor.search", "session.booking.requested"],
        "direction": "increase",
        "magnitude": "high",
        "duration": "3 weeks"
      },
      "icon": "📅",
      "externalLink": "https://ibo.org/exam-schedule"
    }
  ],
  "baselineStats": {
    "customer.tutor.search": {
      "name": "customer.tutor.search",
      "mean": 120,
      "median": 118,
      "stdDev": 15,
      "min": 85,
      "max": 180,
      "percentiles": {
        "p25": 110,
        "p50": 118,
        "p75": 130,
        "p90": 145,
        "p95": 160
      },
      "patterns": {
        "weekdayAvg": 115,
        "weekendAvg": 135,
        "trend": "increasing",
        "seasonality": "exam_season"
      }
    }
  }
}
```

---

### 3. POST /api/simulation/scenario

Activate a pre-defined scenario.

**Request**:
```typescript
{
  scenarioId: string
}
```

**Response**:
```typescript
{
  success: boolean,
  scenario: ScenarioModifier,
  events: ExternalEvent[],
  estimatedDuration: string
}
```

**Example Request**:
```json
{
  "scenarioId": "exam-season-surge"
}
```

**Example Response**:
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
      "customer.tutor.search": {
        "multiplier": 1.6
      },
      "session.booking.requested": {
        "multiplier": 1.5
      }
    },
    "cascadeEffects": [],
    "relatedEvents": ["evt_exam_season_ib"],
    "status": "active",
    "settlementDuration": "6 hours"
  },
  "events": [
    {
      "id": "evt_exam_season_ib",
      "timestamp": "2025-01-16T14:30:00Z",
      "type": "academic",
      "title": "IB Exam Season begins",
      "description": "International Baccalaureate exam period starts, driving increased demand for tutoring",
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
  ],
  "estimatedDuration": "3 hours"
}
```

**Error Response**:
```json
{
  "error": {
    "code": "SCENARIO_NOT_FOUND",
    "message": "Scenario not found",
    "details": "Scenario 'invalid-scenario' does not exist"
  }
}
```

**Error Codes**:
- `SCENARIO_NOT_FOUND` - Scenario ID doesn't exist
- `SCENARIO_ALREADY_ACTIVE` - Another scenario is already active
- `INVALID_SCENARIO` - Scenario definition is invalid

---

### 4. POST /api/simulation/reset

Reset simulation to baseline.

**Request**: No body

**Response**:
```typescript
{
  success: boolean,
  message: string
}
```

**Example**:
```json
{
  "success": true,
  "message": "Simulation reset to baseline. All modifiers cleared, historical data restored."
}
```

---

### 5. POST /api/simulation/stop

Stop current scenario (triggers settling).

**Request**: No body

**Response**:
```typescript
{
  success: boolean,
  settlingUntil: string  // ISO 8601
}
```

**Example**:
```json
{
  "success": true,
  "settlingUntil": "2025-01-16T20:30:00Z"
}
```

---

## Data Types

### StreamEvent

```typescript
interface StreamEvent {
  stream: string;                    // e.g., "customer.tutor.search"
  timestamp: string;                  // ISO 8601
  data: Record<string, any>;        // Stream-specific payload
  normalizedValue?: number;           // 0-100 scale
  anomalyFlag?: "normal" | "warning" | "critical";
}
```

**Example**:
```json
{
  "stream": "customer.tutor.search",
  "timestamp": "2025-01-16T14:30:00Z",
  "data": {
    "user_id": "student_12345",
    "subject": "calculus",
    "availability_start": "2025-01-17T14:00:00Z",
    "availability_end": "2025-01-17T18:00:00Z"
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
  timestamp: string;                 // ISO 8601
  type: "marketing" | "product" | "infrastructure" | "academic" | "competitive" | "operational";
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  expectedImpact: {
    streams: string[];
    direction: "increase" | "decrease" | "mixed";
    magnitude: "low" | "medium" | "high";
    duration: string;
  };
  icon: string;
  externalLink?: string;
  injectedByAI?: boolean;
}
```

---

### ScenarioModifier

```typescript
interface ScenarioModifier {
  id: string;
  type: string;
  description: string;
  startTime: string;                 // ISO 8601
  duration?: string;
  affectedStreams: Record<string, StreamModification>;
  cascadeEffects: CascadeRule[];
  relatedEvents: string[];
  status: "active" | "settling" | "settled";
  settlementDuration?: string;
}

interface StreamModification {
  multiplier?: number;
  additive?: number;
  override?: number;
  probabilityShift?: Record<string, number>;
}
```

---

### StreamBaseline

```typescript
interface StreamBaseline {
  name: string;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentiles: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
  };
  patterns: {
    weekdayAvg: number;
    weekendAvg: number;
    trend: string;
    seasonality: string;
  };
}
```

---

## Error Handling

### HTTP Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid request (missing params, invalid format)
- `404 Not Found` - Endpoint or resource not found
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable (e.g., AI API down)

### Error Response Format

```typescript
{
  error: {
    code: string;
    message: string;
    details?: string;
  }
}
```

**Error Codes**:
- `SCENARIO_NOT_FOUND` - Scenario ID doesn't exist
- `SCENARIO_ALREADY_ACTIVE` - Cannot start new scenario while one is active
- `INVALID_SCENARIO` - Scenario definition is invalid
- `INVALID_TIME_RANGE` - Invalid start/end timestamps
- `STREAM_NOT_FOUND` - Requested stream doesn't exist
- `INTERNAL_ERROR` - Unexpected server error

---

## Rate Limiting

**Current**: None (demo only)  
**Future**: TBD (e.g., 100 requests/minute per IP)

---

## Versioning

**Current**: v1 (no version prefix)  
**Future**: `/api/v1/...` when breaking changes needed

---

### 6. GET /api/simulation/scenarios

Get list of all available scenarios.

**Request**: No body

**Response**:
```typescript
{
  scenarios: Array<{
    id: string,
    name: string,
    description: string,
    duration: string
  }>
}
```

**Example**:
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

## Testing

### Mock Data for Frontend Development

Frontend can use mock data matching these contracts:

**Mock WebSocket Server**:
- Use `mock-socket` or similar library
- Emit events matching `StreamEvent` format
- Support subscription/unsubscription

**Mock API Server**:
- Use `msw` (Mock Service Worker) or similar
- Return responses matching contract
- Handle all endpoints defined above

---

## Notes

1. **WebSocket Connection**: Frontend should handle reconnection automatically
2. **Time Format**: All timestamps use ISO 8601 format (UTC)
3. **Normalized Values**: 0-100 scale where 50 = baseline mean
4. **Stream Names**: Use dot notation (e.g., `customer.tutor.search`)
5. **Topic Patterns**: Support wildcards (`*`, `customer.*`)
6. **Batch Events**: Server may batch high-frequency events (send every 100ms)

---

## Change Log

- **2025-01-16**: Initial contract definition

---

**Contract Status**: ✅ **READY FOR PARALLEL DEVELOPMENT**

