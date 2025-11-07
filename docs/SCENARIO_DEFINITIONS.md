# Scenario Definitions Structure

**Purpose**: Define the structure for pre-defined scenarios in `config/scenario-definitions.json`

**Status**: Reference document for scenario definitions

---

## Overview

Scenarios are pre-defined configurations that modify stream behavior and inject external events. Each scenario is a complete definition that can be activated via the admin UI or API.

---

## JSON Structure

```json
{
  "scenarios": [
    {
      "id": "exam-season-surge",
      "name": "Exam Season Surge",
      "description": "Simulates increased demand during exam season (IB, SAT, finals). Demand increases significantly while supply may become constrained.",
      "duration": "3 hours",
      "settlementDuration": "6 hours",
      "settlementType": "linear",
      "affectedStreams": {
        "customer.tutor.search": {
          "multiplier": 1.6,
          "description": "Search volume increases 60%"
        },
        "session.booking.requested": {
          "multiplier": 1.5,
          "description": "Booking requests increase 50%"
        },
        "session.booking.expired": {
          "multiplier": 1.8,
          "description": "More bookings expire due to supply shortage"
        },
        "tutor.availability.set": {
          "multiplier": 0.9,
          "description": "Tutor availability decreases 10% (some tutors already booked)"
        }
      },
      "cascadeEffects": [
        {
          "trigger": "session.booking.expired",
          "effect": {
            "support.ticket.created": {
              "multiplier": 1.3,
              "delay": "1-6 hours",
              "description": "Expired bookings lead to support tickets"
            }
          }
        }
      ],
      "externalEvents": [
        {
          "id": "evt_exam_season_ib",
          "timestamp": "now",
          "type": "academic",
          "title": "IB Exam Season begins",
          "description": "International Baccalaureate exam period starts, driving increased demand for tutoring",
          "severity": "warning",
          "expectedImpact": {
            "streams": ["customer.tutor.search", "session.booking.requested"],
            "direction": "increase",
            "magnitude": "high",
            "duration": "3 weeks"
          },
          "icon": "📅",
          "externalLink": "https://ibo.org/exam-schedule"
        }
      ],
      "metadata": {
        "category": "demand-surge",
        "tags": ["academic", "seasonal", "high-impact"],
        "typicalTrigger": "Exam season (May, Nov-Dec)"
      }
    }
  ]
}
```

---

## Scenario Fields

### Required Fields

- **`id`** (string): Unique identifier (kebab-case, e.g., `exam-season-surge`)
- **`name`** (string): Human-readable name (e.g., "Exam Season Surge")
- **`description`** (string): What this scenario simulates
- **`duration`** (string): How long scenario is active (e.g., "3 hours", "1 day")
- **`affectedStreams`** (object): Stream modifications (see below)
- **`externalEvents`** (array): Events to inject (see below)

### Optional Fields

- **`settlementDuration`** (string): How long settling takes (default: same as duration)
- **`settlementType`** (string): Settlement curve type - `"linear"` | `"exponential"` | `"immediate"` (default: `"linear"`)
- **`cascadeEffects`** (array): Cascading effects (see below)
- **`metadata`** (object): Additional metadata (category, tags, etc.)

---

## Stream Modifications

### Structure

```json
{
  "streamName": {
    "multiplier": 1.6,
    "additive": 0,
    "override": null,
    "description": "Optional description of the change"
  }
}
```

### Modification Types

1. **Multiplier** (number): Multiply base value (e.g., `1.6` = 60% increase)
2. **Additive** (number): Add to base value (e.g., `+20` events/hour)
3. **Override** (number | null): Force specific value (e.g., `95` = force 95% failure rate)

**Rules**:
- Only one of `multiplier`, `additive`, or `override` should be set
- `multiplier` and `additive` can be combined (multiply first, then add)
- `override` takes precedence over both

### Example

```json
{
  "customer.tutor.search": {
    "multiplier": 1.6,
    "description": "Search volume increases 60% during exam season"
  },
  "session.booking.expired": {
    "multiplier": 1.8,
    "description": "More bookings expire due to supply shortage"
  },
  "payment_gateway.transaction.status": {
    "override": 95,
    "description": "Force 95% failure rate (simulating outage)"
  }
}
```

---

## Cascade Effects

Cascade effects are secondary impacts that occur after a primary stream change.

### Structure

```json
{
  "trigger": "stream.name",
  "effect": {
    "affected.stream": {
      "multiplier": 1.3,
      "delay": "1-6 hours",
      "description": "What happens"
    }
  }
}
```

### Example

```json
{
  "trigger": "session.booking.expired",
  "effect": {
    "support.ticket.created": {
      "multiplier": 1.3,
      "delay": "1-6 hours",
      "description": "Expired bookings lead to frustrated students contacting support"
    },
    "customer.subscription.plan_changed": {
      "multiplier": 1.2,
      "delay": "24-48 hours",
      "description": "Some students downgrade after poor experience"
    }
  }
}
```

**Delay Format**: `"1-6 hours"` means effect occurs 1-6 hours after trigger (randomized)

---

## External Events

External events are marketplace events that are injected into the timeline.

### Structure

```json
{
  "id": "evt_exam_season_ib",
  "timestamp": "now" | "ISO 8601",
  "type": "academic" | "marketing" | "product" | "infrastructure" | "competitive" | "operational",
  "title": "IB Exam Season begins",
  "description": "International Baccalaureate exam period starts...",
  "severity": "info" | "warning" | "critical",
  "expectedImpact": {
    "streams": ["customer.tutor.search", "session.booking.requested"],
    "direction": "increase" | "decrease" | "mixed",
    "magnitude": "low" | "medium" | "high",
    "duration": "3 weeks"
  },
  "icon": "📅",
  "externalLink": "https://ibo.org/exam-schedule",
  "injectedByAI": false
}
```

### Timestamp

- **`"now"`**: Event occurs when scenario is activated
- **ISO 8601**: Specific timestamp (e.g., `"2025-01-16T14:30:00Z"`)
- **Relative**: Can use relative times (e.g., `"+2 hours"` from activation)

---

## Pre-Defined Scenarios

### 1. exam-season-surge

**Purpose**: Simulate exam season demand surge

**Key Changes**:
- `customer.tutor.search`: +60%
- `session.booking.requested`: +50%
- `session.booking.expired`: +80% (supply shortage)
- `tutor.availability.set`: -10%

**Events**: IB Exam Season begins

---

### 2. supply-crisis

**Purpose**: Simulate tutor supply shortage

**Key Changes**:
- `tutor.availability.set`: -40%
- `tutor.status.changed`: +200% (tutors going inactive)
- `session.booking.expired`: +150%
- `customer.tutor.search`: +20% (students searching more)

**Events**: Top tutors on vacation, Recruiting pipeline dry

---

### 3. payment-outage

**Purpose**: Simulate payment gateway failure

**Key Changes**:
- `payment_gateway.transaction.status`: 95% failure rate (override)
- `customer.subscription.payment_failure`: +500%
- `support.ticket.created`: +200% (billing category)
- `customer.subscription.plan_changed`: +150% (downgrades)

**Events**: Stripe API outage, Payment gateway maintenance

---

### 4. quality-crisis

**Purpose**: Simulate quality degradation

**Key Changes**:
- `session.no_show.tutor`: +300%
- `session.cancellation.by_tutor`: +200%
- `session.rating.submitted_by_student`: -30% (lower ratings)
- `support.refund.requested`: +400%
- `support.ticket.created`: +150%

**Events**: Tutor training program paused, Quality standards lowered

---

### 5. support-overload

**Purpose**: Simulate support team overwhelmed

**Key Changes**:
- `support.ticket.created`: +200%
- `support.ticket.resolved`: -30% (slower resolution)
- `support.call.inbound`: +150%
- `support.live_chat.started`: +180%

**Events**: Support team reduced, New product launch (more issues)

---

### 6. churn-pattern

**Purpose**: Simulate customer churn

**Key Changes**:
- `customer.subscription.plan_changed`: +200% (downgrades)
- `customer.subscription.payment_failure`: +150%
- `support.call.inbound`: +100% (≥2 calls = churn risk)
- `session.booking.requested`: -30% (less engagement)

**Events**: Competitor launched, Pricing increased

---

### 7. recruiting-crisis

**Purpose**: Simulate tutor recruiting problems

**Key Changes**:
- `tutor.application.received`: -50%
- `tutor.onboarding.approved`: -40%
- `marketing.ad.conversion`: -30%
- `tutor.availability.set`: -20% (fewer new tutors)

**Events**: Recruiting budget cut, Job market improved (tutors finding other jobs)

---

### 8. competitor-disruption

**Purpose**: Simulate competitor impact

**Key Changes**:
- `customer.signup.completed`: -40%
- `customer.tutor.search`: -20%
- `session.booking.requested`: -25%
- `marketing.ad.spend`: +50% (increased marketing to compete)

**Events**: Competitor launched, Competitor raised funding, Industry report published

---

### 9. normal-operations

**Purpose**: Reset to baseline (no modifications)

**Key Changes**: None (all multipliers = 1.0)

**Events**: None

**Use Case**: Reset button, return to baseline

---

## Settlement Types

### Linear

Gradual return to baseline over settlement duration.

**Formula**: `multiplier = 1.0 + (initialMultiplier - 1.0) * (1 - progress)`

**Use Cases**: Demand surge, Supply crisis, Support overload

---

### Exponential

Fast initial return, then slower approach to baseline.

**Formula**: `multiplier = 1.0 + (initialMultiplier - 1.0) * Math.exp(-progress * 3)`

**Use Cases**: Quality crisis (takes time to improve), Recruiting crisis (slow recovery)

---

### Immediate

Instant return to baseline (no settling period).

**Use Cases**: Payment outage (fixed immediately), Normal operations

---

## Validation Rules

1. **Stream Names**: Must exist in `STREAM_DEFINITIONS.md`
2. **Multipliers**: Must be positive numbers (> 0)
3. **Additive**: Can be negative (reduces value)
4. **Override**: Must be within valid range for stream (0-100 for normalized, or stream-specific range)
5. **Duration**: Must be parseable (e.g., "3 hours", "1 day", "2 weeks")
6. **Event Types**: Must be valid (`academic`, `marketing`, `product`, `infrastructure`, `competitive`, `operational`)
7. **Severity**: Must be valid (`info`, `warning`, `critical`)
8. **Cascade Triggers**: Must reference valid stream names

---

## Example: Complete Scenario

```json
{
  "id": "exam-season-surge",
  "name": "Exam Season Surge",
  "description": "Simulates increased demand during exam season. Demand increases significantly while supply may become constrained.",
  "duration": "3 hours",
  "settlementDuration": "6 hours",
  "settlementType": "linear",
  "affectedStreams": {
    "customer.tutor.search": {
      "multiplier": 1.6,
      "description": "Search volume increases 60%"
    },
    "session.booking.requested": {
      "multiplier": 1.5,
      "description": "Booking requests increase 50%"
    },
    "session.booking.expired": {
      "multiplier": 1.8,
      "description": "More bookings expire due to supply shortage"
    },
    "tutor.availability.set": {
      "multiplier": 0.9,
      "description": "Tutor availability decreases 10% (some tutors already booked)"
    }
  },
  "cascadeEffects": [
    {
      "trigger": "session.booking.expired",
      "effect": {
        "support.ticket.created": {
          "multiplier": 1.3,
          "delay": "1-6 hours",
          "description": "Expired bookings lead to support tickets"
        }
      }
    }
  ],
  "externalEvents": [
    {
      "id": "evt_exam_season_ib",
      "timestamp": "now",
      "type": "academic",
      "title": "IB Exam Season begins",
      "description": "International Baccalaureate exam period starts, driving increased demand for tutoring",
      "severity": "warning",
      "expectedImpact": {
        "streams": ["customer.tutor.search", "session.booking.requested"],
        "direction": "increase",
        "magnitude": "high",
        "duration": "3 weeks"
      },
      "icon": "📅",
      "externalLink": "https://ibo.org/exam-schedule"
    }
  ],
  "metadata": {
    "category": "demand-surge",
    "tags": ["academic", "seasonal", "high-impact"],
    "typicalTrigger": "Exam season (May, Nov-Dec)"
  }
}
```

---

## Notes

1. **Scenario IDs**: Use kebab-case, descriptive (e.g., `exam-season-surge`, not `scenario1`)
2. **Stream Names**: Must match exactly with `STREAM_DEFINITIONS.md`
3. **Timestamps**: Use `"now"` for immediate events, ISO 8601 for specific times
4. **Settlement**: All scenarios should settle back to baseline (multiplier = 1.0)
5. **Conflicts**: Only one scenario can be active at a time
6. **Validation**: Validate all scenarios on startup

---

**Status**: ✅ **READY FOR IMPLEMENTATION**

