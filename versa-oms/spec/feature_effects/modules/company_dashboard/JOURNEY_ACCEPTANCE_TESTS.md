# Company Dashboard — Journey Acceptance Tests

## JRN-001 — Company Dashboard: View operations dashboard

- Actor: Authorized Staff
- Start screen: Company Dashboard - View operations dashboard
- API/worker: `GET /api/staff/company-dashboard`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Company Dashboard - View operations dashboard
3. Perform action: View operations dashboard
4. Call GET /api/staff/company-dashboard
5. Verify validation and server-side authorization
6. Verify server effect: safe summary widgets update
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: dashboard loads counts and alerts
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

## JRN-002 — Company Dashboard: Open widget drilldown

- Actor: Authorized Staff
- Start screen: Company Dashboard - Open widget drilldown
- API/worker: `GET source module route`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Company Dashboard - Open widget drilldown
3. Perform action: Open widget drilldown
4. Call GET source module route
5. Verify validation and server-side authorization
6. Verify server effect: source module permission rechecked
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: module list/detail opens
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

## JRN-003 — Company Dashboard: Dismiss dashboard alert

- Actor: Authorized Staff
- Start screen: Company Dashboard - Dismiss dashboard alert
- API/worker: `POST /alerts/{id}/dismiss`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Company Dashboard - Dismiss dashboard alert
3. Perform action: Dismiss dashboard alert
4. Call POST /alerts/{id}/dismiss
5. Verify validation and server-side authorization
6. Verify server effect: user alert dismissal created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: alert hidden for actor only
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

## JRN-004 — Company Dashboard: Acknowledge critical alert

- Actor: Authorized Staff
- Start screen: Company Dashboard - Acknowledge critical alert
- API/worker: `POST /alerts/{id}/acknowledge`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Company Dashboard - Acknowledge critical alert
3. Perform action: Acknowledge critical alert
4. Call POST /alerts/{id}/acknowledge
5. Verify validation and server-side authorization
6. Verify server effect: task/incident acknowledgement recorded
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: alert shows acknowledged
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
