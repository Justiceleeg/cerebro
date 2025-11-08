## 1. Implementation
- [ ] 1.1 Build correlation tracker
  - Create `/lib/correlations/correlation-tracker.ts`
  - Track active external events
  - Track stream value changes when events are active
  - Calculate correlation strength between events and streams
  - Store correlation data in memory
  - Test: Activate scenario with events, verify correlations are tracked

- [ ] 1.2 Integrate with scenario engine
  - Update `/lib/scenarios/scenario-engine.ts`
  - When external events are injected, register them with correlation tracker
  - When stream values change, record the change with active events
  - Test: Activate scenario, generate events, verify correlations are recorded

- [ ] 1.3 Build correlation query endpoint
  - Create `/routes/api/simulation/correlations/+server.ts`
  - Accept optional parameters: eventId, stream, time range
  - Return correlation data matching the query
  - Include correlation strength and statistical significance
  - Test: Query correlations, verify data is returned correctly

- [ ] 1.4 Calculate correlation strength
  - Implement correlation calculation (e.g., Pearson correlation coefficient)
  - Calculate statistical significance
  - Store correlation metadata (strength, direction, confidence)
  - Test: Verify correlation calculations are accurate

- [ ] 1.5 Store correlation data
  - Maintain in-memory store of correlations
  - Structure: event → streams → correlation data
  - Support querying by event, stream, or time range
  - Test: Store and retrieve correlations, verify data structure

