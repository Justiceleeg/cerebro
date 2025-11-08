# Change: Slice 12 - Admin UI

## Why
Currently, scenario activation and simulation control are only available via API. To provide a user-friendly interface for demo purposes, we need a basic admin UI that allows users to view simulation state, activate scenarios, and reset the simulation.

## What Changes
- Create `/admin` page with simulation state display
- Build scenario selection UI with scenario cards and "Activate" buttons
- Build "Reset to Baseline" button
- Build "Stop Current Scenario" button
- Fetch available scenarios from API
- Call simulation control endpoints on user actions

## Impact
- Affected specs: New capability `admin-interface`
- Affected code:
  - New `/routes/admin/+page.svelte` (admin UI page)
  - New `/routes/api/simulation/scenarios/+server.ts` (list available scenarios endpoint)
  - Modified existing simulation endpoints (ensure they work with UI)
- Dependencies: Uses simulation API endpoints and scenario definitions

