## 1. Configuration Files
- [x] 1.1 Create `lib/config/baseline-metrics.json`
  - [x] Define baseline rates for all 50 streams
  - [x] Include session confirmation rates (~70-80%)
  - [x] Include tutor no-show rates (~2-5%)
  - [x] Include student churn rates by cohort
  - [x] Include support ticket resolution times
  - [x] Include first session success rates
  - [x] Include growth rates and seasonal multipliers
  - [x] Include volume targets (tens of thousands students, 1-8 per tutor, ~3 sessions/tutor/day)

- [x] 1.2 Create `lib/config/stream-relationships.json`
  - [x] Document event chains (booking.requested → confirmed/declined/expired with timing)
  - [x] Document cascading effects (payment failure → support ticket → potential churn with delays)
  - [x] Document supply/demand correlations (tutor availability ↔ booking success)
  - [x] Document temporal dependencies (tutor must be approved before availability can be set)
  - [x] Document cross-domain relationships (low ratings → increased support contacts → churn risk)
  - [x] Include probability matrices for event outcomes

- [x] 1.3 Create `lib/config/stream-cadences.json`
  - [x] Define high frequency streams (seconds-minutes): session events, API logs, live chat
  - [x] Define medium frequency streams (minutes-hours): searches, bookings, availability changes
  - [x] Define low frequency streams (hours-daily): ad spend, payouts, platform snapshots, subscriptions
  - [x] Include jitter/variance to avoid synchronized bursts

- [x] 1.4 Create `lib/config/scenario-definitions.json`
  - [x] Define all pre-defined scenarios (reference `docs/SCENARIO_DEFINITIONS.md`)
  - [x] Include scenarios: exam-season-surge, supply-crisis, payment-outage, quality-crisis, support-overload, churn-pattern, recruiting-crisis, competitor-disruption, normal-operations
  - [x] For each scenario: id, name, description, affected streams with multipliers, cascade rules, expected duration, settlement behavior
  - [x] Include external events to inject for each scenario

- [x] 1.5 Create `lib/config/external-events-library.json`
  - [x] Define Marketing/Growth event types: Blog viral, TikTok mention, podcast sponsorship, ad campaigns, competitor launch, influencer endorsement
  - [x] Define Product/Platform event types: App launch, feature release, UI redesign, pricing change, new payment method
  - [x] Define External/Infrastructure event types: AWS outage, Stripe rate limiting, weather events, school holidays, internet outages
  - [x] Define Academic Calendar event types: IB exam season, SAT exams, school year start, finals week, summer break
  - [x] Define Competitive/Market event types: Competitor funding, competitor shutdown, industry reports, regulatory changes
  - [x] Define Internal Operational event types: Tutor training completion, support hours change, new pricing tier, referral program launch
  - [x] For each event type: type, expected impact (streams, direction, magnitude, duration), severity, icon, typical timing patterns

