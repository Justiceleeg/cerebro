# Change: Slice 11 - Relationship Enforcement

## Why
Currently, stream events are generated independently. To create realistic marketplace behavior, events must follow realistic chains (e.g., `booking.requested` → `booking.confirmed`/`declined`/`expired`) and enforce cascading effects (e.g., payment failure → support ticket → potential churn).

## What Changes
- Implement relationship enforcement engine
- Track pending events requiring resolution (e.g., `booking.requested` awaiting response)
- Enforce event chains with realistic timing
- Apply cascading effects using cascade rules from config
- Ensure event outcomes match probability matrices from stream relationships config

## Impact
- Affected specs: Modifies capability `stream-generation`
- Affected code:
  - New `/lib/streams/relationship-engine.ts` (relationship enforcement)
  - Modified `/lib/streams/stream-generator.ts` (integrate relationship engine)
  - Modified `/lib/streams/generate-history.ts` (apply relationships to historical data)
- Dependencies: Uses `config/stream-relationships.json` for relationship definitions

