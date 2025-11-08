## MODIFIED Requirements
### Requirement: Historical Baseline Data
The system SHALL generate and maintain a full 30-day historical baseline for all 50 streams with realistic patterns, anomalies, and external events. The system SHALL load this data into memory on startup for efficient querying.

#### Scenario: Generate 30-day historical baseline
- **WHEN** the system generates historical baseline data
- **THEN** the system SHALL generate 30 days × 2 intervals = 60 data points per stream
- **AND** the system SHALL apply academic calendar patterns (exam seasons, school holidays)
- **AND** the system SHALL apply weekday/weekend variance (~30-50% more on weekends)
- **AND** the system SHALL apply time-of-day patterns (peak 8am-10pm, low 11pm-7am)
- **AND** the system SHALL include realistic anomalies (occasional spikes/dips)

#### Scenario: Generate baseline external events
- **WHEN** the system generates historical baseline data
- **THEN** the system SHALL generate 2-5 external events per day (60-150 events total)
- **AND** events SHALL be distributed realistically across the 30-day period
- **AND** events SHALL use templates from the external events library
- **AND** events SHALL be distributed across different event types

#### Scenario: Load baseline into memory
- **WHEN** the application starts up
- **THEN** the system SHALL load 30-day historical data into memory
- **AND** the system SHALL load baseline statistics into memory
- **AND** the system SHALL load external events timeline into memory
- **AND** the system SHALL create efficient in-memory structures (maps, indexes)
- **AND** the system SHALL pre-calculate aggregations (daily totals, weekly averages)
- **AND** memory usage SHALL be reasonable (~50MB baseline)

#### Scenario: Query historical data
- **WHEN** a client requests historical data via `GET /api/simulation/history`
- **THEN** the system SHALL return data from in-memory structures
- **AND** the system SHALL support filtering by stream (query parameter)
- **AND** the system SHALL support time range filtering (start/end parameters)
- **AND** the system SHALL return data in format suitable for charting
- **AND** response time SHALL be <1 second

