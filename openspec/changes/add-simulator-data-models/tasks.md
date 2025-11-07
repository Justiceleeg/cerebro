## 1. Data Models & Types
- [ ] 1.1 Define TypeScript interfaces for all 50 stream event types
  - [ ] Reference `docs/STREAM_DEFINITIONS.md` for complete schemas
  - [ ] Create interfaces for Customer (Student) streams (10)
  - [ ] Create interfaces for Tutor (Supplier) streams (10)
  - [ ] Create interfaces for Session (Transaction) streams (12)
  - [ ] Create interfaces for Support & Operations streams (8)
  - [ ] Create interfaces for Marketing streams (5)
  - [ ] Create interfaces for System Health streams (5)

- [ ] 1.2 Create core data type definitions
  - [ ] Define `StreamEvent` interface (stream, timestamp, data, normalizedValue?, anomalyFlag?)
  - [ ] Define `ExternalEvent` interface (id, timestamp, type, title, description, severity, expectedImpact, icon, externalLink?, injectedByAI?)
  - [ ] Define `ScenarioModifier` interface (id, type, description, startTime, duration?, affectedStreams, cascadeEffects, relatedEvents, status, settlementDuration?)
  - [ ] Define `BaselineStatistics` interface (calculatedFrom, streams)
  - [ ] Define `StreamBaseline` interface (name, mean, median, stdDev, min, max, percentiles, patterns)
  - [ ] Define `SimulationState` interface (baselineState, activeModifiers, activeEvents, historicalMode, currentSimulationTime, lastModified)

- [ ] 1.3 Organize types in TypeScript files
  - [ ] Create `lib/types/stream-events.ts` for stream event interfaces
  - [ ] Create `lib/types/core.ts` for core data types
  - [ ] Export all types from appropriate index files

