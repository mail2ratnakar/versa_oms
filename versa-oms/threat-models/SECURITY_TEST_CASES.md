# Security Test Cases

These tests must be converted into automated tests during implementation.

| # | Test ID | Threat | Domain | Test | Risk |
|---:|---|---|---|---|---|
| 1 | `SEC-0001` | `THR-AUTH-001` | `auth` | disabled_staff_cannot_login | critical |
| 2 | `SEC-0002` | `THR-AUTH-001` | `auth` | session_revocation_blocks_access | critical |
| 3 | `SEC-0003` | `THR-AUTH-001` | `auth` | staff_routes_require_auth | critical |
| 4 | `SEC-0004` | `THR-AUTH-002` | `auth` | staff_cannot_change_own_role | critical |
| 5 | `SEC-0005` | `THR-AUTH-002` | `auth` | last_super_admin_protected | critical |
| 6 | `SEC-0006` | `THR-AUTH-002` | `auth` | role_change_requires_approval | critical |
| 7 | `SEC-0007` | `THR-SCOPE-001` | `school_scope` | cross_school_roster_access_blocked | critical |
| 8 | `SEC-0008` | `THR-SCOPE-001` | `school_scope` | browser_school_id_ignored | critical |
| 9 | `SEC-0009` | `THR-SCOPE-001` | `school_scope` | school_scope_guard_required | critical |
| 10 | `SEC-0010` | `THR-SCOPE-002` | `school_scope` | post_lock_edit_blocked | high |
| 11 | `SEC-0011` | `THR-SCOPE-002` | `school_scope` | candidate_id_reuse_blocked | high |
| 12 | `SEC-0012` | `THR-SCOPE-002` | `school_scope` | correction_requires_reason | high |
| 13 | `SEC-0013` | `THR-PAY-001` | `payments` | browser_payment_status_ignored | critical |
| 14 | `SEC-0014` | `THR-PAY-001` | `payments` | manual_confirmation_requires_approval | critical |
| 15 | `SEC-0015` | `THR-PAY-001` | `payments` | payment_amount_server_calculated | critical |
| 16 | `SEC-0016` | `THR-PAY-002` | `payments` | manual_payment_requires_reason | critical |
| 17 | `SEC-0017` | `THR-PAY-002` | `payments` | manual_payment_audit_created | critical |
| 18 | `SEC-0018` | `THR-PAY-002` | `payments` | manual_payment_proof_required | critical |
| 19 | `SEC-0019` | `THR-MAT-001` | `exam_materials` | material_file_public_url_blocked | critical |
| 20 | `SEC-0020` | `THR-MAT-001` | `exam_materials` | signed_url_expires | critical |
| 21 | `SEC-0021` | `THR-MAT-001` | `exam_materials` | download_audited | critical |
| 22 | `SEC-0022` | `THR-MAT-001` | `exam_materials` | revoked_material_download_blocked | critical |
| 23 | `SEC-0023` | `THR-MAT-002` | `exam_materials` | material_release_requires_dual_approval | critical |
| 24 | `SEC-0024` | `THR-MAT-002` | `exam_materials` | material_replacement_creates_new_version | critical |
| 25 | `SEC-0025` | `THR-MAT-002` | `exam_materials` | same_user_cannot_approve_own_release | critical |
| 26 | `SEC-0026` | `THR-EVAL-001` | `evaluation_results` | approved_answer_key_not_overwritten | critical |
| 27 | `SEC-0027` | `THR-EVAL-001` | `evaluation_results` | score_recalculation_creates_new_version | critical |
| 28 | `SEC-0028` | `THR-EVAL-001` | `evaluation_results` | score_batch_approval_required | critical |
| 29 | `SEC-0029` | `THR-RES-001` | `evaluation_results` | published_result_correction_creates_new_version | critical |
| 30 | `SEC-0030` | `THR-RES-001` | `evaluation_results` | correction_requires_reason | critical |
| 31 | `SEC-0031` | `THR-RES-001` | `evaluation_results` | certificate_impact_review_required | critical |
| 32 | `SEC-0032` | `THR-CERT-001` | `certificates` | fake_verification_code_returns_not_found | critical |
| 33 | `SEC-0033` | `THR-CERT-001` | `certificates` | revoked_certificate_shows_revoked | critical |
| 34 | `SEC-0034` | `THR-CERT-001` | `certificates` | verification_rate_limit | critical |
| 35 | `SEC-0035` | `THR-CERT-002` | `certificates` | public_verification_minimal_fields | high |
| 36 | `SEC-0036` | `THR-CERT-002` | `certificates` | public_verification_no_parent_contact | high |
| 37 | `SEC-0037` | `THR-CERT-002` | `certificates` | public_verification_no_payment_status | high |
| 38 | `SEC-0038` | `THR-EXP-001` | `reports_exports` | sensitive_export_requires_approval | critical |
| 39 | `SEC-0039` | `THR-EXP-001` | `reports_exports` | export_masks_pii_default | critical |
| 40 | `SEC-0040` | `THR-EXP-001` | `reports_exports` | export_excludes_answer_keys_default | critical |
| 41 | `SEC-0041` | `THR-EXP-001` | `reports_exports` | export_download_audited | critical |
| 42 | `SEC-0042` | `THR-PUB-001` | `public_verification` | public_verify_rate_limit | high |
| 43 | `SEC-0043` | `THR-PUB-001` | `public_verification` | public_verify_no_broad_search | high |
| 44 | `SEC-0044` | `THR-PUB-001` | `public_verification` | not_found_response_no_existence_leak | high |
| 45 | `SEC-0045` | `THR-AUD-001` | `security_audit` | audit_append_only | critical |
| 46 | `SEC-0046` | `THR-AUD-001` | `security_audit` | audit_delete_blocked | critical |
| 47 | `SEC-0047` | `THR-AUD-001` | `security_audit` | audit_event_hash_required | critical |
| 48 | `SEC-0048` | `THR-AUD-001` | `security_audit` | audit_correction_event_required | critical |
| 49 | `SEC-0049` | `THR-NOTIF-001` | `notifications` | browser_recipient_list_ignored | high |
| 50 | `SEC-0050` | `THR-NOTIF-001` | `notifications` | bulk_send_requires_approval | high |
| 51 | `SEC-0051` | `THR-NOTIF-001` | `notifications` | notification_audit_created | high |
| 52 | `SEC-0052` | `THR-SUP-001` | `support_tasks` | support_sees_safe_summary_only | high |
| 53 | `SEC-0053` | `THR-SUP-001` | `support_tasks` | support_raw_omr_blocked | high |
| 54 | `SEC-0054` | `THR-SUP-001` | `support_tasks` | support_answer_key_blocked | high |
| 55 | `SEC-0055` | `THR-SUP-001` | `support_tasks` | support_provider_payload_blocked | high |
