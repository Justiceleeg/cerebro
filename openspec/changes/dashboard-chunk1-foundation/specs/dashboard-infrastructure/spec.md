## ADDED Requirements

### Requirement: Dashboard Project Foundation
The dashboard SHALL have a proper project foundation with frontend dependencies, project structure, and routing infrastructure.

#### Scenario: Project dependencies installed
- **WHEN** the project is set up
- **THEN** all required frontend dependencies are installed:
  - Apache ECharts (`echarts@^5.5.0`) for charting
  - AI SDK (`ai@^5.0.0`, `@ai-sdk/openai@^2.0.64`) for Dashboard AI Contextualizer
  - shadcn-svelte UI component library
  - Lucide icons for UI elements

#### Scenario: Project structure created
- **WHEN** the project is set up
- **THEN** the following directory structure exists:
  - `/routes/dashboard` for main dashboard route
  - `/lib/components/dashboard` for dashboard-specific components
  - `/lib/components/ui` for shadcn-svelte UI components
  - `/lib/stores` for Svelte runes stores
  - `/lib/ai-contextualizer` for Dashboard AI logic
  - `/lib/utils` for utility functions

#### Scenario: Dashboard route accessible
- **WHEN** the application is running
- **THEN** the `/dashboard` route is accessible and loads without errors
- **AND** the `/admin` route already exists and is accessible (no work needed)

#### Scenario: Application page structure
- **WHEN** the application is set up
- **THEN** the application has two main functional pages:
  - `/admin` - Admin UI for changing/applying scenarios (already exists)
  - `/dashboard` - Main operations dashboard (new route to be created)
- **AND** the root `/` route may redirect to `/dashboard` or provide a simple landing page (optional)

### Requirement: Dashboard State Management
The dashboard SHALL use Svelte runes stores for reactive state management of WebSocket connections, stream data, UI state, chart state, and recommendations.

#### Scenario: WebSocket connection state managed
- **WHEN** the dashboard connects to WebSocket
- **THEN** the WebSocket connection store tracks connection state (connected/disconnected/reconnecting), subscriptions, and handles reconnection logic

#### Scenario: Stream data aggregated
- **WHEN** stream events are received
- **THEN** the stream data store aggregates events by stream name, stores historical data, and handles real-time updates with normalized value calculations

#### Scenario: UI state tracked
- **WHEN** user interacts with filters or selections
- **THEN** the UI state store tracks filter state (status, domain, event types), selection state (selected streams, events), and time range state

#### Scenario: Chart state managed
- **WHEN** user interacts with chart
- **THEN** the chart state store tracks zoom level, pan position, selected streams for display, and event markers visibility

#### Scenario: Recommendations state tracked
- **WHEN** recommendations are generated or acted upon
- **THEN** the recommendations store tracks active and resolved recommendations, priority filtering, and action status

### Requirement: Dashboard Type Definitions
The dashboard SHALL have TypeScript type definitions matching backend types and dashboard-specific types for type-safe development.

#### Scenario: Backend types imported
- **WHEN** types are defined
- **THEN** all backend types are imported and re-exported from `src/lib/types/core.ts` matching `docs/API_CONTRACT.md`:
  - `StreamEvent`, `ExternalEvent`, `ScenarioModifier`, `StreamBaseline`, `SimulationState`, `StreamModification`, `CascadeRule`

#### Scenario: Dashboard-specific types defined
- **WHEN** types are defined
- **THEN** dashboard-specific types are created:
  - `HeatmapCell` for heatmap cell data
  - `Recommendation` for AI-generated recommendations
  - `ChartSeries` for chart data series
  - `ChartDataPoint` for individual chart points
  - `WebSocketMessage` for WebSocket message types
  - `FilterState` for UI filter state
  - `TimeRange` for time range selection

#### Scenario: Types exported
- **WHEN** types are defined
- **THEN** all types are exported from `lib/types/dashboard.ts` and available via `lib/types/index.ts`

### Requirement: Minimal Dashboard Page
The dashboard SHALL have a minimal dashboard page with basic layout and placeholder sections.

#### Scenario: Dashboard page loads
- **WHEN** user navigates to `/dashboard`
- **THEN** the dashboard page loads with:
  - Basic layout with header
  - Placeholder sections for chart, heatmap, events, recommendations
  - Hardcoded connection status display showing "Connected"
  - Basic styling with shadcn-svelte components

#### Scenario: Dashboard layout structure
- **WHEN** the dashboard page is rendered
- **THEN** the layout includes:
  - Header section with connection status
  - Main content area with placeholder sections for all major dashboard components
  - Proper spacing and layout structure

#### Scenario: Application has two main pages
- **WHEN** the application is running
- **THEN** the application has two functional pages:
  - `/admin` - Admin UI for scenario control (already exists, no work needed)
  - `/dashboard` - Main operations dashboard (new route to be created)
- **AND** both pages are accessible and functional

