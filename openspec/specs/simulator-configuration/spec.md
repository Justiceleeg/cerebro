# simulator-configuration Specification

## Purpose
TBD - created by archiving change add-simulator-config. Update Purpose after archive.
## Requirements
### Requirement: Baseline Metrics Configuration
The simulator SHALL have a configuration file defining baseline rates and metrics for all 50 streams.

#### Scenario: Baseline metrics file exists
- **WHEN** the simulator loads configuration
- **THEN** `lib/config/baseline-metrics.json` exists
- **AND** it contains baseline rates for all 50 streams
- **AND** it includes session confirmation rates (~70-80%)
- **AND** it includes tutor no-show rates (~2-5%)
- **AND** it includes student churn rates by cohort
- **AND** it includes support ticket resolution times
- **AND** it includes first session success rates
- **AND** it includes growth rates and seasonal multipliers
- **AND** it includes volume targets (tens of thousands students, 1-8 per tutor, ~3 sessions/tutor/day)

### Requirement: Stream Relationships Configuration
The simulator SHALL have a configuration file documenting interconnections and event chains between streams.

#### Scenario: Stream relationships file exists
- **WHEN** the simulator loads configuration
- **THEN** `lib/config/stream-relationships.json` exists
- **AND** it documents event chains (e.g., booking.requested → confirmed/declined/expired with timing)
- **AND** it documents cascading effects (e.g., payment failure → support ticket → potential churn with delays)
- **AND** it documents supply/demand correlations (tutor availability ↔ booking success)
- **AND** it documents temporal dependencies (e.g., tutor must be approved before availability can be set)
- **AND** it documents cross-domain relationships (e.g., low ratings → increased support contacts → churn risk)
- **AND** it includes probability matrices for event outcomes

### Requirement: Stream Cadences Configuration
The simulator SHALL have a configuration file defining update frequencies for each stream.

#### Scenario: Stream cadences file exists
- **WHEN** the simulator loads configuration
- **THEN** `lib/config/stream-cadences.json` exists
- **AND** it defines high frequency streams (seconds-minutes): session events, API logs, live chat
- **AND** it defines medium frequency streams (minutes-hours): searches, bookings, availability changes
- **AND** it defines low frequency streams (hours-daily): ad spend, payouts, platform snapshots, subscriptions
- **AND** it includes jitter/variance to avoid synchronized bursts

### Requirement: Scenario Definitions Configuration
The simulator SHALL have a configuration file with pre-defined scenario configurations.

#### Scenario: Scenario definitions file exists
- **WHEN** the simulator loads configuration
- **THEN** `lib/config/scenario-definitions.json` exists
- **AND** it contains all pre-defined scenarios (reference `docs/SCENARIO_DEFINITIONS.md`)
- **AND** it includes scenarios: exam-season-surge, supply-crisis, payment-outage, quality-crisis, support-overload, churn-pattern, recruiting-crisis, competitor-disruption, normal-operations
- **AND** each scenario has: id, name, description, affected streams with multipliers, cascade rules, expected duration, settlement behavior
- **AND** each scenario includes external events to inject

### Requirement: External Events Library Configuration
The simulator SHALL have a configuration file defining external event types and templates.

#### Scenario: External events library file exists
- **WHEN** the simulator loads configuration
- **THEN** `lib/config/external-events-library.json` exists
- **AND** it defines Marketing/Growth event types: Blog viral, TikTok mention, podcast sponsorship, ad campaigns, competitor launch, influencer endorsement
- **AND** it defines Product/Platform event types: App launch, feature release, UI redesign, pricing change, new payment method
- **AND** it defines External/Infrastructure event types: AWS outage, Stripe rate limiting, weather events, school holidays, internet outages
- **AND** it defines Academic Calendar event types: IB exam season, SAT exams, school year start, finals week, summer break
- **AND** it defines Competitive/Market event types: Competitor funding, competitor shutdown, industry reports, regulatory changes
- **AND** it defines Internal Operational event types: Tutor training completion, support hours change, new pricing tier, referral program launch
- **AND** each event type includes: type, expected impact (streams, direction, magnitude, duration), severity, icon, typical timing patterns

