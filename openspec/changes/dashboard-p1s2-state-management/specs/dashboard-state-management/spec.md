## ADDED Requirements

### Requirement: WebSocket Connection State Management
The dashboard SHALL manage WebSocket connection state using Svelte runes stores.

#### Scenario: Connection state tracking
- **WHEN** the dashboard initializes
- **THEN** a WebSocket connection store tracks connection state (connected/disconnected/reconnecting)
- **AND** the store provides reactive state for UI components

#### Scenario: Subscription management
- **WHEN** the dashboard subscribes to streams
- **THEN** the WebSocket store manages subscription topics
- **AND** subscriptions can be added or removed reactively

#### Scenario: Auto-reconnection
- **WHEN** the WebSocket connection is lost
- **THEN** the store automatically attempts reconnection
- **AND** the connection state updates to "reconnecting" during attempts

### Requirement: Stream Data State Management
The dashboard SHALL aggregate and manage stream data using Svelte runes stores.

#### Scenario: Stream events aggregation
- **WHEN** stream events are received via WebSocket
- **THEN** events are aggregated by stream name in a reactive store
- **AND** historical data is merged with real-time updates

#### Scenario: Normalized value storage
- **WHEN** stream events include normalized values
- **THEN** normalized values are stored and accessible for charting
- **AND** values are reactive and update UI components automatically

### Requirement: UI State Management
The dashboard SHALL manage UI filters, selections, and time range using Svelte runes stores.

#### Scenario: Filter state management
- **WHEN** users apply filters (status, domain, event types)
- **THEN** filter state is stored in a reactive store
- **AND** UI components react to filter changes

#### Scenario: Selection state management
- **WHEN** users select streams or events
- **THEN** selection state is stored in a reactive store
- **AND** selections persist across component updates

#### Scenario: Time range management
- **WHEN** users change the time range (24h, 7d, 30d, custom)
- **THEN** time range state is stored in a reactive store
- **AND** historical data is reloaded based on new time range

### Requirement: Chart State Management
The dashboard SHALL manage chart zoom, pan, and display state using Svelte runes stores.

#### Scenario: Zoom state management
- **WHEN** users zoom the chart
- **THEN** zoom level is stored in a reactive store
- **AND** chart updates to reflect zoom level

#### Scenario: Pan state management
- **WHEN** users pan the chart
- **THEN** pan position is stored in a reactive store
- **AND** chart updates to reflect pan position

#### Scenario: Stream selection for chart
- **WHEN** users select streams to display on chart
- **THEN** selected streams are stored in a reactive store
- **AND** chart updates to show selected streams

### Requirement: Recommendations State Management
The dashboard SHALL manage AI-generated recommendations using Svelte runes stores.

#### Scenario: Recommendations storage
- **WHEN** AI generates recommendations
- **THEN** recommendations are stored in a reactive store
- **AND** recommendations are categorized by priority (critical/warning/normal)

#### Scenario: Recommendation actions
- **WHEN** users take action on recommendations
- **THEN** recommendation status updates in the store
- **AND** recommendations move to "resolved" state reactively

