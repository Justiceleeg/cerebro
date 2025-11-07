## 1. Implementation
- [x] 1.1 Integrate `ScenarioEngine` with `StreamGenerator`
  - Modify `/lib/streams/stream-generator.ts`
  - When generating events, check for active scenario modifiers
  - Apply multipliers/overrides to stream generation
- [x] 1.2 Apply external event impacts
  - Check if external events are active
  - Apply event impacts to stream generation
- [x] 1.3 Test scenario application
  - Activate scenario via API
  - Generate events via API or WebSocket
  - Verify values are modified according to scenario modifiers
  - Test: Activate scenario, generate events, verify impacts

