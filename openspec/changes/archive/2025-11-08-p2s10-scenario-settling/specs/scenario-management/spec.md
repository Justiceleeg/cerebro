## MODIFIED Requirements
### Requirement: Scenario Lifecycle Management
The system SHALL manage scenario lifecycle states (active, settling, settled) and provide endpoints to reset the simulation to baseline or manually stop active scenarios.

#### Scenario: Scenario settling transition
- **WHEN** a scenario's duration expires or it is manually stopped
- **THEN** the scenario SHALL transition from 'active' to 'settling'
- **AND** during settling, modifiers SHALL gradually reduce multipliers back to 1.0
- **AND** the settlement duration SHALL be specified in the scenario definition
- **AND** the settlement type SHALL be 'linear' or 'exponential' as specified in the scenario
- **AND** after settlement duration, the scenario SHALL transition to 'settled'

#### Scenario: Reset simulation to baseline
- **WHEN** a client calls `POST /api/simulation/reset`
- **THEN** the system SHALL clear all active scenario modifiers
- **AND** the system SHALL clear all injected external events
- **AND** the system SHALL reset simulation state to baseline
- **AND** the system SHALL return `{ success: true }`
- **AND** stream generation SHALL return to baseline behavior

#### Scenario: Manually stop scenario
- **WHEN** a client calls `POST /api/simulation/stop` while a scenario is active
- **THEN** the system SHALL transition the scenario to 'settling' state
- **AND** the system SHALL begin the settlement process
- **AND** the system SHALL return `{ success: true, scenario: { state: "settling" } }`
- **AND** if no scenario is active, the system SHALL return an error

#### Scenario: Query scenario lifecycle state
- **WHEN** a client calls `GET /api/simulation/state`
- **THEN** the response SHALL include the active scenario's lifecycle state ('active', 'settling', or 'settled')
- **AND** if the scenario is settling, the response SHALL include settlement progress
- **AND** the response SHALL include active modifiers and their current values

#### Scenario: Settlement progress tracking
- **WHEN** a scenario is in 'settling' state
- **THEN** the system SHALL track settlement progress (0.0 to 1.0)
- **AND** multipliers SHALL be interpolated between active values and 1.0 based on progress
- **AND** for linear settlement, progress SHALL increase linearly over time
- **AND** for exponential settlement, progress SHALL increase exponentially over time

