## ADDED Requirements
### Requirement: Event-Stream Correlation Tracking
The system SHALL track correlations between external events and stream value changes to enable AI analysis of causal relationships.

#### Scenario: Track correlations when events are active
- **WHEN** an external event is active as part of an active scenario
- **THEN** the system SHALL track which streams are affected by the event
- **AND** the system SHALL record stream value changes while the event is active
- **AND** the system SHALL calculate correlation strength between the event and stream changes
- **AND** the system SHALL store correlation data for later analysis

#### Scenario: Calculate correlation strength
- **WHEN** stream values change while external events are active
- **THEN** the system SHALL calculate the correlation strength between events and stream changes
- **AND** the correlation SHALL include direction (positive/negative) and magnitude
- **AND** the correlation SHALL include statistical significance metrics
- **AND** the correlation data SHALL be stored with metadata (event ID, stream name, time range)

#### Scenario: Query correlation data
- **WHEN** a client requests correlation data via `GET /api/simulation/correlations`
- **THEN** the system SHALL return correlation data matching the query parameters
- **AND** if an `eventId` is provided, the system SHALL return correlations for that event
- **AND** if a `stream` parameter is provided, the system SHALL return correlations for that stream
- **AND** if a time range is provided, the system SHALL return correlations within that range
- **AND** the response SHALL include correlation strength, direction, and confidence metrics

#### Scenario: Track multiple events simultaneously
- **WHEN** multiple external events are active at the same time
- **THEN** the system SHALL track correlations for each event separately
- **AND** the system SHALL attribute stream changes to the appropriate events
- **AND** the system SHALL handle overlapping event impacts correctly

