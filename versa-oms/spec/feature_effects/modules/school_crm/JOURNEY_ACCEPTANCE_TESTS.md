# School CRM — Journey Acceptance Tests

## JRN-013 — School CRM: Create school lead

- Actor: Authorized Staff
- Start screen: School CRM - Create school lead
- API/worker: `POST /school-crm/leads`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: School CRM - Create school lead
3. Perform action: Create school lead
4. Call POST /school-crm/leads
5. Verify validation and server-side authorization
6. Verify server effect: lead created stage=new_lead
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: lead appears in CRM
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

## JRN-014 — School CRM: Move lead stage

- Actor: Authorized Staff
- Start screen: School CRM - Move lead stage
- API/worker: `POST /leads/{id}/stage`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: School CRM - Move lead stage
3. Perform action: Move lead stage
4. Call POST /leads/{id}/stage
5. Verify validation and server-side authorization
6. Verify server effect: lead stage changed and follow-up task maybe created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: pipeline/list updates
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

## JRN-015 — School CRM: Convert lead to onboarding

- Actor: Authorized Staff
- Start screen: School CRM - Convert lead to onboarding
- API/worker: `POST /leads/{id}/convert`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: School CRM - Convert lead to onboarding
3. Perform action: Convert lead to onboarding
4. Call POST /leads/{id}/convert
5. Verify validation and server-side authorization
6. Verify server effect: school created/linked, onboarding case and task created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: school appears in onboarding queue
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

## JRN-016 — School CRM: Mark lead lost

- Actor: Authorized Staff
- Start screen: School CRM - Mark lead lost
- API/worker: `POST /leads/{id}/lost`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: School CRM - Mark lead lost
3. Perform action: Mark lead lost
4. Call POST /leads/{id}/lost
5. Verify validation and server-side authorization
6. Verify server effect: lead stage=lost with reason
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: lost filter updates
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
