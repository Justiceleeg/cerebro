## ADDED Requirements

### Requirement: Basic Time-Series Chart Display
The dashboard SHALL display a time-series chart showing normalized stream data with a baseline reference line.

#### Scenario: Chart displays hardcoded data
- **WHEN** the dashboard page loads
- **THEN** a time-series chart is displayed in the chart section
- **AND** the chart shows normalized values (0-100 scale) for a single stream
- **AND** the chart displays a baseline reference line at y=50 (baseline mean)
- **AND** the chart uses hardcoded sample data (no API or WebSocket calls)

#### Scenario: Chart configuration
- **WHEN** the chart is rendered
- **THEN** the X-axis displays timestamps (time scale)
- **AND** the Y-axis displays normalized values (0-100 scale)
- **AND** the chart shows a line series for stream data
- **AND** the baseline reference line is clearly visible at y=50
- **AND** the chart is properly styled and responsive

#### Scenario: Chart component structure
- **WHEN** the chart component is created
- **THEN** it uses the ECharts wrapper component (`lib/components/ECharts.svelte`)
- **AND** it accepts stream name and data as props
- **AND** it handles empty data state gracefully
- **AND** it supports loading state display

#### Scenario: Chart integration
- **WHEN** the dashboard page is rendered
- **THEN** the chart component replaces the chart placeholder section
- **AND** the chart displays hardcoded sample data for one stream
- **AND** the chart is properly sized within the dashboard layout
- **AND** the chart is responsive to container size changes

