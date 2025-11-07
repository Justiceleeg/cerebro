# stream-generation Specification

## Purpose
TBD - created by archiving change p2s2-single-stream-generation. Update Purpose after archive.
## Requirements
### Requirement: Stream Event Generation
The system SHALL generate individual stream events using baseline metrics and return them via API. When a scenario is active, the system SHALL apply scenario modifiers to the generated events.

#### Scenario: Generate single stream event
- **WHEN** a client requests a stream event via `GET /api/simulation/events`
- **THEN** the system SHALL generate a `customer.tutor.search` event
- **AND** the event SHALL use baseline metrics from configuration
- **AND** if a scenario is active, the system SHALL apply scenario modifiers (multipliers/overrides) to the generated values
- **AND** the event SHALL match the `StreamEvent` interface
- **AND** the event SHALL include normalized values (0-100 scale)

#### Scenario: Apply scenario modifiers to generation
- **WHEN** a scenario is active and a stream event is being generated
- **THEN** the system SHALL check for active scenario modifiers for the stream
- **AND** the system SHALL apply multipliers to the baseline values
- **AND** the system SHALL apply any overrides specified in the scenario
- **AND** the generated event SHALL reflect the modified values

#### Scenario: Apply external event impacts
- **WHEN** external events are active as part of an active scenario
- **THEN** the system SHALL check if the external events affect the stream being generated
- **AND** the system SHALL apply the event impacts (direction, magnitude, duration) to the stream generation
- **AND** the generated event SHALL reflect the combined impact of scenario modifiers and external events

#### Scenario: Normalize stream values
- **WHEN** a raw stream value is generated
- **THEN** the system SHALL normalize it to a 0-100 scale based on baseline statistics
- **AND** the system SHALL assign an anomaly flag ('normal', 'warning', or 'critical')
- **AND** the normalized value SHALL be included in the stream event

