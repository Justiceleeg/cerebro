## 1. Implementation
- [ ] 1.1 Implement settling behavior
  - Update `/lib/scenarios/scenario-engine.ts`
  - Add lifecycle states: 'active', 'settling', 'settled'
  - Implement settling transition logic
  - Gradually reduce multipliers back to 1.0 during settling phase
  - Support linear and exponential settlement types from scenario definitions
  - Test: Activate scenario, wait for settling, verify multipliers decrease

- [ ] 1.2 Build reset endpoint
  - Create `/routes/api/simulation/reset/+server.ts`
  - Clear all active modifiers
  - Clear all injected external events
  - Reset simulation state to baseline
  - Return success response
  - Test: Activate scenario, reset, verify state is baseline

- [ ] 1.3 Build stop endpoint
  - Create `/routes/api/simulation/stop/+server.ts`
  - Manually stop current scenario (if active)
  - Trigger settling phase
  - Return success response with scenario state
  - Test: Activate scenario, stop it, verify settling starts

- [ ] 1.4 Update state endpoint
  - Modify `/routes/api/simulation/state/+server.ts`
  - Include scenario lifecycle state (active/settling/settled)
  - Include settlement progress if in settling phase
  - Test: Verify state reflects lifecycle correctly

