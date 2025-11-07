## 1. Configuration Files
- [ ] 1.1 Create `lib/config/baseline-metrics.json`
  - [ ] Define baseline rates for all 50 streams
  - [ ] Include session confirmation rates (~70-80%)
  - [ ] Include tutor no-show rates (~2-5%)
  - [ ] Include student churn rates by cohort
  - [ ] Include support ticket resolution times
  - [ ] Include first session success rates
  - [ ] Include growth rates and seasonal multipliers
  - [ ] Include volume targets (tens of thousands students, 1-8 per tutor, ~3 sessions/tutor/day)

- [ ] 1.2 Create `lib/config/stream-relationships.json`
  - [ ] Document event chains (booking.requested → confirmed/declined/expired with timing)
  - [ ] Document cascading effects (payment failure → support ticket → potential churn with delays)
  - [ ] Document supply/demand correlations (tutor availability ↔ booking success)
  - [ ] Document temporal dependencies (tutor must be approved before availability can be set)
  - [ ] Document cross-domain relationships (low ratings → increased support contacts → churn risk)
  - [ ] Include probability matrices for event outcomes

- [ ] 1.3 Create `lib/config/stream-cadences.json`
  - [ ] Define high frequency streams (seconds-minutes): session events, API logs, live chat
  - [ ] Define medium frequency streams (minutes-hours): searches, bookings, availability changes
  - [ ] Define low frequency streams (hours-daily): ad spend, payouts, platform snapshots, subscriptions
  - [ ] Include jitter/variance to avoid synchronized bursts

- [ ] 1.4 Create `lib/config/scenario-definitions.json`
  - [ ] Define all pre-defined scenarios (reference `docs/SCENARIO_DEFINITIONS.md`)
  - [ ] Include scenarios: exam-season-surge, supply-crisis, payment-outage, quality-crisis, support-overload, churn-pattern, recruiting-crisis, competitor-disruption, normal-operations
  - [ ] For each scenario: id, name, description, affected streams with multipliers, cascade rules, expected duration, settlement behavior
  - [ ] Include external events to inject for each scenario

- [ ] 1.5 Create `lib/config/external-events-library.json`
  - [ ] Define Marketing/Growth event types: Blog viral, TikTok mention, podcast sponsorship, ad campaigns, competitor launch, influencer endorsement
  - [ ] Define Product/Platform event types: App launch, feature release, UI redesign, pricing change, new payment method
  - [ ] Define External/Infrastructure event types: AWS outage, Stripe rate limiting, weather events, school holidays, internet outages
  - [ ] Define Academic Calendar event types: IB exam season, SAT exams, school year start, finals week, summer break
  - [ ] Define Competitive/Market event types: Competitor funding, competitor shutdown, industry reports, regulatory changes
  - [ ] Define Internal Operational event types: Tutor training completion, support hours change, new pricing tier, referral program launch
  - [ ] For each event type: type, expected impact (streams, direction, magnitude, duration), severity, icon, typical timing patterns

