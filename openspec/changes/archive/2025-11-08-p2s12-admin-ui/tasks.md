## 1. Implementation
- [x] 1.1 Create admin page
  - Create `/routes/admin/+page.svelte`
  - Display current simulation state
  - Show active scenarios and events
  - Display baseline status
  - Test: Navigate to `/admin`, verify state displays

- [x] 1.2 Build scenario selection UI
  - Fetch available scenarios from `GET /api/simulation/scenarios`
  - Display scenario cards with name, description, duration
  - Add "Activate" button for each scenario
  - Call `POST /api/simulation/scenario` on click
  - Show loading state during activation
  - Show success/error messages
  - Test: Click activate button, verify scenario activates

- [x] 1.3 Build "Reset to Baseline" button
  - Add button to admin page
  - Call `POST /api/simulation/reset` on click
  - Show confirmation dialog before reset
  - Show loading state during reset
  - Show success message after reset
  - Test: Click reset, verify simulation resets

- [x] 1.4 Build "Stop Current Scenario" button
  - Add button to admin page
  - Only enabled when scenario is active
  - Call `POST /api/simulation/stop` on click
  - Show loading state during stop
  - Show success message after stop
  - Test: Activate scenario, stop it, verify settling starts

- [x] 1.5 Create scenarios list endpoint
  - Create `/routes/api/simulation/scenarios/+server.ts`
  - Return list of available scenarios from scenario definitions
  - Include scenario metadata (id, name, description, duration)
  - Test: Call endpoint, verify scenarios are returned

