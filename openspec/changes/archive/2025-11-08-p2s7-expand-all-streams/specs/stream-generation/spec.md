## MODIFIED Requirements
### Requirement: Stream Event Generation
The system SHALL generate stream events for all 50 stream types using baseline metrics and return them via API or WebSocket. The system SHALL apply appropriate cadences, time-of-day patterns, and day-of-week patterns to each stream type.

#### Scenario: Generate events for all stream types
- **WHEN** a client requests stream events via `GET /api/simulation/events` or connects via WebSocket
- **THEN** the system SHALL generate events for all 50 stream types
- **AND** each event SHALL match its stream type definition from `STREAM_DEFINITIONS.md`
- **AND** each event SHALL use baseline metrics from configuration for its stream type
- **AND** if a scenario is active, the system SHALL apply scenario modifiers to the generated values

#### Scenario: Apply stream cadences
- **WHEN** generating stream events
- **THEN** the system SHALL apply cadences from `config/stream-cadences.json` to each stream type
- **AND** high-frequency streams (seconds-minutes) SHALL generate events more frequently than low-frequency streams (hours-daily)
- **AND** the system SHALL add jitter/variance to avoid synchronized bursts
- **AND** WebSocket events SHALL be sent at the appropriate cadence for each stream type

#### Scenario: Apply temporal patterns
- **WHEN** generating stream events
- **THEN** the system SHALL apply time-of-day patterns (peak 8am-10pm, low 11pm-7am)
- **AND** the system SHALL apply day-of-week patterns (weekday/weekend variance ~30-50% more on weekends)
- **AND** patterns SHALL be applied consistently across all stream types

#### Scenario: Normalize stream values
- **WHEN** a raw stream value is generated for any stream type
- **THEN** the system SHALL normalize it to a 0-100 scale based on baseline statistics for that stream
- **AND** the system SHALL assign an anomaly flag ('normal', 'warning', or 'critical')
- **AND** the normalized value SHALL be included in the stream event

