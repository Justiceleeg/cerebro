## 1. Implementation
- [x] 1.1 Build regeneration function
  - Create `regenerateHistoricalWindow()` in `/lib/streams/generate-history.ts`
  - Accept parameters: time range, scenario modifiers, external events
  - Regenerate historical data for the specified time window
  - Apply scenario modifiers to generated values
  - Apply external event impacts to generated values
  - Test: Call function with scenario modifiers, verify modifications are applied

- [x] 1.2 Integrate with historical endpoint
  - Update `/routes/api/simulation/history/+server.ts`
  - Check for active scenario when generating historical data
  - If scenario is active, use `regenerateHistoricalWindow()` with active modifiers
  - If no scenario is active, use baseline generation
  - Test: Activate scenario, request historical data, verify modifications are applied

- [x] 1.3 Maintain data coherence
  - Ensure regenerated data maintains temporal patterns
  - Preserve relationships between streams in regenerated data
  - Maintain baseline statistics for normalization
  - Test: Regenerate historical window, verify patterns are preserved

- [x] 1.4 Support time range filtering
  - Ensure regeneration works with any time range within the 30-day baseline
  - Handle edge cases (partial days, boundaries)
  - Test: Request various time ranges, verify regeneration works correctly

