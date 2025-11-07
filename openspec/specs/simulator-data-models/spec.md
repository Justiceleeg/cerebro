# simulator-data-models Specification

## Purpose
TBD - created by archiving change add-simulator-data-models. Update Purpose after archive.
## Requirements
### Requirement: Stream Event Type Definitions
The simulator SHALL have TypeScript interfaces for all 50 stream event types.

#### Scenario: Stream event types defined
- **WHEN** TypeScript types are defined
- **THEN** interfaces exist for all 50 stream event types (reference `docs/STREAM_DEFINITIONS.md`)
- **AND** Customer (Student) stream interfaces are defined (10 streams)
- **AND** Tutor (Supplier) stream interfaces are defined (10 streams)
- **AND** Session (Transaction) stream interfaces are defined (12 streams)
- **AND** Support & Operations stream interfaces are defined (8 streams)
- **AND** Marketing stream interfaces are defined (5 streams)
- **AND** System Health stream interfaces are defined (5 streams)

### Requirement: Core Data Type Definitions
The simulator SHALL have TypeScript interfaces for core data structures used throughout the system.

#### Scenario: StreamEvent interface exists
- **WHEN** core types are defined
- **THEN** `StreamEvent` interface exists with fields: stream (string), timestamp (string), data (Record<string, any>), normalizedValue? (number), anomalyFlag? ('normal' | 'warning' | 'critical')

#### Scenario: ExternalEvent interface exists
- **WHEN** core types are defined
- **THEN** `ExternalEvent` interface exists with fields: id (string), timestamp (string), type ('marketing' | 'product' | 'infrastructure' | 'academic' | 'competitive' | 'operational'), title (string), description (string), severity ('info' | 'warning' | 'critical'), expectedImpact (object with streams, direction, magnitude, duration), icon (string), externalLink? (string), injectedByAI? (boolean)

#### Scenario: ScenarioModifier interface exists
- **WHEN** core types are defined
- **THEN** `ScenarioModifier` interface exists with fields: id (string), type (string), description (string), startTime (string), duration? (string), affectedStreams (Record<string, StreamModification>), cascadeEffects (CascadeRule[]), relatedEvents (string[]), status ('active' | 'settling' | 'settled'), settlementDuration? (string)

#### Scenario: BaselineStatistics interface exists
- **WHEN** core types are defined
- **THEN** `BaselineStatistics` interface exists with fields: calculatedFrom (string), streams (Record<string, StreamBaseline>)

#### Scenario: StreamBaseline interface exists
- **WHEN** core types are defined
- **THEN** `StreamBaseline` interface exists with fields: name (string), mean (number), median (number), stdDev (number), min (number), max (number), percentiles (object with p25, p50, p75, p90, p95), patterns (object with weekdayAvg, weekendAvg, trend, seasonality)

#### Scenario: SimulationState interface exists
- **WHEN** core types are defined
- **THEN** `SimulationState` interface exists with fields: baselineState ('normal' | 'custom'), activeModifiers (ScenarioModifier[]), activeEvents (ExternalEvent[]), historicalMode ('baseline' | 'modified'), currentSimulationTime (string), lastModified (string)

### Requirement: Type Organization
The simulator SHALL organize TypeScript types in appropriate files.

#### Scenario: Types are organized
- **WHEN** types are defined
- **THEN** stream event interfaces are in `lib/types/stream-events.ts`
- **AND** core data types are in `lib/types/core.ts`
- **AND** all types are exported from appropriate index files

