# Exam Slot Ops — Journey Acceptance Tests

## JRN-029 — Exam Slot Ops: Create exam slot

- Actor: Authorized Staff
- Start screen: Exam Slot Ops - Create exam slot
- API/worker: `POST /exam-slot-ops/slots`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Exam Slot Ops - Create exam slot
3. Perform action: Create exam slot
4. Call POST /exam-slot-ops/slots
5. Verify validation and server-side authorization
6. Verify server effect: slot created with capacity/timezone
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: slot visible in schedule
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

## JRN-030 — Exam Slot Ops: Assign school to slot

- Actor: Authorized Staff
- Start screen: Exam Slot Ops - Assign school to slot
- API/worker: `POST /slots/{id}/assign-school`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Exam Slot Ops - Assign school to slot
3. Perform action: Assign school to slot
4. Call POST /slots/{id}/assign-school
5. Verify validation and server-side authorization
6. Verify server effect: assignment created capacity reduced
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: school sees assigned slot
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

## JRN-031 — Exam Slot Ops: School confirms slot

- Actor: School Coordinator
- Start screen: Exam Slot Ops - School confirms slot
- API/worker: `POST /school/exam-slots/{id}/confirm`

### Steps
1. Resolve actor as School Coordinator
2. Open screen: Exam Slot Ops - School confirms slot
3. Perform action: School confirms slot
4. Call POST /school/exam-slots/{id}/confirm
5. Verify validation and server-side authorization
6. Verify server effect: assignment confirmed
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: staff and school see confirmation
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

## JRN-032 — Exam Slot Ops: Reschedule slot

- Actor: Authorized Staff
- Start screen: Exam Slot Ops - Reschedule slot
- API/worker: `POST /slots/{id}/reschedule`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Exam Slot Ops - Reschedule slot
3. Perform action: Reschedule slot
4. Call POST /slots/{id}/reschedule
5. Verify validation and server-side authorization
6. Verify server effect: slot version/approval created and schools notified
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: new slot visible after approval
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
