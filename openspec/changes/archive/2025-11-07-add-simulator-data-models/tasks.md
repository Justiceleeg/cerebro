## 1. Data Models & Types
- [x] 1.1 Define TypeScript interfaces for all 50 stream event types
  - [x] Reference `docs/STREAM_DEFINITIONS.md` for complete schemas
  - [x] Create interfaces for Customer (Student) streams (10)
  - [x] Create interfaces for Tutor (Supplier) streams (10)
  - [x] Create interfaces for Session (Transaction) streams (12)
  - [x] Create interfaces for Support & Operations streams (8)
  - [x] Create interfaces for Marketing streams (5)
  - [x] Create interfaces for System Health streams (5)

- [x] 1.2 Create core data type definitions
  - [x] Define `StreamEvent` interface (stream, timestamp, data, normalizedValue?, anomalyFlag?)
  - [x] Define `ExternalEvent` interface (id, timestamp, type, title, description, severity, expectedImpact, icon, externalLink?, injectedByAI?)
  - [x] Define `ScenarioModifier` interface (id, type, description, startTime, duration?, affectedStreams, cascadeEffects, relatedEvents, status, settlementDuration?)
  - [x] Define `BaselineStatistics` interface (calculatedFrom, streams)
  - [x] Define `StreamBaseline` interface (name, mean, median, stdDev, min, max, percentiles, patterns)
  - [x] Define `SimulationState` interface (baselineState, activeModifiers, activeEvents, historicalMode, currentSimulationTime, lastModified)

- [x] 1.3 Organize types in TypeScript files
  - [x] Create `lib/types/stream-events.ts` for stream event interfaces
  - [x] Create `lib/types/core.ts` for core data types
  - [x] Export all types from appropriate index files

