# simulator-infrastructure Specification

## Purpose
TBD - created by archiving change setup-simulator-project. Update Purpose after archive.
## Requirements
### Requirement: Simulator Project Foundation
The simulator SHALL have a properly configured SvelteKit project with TypeScript, WebSocket dependencies, and organized directory structure.

#### Scenario: Project initialization
- **WHEN** the project is set up
- **THEN** SvelteKit is configured with TypeScript
- **AND** WebSocket dependencies (`ws`, `@types/ws`) are installed
- **AND** Railway deployment configuration exists
- **AND** environment variables are documented in `.env.example`

#### Scenario: Directory structure
- **WHEN** the project is initialized
- **THEN** `/lib/streams` directory exists for stream generation logic
- **AND** `/lib/scenarios` directory exists for scenario definitions
- **AND** `/lib/config` directory exists for configuration files
- **AND** `/lib/data` directory exists for pre-generated baseline data
- **AND** `/routes/api/simulation` directory exists for simulation control endpoints
- **AND** `/routes/api/streams` directory exists for stream data endpoints
- **AND** `/routes/admin` directory exists for admin UI

