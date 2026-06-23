# API_CONTRACT_PLAN.md — Versa API Contract Plan

## Purpose
Defines route conventions before OpenAPI generation. The LLM must not invent inconsistent routes.

## Route Groups
- `/staff/*` — staff UI routes.
- `/school/*` — school UI routes.
- `/verify/*` — public verification routes only.
- `/api/staff/*` — staff APIs, staff auth required.
- `/api/school/*` — school APIs, school auth required.
- `/api/internal/*` — trusted system APIs only.
- `/api/verify/*` — explicit public allow-list only.

## Standard Request Headers
- `Authorization`
- `X-Request-Id`
- `X-Idempotency-Key` for writes
- `X-Client-Version`

Never trust browser-submitted `X-Role`, `X-School-Id`, `X-Scope`, status or approval data.

## Standard Response Envelope
```json
{"ok": true, "data": {}, "meta": {"request_id": "", "server_time": "", "module": "", "audit_event_id": ""}}
```

## Standard Error Envelope
```json
{"ok": false, "error": {"code": "ACCESS_DENIED", "message": "Access denied.", "details": []}, "meta": {"request_id": "", "server_time": "", "module": ""}}
```

## API Generation Rules
1. Read module `messages.json`.
2. Create route.
3. Add auth guard.
4. Add role/scope guard.
5. Add validation.
6. Add idempotency where required.
7. Add lifecycle guard.
8. Add audit event.
9. Add typed response.
10. Add tests.

## Module Route Prefixes
- `company_dashboard` → `/staff/dashboard`
- `staff_users` → `/staff/admin/users`
- `roles_permissions` → `/staff/admin/roles`
- `school_crm` → `/staff/schools/crm`
- `school_onboarding_ops` → `/staff/schools/onboarding`
- `student_roster_ops` → `/staff/students/rosters`
- `finance_ops` → `/staff/finance`
- `exam_slot_ops` → `/staff/exams/slots`
- `exam_material_ops` → `/staff/exams/materials`
- `courier_ops` → `/staff/courier`
- `evaluation_ops` → `/staff/evaluation`
- `results_ops` → `/staff/results`
- `certificate_ops` → `/staff/certificates`
- `notification_ops` → `/staff/notifications`
- `support_tickets` → `/staff/support`
- `task_work_queue` → `/staff/tasks`
- `reports_exports` → `/staff/reports`
- `admin_settings` → `/staff/admin/settings`
- `security_audit_console` → `/staff/security-audit`

## Stop Conditions
Stop if API trusts browser scope/status, exposes private file URLs, lacks audit for write actions, or creates new public exposure without allow-list.
