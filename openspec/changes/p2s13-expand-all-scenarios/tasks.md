## 1. Implementation
- [ ] 1.1 Add scenario listing endpoint
  - Create `/routes/api/simulation/scenarios/+server.ts`
  - Return list of all available scenarios from configuration
  - Include scenario metadata (id, name, description)
  - Test: Request scenarios list, verify all scenarios are returned

- [ ] 1.2 Implement scenario conflict resolution
  - Update `/lib/scenarios/scenario-engine.ts`
  - Prevent activating new scenario when one is already active
  - Return error response if scenario activation conflicts with active scenario
  - Test: Activate scenario, attempt to activate another, verify error

- [ ] 1.3 Test all pre-defined scenarios
  - Activate each scenario type and verify it works
  - Verify scenario modifiers are applied correctly
  - Verify external events are injected correctly
  - Test: Activate each scenario via Admin UI, verify behavior

- [ ] 1.4 Validate scenario definitions
  - Ensure all scenarios have required fields
  - Validate scenario structure on load
  - Return clear error messages for invalid scenarios
  - Test: Load scenarios, verify validation works

