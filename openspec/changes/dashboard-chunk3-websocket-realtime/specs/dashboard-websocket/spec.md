# Dashboard WebSocket Specification

## Purpose
Define the WebSocket connection and real-time data infrastructure for the Operations Dashboard.

## ADDED Requirements

### Requirement: WebSocket Connection Manager
The dashboard SHALL maintain a persistent WebSocket connection to the simulator backend for real-time data streaming.

#### Scenario: WebSocket connection established
- **WHEN** the dashboard page loads
- **THEN** a WebSocket connection is established to the backend WebSocket endpoint
- **AND** the connection state in the websocket store is updated to 'connected'
- **AND** the connection status is displayed in the dashboard UI

#### Scenario: WebSocket auto-reconnect
- **WHEN** the WebSocket connection is lost
- **THEN** the connection state is updated to 'reconnecting'
- **AND** the client attempts to reconnect with exponential backoff (1s, 2s, 4s, 8s, 16s, max 30s)
- **AND** **WHEN** reconnection succeeds
- **THEN** the client re-subscribes to all previous topics
- **AND** the connection state is updated to 'connected'

#### Scenario: WebSocket heartbeat
- **WHEN** the server sends a WebSocket protocol-level ping
- **THEN** the browser automatically responds with a WebSocket protocol-level pong
- **AND** the connection health is maintained

#### Scenario: WebSocket subscription
- **WHEN** the client subscribes to a stream topic
- **THEN** a subscribe message is sent to the server
- **AND** the topic is added to the websocket store
- **AND** **WHEN** the server confirms subscription
- **THEN** the subscription is active and events are received

### Requirement: Real-time Event Processing
The dashboard SHALL process incoming WebSocket events and update the stream data store.

#### Scenario: Single event received
- **WHEN** a single `event` message is received from the WebSocket
- **THEN** the StreamEvent is extracted from the message
- **AND** the event is added to the stream data store using `addEvent()`
- **AND** the chart is updated reactively with the new event

#### Scenario: Batch events received
- **WHEN** a `batch` message is received from the WebSocket
- **THEN** the StreamEvent[] array is extracted from the message
- **AND** all events are added to the stream data store using `addEvents()`
- **AND** the chart is updated reactively with all new events

#### Scenario: Catch-up events after reconnection
- **WHEN** the client reconnects after a disconnection
- **AND** a `catchup` message is received
- **THEN** the StreamEvent[] array and catchUpEndTime are extracted
- **AND** all catch-up events are added to the stream data store
- **AND** the chart is updated with the catch-up events

### Requirement: Historical Data Loading
The dashboard SHALL load historical data on initial mount and merge it with real-time events.

#### Scenario: Historical data loaded on mount
- **WHEN** the dashboard page loads
- **THEN** a REST API call is made to `GET /api/simulation/history`
- **AND** the time range defaults to the last 7 days
- **AND** historical events are stored in the stream data store using `setHistoricalData()`
- **AND** external events are stored (for future use in Chunk 5)

#### Scenario: Historical and real-time data merged
- **WHEN** historical data is loaded and real-time events are received
- **THEN** historical events and real-time events are merged
- **AND** events are sorted by timestamp
- **AND** duplicate events are deduplicated (if any)
- **AND** the chart displays the merged data chronologically

#### Scenario: Chart updates with merged data
- **WHEN** the chart component receives merged historical + real-time data
- **THEN** the chart displays all events in chronological order
- **AND** the chart updates reactively as new real-time events arrive
- **AND** there is a smooth transition from historical to real-time data

### Requirement: Single Stream Real-time Updates
The dashboard SHALL subscribe to a single stream and display real-time updates in the chart.

#### Scenario: Single stream subscription
- **WHEN** the WebSocket connection is established
- **THEN** the client subscribes to `customer.tutor.search` stream
- **AND** the subscription is confirmed by the server
- **AND** events for this stream are received and processed

#### Scenario: Chart updates in real-time
- **WHEN** a new event is received for the subscribed stream
- **THEN** the event is added to the stream data store
- **AND** the chart component reactively updates to display the new event
- **AND** the chart maintains chronological order
- **AND** the chart smoothly scrolls/updates to show the latest data

