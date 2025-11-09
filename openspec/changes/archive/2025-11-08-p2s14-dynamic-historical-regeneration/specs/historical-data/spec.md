## MODIFIED Requirements
### Requirement: Historical Data Generation
The system SHALL generate historical baseline data for streams and expose it via API. When a scenario is active, the system SHALL regenerate historical data with scenario modifications applied.

#### Scenario: Generate historical data for time range
- **WHEN** a client requests historical data via `GET /api/simulation/history` with `start` and `end` parameters
- **THEN** the system SHALL generate historical stream events for the specified time range
- **AND** if no scenario is active, the system SHALL generate baseline data at 12-hour intervals (2 data points per day)
- **AND** if a scenario is active, the system SHALL regenerate the time window with scenario modifiers and external events applied
- **AND** the system SHALL apply basic temporal patterns (weekday/weekend variance)
- **AND** the response SHALL return an array of `StreamEvent` objects

#### Scenario: Regenerate historical data with scenario modifications
- **WHEN** a scenario is active and historical data is requested
- **THEN** the system SHALL regenerate the requested time window with active scenario modifiers applied
- **AND** the system SHALL apply external event impacts to the regenerated data
- **AND** the regenerated data SHALL maintain temporal coherence and stream relationships
- **AND** the regenerated data SHALL reflect the scenario's impact on stream values

#### Scenario: Calculate baseline statistics
- **WHEN** historical data is generated
- **THEN** the system SHALL calculate baseline statistics (mean, median, standard deviation)
- **AND** the statistics SHALL be returned as a `StreamBaseline` object
- **AND** the statistics SHALL be used for normalization of future events
- **AND** if scenario modifications are applied, the statistics SHALL reflect the modified values

#### Scenario: Filter by stream
- **WHEN** a client requests historical data with an optional `streams` parameter
- **THEN** the system SHALL generate data only for the specified stream(s)
- **AND** if no `streams` parameter is provided, the system SHALL generate data for all streams
- **AND** scenario modifications SHALL be applied to the filtered streams

