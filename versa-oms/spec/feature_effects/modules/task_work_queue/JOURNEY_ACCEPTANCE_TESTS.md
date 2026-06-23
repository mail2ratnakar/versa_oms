# Task Work Queue — Journey Acceptance Tests

## JRN-061 — Task Work Queue: Create task from effect

- Actor: Authorized Staff
- Start screen: Task Work Queue - Create task from effect
- API/worker: `internal task service`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Task Work Queue - Create task from effect
3. Perform action: Create task from effect
4. Call internal task service
5. Verify validation and server-side authorization
6. Verify server effect: task with owner/SLA/source created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: task in queue
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

## JRN-062 — Task Work Queue: Assign task

- Actor: Authorized Staff
- Start screen: Task Work Queue - Assign task
- API/worker: `POST /tasks/{id}/assign`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Task Work Queue - Assign task
3. Perform action: Assign task
4. Call POST /tasks/{id}/assign
5. Verify validation and server-side authorization
6. Verify server effect: assignee changed
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: assignee queue updates
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

## JRN-063 — Task Work Queue: Approve/reject task decision

- Actor: Authorized Staff
- Start screen: Task Work Queue - Approve/reject task decision
- API/worker: `POST /tasks/{id}/decision`

### Steps
1. Resolve actor as Authorized Staff
2. Open screen: Task Work Queue - Approve/reject task decision
3. Perform action: Approve/reject task decision
4. Call POST /tasks/{id}/decision
5. Verify validation and server-side authorization
6. Verify server effect: decision stored and source workflow advances
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: source status updates
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

## JRN-064 — Task Work Queue: Escalate overdue task

- Actor: System Worker
- Start screen: Task Work Queue - Escalate overdue task
- API/worker: `worker:task.scan_overdue`

### Steps
1. Resolve actor as System Worker
2. Open screen: Task Work Queue - Escalate overdue task
3. Perform action: Escalate overdue task
4. Call worker:task.scan_overdue
5. Verify validation and server-side authorization
6. Verify server effect: escalation and notification created
7. Verify audit event exists
8. Verify downstream task/job/notification/dashboard/portal effect where specified
9. Verify UI result: task highlighted overdue
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
