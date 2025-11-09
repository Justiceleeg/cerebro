## ADDED Requirements

### Requirement: Backend Type Definitions
The dashboard SHALL import and re-export backend type definitions matching `docs/API_CONTRACT.md`.

#### Scenario: Backend types imported
- **WHEN** the dashboard uses backend types
- **THEN** types are imported from `$lib/types/core` (not redefined)
- **AND** all types match `docs/API_CONTRACT.md` exactly

#### Scenario: StreamEvent type available
- **WHEN** the dashboard receives stream events
- **THEN** `StreamEvent` interface is imported from `$lib/types/core`
- **AND** matches `docs/API_CONTRACT.md` definition exactly
- **AND** includes: `stream`, `timestamp`, `data`, `normalizedValue?`, `anomalyFlag?`

#### Scenario: ExternalEvent type available
- **WHEN** the dashboard displays external events
- **THEN** `ExternalEvent` interface is imported from `$lib/types/core`
- **AND** matches `docs/API_CONTRACT.md` definition exactly
- **AND** includes: `id`, `timestamp`, `type`, `title`, `description`, `severity`, `expectedImpact`, `icon`, `externalLink?`, `injectedByAI?`

#### Scenario: ScenarioModifier type available
- **WHEN** the dashboard displays scenario state
- **THEN** `ScenarioModifier` interface is imported from `$lib/types/core`
- **AND** matches `docs/API_CONTRACT.md` definition exactly
- **AND** includes: `id`, `type`, `description`, `startTime`, `duration?`, `affectedStreams`, `cascadeEffects`, `relatedEvents`, `status`, `settlementDuration?`

#### Scenario: StreamBaseline type available
- **WHEN** the dashboard uses baseline statistics
- **THEN** `StreamBaseline` interface is imported from `$lib/types/core`
- **AND** matches `docs/API_CONTRACT.md` definition exactly
- **AND** includes: `name`, `mean`, `median`, `stdDev`, `min`, `max`, `percentiles`, `patterns`

#### Scenario: SimulationState type available
- **WHEN** the dashboard fetches simulation state
- **THEN** `SimulationState` interface is imported from `$lib/types/core`
- **AND** matches `docs/API_CONTRACT.md` definition exactly
- **AND** includes: `baselineState`, `activeModifiers`, `activeEvents`, `historicalMode`, `currentSimulationTime`, `lastModified`

#### Scenario: Supporting types available
- **WHEN** the dashboard uses scenario-related types
- **THEN** `StreamModification` and `CascadeRule` interfaces are imported from `$lib/types/core`
- **AND** match `docs/API_CONTRACT.md` definitions exactly

### Requirement: Dashboard-Specific Type Definitions
The dashboard SHALL have TypeScript type definitions for dashboard-specific data structures.

#### Scenario: HeatmapCell type definition
- **WHEN** the dashboard displays heatmap cells
- **THEN** `HeatmapCell` interface includes: `stream`, `normalizedValue`, `status`, `domain`
- **AND** status is typed as: `'normal' | 'warning' | 'critical'`

#### Scenario: Recommendation type definition
- **WHEN** the dashboard displays AI recommendations
- **THEN** `Recommendation` interface includes: `id`, `priority`, `title`, `description`, `actions`, `confidence`, `status`
- **AND** priority is typed as: `'critical' | 'warning' | 'normal'`

#### Scenario: ChartSeries type definition
- **WHEN** the dashboard displays chart series
- **THEN** `ChartSeries` interface includes: `stream`, `dataPoints`, `color`
- **AND** dataPoints is an array of `ChartDataPoint`

#### Scenario: ChartDataPoint type definition
- **WHEN** the dashboard displays chart data points
- **THEN** `ChartDataPoint` interface includes: `timestamp`, `value`, `normalized`
- **AND** timestamp is an ISO 8601 string

#### Scenario: WebSocketMessage type definition
- **WHEN** the dashboard sends or receives WebSocket messages
- **THEN** `WebSocketMessage` union type includes all message types from `docs/API_CONTRACT.md`:
  - Client → Server: `subscribe`, `unsubscribe`, `pong`
  - Server → Client: `event`, `batch`, `ping`, `subscribed`, `catchup`, `error`
- **AND** message types match the WebSocket protocol contract exactly

#### Scenario: FilterState type definition
- **WHEN** the dashboard manages UI filters
- **THEN** `FilterState` interface includes: `status`, `domain`, `eventTypes`, `timeRange`
- **AND** all filter properties are optional and typed correctly

#### Scenario: TimeRange type definition
- **WHEN** the dashboard manages time range selection
- **THEN** `TimeRange` interface includes: `start`, `end`, `preset`
- **AND** preset is typed as: `'24h' | '7d' | '30d' | 'custom'`

### Requirement: Type Exports
The dashboard SHALL export all type definitions for use across the application.

#### Scenario: Type exports available
- **WHEN** dashboard components import types
- **THEN** all types are exported from `lib/types/dashboard.ts`
- **AND** types are re-exported from `lib/types/index.ts` for convenience

