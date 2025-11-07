# Change: Add Simulator Configuration Files

## Why
The simulator requires configuration files that define baseline metrics, stream relationships, cadences, scenario definitions, and external events library. These files serve as the source of truth for data generation behavior.

## What Changes
- Create `config/baseline-metrics.json` with baseline rates for all 50 streams
- Create `config/stream-relationships.json` documenting interconnections and event chains
- Create `config/stream-cadences.json` defining update frequencies per stream
- Create `config/scenario-definitions.json` with pre-defined scenario configurations
- Create `config/external-events-library.json` with external event types and templates

## Impact
- Affected specs: New capability `simulator-configuration`
- Affected code: New configuration files in `/lib/config/`
- Dependencies: References `docs/STREAM_DEFINITIONS.md` and `docs/SCENARIO_DEFINITIONS.md`


