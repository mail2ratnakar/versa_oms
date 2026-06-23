# Threat Model

Generated from security, privacy, audit and reconciliation rows.

## Cross-school data access

Prevent by deriving school_id from session and enforcing Directus item-level permissions.

## Exam material leakage

Prevent by private files, controlled downloads, release gates and download audit.

## Payment webhook tampering

Prevent by Razorpay signature verification, amount checks and idempotency.

## Public verification abuse

Prevent by field whitelisting and rate limiting.

## Result or certificate tampering

Prevent by approval workflow, audit events, correction/revocation rules.

## Secret leakage

Prevent by server-side environment variables only and secret scans.

## Source controls

| question_id | section | module | answer | security_level |
|---|---|---|---|---|
| 15.001 | 15 Security Hardening | deny_by_default | Deny by default for all collections, files, APIs and routes unless explicitly granted. | restricted |
| 15.002 | 15 Security Hardening | admin_mfa | Require MFA for system_admin and finverse_admin where identity provider/Directus supports it. | restricted |
| 15.003 | 15 Security Hardening | school_isolation | Every school-facing query and mutation must derive school_id from authenticated session, not browser input. | restricted |
| 15.004 | 15 Security Hardening | field_level_permissions | Hide parent contact, payment internals, evaluation notes and internal notes from roles that do not need them. | restricted |
| 15.005 | 15 Security Hardening | private_files_default | All files are private unless explicitly whitelisted for public certificate verification metadata. | restricted |
| 15.006 | 15 Security Hardening | signed_downloads | Downloads must pass through server-side permission check and log audit event; use signed/streamed access. | restricted |
| 15.007 | 15 Security Hardening | webhook_signature | Razorpay webhook must verify signature before updating payment records. | restricted |
| 15.008 | 15 Security Hardening | webhook_idempotency | Duplicate webhook/event must not double-update payment or generate duplicate audit side effects. | restricted |
| 15.009 | 15 Security Hardening | rate_limiting | Rate limit login, public verification, uploads, webhook endpoints and expensive export/download endpoints. | restricted |
| 15.010 | 15 Security Hardening | input_validation | Validate all server inputs using schema validation; never trust client-side validation alone. | restricted |
| 15.011 | 15 Security Hardening | upload_validation | Validate file type, size, extension, MIME, and expected parser format before processing. | restricted |
| 15.012 | 15 Security Hardening | secrets_policy | No secrets in browser, GitHub, logs, CSV, screenshots or generated documentation; .env.example uses placeholders only. | restricted |
| 15.013 | 15 Security Hardening | error_safety | User-facing errors must be clear but not reveal internal table names, tokens, stack traces, SQL/API details. | restricted |
| 15.014 | 15 Security Hardening | audit_required | Audit login failures, role changes, payment updates, manual overrides, result changes, file downloads, certificate actions. | restricted |
| 15.015 | 15 Security Hardening | least_privilege | Each role only receives permissions required for its workflow; delete disabled by default. | restricted |
| 15.016 | 15 Security Hardening | session_timeout | Use reasonable session timeout; require re-authentication for high-risk admin/payment actions if possible. | restricted |
| 15.017 | 15 Security Hardening | csrf_protection | Protect mutating routes using same-site cookies/CSRF tokens or framework equivalent. | restricted |
| 15.018 | 15 Security Hardening | cors_restriction | Restrict API/CORS origins to approved portal domains in production. | restricted |
| 15.019 | 15 Security Hardening | security_headers | Add CSP, X-Frame-Options/frame-ancestors, Referrer-Policy, X-Content-Type-Options and HSTS where supported. | restricted |
| 15.020 | 15 Security Hardening | dependency_scanning | Run npm audit or equivalent dependency checks; avoid abandoned packages for auth/payments/files. | internal |
| 15.021 | 15 Security Hardening | logging_redaction | Mask tokens, passwords, parent contacts, payment references where not needed, and webhook raw secrets. | restricted |
| 15.022 | 15 Security Hardening | backup_access | Backups restricted to system_admin; backup downloads logged; encrypted where available. | restricted |
| 15.023 | 15 Security Hardening | staging_data | No real student/parent data in staging unless anonymised and approved. | restricted |
| 15.024 | 15 Security Hardening | delete_policy | Prefer archive/revoke/status over hard delete; destructive deletes require system_admin and audit. | restricted |
| 15.025 | 15 Security Hardening | public_verification_limit | Public certificate verification returns only approved fields and is rate-limited. | public |
| 15.026 | 15 Security Hardening | admin_builder_account | Directus MCP/agent builder uses dedicated account, limited time, no personal admin token, delete disabled where possible. | restricted |
| 15.027 | 15 Security Hardening | change_review_gate | Any permission, payment, student data, file access, public endpoint or schema change requires security review row/change ticket. | restricted |
| 16.001 | 16 Privacy and Children's Data | data_minimisation | Collect only data required for school participation, exam administration, results and certificate generation. | sensitive |
| 16.002 | 16 Privacy and Children's Data | children_data_classification | Student data is sensitive children's data and must never be publicly exposed except approved certificate verification fields. | sensitive |
| 16.003 | 16 Privacy and Children's Data | no_government_ids | Do not collect Aadhaar, passport, government ID, bank card or medical data in MVP. | restricted |
| 16.004 | 16 Privacy and Children's Data | parent_contact_minimisation | Avoid parent contact fields in MVP unless a specific consent/notification flow requires it. | sensitive |
| 16.005 | 16 Privacy and Children's Data | consent_model | Use school-level declaration confirming parent consent obtained; individual parent login/forms are future optional. | sensitive |
| 16.006 | 16 Privacy and Children's Data | consent_required_for_finalisation | A student cannot be finalised for exam unless consent_obtained=true or school declaration covers the student. | sensitive |
| 16.007 | 16 Privacy and Children's Data | public_certificate_fields | Public certificate verification may show only verification status, student name, school name, olympiad, certificate type, award, issue/revocation status and issue date. | public |
| 16.008 | 16 Privacy and Children's Data | certificate_private_pdf | Certificate PDF file remains private and cannot be directly accessed by public verification route. | sensitive |
| 16.009 | 16 Privacy and Children's Data | evaluator_data_minimisation | Evaluators see candidate/evaluation data only, not parent contact, payment status, school finance notes or unnecessary personal fields. | sensitive |
| 16.010 | 16 Privacy and Children's Data | finance_data_minimisation | Finance sees payment and school billing data, not detailed marks/ranking edits beyond payment gating needs. | restricted |
| 16.011 | 16 Privacy and Children's Data | school_data_isolation | School coordinator sees only own school students, own payments summary, own results and own certificates. | sensitive |
| 16.012 | 16 Privacy and Children's Data | export_restriction | Exports containing student data are limited to school coordinator own-school, operations/admin, and result approver roles as required. | sensitive |
| 16.013 | 16 Privacy and Children's Data | retention_policy_student | Student/results/certificate records retained for configured academic/legal period; deletion/archival policy must be approved before production. | sensitive |
| 16.014 | 16 Privacy and Children's Data | retention_policy_uploads | Raw upload files, OMR scans and courier evidence have defined retention period and restricted access. | restricted |
| 16.015 | 16 Privacy and Children's Data | right_to_correction | Corrections to student/result/certificate records require controlled workflow and audit, not silent edits. | sensitive |
| 16.016 | 16 Privacy and Children's Data | data_deletion_request | Deletion requests are handled manually by admin with legal/operational review; hard delete disabled by default. | restricted |
| 16.017 | 16 Privacy and Children's Data | staging_anonymisation | Use fake/anonymised school/student data in staging, tests and demos. | restricted |
| 16.018 | 16 Privacy and Children's Data | email_privacy | Emails must not attach full student lists, certificates ZIPs, question papers or sensitive reports; send secure login links instead. | sensitive |
| 16.019 | 16 Privacy and Children's Data | audit_privacy | Audit logs should record action metadata but avoid storing full sensitive before/after payloads unless necessary and restricted. | restricted |
| 16.020 | 16 Privacy and Children's Data | privacy_review_gate | Any new feature involving students, parents, public pages, exports, emails, AI or analytics requires privacy review. | restricted |
| 17.001 | 17 Audit Reconciliation and Reversal | audit_event_schema | Every audit event stores trace_id, actor_user_id, actor_role, action, entity_name, entity_id, previous_status, new_status, timestamp, ip_address, reason, external_reference. | restricted |
| 17.002 | 17 Audit Reconciliation and Reversal | login_audit | Log successful and failed login attempts with user reference, timestamp, IP and reason category. | restricted |
| 17.003 | 17 Audit Reconciliation and Reversal | role_change_audit | Log role, permission and school_user mapping changes. | restricted |
| 17.004 | 17 Audit Reconciliation and Reversal | school_approval_audit | Log school approval/block/unblock actions with approving actor and notes. | sensitive |
| 17.005 | 17 Audit Reconciliation and Reversal | student_upload_audit | Log student upload file, validation summary, finalisation and overrides. | sensitive |
| 17.006 | 17 Audit Reconciliation and Reversal | payment_creation_audit | Log payment link creation, expected amount, provider link id and trace_id. | restricted |
| 17.007 | 17 Audit Reconciliation and Reversal | payment_webhook_audit | Log verified payment webhook event id, provider payment id, result status and idempotency decision. | restricted |
| 17.008 | 17 Audit Reconciliation and Reversal | manual_payment_audit | Manual paid marking requires evidence, reason, actor, timestamp and before/after status. | restricted |
| 17.009 | 17 Audit Reconciliation and Reversal | payment_reversal_rule | Payment reversal allowed only for finance_admin/system_admin with reason and evidence; it reopens payment gate and blocks future material release if not already handled. | restricted |
| 17.010 | 17 Audit Reconciliation and Reversal | payment_reconciliation_report | School-wise payment reconciliation proves correctness using school_id, participation_id, invoice/payment_code, expected amount, received amount, commission, provider reference and reconciliation status. | restricted |
| 17.011 | 17 Audit Reconciliation and Reversal | student_count_reconciliation | Student count reconciliation compares uploaded valid students, finalised count, payment amount, OMR received sheets and result count. | sensitive |
| 17.012 | 17 Audit Reconciliation and Reversal | courier_count_reconciliation | Courier reconciliation compares expected sheets, dispatched sheets, received sheets, missing/damaged/extra sheets and exception status. | sensitive |
| 17.013 | 17 Audit Reconciliation and Reversal | omr_import_reconciliation | OMR reconciliation compares CSV row count, candidate matches, duplicate candidate IDs, score range failures and exception rows. | restricted |
| 17.014 | 17 Audit Reconciliation and Reversal | ranking_reconciliation | Ranking reconciliation proves sort logic, tie-breakers, award category mapping and count of published students. | restricted |
| 17.015 | 17 Audit Reconciliation and Reversal | result_correction_rule | Published result correction requires reason, before/after values, approver and correction notification decision. | sensitive |
| 17.016 | 17 Audit Reconciliation and Reversal | certificate_generation_audit | Log certificate generation batch, template version, result set, PDF file ids and actor. | sensitive |
| 17.017 | 17 Audit Reconciliation and Reversal | certificate_revocation_rule | Certificate revocation requires reason, actor, timestamp, public verification status update and school notification decision. | sensitive |
| 17.018 | 17 Audit Reconciliation and Reversal | file_download_audit | Log exam material, result report, certificate and sensitive file downloads with actor, file id, entity id, timestamp and IP. | restricted |
| 17.019 | 17 Audit Reconciliation and Reversal | export_audit | Any export of students, payments, results, certificates or audit logs is itself audited. | restricted |
| 17.020 | 17 Audit Reconciliation and Reversal | exception_queue | Create exception queue/report for payment mismatches, student validation failures, courier mismatches, OMR errors, ranking issues and certificate generation failures. | restricted |
| 17.021 | 17 Audit Reconciliation and Reversal | reversal_no_hard_delete | Reversals/cancellations create new status/audit entries; do not hard-delete historical payment/result/certificate records. | restricted |
| 17.022 | 17 Audit Reconciliation and Reversal | reconciliation_frequency | Run reconciliation before material release, before result publication, before certificate issue and during final go-live checks. | restricted |
