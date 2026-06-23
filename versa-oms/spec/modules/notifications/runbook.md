# Notifications Module Runbook

## Purpose

Build the Notifications module after core business modules because it consolidates event-driven messaging across Schools, Students, Payments, Exam Slots, Exam Materials, Courier, OMR Imports, Results and Certificates.

## Required order

1. Confirm source event modules exist.
2. Create `notification_templates` collection.
3. Create `notification_events` collection.
4. Create `notification_deliveries` collection.
5. Create `notification_preferences` collection.
6. Configure permissions:
   - operations_admin: full template/event/delivery management
   - school_coordinator: own in-app notifications only
   - finance/evaluation roles: limited event/status views
   - public: no queue/template access
7. Configure provider secrets server-side only.
8. Implement recipient resolver functions.
9. Implement event ingestion and delivery worker:
   - `POST /api/internal/notifications/events`
   - `POST /api/admin/notification-templates`
   - `POST /api/internal/notifications/send-pending`
   - `POST /api/notifications/provider-webhook/{provider}`
   - `GET /api/notifications/center`
   - `POST /api/notifications/{delivery_id}/read`
10. Implement screens:
   - `/staff/notification-templates`
   - `/staff/notifications/events`
   - `/staff/notifications/deliveries`
   - `/school/notifications`
11. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Provider secrets reach browser/client responses.
- Duplicate events send duplicate messages.
- School coordinator can see another school's notifications.
- Public role can read templates/events/deliveries.
- Notification payload includes answer keys/raw OMR/private file URLs.
- Provider webhook status update does not verify signature.
- Real delivery works with draft/unapproved template.
- More than two repair attempts fail.

## Change continuity

All future notification changes must use:

- `feature_request_template.json` for new features.
- `bug_fix_template.json` for bugs.
- `change_control.json` for review and migration gates.
- `versioning_policy.json` for semantic versioning.
