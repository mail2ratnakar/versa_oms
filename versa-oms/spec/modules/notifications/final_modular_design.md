# Notifications Module — Final Modular Design

The Notifications module is an independent, versioned cross-cutting module under:

```text
/spec/modules/notifications/
```

It is generated after the business modules because it listens to and delivers events from the completed modules.

## Module position

```text
Core spec
  ↓
Schools / Students / Payments / Exam Slots / Exam Materials / Courier / OMR Imports / Results / Certificates
  ↓
Notifications module
  ↓
Audit module
  ↓
Shared security baseline
  ↓
Change requests
  ↓
Regression tests
  ↓
Runbook execution
```

## Non-negotiable rules

1. Notification events and deliveries are idempotent.
2. Templates are versioned and approval-gated.
3. Provider secrets are server-side only.
4. Recipient resolution is server-side only.
5. School coordinators see only own in-app notifications.
6. Public users have no access to queues/templates.
7. Payloads must not contain raw OMR, answer keys or private file URLs.
8. Provider webhook signatures must be verified.
9. Failed deliveries retry only within configured limits.
10. Template, event and delivery status changes are audited.

## Future extension examples

Possible future features:

- WhatsApp delivery
- SMS delivery
- Parent/student notifications
- Scheduled reminder campaigns
- Notification preference center
- Digest emails
- Provider failover
- Admin test-send sandbox

## Bug fix continuity

Every Notifications module bug fix must add a regression test, especially for idempotency, school isolation, provider secrets, payload minimisation and webhook verification.
