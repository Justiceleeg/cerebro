## ADDED Requirements
### Requirement: Scenario Loading
The system SHALL load pre-defined scenario definitions from configuration files.

#### Scenario: Load scenario by ID
- **WHEN** a scenario ID is requested
- **THEN** the system SHALL load the scenario definition from `config/scenario-definitions.json`
- **AND** the system SHALL return scenario metadata including modifiers and external events
- **AND** if the scenario ID does not exist, the system SHALL return an error

### Requirement: Scenario Activation
The system SHALL activate scenarios and track their state in the simulation.

#### Scenario: Activate scenario via API
- **WHEN** a client sends a POST request to `/api/simulation/scenario` with a `scenarioId`
- **THEN** the system SHALL load the scenario definition
- **AND** the system SHALL store the scenario modifiers and external events in the simulation state
- **AND** the system SHALL return a success response with the scenario details
- **AND** the simulation state SHALL reflect the active scenario

#### Scenario: Query active scenario state
- **WHEN** a client requests the simulation state via `GET /api/simulation/state`
- **THEN** the system SHALL return the current active scenario (if any)
- **AND** the response SHALL include active modifiers and external events
- **AND** the response SHALL indicate whether a scenario is currently active

