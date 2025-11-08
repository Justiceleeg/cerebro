## MODIFIED Requirements
### Requirement: Stream Event Generation with Relationships
The system SHALL generate stream events that follow realistic event chains and cascading effects as defined in `config/stream-relationships.json`. Events SHALL maintain temporal and logical relationships.

#### Scenario: Enforce event chains
- **WHEN** a stream event is generated that starts a chain (e.g., `session.booking.requested`)
- **THEN** the system SHALL track the pending event requiring resolution
- **AND** the system SHALL generate a follow-up event within the specified time window (e.g., `session.booking.confirmed` within 5-30 minutes)
- **AND** the follow-up event SHALL use probability matrices from relationship definitions
- **AND** the sum of outcomes SHALL match the trigger event (e.g., all booking requests result in confirmed/declined/expired)

#### Scenario: Apply cascading effects
- **WHEN** a stream event triggers a cascade (e.g., `payment.failure` triggers `support.ticket.created`)
- **THEN** the system SHALL generate the cascading event after the specified delay
- **AND** the cascading event SHALL use the cascade rules from relationship definitions
- **AND** multiple cascading effects SHALL be applied if specified
- **AND** cascading effects SHALL maintain logical consistency

#### Scenario: Enforce temporal dependencies
- **WHEN** generating events with temporal dependencies (e.g., tutor must be approved before availability can be set)
- **THEN** the system SHALL enforce the dependency order
- **AND** dependent events SHALL only be generated after prerequisite events
- **AND** the system SHALL track prerequisite state

#### Scenario: Apply supply/demand correlations
- **WHEN** generating events that have supply/demand correlations (e.g., tutor availability ↔ booking success)
- **THEN** the system SHALL apply the correlation factors from relationship definitions
- **AND** correlated streams SHALL reflect the relationship (e.g., low availability reduces booking success rate)
- **AND** correlations SHALL be bidirectional where specified

#### Scenario: Maintain relationship coherence in historical data
- **WHEN** generating historical baseline data
- **THEN** the system SHALL apply relationship enforcement to historical generation
- **AND** historical data SHALL maintain relationship coherence
- **AND** event chains SHALL be complete in historical data
- **AND** cascading effects SHALL be present in historical data

