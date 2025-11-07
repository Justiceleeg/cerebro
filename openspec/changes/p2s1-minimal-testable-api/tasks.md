## 1. Implementation
- [ ] 1.1 Create `GET /api/simulation/state` endpoint
  - Create `/routes/api/simulation/state/+server.ts`
  - Return hardcoded `SimulationState` object
  - Use types from `$lib/types`
- [ ] 1.2 Test endpoint
  - Test: `curl http://localhost:5173/api/simulation/state`
  - Verify: Response matches `SimulationState` interface
  - Verify: Types are enforced (TypeScript compilation succeeds)

