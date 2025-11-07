# Stream Definitions Reference

## Overview
This document provides the complete schema definitions for all 50 data streams in the marketplace simulation system. These streams represent events across the tutoring marketplace platform, covering customer behavior, tutor supply, session transactions, support operations, marketing activities, and system health.

**Total Streams: 50**
- Customer (Student) Streams: 10
- Tutor (Supplier) Streams: 10
- Session (Marketplace Transaction) Streams: 12
- Support & Operations Streams: 8
- Marketing (Tutor Recruiting) Streams: 5
- System & Platform Health Streams: 5

---

## Customer (Student) Streams (10)

### 1. customer.signup.started
**Description**: Fired when a user visits the signup page and starts filling out the form.

**Schema**:
```json
{
  "stream": "customer.signup.started",
  "timestamp": "2025-01-15T14:23:45Z",
  "data": {
    "temp_user_id": "temp_abc123",
    "source": "google",
    "medium": "cpc",
    "campaign": "spring_2025_student_acquisition"
  }
}
```

**Fields**:
- `temp_user_id` (string): Temporary identifier for anonymous user
- `timestamp` (ISO 8601): When the event occurred
- `source` (string): Traffic source (e.g., "google", "facebook", "direct")
- `medium` (string): Marketing medium (e.g., "cpc", "organic", "email")
- `campaign` (string): Campaign identifier

**Typical Frequency**: Medium (several per hour during peak times)

---

### 2. customer.signup.completed
**Description**: A new student account is successfully created.

**Schema**:
```json
{
  "stream": "customer.signup.completed",
  "timestamp": "2025-01-15T14:28:12Z",
  "data": {
    "user_id": "student_12345",
    "registration_source": "web",
    "device_type": "desktop",
    "cohort_id": "2025_q1"
  }
}
```

**Fields**:
- `user_id` (string): Unique student identifier
- `timestamp` (ISO 8601): When the account was created
- `registration_source` (string): Platform used (e.g., "web", "mobile_ios", "mobile_android")
- `device_type` (string): Device type (e.g., "desktop", "mobile", "tablet")
- `cohort_id` (string): Cohort assignment for analysis

**Typical Frequency**: Medium (varies with marketing campaigns)

**Relationships**: 
- Should follow `customer.signup.started` within reasonable time window
- Conversion rate from started → completed typically 30-50%

---

### 3. customer.login.success
**Description**: A student successfully logs in.

**Schema**:
```json
{
  "stream": "customer.login.success",
  "timestamp": "2025-01-15T15:42:33Z",
  "data": {
    "user_id": "student_12345",
    "ip_address": "192.168.1.100",
    "device_type": "mobile"
  }
}
```

**Fields**:
- `user_id` (string): Student identifier
- `timestamp` (ISO 8601): Login time
- `ip_address` (string): IP address of login
- `device_type` (string): Device type used

**Typical Frequency**: High (thousands per day during peak hours)

**Relationships**:
- High correlation with session bookings and searches
- Lower frequency may indicate engagement issues

---

### 4. customer.login.failure
**Description**: A failed login attempt.

**Schema**:
```json
{
  "stream": "customer.login.failure",
  "timestamp": "2025-01-15T15:40:15Z",
  "data": {
    "username_or_email": "student@example.com",
    "ip_address": "192.168.1.100",
    "reason": "wrong_password"
  }
}
```

**Fields**:
- `username_or_email` (string): Attempted login identifier
- `timestamp` (ISO 8601): When the failure occurred
- `ip_address` (string): IP address of attempt
- `reason` (string): Failure reason (e.g., "wrong_password", "account_not_found", "account_locked")

**Typical Frequency**: Low to medium (should be <5% of total login attempts)

**Alert Threshold**: Multiple failures from same IP or user may indicate security issue

---

### 5. customer.profile.update
**Description**: A student updates their profile (e.g., subjects, goals).

**Schema**:
```json
{
  "stream": "customer.profile.update",
  "timestamp": "2025-01-15T16:10:22Z",
  "data": {
    "user_id": "student_12345",
    "updated_fields": ["subjects", "education_level"]
  }
}
```

**Fields**:
- `user_id` (string): Student identifier
- `timestamp` (ISO 8601): When profile was updated
- `updated_fields` (array): List of fields that were modified

**Typical Frequency**: Low (sporadic, mostly during onboarding)

**Relationships**: 
- Often occurs shortly after signup
- May indicate renewed engagement if happens later

---

### 6. customer.subscription.plan_changed
**Description**: A student upgrades, downgrades, or changes their subscription.

**Schema**:
```json
{
  "stream": "customer.subscription.plan_changed",
  "timestamp": "2025-01-15T17:05:44Z",
  "data": {
    "user_id": "student_12345",
    "old_plan_id": "basic_monthly",
    "new_plan_id": "premium_monthly",
    "event_type": "upgrade"
  }
}
```

**Fields**:
- `user_id` (string): Student identifier
- `timestamp` (ISO 8601): When change occurred
- `old_plan_id` (string): Previous subscription plan
- `new_plan_id` (string): New subscription plan
- `event_type` (string): Type of change (e.g., "upgrade", "downgrade", "lateral")

**Typical Frequency**: Low (changes occur infrequently)

**Relationships**:
- Downgrades often preceded by quality issues or payment failures
- Upgrades correlated with high session satisfaction

---

### 7. customer.subscription.payment_success
**Description**: A recurring payment was processed successfully.

**Schema**:
```json
{
  "stream": "customer.subscription.payment_success",
  "timestamp": "2025-01-15T18:00:00Z",
  "data": {
    "user_id": "student_12345",
    "amount": 79.99,
    "plan_id": "premium_monthly",
    "next_billing_date": "2025-02-15"
  }
}
```

**Fields**:
- `user_id` (string): Student identifier
- `timestamp` (ISO 8601): Payment processing time
- `amount` (number): Payment amount in USD
- `plan_id` (string): Subscription plan identifier
- `next_billing_date` (ISO 8601 date): Next scheduled billing date

**Typical Frequency**: Continuous (distributed throughout month based on billing cycles)

**Relationships**: 
- Should occur for all active subscribers on their billing date
- Failure leads to `customer.subscription.payment_failure`

---

### 8. customer.subscription.payment_failure
**Description**: A recurring payment failed.

**Schema**:
```json
{
  "stream": "customer.subscription.payment_failure",
  "timestamp": "2025-01-15T18:00:15Z",
  "data": {
    "user_id": "student_12346",
    "amount": 79.99,
    "failure_reason_code": "insufficient_funds"
  }
}
```

**Fields**:
- `user_id` (string): Student identifier
- `timestamp` (ISO 8601): When failure occurred
- `amount` (number): Failed payment amount
- `failure_reason_code` (string): Reason code (e.g., "insufficient_funds", "expired_card", "declined")

**Typical Frequency**: Low (should be <5% of payment attempts)

**Relationships**:
- Often triggers `support.ticket.created` for billing issues
- May lead to subscription cancellation or downgrade
- High correlation with churn risk

---

### 9. customer.page.view
**Description**: Tracks user navigation on the platform.

**Schema**:
```json
{
  "stream": "customer.page.view",
  "timestamp": "2025-01-15T16:30:45Z",
  "data": {
    "user_id": "student_12345",
    "page_url": "/tutors/search",
    "duration_seconds": 45
  }
}
```

**Fields**:
- `user_id` (string): Student identifier
- `timestamp` (ISO 8601): Page view time
- `page_url` (string): URL path viewed
- `duration_seconds` (number): Time spent on page

**Typical Frequency**: High (continuous during user sessions)

**Relationships**:
- High page view frequency indicates active engagement
- Specific pages (search, booking) are demand signals

---

### 10. customer.tutor.search
**Description**: A student performs a search for a tutor (a core demand signal).

**Schema**:
```json
{
  "stream": "customer.tutor.search",
  "timestamp": "2025-01-15T16:35:22Z",
  "data": {
    "user_id": "student_12345",
    "subject": "calculus",
    "availability_start": "2025-01-16T14:00:00Z",
    "availability_end": "2025-01-16T18:00:00Z",
    "keywords": ["derivatives", "limits"]
  }
}
```

**Fields**:
- `user_id` (string): Student identifier
- `timestamp` (ISO 8601): Search time
- `subject` (string): Subject being searched
- `availability_start` (ISO 8601): Desired start of availability window
- `availability_end` (ISO 8601): Desired end of availability window
- `keywords` (array): Additional search keywords

**Typical Frequency**: Medium to high (primary demand signal)

**Relationships**:
- **Critical demand signal** - should lead to booking requests
- Conversion to booking request typically 20-40%
- High search volume with low conversion indicates supply shortage

---

## Tutor (Supplier) Streams (10)

### 11. tutor.application.received
**Description**: A new person applies to be a tutor.

**Schema**:
```json
{
  "stream": "tutor.application.received",
  "timestamp": "2025-01-15T10:15:30Z",
  "data": {
    "applicant_id": "applicant_789",
    "subject": "mathematics",
    "region": "northeast_us",
    "source_campaign_id": "linkedin_jan2025"
  }
}
```

**Fields**:
- `applicant_id` (string): Unique applicant identifier
- `timestamp` (ISO 8601): Application submission time
- `subject` (string): Primary subject expertise
- `region` (string): Geographic region
- `source_campaign_id` (string): Marketing campaign that drove application

**Typical Frequency**: Medium (depends on recruiting campaigns)

**Relationships**:
- **Core supply signal** - beginning of tutor funnel
- Should correlate with `marketing.ad.conversion` events
- Leads to onboarding process

---

### 12. tutor.onboarding.step_completed
**Description**: Tracks an applicant's progress through the vetting funnel.

**Schema**:
```json
{
  "stream": "tutor.onboarding.step_completed",
  "timestamp": "2025-01-16T11:22:15Z",
  "data": {
    "applicant_id": "applicant_789",
    "step_name": "background_check",
    "status": "pending"
  }
}
```

**Fields**:
- `applicant_id` (string): Applicant identifier
- `timestamp` (ISO 8601): Step completion time
- `step_name` (string): Onboarding step (e.g., "application_review", "background_check", "demo_session", "training")
- `status` (string): Step status (e.g., "pending", "completed", "failed")

**Typical Frequency**: Low to medium (depends on applicant volume)

**Relationships**:
- Multiple events per applicant as they progress through funnel
- Leads to either approval or rejection

---

### 13. tutor.onboarding.approved
**Description**: A tutor's application is officially approved.

**Schema**:
```json
{
  "stream": "tutor.onboarding.approved",
  "timestamp": "2025-01-20T14:30:00Z",
  "data": {
    "applicant_id": "applicant_789",
    "tutor_id": "tutor_5001",
    "approved_by_operator_id": "operator_42"
  }
}
```

**Fields**:
- `applicant_id` (string): Original applicant identifier
- `tutor_id` (string): New tutor identifier assigned
- `timestamp` (ISO 8601): Approval time
- `approved_by_operator_id` (string): Operator who approved

**Typical Frequency**: Low (only successful applicants)

**Relationships**:
- Conversion rate from application → approval typically 20-40%
- Enables tutor to set availability and receive bookings
- **Critical supply signal**

---

### 14. tutor.onboarding.rejected
**Description**: A tutor's application is rejected.

**Schema**:
```json
{
  "stream": "tutor.onboarding.rejected",
  "timestamp": "2025-01-18T09:45:00Z",
  "data": {
    "applicant_id": "applicant_790",
    "rejection_reason": "failed_background_check"
  }
}
```

**Fields**:
- `applicant_id` (string): Applicant identifier
- `timestamp` (ISO 8601): Rejection time
- `rejection_reason` (string): Reason for rejection

**Typical Frequency**: Low to medium (depends on applicant quality)

**Relationships**:
- Ends applicant funnel
- High rejection rate may indicate targeting issues in recruiting

---

### 15. tutor.availability.set
**Description**: A tutor sets or updates a single block of availability (a core supply signal).

**Schema**:
```json
{
  "stream": "tutor.availability.set",
  "timestamp": "2025-01-15T08:00:00Z",
  "data": {
    "tutor_id": "tutor_5001",
    "block_start": "2025-01-16T14:00:00Z",
    "block_end": "2025-01-16T16:00:00Z",
    "status": "available"
  }
}
```

**Fields**:
- `tutor_id` (string): Tutor identifier
- `timestamp` (ISO 8601): When availability was set
- `block_start` (ISO 8601): Start of availability block
- `block_end` (ISO 8601): End of availability block
- `status` (string): Availability status (e.g., "available", "booked", "unavailable")

**Typical Frequency**: Medium (tutors update regularly)

**Relationships**:
- **Critical supply signal** - determines bookable capacity
- Must exist before sessions can be booked
- Should correlate with `customer.tutor.search` demand

---

### 16. tutor.availability.batch_updated
**Description**: A tutor updates their recurring weekly template.

**Schema**:
```json
{
  "stream": "tutor.availability.batch_updated",
  "timestamp": "2025-01-15T08:15:00Z",
  "data": {
    "tutor_id": "tutor_5001",
    "template": {
      "monday": [{"start": "14:00", "end": "18:00"}],
      "tuesday": [{"start": "14:00", "end": "18:00"}],
      "wednesday": [{"start": "14:00", "end": "18:00"}],
      "thursday": [{"start": "14:00", "end": "18:00"}],
      "friday": [{"start": "14:00", "end": "18:00"}]
    }
  }
}
```

**Fields**:
- `tutor_id` (string): Tutor identifier
- `timestamp` (ISO 8601): Template update time
- `template` (object): Weekly recurring availability schedule

**Typical Frequency**: Low (changes infrequently)

**Relationships**:
- Generates multiple `tutor.availability.set` events
- Indicates long-term supply commitment

---

### 17. tutor.login.event
**Description**: A tutor logs into their dashboard.

**Schema**:
```json
{
  "stream": "tutor.login.event",
  "timestamp": "2025-01-15T07:45:00Z",
  "data": {
    "tutor_id": "tutor_5001",
    "device_type": "mobile"
  }
}
```

**Fields**:
- `tutor_id` (string): Tutor identifier
- `timestamp` (ISO 8601): Login time
- `device_type` (string): Device type used

**Typical Frequency**: Medium (daily for active tutors)

**Relationships**:
- Indicator of tutor engagement
- Often followed by availability updates or session activity

---

### 18. tutor.profile.viewed_by_student
**Description**: A student clicks on and views a tutor's profile.

**Schema**:
```json
{
  "stream": "tutor.profile.viewed_by_student",
  "timestamp": "2025-01-15T16:40:00Z",
  "data": {
    "tutor_id": "tutor_5001",
    "viewing_student_id": "student_12345"
  }
}
```

**Fields**:
- `tutor_id` (string): Tutor whose profile was viewed
- `timestamp` (ISO 8601): View time
- `viewing_student_id` (string): Student who viewed the profile

**Typical Frequency**: High during peak search times

**Relationships**:
- Follows `customer.tutor.search`
- Often precedes `session.booking.requested`
- High view-to-booking conversion indicates good profile quality

---

### 19. tutor.payout.initiated
**Description**: A payout to a tutor is processed.

**Schema**:
```json
{
  "stream": "tutor.payout.initiated",
  "timestamp": "2025-01-15T23:00:00Z",
  "data": {
    "tutor_id": "tutor_5001",
    "amount_usd": 450.00,
    "session_count": 15,
    "payout_method": "bank_transfer"
  }
}
```

**Fields**:
- `tutor_id` (string): Tutor identifier
- `timestamp` (ISO 8601): Payout initiation time
- `amount_usd` (number): Payout amount in USD
- `session_count` (number): Number of sessions included in payout
- `payout_method` (string): Payment method (e.g., "bank_transfer", "paypal")

**Typical Frequency**: Low (weekly or bi-weekly batches)

**Relationships**:
- Follows completed and rated sessions
- Delayed by payout schedule (e.g., weekly on Fridays)

---

### 20. tutor.status.changed
**Description**: A tutor changes their active status (e.g., "on vacation").

**Schema**:
```json
{
  "stream": "tutor.status.changed",
  "timestamp": "2025-01-15T12:00:00Z",
  "data": {
    "tutor_id": "tutor_5001",
    "old_status": "active",
    "new_status": "paused"
  }
}
```

**Fields**:
- `tutor_id` (string): Tutor identifier
- `timestamp` (ISO 8601): Status change time
- `old_status` (string): Previous status
- `new_status` (string): New status (e.g., "active", "paused", "inactive")

**Typical Frequency**: Low (occasional)

**Relationships**:
- Paused/inactive status removes tutor from available supply
- May trigger supply shortage if many tutors pause simultaneously

---

## Session (Marketplace Transaction) Streams (12)

### 21. session.booking.requested
**Description**: A student requests to book a specific tutor.

**Schema**:
```json
{
  "stream": "session.booking.requested",
  "timestamp": "2025-01-15T16:50:00Z",
  "data": {
    "request_id": "req_abc123",
    "student_id": "student_12345",
    "tutor_id": "tutor_5001",
    "subject": "calculus",
    "requested_time": "2025-01-16T15:00:00Z"
  }
}
```

**Fields**:
- `request_id` (string): Unique request identifier
- `student_id` (string): Student identifier
- `tutor_id` (string): Tutor identifier
- `timestamp` (ISO 8601): Request time
- `subject` (string): Session subject
- `requested_time` (ISO 8601): Desired session time

**Typical Frequency**: Medium to high (core transaction event)

**Relationships**:
- Follows `customer.tutor.search` and profile views
- Must lead to one of: confirmed, declined, or expired
- **Critical conversion point** - booking request rate is key demand metric

---

### 22. session.booking.confirmed
**Description**: A tutor accepts a session request.

**Schema**:
```json
{
  "stream": "session.booking.confirmed",
  "timestamp": "2025-01-15T17:15:00Z",
  "data": {
    "session_id": "session_xyz789",
    "request_id": "req_abc123",
    "student_id": "student_12345",
    "tutor_id": "tutor_5001",
    "scheduled_time": "2025-01-16T15:00:00Z"
  }
}
```

**Fields**:
- `session_id` (string): Unique session identifier (newly created)
- `request_id` (string): Original request identifier
- `student_id` (string): Student identifier
- `tutor_id` (string): Tutor identifier
- `timestamp` (ISO 8601): Confirmation time
- `scheduled_time` (ISO 8601): Scheduled session time

**Typical Frequency**: Medium (confirmation rate ~70-80% of requests)

**Relationships**:
- Resolves `session.booking.requested`
- Should lead to `session.started` at scheduled time
- Updates tutor availability (block becomes "booked")

---

### 23. session.booking.declined_by_tutor
**Description**: A tutor declines a session request.

**Schema**:
```json
{
  "stream": "session.booking.declined_by_tutor",
  "timestamp": "2025-01-15T17:20:00Z",
  "data": {
    "request_id": "req_abc124",
    "student_id": "student_12346",
    "tutor_id": "tutor_5002",
    "reason": "scheduling_conflict"
  }
}
```

**Fields**:
- `request_id` (string): Request identifier
- `student_id` (string): Student identifier
- `tutor_id` (string): Tutor identifier
- `timestamp` (ISO 8601): Decline time
- `reason` (string): Reason for decline (e.g., "scheduling_conflict", "subject_mismatch", "unavailable")

**Typical Frequency**: Low to medium (~10-20% of requests)

**Relationships**:
- Resolves `session.booking.requested`
- High decline rate indicates supply constraints or poor matching
- May trigger student to search again

---

### 24. session.booking.expired
**Description**: A session request expired before any tutor accepted.

**Schema**:
```json
{
  "stream": "session.booking.expired",
  "timestamp": "2025-01-16T16:50:00Z",
  "data": {
    "request_id": "req_abc125",
    "student_id": "student_12347",
    "subject": "chemistry"
  }
}
```

**Fields**:
- `request_id` (string): Request identifier
- `student_id` (string): Student identifier
- `timestamp` (ISO 8601): Expiration time
- `subject` (string): Subject of expired request

**Typical Frequency**: Low (~5-10% of requests)

**Relationships**:
- Resolves `session.booking.requested` after timeout (typically 24 hours)
- **Critical failure mode** - high expiration rate indicates supply shortage
- Often leads to churn risk

---

### 25. session.cancellation.by_student
**Description**: A student cancels a confirmed session.

**Schema**:
```json
{
  "stream": "session.cancellation.by_student",
  "timestamp": "2025-01-16T10:00:00Z",
  "data": {
    "session_id": "session_xyz789",
    "student_id": "student_12345",
    "reason_code": "schedule_conflict",
    "cancellation_fee_charged": 0.00
  }
}
```

**Fields**:
- `session_id` (string): Session identifier
- `student_id` (string): Student identifier
- `timestamp` (ISO 8601): Cancellation time
- `reason_code` (string): Cancellation reason
- `cancellation_fee_charged` (number): Fee amount (if within cancellation window)

**Typical Frequency**: Low (~5-10% of confirmed sessions)

**Relationships**:
- Voids confirmed session
- Frees up tutor availability block
- May indicate student engagement issues if frequent

---

### 26. session.cancellation.by_tutor
**Description**: A tutor cancels a confirmed session (a poor experience).

**Schema**:
```json
{
  "stream": "session.cancellation.by_tutor",
  "timestamp": "2025-01-16T10:30:00Z",
  "data": {
    "session_id": "session_xyz790",
    "tutor_id": "tutor_5003",
    "reason_code": "emergency"
  }
}
```

**Fields**:
- `session_id` (string): Session identifier
- `tutor_id` (string): Tutor identifier
- `timestamp` (ISO 8601): Cancellation time
- `reason_code` (string): Cancellation reason

**Typical Frequency**: Very low (~1-2% of confirmed sessions)

**Relationships**:
- **Negative experience** - disrupts student plans
- High tutor cancellation rate indicates quality issues
- Often triggers support contact from frustrated student

---

### 27. session.started
**Description**: Fired when both users join the virtual session room.

**Schema**:
```json
{
  "stream": "session.started",
  "timestamp": "2025-01-16T15:02:00Z",
  "data": {
    "session_id": "session_xyz789",
    "student_join_time": "2025-01-16T15:01:00Z",
    "tutor_join_time": "2025-01-16T15:02:00Z"
  }
}
```

**Fields**:
- `session_id` (string): Session identifier
- `timestamp` (ISO 8601): Session start time (when both joined)
- `student_join_time` (ISO 8601): When student joined
- `tutor_join_time` (ISO 8601): When tutor joined

**Typical Frequency**: Medium to high (should match confirmed sessions)

**Relationships**:
- Should occur at scheduled time from `session.booking.confirmed`
- Failure to start indicates no-show (see streams 29-30)
- Leads to `session.completed`

---

### 28. session.completed
**Description**: A session is successfully completed.

**Schema**:
```json
{
  "stream": "session.completed",
  "timestamp": "2025-01-16T16:02:00Z",
  "data": {
    "session_id": "session_xyz789",
    "student_id": "student_12345",
    "tutor_id": "tutor_5001",
    "duration_minutes": 60,
    "subject": "calculus"
  }
}
```

**Fields**:
- `session_id` (string): Session identifier
- `timestamp` (ISO 8601): Session end time
- `student_id` (string): Student identifier
- `tutor_id` (string): Tutor identifier
- `duration_minutes` (number): Actual session duration
- `subject` (string): Session subject

**Typical Frequency**: Medium to high (successful sessions)

**Relationships**:
- **Success metric** - core transaction completion
- Should lead to rating/feedback events
- Contributes to tutor earnings and student usage metrics

---

### 29. session.no_show.student
**Description**: A student never joined a confirmed session.

**Schema**:
```json
{
  "stream": "session.no_show.student",
  "timestamp": "2025-01-16T15:20:00Z",
  "data": {
    "session_id": "session_xyz791",
    "student_id": "student_12348",
    "tutor_id": "tutor_5004",
    "scheduled_time": "2025-01-16T15:00:00Z"
  }
}
```

**Fields**:
- `session_id` (string): Session identifier
- `student_id` (string): Student who didn't show
- `tutor_id` (string): Tutor who waited
- `timestamp` (ISO 8601): When no-show was determined
- `scheduled_time` (ISO 8601): Original scheduled time

**Typical Frequency**: Low (~2-5% of confirmed sessions)

**Relationships**:
- **Negative experience** for tutor (wasted time)
- May indicate student disengagement
- Often triggers no-show fee

---

### 30. session.no_show.tutor
**Description**: A tutor never joined a confirmed session (critical failure).

**Schema**:
```json
{
  "stream": "session.no_show.tutor",
  "timestamp": "2025-01-16T15:20:00Z",
  "data": {
    "session_id": "session_xyz792",
    "student_id": "student_12349",
    "tutor_id": "tutor_5005",
    "scheduled_time": "2025-01-16T15:00:00Z"
  }
}
```

**Fields**:
- `session_id` (string): Session identifier
- `student_id` (string): Student who waited
- `tutor_id` (string): Tutor who didn't show
- `timestamp` (ISO 8601): When no-show was determined
- `scheduled_time` (ISO 8601): Original scheduled time

**Typical Frequency**: Very low (~1-2% of confirmed sessions)

**Relationships**:
- **Critical failure** - severe negative experience
- Often triggers support ticket and potential refund
- High tutor no-show rate indicates quality crisis
- Strong churn risk indicator

---

### 31. session.rating.submitted_by_student
**Description**: A student leaves a rating after a session.

**Schema**:
```json
{
  "stream": "session.rating.submitted_by_student",
  "timestamp": "2025-01-16T16:30:00Z",
  "data": {
    "session_id": "session_xyz789",
    "student_id": "student_12345",
    "tutor_id": "tutor_5001",
    "rating_score": 5,
    "comment": "Great session! Really helped me understand derivatives."
  }
}
```

**Fields**:
- `session_id` (string): Session identifier
- `student_id` (string): Student identifier
- `tutor_id` (string): Tutor identifier
- `timestamp` (ISO 8601): Rating submission time
- `rating_score` (number): Rating score (1-5)
- `comment` (string): Optional text comment

**Typical Frequency**: Medium (not all sessions get rated, ~40-60% rating rate)

**Relationships**:
- Follows `session.completed` (usually within 24-48 hours)
- Ratings affect tutor visibility and reputation
- Low ratings may trigger quality review

---

### 32. session.feedback.submitted_by_tutor
**Description**: A tutor leaves internal notes on a student/session.

**Schema**:
```json
{
  "stream": "session.feedback.submitted_by_tutor",
  "timestamp": "2025-01-16T16:35:00Z",
  "data": {
    "session_id": "session_xyz789",
    "tutor_id": "tutor_5001",
    "student_id": "student_12345",
    "notes": "Student needs help with chain rule applications",
    "student_progress": "improving"
  }
}
```

**Fields**:
- `session_id` (string): Session identifier
- `tutor_id` (string): Tutor identifier
- `student_id` (string): Student identifier
- `timestamp` (ISO 8601): Feedback submission time
- `notes` (string): Internal notes for continuity
- `student_progress` (string): Progress assessment (e.g., "improving", "struggling", "advanced")

**Typical Frequency**: Medium (higher rating rate than students, ~60-80%)

**Relationships**:
- Follows `session.completed`
- Helps with student continuity and matching

---

## Support & Operations Streams (8)

### 33. support.call.inbound
**Description**: A customer calls the support line (for the "IB call spike" alert).

**Schema**:
```json
{
  "stream": "support.call.inbound",
  "timestamp": "2025-01-16T09:15:00Z",
  "data": {
    "call_id": "call_abc123",
    "customer_id": "student_12345",
    "phone_number": "+1-555-0100",
    "queue": "billing"
  }
}
```

**Fields**:
- `call_id` (string): Unique call identifier
- `customer_id` (string): Customer identifier (if identified)
- `timestamp` (ISO 8601): Call time
- `phone_number` (string): Caller phone number
- `queue` (string): Support queue (e.g., "billing", "technical", "general")

**Typical Frequency**: Medium (varies with issues)

**Relationships**:
- **IB alert trigger**: ≥2 calls from same customer in 14 days = high churn risk
- Often follows negative experiences (no-shows, payment failures, quality issues)
- May lead to support ticket creation

---

### 34. support.call.outbound
**Description**: An operator makes an outbound call to a customer.

**Schema**:
```json
{
  "stream": "support.call.outbound",
  "timestamp": "2025-01-16T10:30:00Z",
  "data": {
    "call_id": "call_abc124",
    "customer_id": "student_12346",
    "operator_id": "operator_42",
    "reason": "churn_followup"
  }
}
```

**Fields**:
- `call_id` (string): Unique call identifier
- `customer_id` (string): Customer identifier
- `timestamp` (ISO 8601): Call time
- `operator_id` (string): Operator making the call
- `reason` (string): Call reason (e.g., "churn_followup", "payment_retry", "satisfaction_check")

**Typical Frequency**: Low (proactive outreach)

**Relationships**:
- Often triggered by churn risk indicators
- May follow multiple inbound calls or negative experiences

---

### 35. support.ticket.created
**Description**: A new support ticket is created via email or webform.

**Schema**:
```json
{
  "stream": "support.ticket.created",
  "timestamp": "2025-01-16T11:00:00Z",
  "data": {
    "ticket_id": "ticket_12345",
    "customer_id": "student_12347",
    "category": "technical_issue",
    "priority": "high"
  }
}
```

**Fields**:
- `ticket_id` (string): Unique ticket identifier
- `customer_id` (string): Customer identifier
- `timestamp` (ISO 8601): Ticket creation time
- `category` (string): Issue category (e.g., "technical_issue", "billing", "booking_problem", "quality_complaint")
- `priority` (string): Priority level (e.g., "low", "medium", "high", "urgent")

**Typical Frequency**: Medium (correlates with platform issues)

**Relationships**:
- Often follows negative experiences:
  - Payment failures → billing tickets
  - No-shows → quality complaints
  - Booking problems → technical issues
- High ticket volume indicates systemic issues

---

### 36. support.ticket.updated
**Description**: An update to a ticket (e.g., agent reply, status change).

**Schema**:
```json
{
  "stream": "support.ticket.updated",
  "timestamp": "2025-01-16T11:30:00Z",
  "data": {
    "ticket_id": "ticket_12345",
    "update_type": "agent_reply",
    "agent_id": "agent_15"
  }
}
```

**Fields**:
- `ticket_id` (string): Ticket identifier
- `timestamp` (ISO 8601): Update time
- `update_type` (string): Type of update (e.g., "agent_reply", "status_change", "customer_reply", "escalation")
- `agent_id` (string): Agent who made the update (if applicable)

**Typical Frequency**: Medium to high (multiple updates per ticket)

**Relationships**:
- Follows ticket creation
- Multiple updates before resolution

---

### 37. support.ticket.resolved
**Description**: A support ticket is closed.

**Schema**:
```json
{
  "stream": "support.ticket.resolved",
  "timestamp": "2025-01-16T14:00:00Z",
  "data": {
    "ticket_id": "ticket_12345",
    "agent_id": "agent_15",
    "resolution_time_hours": 3.0
  }
}
```

**Fields**:
- `ticket_id` (string): Ticket identifier
- `timestamp` (ISO 8601): Resolution time
- `agent_id` (string): Agent who resolved the ticket
- `resolution_time_hours` (number): Time from creation to resolution

**Typical Frequency**: Medium (matches ticket creation rate)

**Relationships**:
- Closes ticket lifecycle
- Resolution time is key support efficiency metric
- Long resolution times indicate support capacity issues

---

### 38. support.live_chat.started
**Description**: A customer initiates a live chat session.

**Schema**:
```json
{
  "stream": "support.live_chat.started",
  "timestamp": "2025-01-16T13:00:00Z",
  "data": {
    "chat_id": "chat_abc123",
    "customer_id": "student_12348",
    "initial_query": "Can't find available tutors",
    "wait_time_seconds": 45
  }
}
```

**Fields**:
- `chat_id` (string): Unique chat identifier
- `customer_id` (string): Customer identifier
- `timestamp` (ISO 8601): Chat start time
- `initial_query` (string): First message from customer
- `wait_time_seconds` (number): Time waiting for agent

**Typical Frequency**: Medium to high (popular support channel)

**Relationships**:
- Often alternative to phone support
- Wait times indicate support capacity

---

### 39. support.live_chat.message
**Description**: A new message within a live chat.

**Schema**:
```json
{
  "stream": "support.live_chat.message",
  "timestamp": "2025-01-16T13:02:00Z",
  "data": {
    "chat_id": "chat_abc123",
    "sender_type": "customer",
    "message_length": 150
  }
}
```

**Fields**:
- `chat_id` (string): Chat identifier
- `timestamp` (ISO 8601): Message time
- `sender_type` (string): Who sent the message (e.g., "customer", "agent", "bot")
- `message_length` (number): Character count

**Typical Frequency**: High (continuous during active chats)

**Relationships**:
- Multiple messages per chat session
- Message frequency indicates engagement

---

### 40. support.refund.requested
**Description**: A customer requests a refund for a session or subscription.

**Schema**:
```json
{
  "stream": "support.refund.requested",
  "timestamp": "2025-01-16T15:00:00Z",
  "data": {
    "refund_request_id": "refund_123",
    "customer_id": "student_12349",
    "session_id": "session_xyz792",
    "amount": 45.00,
    "reason": "tutor_no_show"
  }
}
```

**Fields**:
- `refund_request_id` (string): Unique refund request identifier
- `customer_id` (string): Customer identifier
- `timestamp` (ISO 8601): Request time
- `session_id` (string): Session identifier (if session-specific)
- `amount` (number): Refund amount requested
- `reason` (string): Refund reason

**Typical Frequency**: Low (should be rare)

**Relationships**:
- Often follows severe negative experiences (no-shows, quality issues)
- High refund rate indicates systemic quality problems
- Strong churn risk indicator

---

## Marketing (Tutor Recruiting) Streams (5)

### 41. marketing.ad.spend
**Description**: Real-time or batched ad spend from platforms.

**Schema**:
```json
{
  "stream": "marketing.ad.spend",
  "timestamp": "2025-01-16T12:00:00Z",
  "data": {
    "campaign_id": "linkedin_jan2025",
    "platform": "linkedin",
    "spend_usd": 150.00
  }
}
```

**Fields**:
- `campaign_id` (string): Campaign identifier
- `timestamp` (ISO 8601): Spend recording time
- `platform` (string): Ad platform (e.g., "linkedin", "google_ads", "facebook", "indeed")
- `spend_usd` (number): Amount spent

**Typical Frequency**: Low to medium (hourly or daily batches)

**Relationships**:
- Should correlate with tutor applications
- Used to calculate recruitment CAC (Customer Acquisition Cost)

---

### 42. marketing.ad.impression
**Description**: An ad for tutor recruiting is viewed.

**Schema**:
```json
{
  "stream": "marketing.ad.impression",
  "timestamp": "2025-01-16T12:05:30Z",
  "data": {
    "campaign_id": "linkedin_jan2025",
    "platform": "linkedin",
    "ad_group_id": "math_tutors_northeast"
  }
}
```

**Fields**:
- `campaign_id` (string): Campaign identifier
- `timestamp` (ISO 8601): Impression time
- `platform` (string): Ad platform
- `ad_group_id` (string): Ad group identifier

**Typical Frequency**: Very high (thousands per day during active campaigns)

**Relationships**:
- Top of funnel metric
- Leads to ad clicks

---

### 43. marketing.ad.click
**Description**: A prospective tutor clicks an ad.

**Schema**:
```json
{
  "stream": "marketing.ad.click",
  "timestamp": "2025-01-16T12:06:00Z",
  "data": {
    "campaign_id": "linkedin_jan2025",
    "platform": "linkedin",
    "cost_per_click": 3.50
  }
}
```

**Fields**:
- `campaign_id` (string): Campaign identifier
- `timestamp` (ISO 8601): Click time
- `platform` (string): Ad platform
- `cost_per_click` (number): Cost of this click

**Typical Frequency**: High (depends on campaign scale)

**Relationships**:
- Follows ad impressions (CTR typically 1-5%)
- Should lead to tutor applications (conversion rate ~10-30%)

---

### 44. marketing.ad.conversion
**Description**: A click leads to a conversion (e.g., tutor.application.received).

**Schema**:
```json
{
  "stream": "marketing.ad.conversion",
  "timestamp": "2025-01-16T12:15:00Z",
  "data": {
    "campaign_id": "linkedin_jan2025",
    "click_id": "click_xyz123",
    "conversion_type": "application_start"
  }
}
```

**Fields**:
- `campaign_id` (string): Campaign identifier
- `timestamp` (ISO 8601): Conversion time
- `click_id` (string): Associated click identifier
- `conversion_type` (string): Type of conversion (e.g., "application_start", "application_complete")

**Typical Frequency**: Medium (subset of clicks)

**Relationships**:
- Follows ad clicks
- Links marketing spend to tutor applications
- Used to optimize campaign targeting

---

### 45. seo.organic.traffic
**Description**: A user lands on a tutor acquisition page from a search engine.

**Schema**:
```json
{
  "stream": "seo.organic.traffic",
  "timestamp": "2025-01-16T13:00:00Z",
  "data": {
    "landing_page_url": "/become-a-tutor",
    "search_engine": "google",
    "keyword": "online tutoring jobs"
  }
}
```

**Fields**:
- `landing_page_url` (string): Page where user landed
- `timestamp` (ISO 8601): Landing time
- `search_engine` (string): Search engine (e.g., "google", "bing", "duckduckgo")
- `keyword` (string): Search keyword (when available)

**Typical Frequency**: Medium (continuous organic traffic)

**Relationships**:
- Alternative to paid ads for tutor recruitment
- May lead to tutor applications
- Free acquisition channel

---

## System & Platform Health Streams (5)

### 46. api.request.log
**Description**: A log for every API request made to the platform.

**Schema**:
```json
{
  "stream": "api.request.log",
  "timestamp": "2025-01-16T14:30:00Z",
  "data": {
    "endpoint": "/v1/book_session",
    "status_code": 201,
    "latency_ms": 120,
    "user_id": "student_12345"
  }
}
```

**Fields**:
- `timestamp` (ISO 8601): Request time
- `endpoint` (string): API endpoint called
- `status_code` (number): HTTP status code
- `latency_ms` (number): Request latency in milliseconds
- `user_id` (string): User making the request (if authenticated)

**Typical Frequency**: Very high (continuous)

**Relationships**:
- Monitors platform performance
- High latency or error rates indicate issues
- Spike in 5xx errors may trigger alerts

---

### 47. system.error.log
**Description**: An uncaught exception or high-severity error from an application.

**Schema**:
```json
{
  "stream": "system.error.log",
  "timestamp": "2025-01-16T14:35:00Z",
  "data": {
    "service_name": "payment_processor",
    "error_message": "Connection timeout to payment gateway",
    "severity": "critical"
  }
}
```

**Fields**:
- `timestamp` (ISO 8601): Error time
- `service_name` (string): Service where error occurred
- `error_message` (string): Error description
- `severity` (string): Severity level (e.g., "info", "warning", "error", "critical")

**Typical Frequency**: Low to medium (should be rare in healthy system)

**Relationships**:
- Critical errors may cause cascading failures
- Payment processor errors → payment failures
- Booking service errors → booking failures

---

### 48. database.query.performance
**Description**: Logs for slow or long-running database queries.

**Schema**:
```json
{
  "stream": "database.query.performance",
  "timestamp": "2025-01-16T14:40:00Z",
  "data": {
    "db_host": "primary-db-01",
    "query_hash": "abc123def456",
    "duration_ms": 3500,
    "query_text": "SELECT * FROM sessions WHERE..."
  }
}
```

**Fields**:
- `timestamp` (ISO 8601): Query execution time
- `db_host` (string): Database host identifier
- `query_hash` (string): Query fingerprint/hash
- `duration_ms` (number): Query duration in milliseconds
- `query_text` (string): Query text (may be truncated)

**Typical Frequency**: Low to medium (only slow queries logged)

**Relationships**:
- Slow queries impact user experience
- May indicate need for optimization or scaling
- Correlates with API latency spikes

---

### 49. platform.concurrent.users
**Description**: A periodic snapshot of active users.

**Schema**:
```json
{
  "stream": "platform.concurrent.users",
  "timestamp": "2025-01-16T15:00:00Z",
  "data": {
    "active_student_count": 1500,
    "active_tutor_count": 250
  }
}
```

**Fields**:
- `timestamp` (ISO 8601): Snapshot time
- `active_student_count` (number): Number of active students
- `active_tutor_count` (number): Number of active tutors

**Typical Frequency**: Low (periodic snapshots, e.g., every 5-15 minutes)

**Relationships**:
- Indicates platform load and usage patterns
- Time-of-day and day-of-week patterns
- Supply/demand balance indicator

---

### 50. payment_gateway.transaction.status
**Description**: Logs for all third-party payment gateway attempts.

**Schema**:
```json
{
  "stream": "payment_gateway.transaction.status",
  "timestamp": "2025-01-16T18:00:00Z",
  "data": {
    "transaction_id": "txn_abc123",
    "gateway": "stripe",
    "status": "success",
    "amount": 79.99
  }
}
```

**Fields**:
- `transaction_id` (string): Gateway transaction identifier
- `timestamp` (ISO 8601): Transaction time
- `gateway` (string): Payment gateway (e.g., "stripe", "paypal", "braintree")
- `status` (string): Transaction status (e.g., "success", "failed", "pending")
- `amount` (number): Transaction amount

**Typical Frequency**: Medium (all payment attempts)

**Relationships**:
- Success status → `customer.subscription.payment_success`
- Failed status → `customer.subscription.payment_failure`
- Gateway outages cause spike in failures

---

## Stream Relationships Summary

### Critical Event Chains

**Student Acquisition Funnel**:
```
customer.signup.started 
  → customer.signup.completed (30-50% conversion)
  → customer.login.success
  → customer.tutor.search
  → session.booking.requested
  → session.booking.confirmed (70-80% conversion)
  → session.started
  → session.completed
  → session.rating.submitted_by_student (40-60% of sessions)
```

**Tutor Supply Funnel**:
```
marketing.ad.click 
  → tutor.application.received (10-30% conversion)
  → tutor.onboarding.step_completed (multiple)
  → tutor.onboarding.approved (20-40% conversion)
  → tutor.availability.set
  → session.booking.requested
  → session.booking.confirmed
  → session.completed
  → tutor.payout.initiated (weekly/bi-weekly)
```

**Payment Flow**:
```
customer.subscription.payment_success (expected path)
OR
customer.subscription.payment_failure 
  → support.ticket.created (billing category)
  → potential customer.subscription.plan_changed (downgrade)
  → potential churn
```

**Support Escalation**:
```
Negative Experience (no-show, quality issue, payment failure)
  → support.call.inbound OR support.ticket.created
  → support.ticket.updated (multiple)
  → support.ticket.resolved
  
IB Alert Pattern:
  support.call.inbound (≥2 calls in 14 days) → HIGH CHURN RISK
```

**Quality Crisis Indicators**:
```
High rates of:
  - session.no_show.tutor
  - session.cancellation.by_tutor
  - session.rating.submitted_by_student (low scores)
  - support.refund.requested
→ Quality crisis scenario
→ Increased churn risk
```

---

## Cadence Guidelines

### High Frequency (Seconds to Minutes)
- `api.request.log` - continuous
- `support.live_chat.message` - continuous during chats
- `session.started` - clustered around scheduled times
- `session.completed` - clustered around scheduled end times

### Medium Frequency (Minutes to Hours)
- `customer.login.success` - peaks during waking hours
- `customer.tutor.search` - steady during business hours
- `session.booking.*` - steady throughout day
- `tutor.availability.set` - morning and evening peaks
- `support.call.inbound` - business hours
- `support.ticket.created` - steady throughout day
- `marketing.ad.click` - continuous during campaigns

### Low Frequency (Hours to Daily)
- `customer.signup.completed` - several per hour
- `customer.subscription.payment_success` - distributed throughout month
- `tutor.application.received` - depends on campaigns
- `tutor.onboarding.approved` - batched weekly
- `tutor.payout.initiated` - weekly batches
- `marketing.ad.spend` - daily or hourly batches
- `platform.concurrent.users` - every 5-15 minutes

### Very Low Frequency (Occasional)
- `customer.profile.update` - sporadic
- `customer.subscription.plan_changed` - rare
- `tutor.status.changed` - occasional
- `session.cancellation.*` - rare (<10% of bookings)
- `session.no_show.*` - rare (<5% of sessions)
- `support.refund.requested` - rare

---

## Usage Notes for Scenario System

1. **Temporal Coherence**: When modifying streams, maintain realistic time relationships (e.g., booking confirmations should follow requests within hours, not instantly).

2. **Volume Consistency**: Ensure downstream events don't exceed upstream capacities (e.g., can't have more session completions than bookings).

3. **Cascade Effects**: Many scenarios trigger cascading changes across multiple streams. Payment outages affect payment_gateway, payment_failure, support tickets, and potentially churn.

4. **Supply/Demand Balance**: The core marketplace dynamic is tutor availability vs. student demand. Monitor:
   - `tutor.availability.set` (supply signal)
   - `customer.tutor.search` (demand signal)
   - `session.booking.confirmed` / `expired` / `declined` (balance indicator)

5. **Quality Indicators**: Watch for quality crisis patterns:
   - No-show rates increasing
   - Rating scores declining
   - Refund requests spiking
   - Support volume increasing

6. **Churn Risk Signals**:
   - IB calls (≥2 in 14 days)
   - Payment failures
   - Declining session velocity
   - Booking expiration (can't find tutors)
   - Low first-session success rates

7. **Scenario Realism**: When simulating scenarios, adjust multiple related streams proportionally to maintain system coherence. Don't just multiply one stream in isolation.
