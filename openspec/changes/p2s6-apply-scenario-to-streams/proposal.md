# Change: Slice 6 - Apply Scenario to Stream Generation

## Why
Active scenarios need to actually modify stream generation behavior. This slice integrates the `ScenarioEngine` with `StreamGenerator` so that active scenario modifiers and external events affect the generated stream values.

## What Changes
- Integrate `ScenarioEngine` with `StreamGenerator`
- Apply active scenario modifiers (multipliers/overrides) to stream generation
- Apply external event impacts to stream generation
- Verify that activated scenarios modify generated event values

## Impact
- Affected specs: Modifies capability `stream-generation`
- Affected code:
  - Modified `/lib/streams/stream-generator.ts` (integrate with ScenarioEngine)
  - Modified `/lib/scenarios/scenario-engine.ts` (expose modifiers for generation)
- Dependencies: Uses `ScenarioEngine` from Slice 4 and `StreamGenerator` from Slice 2

