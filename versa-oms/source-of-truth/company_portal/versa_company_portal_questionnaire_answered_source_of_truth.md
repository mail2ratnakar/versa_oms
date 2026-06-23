# Versa Olympiads — Company/Internal Portal Answered Source of Truth

- Generated at: 2026-06-21T00:00:00+04:00
- Rule: This answered questionnaire is the source for later company-portal module generation.
- Module generation standard: every module must follow the same 14-parameter playbook.


## A. Company Portal Scope

### 1. What is the official name of the internal company portal?

**Answer:** The internal company portal will be called Versa Company Portal for now. Alternate UI label: Versa Operations Console. The product/spec module namespace will use company_portal.

**Decision:** Use Versa Company Portal as business name and company_portal as namespace.

**Affected modules:** company_dashboard; admin_settings

**Priority:** MVP

### 2. Is this portal only for Versa staff, or also for vendors, evaluators, printers, courier partners, and finance users?

**Answer:** MVP is for internal Versa/Fintermatics staff only. External vendors, evaluators, printers and courier partners may be represented as records and limited future users, but not full portal users in MVP.

**Decision:** Internal-staff-only MVP; prepare extensibility for vendor/evaluator restricted access later.

**Affected modules:** staff_users; roles_permissions; admin_settings

**Priority:** MVP+

### 3. Should the company portal be separate from the school portal, or one app with role-based views?

**Answer:** Use one application platform with strict role-based views and separate route groups: /staff/* for company portal, /school/* for school portal, /verify/* for public verification. Do not mix layouts or permissions.

**Decision:** One app, separated by route groups and permissions.

**Affected modules:** roles_permissions; company_dashboard; security_audit_console

**Priority:** MVP

### 4. Should staff log in using email/password, Google login, magic link, OTP, or admin-created accounts?

**Answer:** MVP: admin-created staff accounts with email login/magic link or password depending Directus/Auth setup. Google login can be enabled later for company domain users. OTP can be reserved for high-risk approval actions.

**Decision:** Admin-created invite-only accounts; email login/magic link MVP; Google SSO later; OTP later for high-risk approvals.

**Affected modules:** staff_users; roles_permissions; security_audit_console

**Priority:** MVP

### 5. Should company staff access be invite-only?

**Answer:** Yes. All company staff access must be invite-only. No open staff self-registration.

**Decision:** Invite-only only.

**Affected modules:** staff_users; roles_permissions

**Priority:** MVP

### 6. Should any staff self-register, or only admins create them?

**Answer:** Only Super Admin or Company Admin can create/invite staff. Self-registration is disabled for staff.

**Decision:** No staff self-registration.

**Affected modules:** staff_users

**Priority:** MVP

### 7. Should every staff action be audited?

**Answer:** Yes. All create/update/status/approval/export/login/security-sensitive actions must be audited. Read actions for highly sensitive data should also be audited. Low-risk normal reads can be sampled or excluded unless required.

**Decision:** Audit all staff actions that change data or access sensitive records.

**Affected modules:** security_audit_console; staff_users; reports_exports

**Priority:** MVP

### 8. Should staff access be restricted by department, role, location, or assigned schools?

**Answer:** Yes. Access is restricted by role, department and assigned scope. Sales/support/operations executives may be assigned schools, regions, olympiads or queues. Admin roles can view all.

**Decision:** Use role + department + assignment scope model.

**Affected modules:** roles_permissions; staff_users; task_work_queue

**Priority:** MVP

### 9. Should the portal support multiple companies/entities later, or only one company now?

**Answer:** MVP supports one company entity. Schema should include optional organization_id/company_id fields only where future multi-tenant support is low-cost, but do not overcomplicate MVP.

**Decision:** Single-company MVP with future-friendly namespace.

**Affected modules:** admin_settings; roles_permissions

**Priority:** MVP+

### 10. What is the minimum MVP scope for company portal?

**Answer:** MVP must include dashboard, staff users, roles/permissions, school CRM, school onboarding ops, student roster ops, finance ops, exam slot ops, exam material ops, courier ops, evaluation ops, results ops, certificate ops, notification ops, support tickets, task work queue, reports/exports, admin settings and security/audit console. Modules are generated one by one as semantic specs.

**Decision:** Generate company portal as modular internal operations system, not as one monolith.

**Affected modules:** company_dashboard; staff_users; roles_permissions; school_crm; support_tickets; security_audit_console

**Priority:** MVP


## B. Staff Types and Roles

### 11. List all internal staff roles needed.

**Answer:** Required roles: Super Admin, Company Admin, Operations Head, Operations Executive, Sales/School Outreach Executive, School Onboarding Executive, Finance Admin, Finance Executive, Exam Operations Manager, Question Paper/Content Manager, Material Release Manager, Courier/Logistics Manager, Evaluation Manager, OMR Import Operator, Results Approver, Certificate Manager, Notifications/Communications Manager, Support Executive, Security/Admin Reviewer, Auditor/Read-only Reviewer.

**Decision:** Adopt listed roles as initial role catalog.

**Affected modules:** staff_users; roles_permissions

**Priority:** MVP

### 12. Confirm whether listed roles are needed.

**Answer:** All listed roles are needed. They may be grouped for MVP UI simplicity, but permissions must preserve separation of duties for finance, material release, evaluation, results publication, certificate publication and security review.

**Decision:** Confirm all listed roles; group only visually, not in permissions.

**Affected modules:** roles_permissions

**Priority:** MVP

### 13. Which roles can create other staff users?

**Answer:** Only Super Admin and Company Admin can create/invite staff users. Security/Admin Reviewer may recommend but not create unless granted Company Admin role.

**Decision:** Super Admin and Company Admin only.

**Affected modules:** staff_users; roles_permissions

**Priority:** MVP

### 14. Which roles can disable staff users?

**Answer:** Super Admin and Company Admin can disable staff. Security/Admin Reviewer can request or trigger disable workflow for incidents. Automatic disable occurs after exit date or critical security lock.

**Decision:** Super Admin/Company Admin; security workflow can request/trigger.

**Affected modules:** staff_users; security_audit_console

**Priority:** MVP

### 15. Which roles can reset access?

**Answer:** Super Admin and Company Admin can reset access. Security/Admin Reviewer can force password/session reset for incidents. Department heads can request reset but not execute.

**Decision:** Super Admin/Company Admin plus security incident path.

**Affected modules:** staff_users; security_audit_console

**Priority:** MVP

### 16. Which roles should be read-only?

**Answer:** Auditor/Read-only Reviewer is read-only. Security/Admin Reviewer is mostly read-only plus review/incident actions. Department viewers can be read-only if created later.

**Decision:** Auditor role is read-only; Security reviewer has controlled review actions.

**Affected modules:** roles_permissions; security_audit_console

**Priority:** MVP

### 17. Which roles should have approval powers?

**Answer:** Approval powers: Company Admin for staff/admin settings; Operations Head for school onboarding/material/courier exceptions; Finance Admin for manual payments/refunds; Exam Operations Manager for slots/material readiness; Evaluation Manager/Results Approver for OMR/results; Certificate Manager for certificates; Security/Admin Reviewer for high-risk/security approvals.

**Decision:** Use role-specific approval powers with dual approval for high-risk items.

**Affected modules:** roles_permissions; task_work_queue; security_audit_console

**Priority:** MVP

### 18. Which roles should never have delete permissions?

**Answer:** No operational staff should have hard delete. Support, sales, finance executives, OMR operators, material managers, certificate managers and school onboarding executives never hard delete. Super Admin should also avoid hard delete except technical exception and audit approval.

**Decision:** Hard delete forbidden across business records; use archive/revoke/supersede.

**Affected modules:** roles_permissions; security_audit_console

**Priority:** MVP

### 19. Should staff roles be fixed, or should admins create custom roles?

**Answer:** MVP uses fixed roles and permissions. Later, custom roles may be added, but only with permission review and audit checks.

**Decision:** Fixed roles MVP; custom roles later via change request.

**Affected modules:** roles_permissions

**Priority:** MVP+

### 20. Should staff be assigned to specific schools, regions, exams, or work queues?

**Answer:** Yes. Staff can be assigned to schools, regions/states, olympiads/exams and work queues. Assignment scope controls dashboard, task queue and data visibility for non-admin roles.

**Decision:** Use assignment scope model: school, region, olympiad, queue.

**Affected modules:** staff_users; task_work_queue; company_dashboard

**Priority:** MVP


## C. Staff Profile and HR-like Records

### 21. What staff details must be stored?

**Answer:** Store full name, email, mobile, department, role, reporting manager, employment type, location, active/inactive status, joining date, exit date, assignment scope, last login, invited_by, disabled_by and disable_reason.

**Decision:** Use full operational staff profile schema.

**Affected modules:** staff_users

**Priority:** MVP

### 22. Should staff documents be stored?

**Answer:** MVP should avoid HR document storage unless required. If stored later, documents must be private, restricted and separate from operational access.

**Decision:** Do not include staff documents in MVP; future optional restricted feature.

**Affected modules:** staff_users

**Priority:** Later

### 23. Should joining date and exit date be tracked?

**Answer:** Yes. Joining date and exit date must be tracked for access lifecycle and audit.

**Decision:** Track joining and exit dates.

**Affected modules:** staff_users

**Priority:** MVP

### 24. Should staff access automatically disable after exit date?

**Answer:** Yes. Staff access should auto-disable on or after exit date through a scheduled job or admin workflow.

**Decision:** Auto-disable after exit date.

**Affected modules:** staff_users; security_audit_console

**Priority:** MVP

### 25. Should reporting manager approval be required for some actions?

**Answer:** Yes for operational exceptions, large exports, manual payment confirmations, result corrections and certificate reissue if staff initiating action is below manager level.

**Decision:** Manager approval required for selected high-risk actions.

**Affected modules:** task_work_queue; security_audit_console

**Priority:** MVP

### 26. Should staff workload, productivity, or task completion be tracked?

**Answer:** Yes. Track tasks assigned, completed, overdue, SLA breach, escalations and module-wise action volume. Do not create invasive productivity tracking beyond operational workflow metrics.

**Decision:** Track work queue productivity and SLA metrics.

**Affected modules:** task_work_queue; reports_exports; company_dashboard

**Priority:** MVP

### 27. Should staff attendance/leave be part of this portal, or outside scope?

**Answer:** Outside scope for MVP. Attendance/leave belongs to HR tooling and should not delay operations portal.

**Decision:** Exclude attendance/leave from MVP.

**Affected modules:** staff_users

**Priority:** Later


## D. Company Dashboard

### 28. What should the company dashboard show?

**Answer:** Dashboard should show overall operational command center: schools pipeline, payment status, student counts, slot confirmations, material release, courier status, OMR/evaluation status, result publication, certificate issuance, support tickets, tasks, SLA breaches and high-risk audit alerts.

**Decision:** Build role-aware operations command dashboard.

**Affected modules:** company_dashboard

**Priority:** MVP

### 29. Should dashboard show listed metrics?

**Answer:** Yes. Show total schools, registered schools, paid schools, pending payments, confirmed exam slots, materials released, courier pending, OMR pending, results pending, certificates pending, support tickets open and high-risk audit alerts.

**Decision:** Include all listed KPI cards.

**Affected modules:** company_dashboard

**Priority:** MVP

### 30. Should every role see a different dashboard?

**Answer:** Yes. Dashboard is role-aware. Admin sees all. Finance sees payment/reconciliation. Operations sees school/exam/courier/materials. Evaluation sees OMR/results. Support sees tickets. Sales sees pipeline.

**Decision:** Role-specific dashboard views.

**Affected modules:** company_dashboard; roles_permissions

**Priority:** MVP

### 31. Should dashboard support filters by olympiad, state, school, date, status, and staff owner?

**Answer:** Yes. Filters: olympiad, exam cycle, state/region, school, date range, status, staff owner, workflow stage and risk level.

**Decision:** Add standard operational filters.

**Affected modules:** company_dashboard; reports_exports

**Priority:** MVP

### 32. Should there be a daily operations command center view?

**Answer:** Yes. Daily command center view is required for operations: today’s pending tasks, exams, material releases, courier follow-ups, exceptions and escalations.

**Decision:** Create daily command center screen.

**Affected modules:** company_dashboard; task_work_queue

**Priority:** MVP

### 33. Should there be a critical alerts panel?

**Answer:** Yes. Critical alerts panel must show payment exceptions, material revocations, courier count mismatch, OMR exceptions, result publication risks, security incidents and SLA breaches.

**Decision:** Add critical alerts panel.

**Affected modules:** company_dashboard; security_audit_console

**Priority:** MVP


## E. School CRM / Lead Management

### 34. Should company portal include school lead management?

**Answer:** Yes. School CRM is required in company portal to manage school acquisition before school onboarding.

**Decision:** Include school_crm module.

**Affected modules:** school_crm

**Priority:** MVP

### 35. What stages should school leads follow?

**Answer:** Stages: New Lead, Contacted, Brochure Sent, Demo Scheduled, Demo Completed, Proposal Sent, Follow-up, Payment Pending, Converted, Lost. Add optional Nurture and Not Reachable later.

**Decision:** Use provided CRM stages with optional future stages.

**Affected modules:** school_crm

**Priority:** MVP

### 36. Confirm or modify stages.

**Answer:** Confirmed stages: New Lead → Contacted → Brochure Sent → Demo Scheduled → Demo Completed → Proposal Sent → Follow-up → Payment Pending → Converted / Lost.

**Decision:** Confirmed.

**Affected modules:** school_crm

**Priority:** MVP

### 37. What school lead fields are needed?

**Answer:** Fields: school name, board, address, city, state, country, website, principal name, coordinator name, email, phone, source, lead owner, stage, follow-up date, expected student count, notes, lost reason, duplicate flag, converted_school_id.

**Decision:** Use complete CRM lead schema.

**Affected modules:** school_crm

**Priority:** MVP

### 38. Should staff assign leads to sales executives?

**Answer:** Yes. Leads can be assigned to sales/school outreach executives by Sales Manager/Operations Head/Company Admin.

**Decision:** Lead assignment required.

**Affected modules:** school_crm; task_work_queue

**Priority:** MVP

### 39. Should follow-up reminders be created?

**Answer:** Yes. Follow-up date creates task/reminder and appears in dashboard.

**Decision:** Automatic follow-up tasks.

**Affected modules:** school_crm; task_work_queue; notifications

**Priority:** MVP

### 40. Should call/email/WhatsApp history be tracked?

**Answer:** Yes. Track communication activity as CRM interactions. WhatsApp integration is future optional; manual notes allowed in MVP.

**Decision:** Track communication history; WhatsApp later.

**Affected modules:** school_crm; notifications

**Priority:** MVP

### 41. Should lost reason be mandatory?

**Answer:** Yes. Lost reason is mandatory when moving lead to Lost.

**Decision:** Mandatory lost reason.

**Affected modules:** school_crm

**Priority:** MVP

### 42. Should imported school lead lists be supported?

**Answer:** Yes. Support CSV/XLSX import with validation, duplicate detection and import batch audit.

**Decision:** Lead import supported.

**Affected modules:** school_crm; reports_exports

**Priority:** MVP

### 43. Should duplicate school lead detection be required?

**Answer:** Yes. Detect duplicates by school name + city/state, email, phone, website and normalized address.

**Decision:** Duplicate detection required.

**Affected modules:** school_crm

**Priority:** MVP

### 44. Should lead-to-school conversion create a school record automatically?

**Answer:** Yes. Converted lead should create or link a school record, preserving CRM history and converted_school_id.

**Decision:** Auto-create/link school on conversion.

**Affected modules:** school_crm; school_onboarding_ops

**Priority:** MVP


## F. School Onboarding Operations

### 45. Which staff role approves a school?

**Answer:** School Onboarding Executive can review. Operations Head or Company Admin approves. For exceptions, Security/Admin Reviewer may be required.

**Decision:** Operations Head/Company Admin final approval.

**Affected modules:** school_onboarding_ops

**Priority:** MVP

### 46. What information must staff verify before school approval?

**Answer:** Verify school identity, board, address, official contact, coordinator email/mobile, expected participation, duplicate school check and internal notes. Documents optional in MVP.

**Decision:** Verify identity, contacts, duplicate and participation readiness.

**Affected modules:** school_onboarding_ops

**Priority:** MVP

### 47. Should school approval require documents?

**Answer:** Not mandatory in MVP. Optional document upload can be supported for high-risk/manual verification cases.

**Decision:** Optional documents only.

**Affected modules:** school_onboarding_ops

**Priority:** MVP+

### 48. Should school coordinator identity be verified?

**Answer:** Yes. Coordinator email must be verified. Mobile verification can be later. Staff must confirm coordinator role where needed.

**Decision:** Email verification required; mobile later.

**Affected modules:** school_onboarding_ops; staff_users

**Priority:** MVP

### 49. Should staff be able to edit school records after approval?

**Answer:** Yes, but sensitive edits after approval require reason and audit. Some fields may require Operations Head approval.

**Decision:** Allow controlled edits with reason/audit.

**Affected modules:** school_onboarding_ops; security_audit_console

**Priority:** MVP

### 50. Should edits after approval require reason?

**Answer:** Yes. Edits to name, address, coordinator, board, status and school code require reason.

**Decision:** Reason required for approved-school edits.

**Affected modules:** school_onboarding_ops

**Priority:** MVP

### 51. Should staff be able to block/suspend a school?

**Answer:** Yes. Operations Head, Company Admin or Security/Admin Reviewer can block/suspend a school with reason.

**Decision:** Block/suspend supported with reason.

**Affected modules:** school_onboarding_ops; security_audit_console

**Priority:** MVP

### 52. Should school blocking affect students, payments, materials, results, and certificates?

**Answer:** Yes. Blocking should pause school portal access and stop new actions. Existing payments/results/certificates remain governed by status rules and audit. Material download/result access may be suspended based on reason.

**Decision:** Blocking has downstream workflow impact.

**Affected modules:** school_onboarding_ops; roles_permissions

**Priority:** MVP

### 53. Should school onboarding have SLA tracking?

**Answer:** Yes. Track SLA from lead conversion/registration to approval and onboarding completion.

**Decision:** SLA tracking required.

**Affected modules:** school_onboarding_ops; task_work_queue

**Priority:** MVP


## G. Student and Roster Operations

### 54. Which staff roles can view student data?

**Answer:** Operations Head, Operations Executive, School Onboarding Executive, Exam Operations Manager and Support Executive can view scoped student data. Evaluation roles see candidate IDs and limited details. Finance sees only counts unless permitted.

**Decision:** Scoped student access by role.

**Affected modules:** student_roster_ops; roles_permissions

**Priority:** MVP

### 55. Which staff roles can edit student records?

**Answer:** Operations Executive and Operations Head can edit before roster lock. After lock, only Operations Head/Company Admin can approve corrections with reason.

**Decision:** Controlled edit before lock; approval after lock.

**Affected modules:** student_roster_ops

**Priority:** MVP

### 56. Should operations staff upload students on behalf of schools?

**Answer:** Yes. Operations staff can upload on behalf of schools, with source marked staff_uploaded and audit event.

**Decision:** Staff upload on behalf supported.

**Affected modules:** student_roster_ops

**Priority:** MVP

### 57. Should staff approve student roster locks?

**Answer:** Yes. School can submit roster; staff can review and lock. Auto-lock can be allowed after validation and deadline.

**Decision:** Staff review/lock required for MVP.

**Affected modules:** student_roster_ops

**Priority:** MVP

### 58. Should student corrections after lock require approval?

**Answer:** Yes. Post-lock corrections require reason, approval and audit; may trigger candidate/material regeneration impact review.

**Decision:** Post-lock corrections approval required.

**Affected modules:** student_roster_ops; security_audit_console

**Priority:** MVP

### 59. Should candidate ID generation be staff-triggered or automatic?

**Answer:** Automatic after roster lock, with staff-trigger/manual regenerate only under controlled workflow.

**Decision:** Automatic after lock; controlled regenerate.

**Affected modules:** student_roster_ops

**Priority:** MVP

### 60. Should staff see parent contact details?

**Answer:** Only operations/support roles with need-to-know can see parent contact details. Evaluation and finance should not see parent contact in MVP.

**Decision:** Restrict parent contact fields.

**Affected modules:** student_roster_ops; roles_permissions

**Priority:** MVP

### 61. Should evaluators see student names, or only candidate IDs?

**Answer:** Evaluators and OMR operators should see candidate IDs only by default. Evaluation Manager can access mapping if needed.

**Decision:** Candidate IDs only for evaluators/operators.

**Affected modules:** evaluation_ops; roles_permissions

**Priority:** MVP

### 62. Should student data export be allowed? If yes, for which roles?

**Answer:** Student export allowed only for Operations Head, Company Admin and Security/Admin Reviewer; sensitive export requires reason, audit and optional approval.

**Decision:** Restricted export only.

**Affected modules:** student_roster_ops; reports_exports

**Priority:** MVP


## H. Payment and Finance Operations

### 63. Which staff roles can create payment links?

**Answer:** Finance Admin, Finance Executive and Company Admin can create payment links. Sales may request link but not issue unless explicitly granted.

**Decision:** Finance roles create links.

**Affected modules:** finance_ops

**Priority:** MVP

### 64. Which roles can manually confirm payment?

**Answer:** Finance Admin can manually confirm payment. Finance Executive can prepare confirmation request. Company Admin can approve exceptions.

**Decision:** Finance Admin final manual confirmation.

**Affected modules:** finance_ops

**Priority:** MVP

### 65. Should manual payment confirmation require proof upload?

**Answer:** Yes. Proof upload is mandatory for manual payment confirmation.

**Decision:** Proof required.

**Affected modules:** finance_ops

**Priority:** MVP

### 66. Should manual payment confirmation require dual approval?

**Answer:** Yes for above-threshold payments, late payments, mismatch payments or non-gateway/manual bank transfer cases. Normal low-risk cases can be Finance Admin only.

**Decision:** Dual approval for risky/manual exceptions.

**Affected modules:** finance_ops; security_audit_console

**Priority:** MVP

### 67. Which payment states need staff action?

**Answer:** Staff action states: payment_pending, payment_failed, payment_mismatch, manual_review_required, refund_requested, reversal_detected, reconciliation_exception.

**Decision:** Define finance action states.

**Affected modules:** finance_ops

**Priority:** MVP

### 68. Should finance staff see student-level details or only school/payment summaries?

**Answer:** Finance should see school/payment summaries and student count, not individual student personal details by default.

**Decision:** No student PII for finance by default.

**Affected modules:** finance_ops; roles_permissions

**Priority:** MVP

### 69. Should refund/reversal be supported?

**Answer:** Yes, but controlled. Refund/reversal support should be included as workflow with reason, proof and approval.

**Decision:** Refund/reversal supported through workflow.

**Affected modules:** finance_ops

**Priority:** MVP

### 70. Who can mark payment reversed?

**Answer:** Finance Admin can mark reversed with proof/reason. Company Admin approval required for high-risk or post-material-release reversal.

**Decision:** Finance Admin with approval where needed.

**Affected modules:** finance_ops

**Priority:** MVP

### 71. Should finance reconciliation be daily, exam-wise, or school-wise?

**Answer:** All three: daily operational reconciliation, exam-wise summary and school-wise drill-down.

**Decision:** Daily + exam-wise + school-wise reconciliation.

**Affected modules:** finance_ops; reports_exports

**Priority:** MVP

### 72. Should invoice/receipt generation be part of company portal?

**Answer:** Yes, receipt generation in MVP. Formal tax invoice/GST can be later if required. Include fields so tax module can be added.

**Decision:** Receipt MVP; GST invoice later.

**Affected modules:** finance_ops

**Priority:** MVP+

### 73. Should GST/tax fields be included now or later?

**Answer:** Include optional GST/tax fields now but do not enforce full tax workflow unless business requires it.

**Decision:** Optional tax fields now; full workflow later.

**Affected modules:** finance_ops

**Priority:** MVP+


## I. Exam Slot Operations

### 74. Which staff role creates exam slots?

**Answer:** Exam Operations Manager and Operations Head can create exam slots. Company Admin can override.

**Decision:** Exam Operations Manager/Operations Head.

**Affected modules:** exam_slot_ops

**Priority:** MVP

### 75. Which staff role publishes exam slots?

**Answer:** Operations Head or Exam Operations Manager publishes slots. Company Admin can override.

**Decision:** Operations Head/Exam Operations Manager.

**Affected modules:** exam_slot_ops

**Priority:** MVP

### 76. Should exam slots require approval before publishing?

**Answer:** Yes for new exam cycles and major schedule changes. Simple edits before publish can be single-role controlled.

**Decision:** Approval for new cycles/major changes.

**Affected modules:** exam_slot_ops

**Priority:** MVP

### 77. Can staff assign a school to a slot manually?

**Answer:** Yes. Exam Operations Manager can manually assign/reschedule a school with reason and capacity checks.

**Decision:** Manual assignment allowed with reason.

**Affected modules:** exam_slot_ops

**Priority:** MVP

### 78. Can staff reschedule a school’s slot?

**Answer:** Yes with reason, audit and downstream material impact check.

**Decision:** Reschedule allowed with impact check.

**Affected modules:** exam_slot_ops

**Priority:** MVP

### 79. Should reschedule require reason?

**Answer:** Yes. Reschedule always requires reason.

**Decision:** Reason required.

**Affected modules:** exam_slot_ops

**Priority:** MVP

### 80. Should capacity conflicts be shown to staff?

**Answer:** Yes. Capacity conflicts must be visible and blocking unless override approved.

**Decision:** Show/block capacity conflicts.

**Affected modules:** exam_slot_ops; company_dashboard

**Priority:** MVP

### 81. Should staff lock exam slots before material generation?

**Answer:** Yes. Material generation requires confirmed/locked slot.

**Decision:** Slot lock required before material generation.

**Affected modules:** exam_slot_ops; exam_material_ops

**Priority:** MVP


## J. Exam Materials Operations

### 82. Which staff role generates exam materials?

**Answer:** Material Release Manager, Exam Operations Manager or authorized system job can generate materials after gates pass.

**Decision:** Material Release Manager/Exam Ops/system.

**Affected modules:** exam_material_ops

**Priority:** MVP

### 83. Which role approves exam material release?

**Answer:** Operations Head or Material Release Manager approves. Dual approval required for question paper release close to exam or high-risk changes.

**Decision:** Material Release Manager/Operations Head.

**Affected modules:** exam_material_ops

**Priority:** MVP

### 84. Should material release require dual approval?

**Answer:** Yes for question paper release, replacement after approval, release-time overrides and revocation. Routine non-sensitive materials can be single approval.

**Decision:** Dual approval for high-risk material actions.

**Affected modules:** exam_material_ops; security_audit_console

**Priority:** MVP

### 85. Who can revoke released materials?

**Answer:** Operations Head, Company Admin or Security/Admin Reviewer can revoke with reason and downstream notification.

**Decision:** Restricted revoke with reason.

**Affected modules:** exam_material_ops

**Priority:** MVP

### 86. Should question paper downloads be visible to operations staff?

**Answer:** Yes. Operations staff should see download status, time and user, but not necessarily file contents unless authorized.

**Decision:** Download audit visible; file access restricted.

**Affected modules:** exam_material_ops; security_audit_console

**Priority:** MVP

### 87. Should staff see download history by school?

**Answer:** Yes. Staff dashboard should show school-wise material download history.

**Decision:** Show school-wise download history.

**Affected modules:** exam_material_ops

**Priority:** MVP

### 88. Should material release be automatic based on timer or manual?

**Answer:** Support both. MVP can use scheduled release timer with manual approve/release override by authorized staff.

**Decision:** Scheduled release plus manual override.

**Affected modules:** exam_material_ops

**Priority:** MVP

### 89. Should staff upload/replace question paper files?

**Answer:** Authorized content/material roles can upload before approval. Replacement after approval requires reason, dual approval and versioning.

**Decision:** Controlled upload/replace with versioning.

**Affected modules:** exam_material_ops

**Priority:** MVP

### 90. Should file replacement after approval require reason and audit?

**Answer:** Yes. Mandatory reason, audit, version increment and possibly notification to affected schools.

**Decision:** Reason/audit/version required.

**Affected modules:** exam_material_ops

**Priority:** MVP


## K. Courier and Logistics Operations

### 91. Which staff role creates courier batches?

**Answer:** Courier/Logistics Manager and Operations Executive can create courier batches. Operations Head can override.

**Decision:** Courier/Logistics Manager/Operations Executive.

**Affected modules:** courier_ops

**Priority:** MVP

### 92. Which staff role enters AWB/tracking details?

**Answer:** Courier/Logistics Manager or Operations Executive enters AWB/tracking details. School may submit return AWB for return shipment.

**Decision:** Ops/courier staff plus school return submission.

**Affected modules:** courier_ops

**Priority:** MVP

### 93. Should courier provider integration be manual or API-based later?

**Answer:** Manual in MVP. API integration later through change request.

**Decision:** Manual MVP; API later.

**Affected modules:** courier_ops

**Priority:** MVP+

### 94. Can schools submit return courier details?

**Answer:** Yes. Schools can submit own return AWB/receipt through school portal; company portal reviews it.

**Decision:** School return submission supported.

**Affected modules:** courier_ops

**Priority:** MVP

### 95. Which staff role confirms receipt of returned answer sheets?

**Answer:** Courier/Logistics Manager, Operations Executive or Evaluation Center Intake Operator confirms receipt. Operations Head handles exceptions.

**Decision:** Courier/Ops/Evaluation intake.

**Affected modules:** courier_ops

**Priority:** MVP

### 96. Who resolves count mismatch?

**Answer:** Operations Head or Courier/Logistics Manager can resolve. Evaluation Manager must be involved if OMR import is affected.

**Decision:** Ops Head/Courier Manager; Evaluation involved if OMR affected.

**Affected modules:** courier_ops; evaluation_ops

**Priority:** MVP

### 97. Should mismatch resolution require manager approval?

**Answer:** Yes for shortage/excess beyond tolerance or if OMR import would proceed despite mismatch.

**Decision:** Manager approval for material mismatch exceptions.

**Affected modules:** courier_ops

**Priority:** MVP

### 98. Should courier reports be school-wise, state-wise, or exam-wise?

**Answer:** All three. Reports should support school-wise, state/region-wise and exam/olympiad-wise views.

**Decision:** All report dimensions.

**Affected modules:** courier_ops; reports_exports

**Priority:** MVP

### 99. Should lost/damaged shipment incidents be tracked separately?

**Answer:** Yes. Lost/damaged shipment creates courier exception and security/operations incident when high risk.

**Decision:** Separate incident tracking.

**Affected modules:** courier_ops; security_audit_console

**Priority:** MVP


## L. OMR / Evaluation Operations

### 100. Which staff role uploads OMR scan/CSV files?

**Answer:** OMR Import Operator and Evaluation Manager can upload. Operations staff can hand over files but not approve scoring.

**Decision:** OMR Operator/Evaluation Manager.

**Affected modules:** evaluation_ops

**Priority:** MVP

### 101. Which staff role uploads answer keys?

**Answer:** Evaluation Manager or Question Paper/Content Manager can upload answer keys. Activation/approval requires Results Approver/Evaluation Manager separation if possible.

**Decision:** Evaluation Manager/Content Manager upload; approval separated.

**Affected modules:** evaluation_ops

**Priority:** MVP

### 102. Should answer key approval require dual approval?

**Answer:** Yes. Answer key approval should require dual approval for final exams: Content Manager + Evaluation Manager or Evaluation Manager + Results Approver.

**Decision:** Dual approval for answer keys.

**Affected modules:** evaluation_ops; security_audit_console

**Priority:** MVP

### 103. Should answer key be hidden from operations staff?

**Answer:** Yes. Operations staff should not see answer keys. Only evaluation/content authorized roles see them.

**Decision:** Hide answer keys from operations.

**Affected modules:** evaluation_ops; roles_permissions

**Priority:** MVP

### 104. Should OMR operators see student names or only candidate IDs?

**Answer:** OMR operators see only candidate IDs and sheet identifiers by default. Evaluation Manager may access mapping.

**Decision:** Candidate ID only for OMR operators.

**Affected modules:** evaluation_ops

**Priority:** MVP

### 105. Who can approve OMR import for results?

**Answer:** Evaluation Manager or Results Approver can approve OMR import for results. OMR Import Operator cannot approve own import.

**Decision:** Evaluation Manager/Results Approver; maker-checker.

**Affected modules:** evaluation_ops

**Priority:** MVP

### 106. Should exceptions be assigned to evaluators?

**Answer:** Yes. Exceptions can be assigned to Evaluation Manager or specialized reviewers with candidate-ID-only view.

**Decision:** Exception assignment supported.

**Affected modules:** evaluation_ops; task_work_queue

**Priority:** MVP

### 107. Should manual score correction be allowed at all?

**Answer:** Not in MVP except through audited correction/recalculation workflow after formal approval. Direct score edit is forbidden.

**Decision:** No direct manual score edit.

**Affected modules:** evaluation_ops; results_ops

**Priority:** MVP

### 108. If manual correction is allowed, who approves it?

**Answer:** If enabled later, requires Evaluation Manager + Results Approver + Security/Admin Reviewer for high-impact corrections.

**Decision:** Strict multi-approval if later enabled.

**Affected modules:** evaluation_ops

**Priority:** Later

### 109. Should evaluation batches have SLA tracking?

**Answer:** Yes. Track OMR upload, validation, exception resolution, scoring approval and result handoff SLA.

**Decision:** Evaluation SLA required.

**Affected modules:** evaluation_ops; task_work_queue

**Priority:** MVP

### 110. Should re-evaluation be supported now or later?

**Answer:** Later. MVP should keep extension points for re-evaluation but not implement full workflow.

**Decision:** Re-evaluation later.

**Affected modules:** evaluation_ops; results_ops

**Priority:** Later


## M. Results Operations

### 111. Which role generates results?

**Answer:** Results can be generated by system job or Evaluation Manager after OMR approved-for-results.

**Decision:** System/Evaluation Manager.

**Affected modules:** results_ops

**Priority:** MVP

### 112. Which role approves results?

**Answer:** Results Approver and Evaluation Manager approve. High-risk result publication should require dual approval.

**Decision:** Results Approver/Evaluation Manager.

**Affected modules:** results_ops

**Priority:** MVP

### 113. Which role publishes results?

**Answer:** Results Approver or Company Admin publishes after approval. System can publish scheduled batches once approved.

**Decision:** Results Approver/Company Admin/system scheduled.

**Affected modules:** results_ops

**Priority:** MVP

### 114. Should result publication require dual approval?

**Answer:** Yes. For final publication, use dual approval: Evaluation Manager + Results Approver or Results Approver + Company Admin.

**Decision:** Dual approval for publication.

**Affected modules:** results_ops; security_audit_console

**Priority:** MVP

### 115. Should results be school-visible only or public too?

**Answer:** MVP: school-visible only. Public result lookup is later optional and must pass privacy/security review.

**Decision:** School-visible only MVP.

**Affected modules:** results_ops

**Priority:** MVP+

### 116. Should staff be able to withhold individual results?

**Answer:** Yes. Results Approver/Evaluation Manager can withhold with reason.

**Decision:** Withhold supported with reason.

**Affected modules:** results_ops

**Priority:** MVP

### 117. Should result correction after publication be allowed?

**Answer:** Yes, through audited correction workflow requiring reason, approval, rank recalculation and certificate impact check.

**Decision:** Correction allowed through workflow.

**Affected modules:** results_ops

**Priority:** MVP

### 118. Should result correction trigger certificate revocation/reissue?

**Answer:** Yes. If published result affects issued certificates, certificate revoke/reissue workflow must be triggered.

**Decision:** Trigger certificate impact workflow.

**Affected modules:** results_ops; certificate_ops

**Priority:** MVP

### 119. Should ranking be national, state, school, grade, subject, or all?

**Answer:** Support all as configurable dimensions: national, state, school, grade and subject where data supports it. MVP can show school/grade/national.

**Decision:** All dimensions; MVP school/grade/national.

**Affected modules:** results_ops; reports_exports

**Priority:** MVP

### 120. Should tie rules be configurable?

**Answer:** Yes. Default competition ranking; allow future dense/ordinal options through versioned ranking policy.

**Decision:** Configurable tie rules.

**Affected modules:** results_ops

**Priority:** MVP


## N. Certificates Operations

### 121. Which role manages certificate templates?

**Answer:** Certificate Manager manages templates. Company Admin can approve/override. Security review needed for public verification changes.

**Decision:** Certificate Manager.

**Affected modules:** certificate_ops

**Priority:** MVP

### 122. Which role generates certificates?

**Answer:** System or Certificate Manager generates certificates after results are published.

**Decision:** System/Certificate Manager.

**Affected modules:** certificate_ops

**Priority:** MVP

### 123. Which role publishes certificates?

**Answer:** Certificate Manager publishes. Company Admin can approve high-risk/reissue cases.

**Decision:** Certificate Manager; Company Admin for exceptions.

**Affected modules:** certificate_ops

**Priority:** MVP

### 124. Should certificates be generated automatically after results publication?

**Answer:** Yes, for eligible published results using active templates. Manual batch generation also allowed.

**Decision:** Auto-generate eligible certificates after results publication.

**Affected modules:** certificate_ops

**Priority:** MVP

### 125. Should certificate verification be public?

**Answer:** Yes, public verification by QR/verification code with minimal fields only.

**Decision:** Public minimal verification enabled.

**Affected modules:** certificate_ops

**Priority:** MVP

### 126. Should certificate PDF be downloadable by school only, student/parent also, or both later?

**Answer:** MVP: school downloads. Later: student/parent download via secure link/OTP.

**Decision:** School-only MVP; parent/student later.

**Affected modules:** certificate_ops

**Priority:** MVP+

### 127. Should certificate revocation be supported?

**Answer:** Yes. Revocation requires reason and audit; public verification shows invalid/revoked status.

**Decision:** Revocation supported.

**Affected modules:** certificate_ops

**Priority:** MVP

### 128. Should certificate reissue require approval?

**Answer:** Yes. Reissue requires reason, previous certificate supersede/revoke and approval.

**Decision:** Approval required for reissue.

**Affected modules:** certificate_ops

**Priority:** MVP

### 129. Should digital signature integration be required now or later?

**Answer:** Later. MVP should support template/signature placeholder. Digital signature provider like DocuSeal can be added later.

**Decision:** Digital signature later.

**Affected modules:** certificate_ops

**Priority:** Later


## O. Notifications and Communications

### 130. Which staff role manages notification templates?

**Answer:** Notifications/Communications Manager and Operations Admin manage templates. Company Admin approves critical templates.

**Decision:** Communications Manager/Ops Admin.

**Affected modules:** notification_ops

**Priority:** MVP

### 131. Which events require notification?

**Answer:** Notify for school approval, student upload validation, payment link/success/failure, exam slot confirmation, material release/revocation, courier dispatched/return/received/mismatch, OMR exception, results published, certificates available/revoked, support ticket updates and security-critical alerts.

**Decision:** Use comprehensive event catalog.

**Affected modules:** notification_ops

**Priority:** MVP

### 132. Which channels are required in MVP?

**Answer:** MVP channels: email and in-app. SMS/WhatsApp later.

**Decision:** Email + in-app MVP.

**Affected modules:** notification_ops

**Priority:** MVP

### 133. Should staff be able to send manual announcements to schools?

**Answer:** Yes. Manual announcements to selected schools/groups should be supported, but approval required for bulk/critical messages.

**Decision:** Manual announcements supported with approval for bulk.

**Affected modules:** notification_ops

**Priority:** MVP

### 134. Should announcements require approval?

**Answer:** Yes for bulk announcements, exam-critical messages, result/certificate/publication messages and any message to all schools.

**Decision:** Approval for bulk/critical announcements.

**Affected modules:** notification_ops

**Priority:** MVP

### 135. Should schools receive reminders for listed items?

**Answer:** Yes. Reminders: payment pending, student list pending, exam slot confirmation, material release, courier return, results published and certificates available.

**Decision:** All listed reminders enabled.

**Affected modules:** notification_ops

**Priority:** MVP

### 136. Should failed notification delivery be visible to staff?

**Answer:** Yes. Delivery failures visible to Communications Manager/Ops Admin with retry controls and masked contact display where needed.

**Decision:** Show failed deliveries.

**Affected modules:** notification_ops

**Priority:** MVP

### 137. Should notification retry be automatic?

**Answer:** Yes. Automatic retry up to policy limit; then failed/dead-letter status and staff review.

**Decision:** Automatic retries with cap.

**Affected modules:** notification_ops

**Priority:** MVP


## P. Support / Helpdesk

### 138. Should company portal include support tickets?

**Answer:** Yes. Support ticket module is required for school/staff/system issues.

**Decision:** Include support_tickets module.

**Affected modules:** support_tickets

**Priority:** MVP

### 139. Who can create support tickets?

**Answer:** Schools, staff and system can create tickets. Public users cannot create tickets in MVP unless linked to verification support later.

**Decision:** School/staff/system tickets.

**Affected modules:** support_tickets

**Priority:** MVP

### 140. What ticket categories are needed?

**Answer:** Categories: Login issue, Payment issue, Student upload issue, Exam slot issue, Material download issue, Courier issue, Result issue, Certificate issue, Notification issue, Security/privacy issue, Other.

**Decision:** Adopt listed categories plus notification/security.

**Affected modules:** support_tickets

**Priority:** MVP

### 141. Which staff role handles tickets?

**Answer:** Support Executive handles first level. Operations/Finance/Evaluation/Certificate owners handle category escalations. Support Manager/Operations Head manages SLA escalations.

**Decision:** Support Executive + category escalation.

**Affected modules:** support_tickets; task_work_queue

**Priority:** MVP

### 142. Should tickets have priority levels?

**Answer:** Yes. Priority: low, medium, high, critical.

**Decision:** Priority levels required.

**Affected modules:** support_tickets

**Priority:** MVP

### 143. Should tickets have SLA?

**Answer:** Yes. SLA by category and priority. Critical exam-day/material/payment/result issues have stricter SLA.

**Decision:** SLA required.

**Affected modules:** support_tickets

**Priority:** MVP

### 144. Should tickets be linked to school/student/payment/result/certificate records?

**Answer:** Yes. Tickets can link to school, student, payment, exam slot, material, courier, OMR import, result, certificate and notification delivery records.

**Decision:** Multi-entity linking required.

**Affected modules:** support_tickets

**Priority:** MVP

### 145. Should support replies be emailed to schools?

**Answer:** Yes. Support replies should create notification/email and in-app message where enabled.

**Decision:** Support replies notify school.

**Affected modules:** support_tickets; notification_ops

**Priority:** MVP

### 146. Should ticket escalation be supported?

**Answer:** Yes. Escalation by SLA breach, category, priority or manual assignment.

**Decision:** Escalation supported.

**Affected modules:** support_tickets; task_work_queue

**Priority:** MVP


## Q. Tasks and Work Queue

### 147. Should company portal include internal task management?

**Answer:** Yes. Task/work queue is required to operationalize approvals, follow-ups, exceptions and SLAs.

**Decision:** Include task_work_queue module.

**Affected modules:** task_work_queue

**Priority:** MVP

### 148. Should system automatically create tasks from workflow events?

**Answer:** Yes. Workflow events should create tasks for approval, exception resolution, follow-up and SLA actions.

**Decision:** System-created tasks required.

**Affected modules:** task_work_queue

**Priority:** MVP

### 149. Example tasks.

**Answer:** All examples are required: approve school, follow up payment, validate student upload, release materials, enter courier receipt, resolve OMR exception, approve results, publish certificates. Add support ticket escalation and audit review tasks.

**Decision:** Adopt all listed tasks plus support/audit tasks.

**Affected modules:** task_work_queue

**Priority:** MVP

### 150. Should tasks have owner, due date, priority, status, and SLA?

**Answer:** Yes. Required task fields: owner, queue, module, linked entity, due date, priority, status, SLA, escalation level and completion note.

**Decision:** Full task metadata required.

**Affected modules:** task_work_queue

**Priority:** MVP

### 151. Should staff reassign tasks?

**Answer:** Yes. Reassignment allowed by task owner’s manager, queue manager, Operations Head or Company Admin with reason.

**Decision:** Controlled reassignment.

**Affected modules:** task_work_queue

**Priority:** MVP

### 152. Should managers see team workload?

**Answer:** Yes. Managers see workload, overdue tasks and SLA breaches for their teams/queues.

**Decision:** Manager workload view.

**Affected modules:** task_work_queue; company_dashboard

**Priority:** MVP

### 153. Should overdue tasks create alerts?

**Answer:** Yes. Overdue tasks create dashboard alerts and notifications/escalations.

**Decision:** Overdue alerts required.

**Affected modules:** task_work_queue; notification_ops

**Priority:** MVP


## R. Reports and Analytics

### 154. What reports are needed for company staff?

**Answer:** Required report suite: operational pipeline, finance, student counts, exam slots, materials, courier, OMR/evaluation, results, certificates, notifications, support, tasks, staff productivity, audit/security and export logs.

**Decision:** Full operational report suite.

**Affected modules:** reports_exports

**Priority:** MVP

### 155. Confirm required reports.

**Answer:** Confirmed all listed reports: school pipeline, payment, student count, exam slot, material release, courier reconciliation, OMR import, result publication, certificate issue, notification delivery, staff productivity and audit/security reports.

**Decision:** Confirmed.

**Affected modules:** reports_exports

**Priority:** MVP

### 156. Should reports be downloadable as CSV/XLSX/PDF?

**Answer:** CSV and XLSX in MVP. PDF later for formal reports unless needed. Audit exports use controlled private files.

**Decision:** CSV/XLSX MVP; PDF later.

**Affected modules:** reports_exports

**Priority:** MVP+

### 157. Which roles can export reports?

**Answer:** Company Admin, Operations Head, Finance Admin for finance, Evaluation Manager for evaluation/results, Certificate Manager for certificates, Security/Admin Reviewer for audit/security. Executives export only assigned scope if enabled.

**Decision:** Role-scoped exports.

**Affected modules:** reports_exports; roles_permissions

**Priority:** MVP

### 158. Should exports require approval?

**Answer:** Sensitive exports require approval and reason. Non-sensitive operational summaries can be direct for admin roles.

**Decision:** Approval for sensitive exports.

**Affected modules:** reports_exports; security_audit_console

**Priority:** MVP

### 159. Should sensitive exports be watermarked?

**Answer:** Yes. Sensitive XLSX/PDF exports should include generated_by, timestamp, scope and confidentiality note. CSV should include metadata header or companion manifest where possible.

**Decision:** Watermark/metadata required for sensitive exports.

**Affected modules:** reports_exports

**Priority:** MVP

### 160. Should export activity be audited?

**Answer:** Yes. Every export must be audited with requester, scope, filters, reason, file and timestamp.

**Decision:** Audit all exports.

**Affected modules:** reports_exports; security_audit_console

**Priority:** MVP


## S. Audit, Security, and Compliance

### 161. Which company portal actions are high-risk?

**Answer:** High-risk: staff role/permission changes, manual payment confirmation/reversal/refund, exam slot reschedule, question paper/material release/revoke/replace, answer key approval/change, OMR approval, result publication/correction, certificate revoke/reissue, bulk notifications, sensitive exports, public verification changes and audit export.

**Decision:** High-risk list adopted.

**Affected modules:** security_audit_console

**Priority:** MVP

### 162. Should every high-risk action require reason?

**Answer:** Yes. Every high-risk action requires reason and audit.

**Decision:** Reason required.

**Affected modules:** security_audit_console

**Priority:** MVP

### 163. Should some actions require two-person approval?

**Answer:** Yes. High-impact finance, material, answer key, result publication, certificate reissue/revoke and sensitive exports require two-person approval.

**Decision:** Two-person approval for high-impact actions.

**Affected modules:** security_audit_console; task_work_queue

**Priority:** MVP

### 164. Which actions require dual approval?

**Answer:** Dual approval: manual payment confirmation above threshold, refunds/reversals, material/question paper release and replacement, answer key approval, OMR approval for results, result publication, result correction after publication, certificate reissue/revocation, public verification policy changes, sensitive exports and role permission changes.

**Decision:** Adopt dual-approval list.

**Affected modules:** security_audit_console

**Priority:** MVP

### 165. Should public role permissions be reviewed automatically?

**Answer:** Yes. Public role permissions must be checked automatically and flagged if sensitive access appears.

**Decision:** Automatic public-role review.

**Affected modules:** security_audit_console

**Priority:** MVP

### 166. Should staff access reviews be monthly?

**Answer:** Yes. Monthly access review is required; critical admin roles can be reviewed more frequently.

**Decision:** Monthly access review.

**Affected modules:** security_audit_console

**Priority:** MVP

### 167. Should audit logs be visible to operations staff or only security/admin?

**Answer:** Operations staff see operational audit summaries only. Raw audit logs are for Security/Admin Reviewer, Company Admin and Super Admin.

**Decision:** Raw audit restricted.

**Affected modules:** security_audit_console

**Priority:** MVP

### 168. Should staff login history be tracked?

**Answer:** Yes. Track login history, last login, failed logins and session resets.

**Decision:** Track login history.

**Affected modules:** security_audit_console; staff_users

**Priority:** MVP

### 169. Should failed login attempts be tracked?

**Answer:** Yes. Failed attempts tracked and alert after threshold.

**Decision:** Track failed logins.

**Affected modules:** security_audit_console

**Priority:** MVP

### 170. Should IP/device info be tracked?

**Answer:** Yes where available: IP, user agent, device/browser metadata and approximate location if allowed.

**Decision:** Track IP/device where available.

**Affected modules:** security_audit_console

**Priority:** MVP

### 171. Should suspicious activity create incidents?

**Answer:** Yes. Suspicious activity should create security incident or alert depending severity.

**Decision:** Incident/alert on suspicious activity.

**Affected modules:** security_audit_console

**Priority:** MVP

### 172. Should company portal have a security incident register?

**Answer:** Yes. Security incident register is required.

**Decision:** Incident register required.

**Affected modules:** security_audit_console

**Priority:** MVP


## T. Settings and Master Data

### 173. Which settings should company admins manage?

**Answer:** Admins manage olympiad definitions, subjects, grades/classes, pricing rules, payment rules, exam slot rules, material release rules, courier rules, ranking rules, certificate templates, notification templates, staff roles and permission matrix.

**Decision:** Admin settings module covers all master data.

**Affected modules:** admin_settings

**Priority:** MVP

### 174. Confirm settings.

**Answer:** Confirmed all listed settings: olympiad definitions, subjects, grades/classes, pricing rules, payment rules, exam slot rules, material release rules, courier rules, result ranking rules, certificate templates, notification templates, staff roles and permission matrix.

**Decision:** Confirmed.

**Affected modules:** admin_settings

**Priority:** MVP

### 175. Which settings should be editable only by Super Admin?

**Answer:** Super Admin only: permission matrix, system security settings, provider secrets, public verification settings, audit retention policy, hard-delete exceptions, environment/provider configuration. Company Admin can manage business settings.

**Decision:** Super Admin for security/system settings.

**Affected modules:** admin_settings; roles_permissions

**Priority:** MVP

### 176. Which settings should be versioned?

**Answer:** Version: pricing rules, payment rules, exam slot rules, material release rules, ranking rules, certificate templates, notification templates, permission matrix and public verification policy.

**Decision:** Version critical settings.

**Affected modules:** admin_settings

**Priority:** MVP

### 177. Which settings should require approval before activation?

**Answer:** Require approval: pricing, payment, exam slot publication, material release, ranking, certificate templates, notification bulk templates, permission matrix and public verification settings.

**Decision:** Approval before activation for critical settings.

**Affected modules:** admin_settings; security_audit_console

**Priority:** MVP


## U. Data Visibility and Privacy

### 178. Should staff see all schools or assigned schools only?

**Answer:** Admins/heads see all. Executives/support/sales see assigned schools/regions/queues only.

**Decision:** Scope by role/assignment.

**Affected modules:** roles_permissions

**Priority:** MVP

### 179. Should staff see all students or assigned schools only?

**Answer:** Admins/operations heads see all. Executives see assigned scope. Evaluation operators see candidate IDs only unless manager role.

**Decision:** Scoped student visibility.

**Affected modules:** roles_permissions; student_roster_ops

**Priority:** MVP

### 180. Should finance staff see student personal data?

**Answer:** No. Finance sees school/payment summary and counts, not student PII by default.

**Decision:** No student PII for finance.

**Affected modules:** finance_ops; roles_permissions

**Priority:** MVP

### 181. Should evaluators see school names?

**Answer:** OMR operators/evaluators see school names only if required for batch operations; default candidate/batch IDs. Evaluation Manager can see school names.

**Decision:** Limited school visibility for evaluators.

**Affected modules:** evaluation_ops; roles_permissions

**Priority:** MVP

### 182. Should operations staff see answer keys?

**Answer:** No. Answer keys are restricted to evaluation/content authorized roles.

**Decision:** Operations cannot see answer keys.

**Affected modules:** evaluation_ops; roles_permissions

**Priority:** MVP

### 183. Should support staff see payments?

**Answer:** Support can see payment status and basic issue context, not full gateway payload/proofs unless escalated to finance.

**Decision:** Limited payment visibility for support.

**Affected modules:** support_tickets; finance_ops

**Priority:** MVP

### 184. Should support staff see results?

**Answer:** Support can see publication/status and school-facing result summary when ticket requires it. Raw OMR and answer keys remain hidden.

**Decision:** Limited result visibility for support.

**Affected modules:** support_tickets; results_ops

**Priority:** MVP

### 185. Should certificate staff see OMR details?

**Answer:** No. Certificate staff sees published result eligibility fields only, not OMR details.

**Decision:** No OMR details for certificate staff.

**Affected modules:** certificate_ops; roles_permissions

**Priority:** MVP

### 186. Should any data be masked by default?

**Answer:** Yes. Mask parent contacts, recipient contacts, payment references, internal notes, answer key fields, raw OMR fields, provider payloads and audit snapshots by default for non-admin roles.

**Decision:** Default masking for sensitive fields.

**Affected modules:** roles_permissions; reports_exports

**Priority:** MVP

### 187. Should exports hide/mask sensitive fields?

**Answer:** Yes. Exports must hide/mask sensitive fields based on role and export type. Sensitive exports require approval and audit.

**Decision:** Masked exports by role.

**Affected modules:** reports_exports; security_audit_console

**Priority:** MVP


## V. Company Portal Modules to Generate Later

### 188. Confirm whether we should generate listed company portal modules.

**Answer:** Yes. Generate all listed modules. These are separate from the already completed Olympiad business modules, but they operate/control them through internal staff workflows.

**Decision:** Generate all listed company portal modules.

**Affected modules:** company_dashboard; staff_users; roles_permissions; school_crm; school_onboarding_ops; student_roster_ops; finance_ops; exam_slot_ops; exam_material_ops; courier_ops; evaluation_ops; results_ops; certificate_ops; notification_ops; support_tickets; task_work_queue; reports_exports; admin_settings; security_audit_console

**Priority:** MVP

### 189. Which of the above should be merged?

**Answer:** Do not merge in source-of-truth. For implementation, some UI pages may be grouped under Operations, but specs should remain separate for clarity, permissions and build safety.

**Decision:** Keep modules separate in spec; UI may group later.

**Affected modules:** company_dashboard; staff_users; roles_permissions; school_crm; school_onboarding_ops; student_roster_ops; finance_ops; exam_slot_ops; exam_material_ops; courier_ops; evaluation_ops; results_ops; certificate_ops; notification_ops; support_tickets; task_work_queue; reports_exports; admin_settings; security_audit_console

**Priority:** MVP

### 190. Which of the above should be split further?

**Answer:** Potential future splits: reports_exports into reports and exports; roles_permissions into roles and access reviews; evaluation_ops into answer_keys and omr_review; admin_settings into business_settings and security_settings. For MVP, keep listed modules.

**Decision:** No split for MVP; note future split candidates.

**Affected modules:** reports_exports; roles_permissions; evaluation_ops; admin_settings

**Priority:** MVP+

### 191. Which module should be generated first after the questionnaire CSV is ready?

**Answer:** Generate company_dashboard first, then staff_users, then roles_permissions. This establishes portal shell, users and permissions before operations modules.

**Decision:** First module: company_dashboard.

**Affected modules:** company_dashboard

**Priority:** MVP

### 192. What is the final priority order?

**Answer:** Priority order: company_dashboard, staff_users, roles_permissions, school_crm, school_onboarding_ops, student_roster_ops, finance_ops, exam_slot_ops, exam_material_ops, courier_ops, evaluation_ops, results_ops, certificate_ops, notification_ops, support_tickets, task_work_queue, reports_exports, admin_settings, security_audit_console.

**Decision:** Use this sequence for later generation.

**Affected modules:** company_dashboard; staff_users; roles_permissions; school_crm; school_onboarding_ops; student_roster_ops; finance_ops; exam_slot_ops; exam_material_ops; courier_ops; evaluation_ops; results_ops; certificate_ops; notification_ops; support_tickets; task_work_queue; reports_exports; admin_settings; security_audit_console

**Priority:** MVP


## W. Build Rules for Company Portal

### 193. Should each module follow the same 14-point structure?

**Answer:** Yes. Every company portal module must follow the same 14-point modular design structure used for previous modules.

**Decision:** 14-point structure mandatory.

**Affected modules:** company_dashboard; staff_users; roles_permissions; school_crm; school_onboarding_ops; student_roster_ops; finance_ops; exam_slot_ops; exam_material_ops; courier_ops; evaluation_ops; results_ops; certificate_ops; notification_ops; support_tickets; task_work_queue; reports_exports; admin_settings; security_audit_console

**Priority:** MVP

### 194. Should every module include listed files?

**Answer:** Yes. Every module must include module.json, schema.json, workflows.json, messages.json, validations.json, screens.json, permissions.json, security.json, data_classification.json, access_matrix.json, dependency_map.json, lifecycle_states.json, change_control.json, versioning_policy.json, feature_request_template.json, bug_fix_template.json, tests.json, runbook.md and final_modular_design.md. Additional policy files may be added where needed.

**Decision:** All listed files mandatory per module.

**Affected modules:** company_dashboard; staff_users; roles_permissions; school_crm; school_onboarding_ops; student_roster_ops; finance_ops; exam_slot_ops; exam_material_ops; courier_ops; evaluation_ops; results_ops; certificate_ops; notification_ops; support_tickets; task_work_queue; reports_exports; admin_settings; security_audit_console

**Priority:** MVP

### 195. Should company portal modules use the same naming style as previous modules?

**Answer:** Yes. Use lowercase snake_case module IDs, semantic JSON/MD files, completed-vs-pending reports, manifests, source trace CSVs and module ZIPs.

**Decision:** Same naming style.

**Affected modules:** company_dashboard; staff_users; roles_permissions; school_crm; school_onboarding_ops; student_roster_ops; finance_ops; exam_slot_ops; exam_material_ops; courier_ops; evaluation_ops; results_ops; certificate_ops; notification_ops; support_tickets; task_work_queue; reports_exports; admin_settings; security_audit_console

**Priority:** MVP

### 196. Should every module have completed-vs-pending summary?

**Answer:** Yes. Each module must include a completed-vs-pending summary and running module status.

**Decision:** Summary mandatory.

**Affected modules:** company_dashboard; staff_users; roles_permissions; school_crm; school_onboarding_ops; student_roster_ops; finance_ops; exam_slot_ops; exam_material_ops; courier_ops; evaluation_ops; results_ops; certificate_ops; notification_ops; support_tickets; task_work_queue; reports_exports; admin_settings; security_audit_console

**Priority:** MVP

### 197. Should every module have source trace CSV?

**Answer:** Yes. Each module must include a source trace CSV extracted from this company portal source-of-truth CSV and any future answered sources.

**Decision:** Source trace mandatory.

**Affected modules:** company_dashboard; staff_users; roles_permissions; school_crm; school_onboarding_ops; student_roster_ops; finance_ops; exam_slot_ops; exam_material_ops; courier_ops; evaluation_ops; results_ops; certificate_ops; notification_ops; support_tickets; task_work_queue; reports_exports; admin_settings; security_audit_console

**Priority:** MVP

### 198. Should every module be delivered as ZIP?

**Answer:** Yes. Deliver each module as a ZIP with manifest and integrity verification.

**Decision:** ZIP mandatory.

**Affected modules:** company_dashboard; staff_users; roles_permissions; school_crm; school_onboarding_ops; student_roster_ops; finance_ops; exam_slot_ops; exam_material_ops; courier_ops; evaluation_ops; results_ops; certificate_ops; notification_ops; support_tickets; task_work_queue; reports_exports; admin_settings; security_audit_console

**Priority:** MVP

### 199. Should all company portal specs be kept separate from school/exam business modules?

**Answer:** Yes. Keep company portal specs separate under company_portal namespace. Business modules remain previous source. Cross-links go through dependency maps and internal operations modules.

**Decision:** Separate namespace and packs.

**Affected modules:** company_dashboard; staff_users; roles_permissions; school_crm; school_onboarding_ops; student_roster_ops; finance_ops; exam_slot_ops; exam_material_ops; courier_ops; evaluation_ops; results_ops; certificate_ops; notification_ops; support_tickets; task_work_queue; reports_exports; admin_settings; security_audit_console

**Priority:** MVP

### 200. Any special rule for company portal that was not covered above?

**Answer:** Special rule: company portal is a control plane. It must never weaken business-module security. Staff actions must be scoped, audited and approval-gated where high-risk. No module should trust browser-submitted school_id, staff role, price, score, file URL, approval status or recipient list. All high-risk actions require server-side guards, reason, audit, and where configured dual approval.

**Decision:** Company portal is control plane; strict server-side trust boundaries.

**Affected modules:** company_dashboard; staff_users; roles_permissions; school_crm; school_onboarding_ops; student_roster_ops; finance_ops; exam_slot_ops; exam_material_ops; courier_ops; evaluation_ops; results_ops; certificate_ops; notification_ops; support_tickets; task_work_queue; reports_exports; admin_settings; security_audit_console

**Priority:** MVP
