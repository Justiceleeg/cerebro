# Change: Dashboard Phase 1.3 - Type Definitions

## Why
The Operations Dashboard requires TypeScript type definitions matching backend types and dashboard-specific types for type-safe development. This ensures consistency between frontend and backend and enables proper type checking throughout the dashboard.

## What Changes
- Import and re-export backend type definitions from `src/lib/types/core.ts` (matching `docs/API_CONTRACT.md`):
  - `StreamEvent` - Real-time stream data (from API contract)
  - `ExternalEvent` - Marketplace events (from API contract)
  - `ScenarioModifier` - Active scenario configuration (from API contract)
  - `StreamBaseline` - Statistical baseline data (from API contract)
  - `SimulationState` - Current simulation state (from API contract)
  - `StreamModification` - Stream modification configuration (from API contract)
  - `CascadeRule` - Cascade rule for stream relationships (from API contract)
- Define dashboard-specific types (not in backend):
  - `HeatmapCell` - Heatmap cell data structure
  - `Recommendation` - AI-generated recommendations
  - `ChartSeries` - Chart data series structure
  - `ChartDataPoint` - Individual chart data point
  - `WebSocketMessage` - WebSocket message types (matching API contract WebSocket protocol)
  - `FilterState` - UI filter state
  - `TimeRange` - Time range selection

## Impact
- Affected specs: New capability `dashboard-types`
- Affected code: 
  - `/lib/types/dashboard.ts` (new file for dashboard-specific types)
  - `/lib/types/index.ts` (re-export backend types and dashboard types)
- References: `docs/API_CONTRACT.md` - Source of truth for backend type definitions
- Reuses: Existing backend types from `src/lib/types/core.ts` (StreamEvent, ExternalEvent, ScenarioModifier, StreamBaseline, SimulationState, StreamModification, CascadeRule)

