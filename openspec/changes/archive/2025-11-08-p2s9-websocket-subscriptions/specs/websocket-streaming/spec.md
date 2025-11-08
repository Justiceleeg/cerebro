## MODIFIED Requirements
### Requirement: WebSocket Real-time Streaming
The system SHALL stream real-time events to connected WebSocket clients. Clients SHALL be able to subscribe to specific streams or stream patterns. The system SHALL maintain connection health with heartbeat/keepalive.

#### Scenario: Subscribe to all streams
- **WHEN** a client sends `{ type: "subscribe", topics: ["*"] }`
- **THEN** the server SHALL respond with `{ type: "subscribed", topics: ["*"] }`
- **AND** the client SHALL receive events for all streams
- **AND** the subscription SHALL persist for the connection lifetime

#### Scenario: Subscribe to stream pattern
- **WHEN** a client sends `{ type: "subscribe", topics: ["customer.*"] }`
- **THEN** the server SHALL respond with `{ type: "subscribed", topics: ["customer.*"] }`
- **AND** the client SHALL receive events only for streams matching the pattern (e.g., `customer.signup.started`, `customer.tutor.search`)
- **AND** the client SHALL NOT receive events for other streams (e.g., `session.booking.requested`)

#### Scenario: Subscribe to specific stream
- **WHEN** a client sends `{ type: "subscribe", topics: ["customer.tutor.search"] }`
- **THEN** the server SHALL respond with `{ type: "subscribed", topics: ["customer.tutor.search"] }`
- **AND** the client SHALL receive events only for that specific stream
- **AND** the client SHALL NOT receive events for other streams

#### Scenario: Multiple subscription patterns
- **WHEN** a client sends `{ type: "subscribe", topics: ["customer.*", "session.*"] }`
- **THEN** the server SHALL respond with `{ type: "subscribed", topics: ["customer.*", "session.*"] }`
- **AND** the client SHALL receive events for streams matching either pattern
- **AND** the subscription SHALL replace any previous subscription

#### Scenario: Heartbeat and keepalive
- **WHEN** a WebSocket connection is established
- **THEN** the server SHALL send ping messages every 30 seconds
- **AND** the client SHALL respond with pong messages
- **AND** if no pong is received within 60 seconds, the server SHALL close the connection
- **AND** the connection SHALL remain alive as long as pong responses are received

#### Scenario: Filter events by subscription
- **WHEN** a stream event is generated and a client is connected
- **THEN** the system SHALL check if the event stream matches the client's subscription patterns
- **AND** if the event matches, the system SHALL send it to the client
- **AND** if the event does not match, the system SHALL NOT send it to the client

