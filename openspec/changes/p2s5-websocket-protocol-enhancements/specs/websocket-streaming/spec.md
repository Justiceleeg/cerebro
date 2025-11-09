## ADDED Requirements

### Requirement: Unsubscribe Message Handler
The system SHALL allow clients to unsubscribe from specific topics by sending an unsubscribe message. The system SHALL remove the specified topics from the client's subscription list and update stream intervals accordingly.

#### Scenario: Unsubscribe from specific topics
- **WHEN** a client sends `{ type: "unsubscribe", topics: ["customer.tutor.search"] }`
- **THEN** the server SHALL remove `"customer.tutor.search"` from the client's subscriptions
- **AND** the server SHALL respond with `{ type: "unsubscribed", topics: ["customer.tutor.search"] }`
- **AND** the client SHALL stop receiving events for the unsubscribed topics
- **AND** the client SHALL continue receiving events for remaining subscribed topics

#### Scenario: Unsubscribe from multiple topics
- **WHEN** a client is subscribed to `["customer.*", "session.*", "support.*"]` and sends `{ type: "unsubscribe", topics: ["customer.*", "session.*"] }`
- **THEN** the server SHALL remove `"customer.*"` and `"session.*"` from the client's subscriptions
- **AND** the server SHALL respond with `{ type: "unsubscribed", topics: ["customer.*", "session.*"] }`
- **AND** the client SHALL only receive events for `"support.*"` streams

#### Scenario: Unsubscribe from non-existent subscription
- **WHEN** a client sends `{ type: "unsubscribe", topics: ["nonexistent.stream"] }` for a topic not in their subscriptions
- **THEN** the server SHALL respond with `{ type: "unsubscribed", topics: ["nonexistent.stream"] }`
- **AND** the client's subscriptions SHALL remain unchanged

### Requirement: Anomalies Topic Pattern
The system SHALL support an `"anomalies"` subscription pattern that filters events to only include those with `anomalyFlag` of `'warning'` or `'critical'`. This pattern SHALL work in combination with other subscription patterns.

#### Scenario: Subscribe to anomalies only
- **WHEN** a client sends `{ type: "subscribe", topics: ["anomalies"] }`
- **THEN** the server SHALL respond with `{ type: "subscribed", topics: ["anomalies"] }`
- **AND** the client SHALL receive only events where `anomalyFlag === 'warning' || anomalyFlag === 'critical'`
- **AND** the client SHALL NOT receive events with `anomalyFlag === 'normal'` or missing `anomalyFlag`

#### Scenario: Subscribe to anomalies and stream pattern
- **WHEN** a client sends `{ type: "subscribe", topics: ["customer.*", "anomalies"] }`
- **THEN** the server SHALL respond with `{ type: "subscribed", topics: ["customer.*", "anomalies"] }`
- **AND** the client SHALL receive all `customer.*` events (regardless of anomaly flag)
- **AND** the client SHALL receive all events with `anomalyFlag === 'warning' || anomalyFlag === 'critical'` (regardless of stream)

### Requirement: Batch Message Type
The system SHALL batch high-frequency events and send them together in a single batch message to reduce WebSocket overhead. Events SHALL be buffered for up to 100ms before being sent as a batch.

#### Scenario: Batch high-frequency events
- **WHEN** multiple events are generated for a subscribed stream within 100ms
- **THEN** the system SHALL buffer the events instead of sending them immediately
- **AND** after 100ms, the system SHALL send a single message: `{ type: "batch", events: StreamEvent[] }`
- **AND** the batch message SHALL contain all buffered events for that time window
- **AND** events SHALL be sent in the order they were generated

#### Scenario: Empty batch handling
- **WHEN** no events are generated within a 100ms window
- **THEN** the system SHALL NOT send an empty batch message
- **AND** the system SHALL wait for the next event before starting a new batch timer

#### Scenario: Batch cleanup on disconnect
- **WHEN** a client disconnects while events are buffered
- **THEN** the system SHALL send any remaining buffered events before closing the connection
- **AND** the system SHALL clean up the client's event buffer

### Requirement: Catchup / LastTimestamp Support
The system SHALL maintain a recent event buffer and allow clients to request catchup events after a specified timestamp. This enables clients to fill gaps after reconnection and prevents data loss.

#### Scenario: Subscribe with lastTimestamp
- **WHEN** a client sends `{ type: "subscribe", topics: ["customer.*"], lastTimestamp: "2025-01-16T14:25:00Z" }`
- **THEN** the server SHALL respond with `{ type: "subscribed", topics: ["customer.*"] }`
- **AND** the server SHALL query the recent event buffer for events after `"2025-01-16T14:25:00Z"` matching `"customer.*"`
- **AND** the server SHALL send a catchup message: `{ type: "catchup", events: StreamEvent[], catchUpEndTime: string }`
- **AND** `catchUpEndTime` SHALL be the current time (ISO 8601) when catchup completes
- **AND** the catchup message SHALL be sent immediately after the subscription confirmation

#### Scenario: Catchup fills reconnection gap
- **WHEN** a client disconnects at time T1, reconnects at time T2 (3 minutes later), and subscribes with `lastTimestamp: T1`
- **THEN** the server SHALL send catchup events for the time period between T1 and T2
- **AND** the client SHALL receive all events that occurred during the disconnection period (within buffer limits)

#### Scenario: Catchup with old timestamp
- **WHEN** a client subscribes with `lastTimestamp` older than the buffer retention period (5 minutes)
- **THEN** the server SHALL send an empty catchup message or return an error
- **AND** the server SHALL indicate that the requested timestamp is beyond the buffer limit

#### Scenario: Recent event buffer maintenance
- **WHEN** events are generated for any stream
- **THEN** the system SHALL store events in the recent event buffer
- **AND** the buffer SHALL retain events for the last 5 minutes or last 1000 events per stream (whichever limit is reached first)
- **AND** the system SHALL automatically clean up events older than 5 minutes every minute

