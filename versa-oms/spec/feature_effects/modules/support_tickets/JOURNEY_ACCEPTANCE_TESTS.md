# Support Tickets — Journey Acceptance Tests

## JRN-057 — Support Tickets: Create school ticket

- Actor: School Coordinator
- Start screen: Support Tickets - Create school ticket
- API/worker: `POST /school/support-tickets`

### Steps
1. Resolve actor as School Coordinator
2. Open screen: Support Tickets - Create school ticket
3. Perform action: Create school ticket
4. Call POST /school/support-tickets
5. Verify validation and server-side authorization
6. Verify server effect: ticket created, SLA timer and task started
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: ticket visible
10. Verify unauthorized actor is blocked
11. Verify sensitive fields are masked

### Pass criteria
- state persisted
- response envelope standard
- audit event written
- downstream effect visible
- UI shows correct success state
- error states covered
- security/privacy guardrails pass

## JRN-058 — Support Tickets: Add internal note

- Actor: Authorized Staff
- Start screen: Support Tickets - Add internal note
- API/worker: `POST /support-tickets/{id}/internal-notes`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Support Tickets - Add internal note
3. Perform action: Add internal note
4. Call POST /support-tickets/{id}/internal-notes
5. Verify validation and server-side authorization
6. Verify server effect: internal note created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: staff-only note visible
10. Verify unauthorized actor is blocked
11. Verify sensitive fields are masked

### Pass criteria
- state persisted
- response envelope standard
- audit event written
- downstream effect visible
- UI shows correct success state
- error states covered
- security/privacy guardrails pass

## JRN-059 — Support Tickets: Link safe source context

- Actor: Authorized Staff
- Start screen: Support Tickets - Link safe source context
- API/worker: `POST /support-tickets/{id}/link`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Support Tickets - Link safe source context
3. Perform action: Link safe source context
4. Call POST /support-tickets/{id}/link
5. Verify validation and server-side authorization
6. Verify server effect: safe summary linked after permission check
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: context card visible
10. Verify unauthorized actor is blocked
11. Verify sensitive fields are masked

### Pass criteria
- state persisted
- response envelope standard
- audit event written
- downstream effect visible
- UI shows correct success state
- error states covered
- security/privacy guardrails pass

## JRN-060 — Support Tickets: Resolve ticket

- Actor: Authorized Staff
- Start screen: Support Tickets - Resolve ticket
- API/worker: `POST /support-tickets/{id}/resolve`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Support Tickets - Resolve ticket
3. Perform action: Resolve ticket
4. Call POST /support-tickets/{id}/resolve
5. Verify validation and server-side authorization
6. Verify server effect: ticket resolved and school notified
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: ticket closed
10. Verify unauthorized actor is blocked
11. Verify sensitive fields are masked

### Pass criteria
- state persisted
- response envelope standard
- audit event written
- downstream effect visible
- UI shows correct success state
- error states covered
- security/privacy guardrails pass
