## ADDED Requirements
### Requirement: Stream Event Generation
The system SHALL generate individual stream events using baseline metrics and return them via API.

#### Scenario: Generate single stream event
- **WHEN** a client requests a stream event via `GET /api/simulation/events`
- **THEN** the system SHALL generate a `customer.tutor.search` event
- **AND** the event SHALL use baseline metrics from configuration
- **AND** the event SHALL match the `StreamEvent` interface
- **AND** the event SHALL include normalized values (0-100 scale)

#### Scenario: Normalize stream values
- **WHEN** a raw stream value is generated
- **THEN** the system SHALL normalize it to a 0-100 scale based on baseline statistics
- **AND** the system SHALL assign an anomaly flag ('normal', 'warning', or 'critical')
- **AND** the normalized value SHALL be included in the stream event

