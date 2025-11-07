## ADDED Requirements
### Requirement: Simulation State API Endpoint
The system SHALL provide a REST API endpoint that returns the current simulation state.

#### Scenario: Get simulation state
- **WHEN** a client sends a GET request to `/api/simulation/state`
- **THEN** the server SHALL return a JSON response containing a `SimulationState` object
- **AND** the response SHALL match the `SimulationState` interface from `$lib/types`
- **AND** the response SHALL include at minimum: active scenario status, baseline state, and timestamp

