# Change: Add Simulator Data Models and Types

## Why
The simulator requires TypeScript interfaces and data models for all stream events, external events, scenario modifiers, baseline statistics, and simulation state. These types ensure type safety and provide clear contracts for data structures.

## What Changes
- Define TypeScript interfaces for all 50 stream event types (reference `docs/STREAM_DEFINITIONS.md`)
- Create core data type definitions: `StreamEvent`, `ExternalEvent`, `ScenarioModifier`, `BaselineStatistics`, `StreamBaseline`, `SimulationState`
- Organize types in appropriate TypeScript files

## Impact
- Affected specs: New capability `simulator-data-models`
- Affected code: New TypeScript type definition files in `/lib/types/` or similar
- Dependencies: References `docs/STREAM_DEFINITIONS.md` for stream schemas

