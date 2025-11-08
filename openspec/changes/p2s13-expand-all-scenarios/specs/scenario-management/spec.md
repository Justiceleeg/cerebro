## ADDED Requirements
### Requirement: Scenario Listing
The system SHALL provide an endpoint to list all available pre-defined scenarios.

#### Scenario: List all scenarios
- **WHEN** a client requests available scenarios via `GET /api/simulation/scenarios`
- **THEN** the system SHALL return a list of all scenarios from configuration
- **AND** each scenario SHALL include id, name, and description
- **AND** the response SHALL be an array of scenario metadata objects

## MODIFIED Requirements
### Requirement: Scenario Activation
The system SHALL activate scenarios and track their state in the simulation. Only one scenario can be active at a time.

#### Scenario: Activate scenario via API
- **WHEN** a client sends a POST request to `/api/simulation/scenario` with a `scenarioId`
- **THEN** the system SHALL load the scenario definition
- **AND** if no scenario is currently active, the system SHALL store the scenario modifiers and external events in the simulation state
- **AND** the system SHALL return a success response with the scenario details
- **AND** the simulation state SHALL reflect the active scenario
- **AND** if a scenario is already active, the system SHALL return an error response indicating a conflict

#### Scenario: Conflict resolution
- **WHEN** a client attempts to activate a scenario while another scenario is active
- **THEN** the system SHALL reject the activation request
- **AND** the system SHALL return an error response indicating that a scenario is already active
- **AND** the currently active scenario SHALL remain active

