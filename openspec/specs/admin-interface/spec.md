# admin-interface Specification

## Purpose
TBD - created by archiving change p2s12-admin-ui. Update Purpose after archive.
## Requirements
### Requirement: Admin Interface
The system SHALL provide an admin interface at `/admin` for viewing simulation state and controlling scenario activation.

#### Scenario: Display simulation state
- **WHEN** a user navigates to `/admin`
- **THEN** the page SHALL display the current simulation state
- **AND** the page SHALL show active scenarios (if any)
- **AND** the page SHALL show active external events (if any)
- **AND** the page SHALL show baseline status
- **AND** the state SHALL update when scenarios change

#### Scenario: List available scenarios
- **WHEN** a user navigates to `/admin`
- **THEN** the page SHALL fetch available scenarios from `GET /api/simulation/scenarios`
- **AND** the page SHALL display scenario cards with:
  - Scenario name
  - Scenario description
  - Scenario duration
  - "Activate" button
- **AND** if a scenario is already active, the activate button SHALL be disabled

#### Scenario: Activate scenario
- **WHEN** a user clicks "Activate" on a scenario card
- **THEN** the page SHALL call `POST /api/simulation/scenario` with the scenario ID
- **AND** the page SHALL show a loading state during activation
- **AND** if activation succeeds, the page SHALL show a success message
- **AND** if activation fails, the page SHALL show an error message
- **AND** the simulation state SHALL update to reflect the active scenario

#### Scenario: Reset to baseline
- **WHEN** a user clicks "Reset to Baseline" button
- **THEN** the page SHALL show a confirmation dialog
- **AND** if the user confirms, the page SHALL call `POST /api/simulation/reset`
- **AND** the page SHALL show a loading state during reset
- **AND** if reset succeeds, the page SHALL show a success message
- **AND** the simulation state SHALL update to reflect baseline

#### Scenario: Stop current scenario
- **WHEN** a user clicks "Stop Current Scenario" button while a scenario is active
- **THEN** the page SHALL call `POST /api/simulation/stop`
- **AND** the page SHALL show a loading state during stop
- **AND** if stop succeeds, the page SHALL show a success message
- **AND** the simulation state SHALL update to show scenario is settling
- **AND** if no scenario is active, the button SHALL be disabled

