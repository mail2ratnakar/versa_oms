-- Versa OMS schema — generated from CANONICAL_DATA_MODEL.json
-- Stack: Supabase (Postgres + RLS). No hard delete (archived_at).
create extension if not exists "pgcrypto";
create extension if not exists "citext";

create table if not exists "setting_groups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "group_code" text NOT NULL UNIQUE,
  "group_name" text NOT NULL,
  "owner_module" text NOT NULL,
  "owner_role" text NOT NULL,
  "classification" text NOT NULL DEFAULT 'internal' CHECK ("classification" IN ('internal', 'sensitive', 'restricted')),
  "group_status" text NOT NULL DEFAULT 'active' CHECK ("group_status" IN ('active', 'inactive', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "setting_definitions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "setting_key" text NOT NULL UNIQUE,
  "setting_name" text NOT NULL,
  "group_id" uuid NOT NULL,
  "value_schema" jsonb NOT NULL,
  "default_value" jsonb,
  "criticality" text NOT NULL DEFAULT 'normal' CHECK ("criticality" IN ('low', 'normal', 'high', 'critical')),
  "classification" text NOT NULL DEFAULT 'internal' CHECK ("classification" IN ('internal', 'sensitive', 'restricted')),
  "requires_approval" boolean NOT NULL DEFAULT false,
  "definition_version" text NOT NULL,
  "definition_status" text NOT NULL DEFAULT 'draft' CHECK ("definition_status" IN ('draft', 'under_review', 'active', 'retired', 'archived')),
  "created_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "setting_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "setting_key" text NOT NULL,
  "setting_version" text NOT NULL,
  "setting_value" jsonb NOT NULL,
  "value_hash" text NOT NULL,
  "effective_from" timestamptz,
  "effective_to" timestamptz,
  "activation_scope" jsonb,
  "version_status" text NOT NULL DEFAULT 'draft' CHECK ("version_status" IN ('draft', 'under_review', 'approved', 'scheduled', 'active', 'superseded', 'rolled_back', 'rejected', 'archived')),
  "requested_by" uuid NOT NULL,
  "approved_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "setting_change_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "change_request_code" text NOT NULL UNIQUE,
  "setting_version_id" uuid NOT NULL,
  "change_type" text NOT NULL CHECK ("change_type" IN ('create', 'update', 'activate', 'rollback', 'retire', 'secret_reference_update', 'hard_delete_exception')),
  "reason" text NOT NULL,
  "impact_summary" jsonb,
  "rollback_plan" text,
  "requested_by" uuid NOT NULL,
  "approved_by" uuid,
  "request_status" text NOT NULL DEFAULT 'draft' CHECK ("request_status" IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'applied', 'cancelled', 'expired', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "setting_activation_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "setting_version_id" uuid NOT NULL,
  "event_code" text NOT NULL CHECK ("event_code" IN ('scheduled', 'activated', 'activation_failed', 'rolled_back', 'superseded', 'retired')),
  "previous_active_version_id" uuid,
  "reason" text,
  "actor_id" uuid,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "admin_setting_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "event_code" text NOT NULL,
  "previous_status" text,
  "new_status" text,
  "reason" text,
  "actor_id" uuid,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "audit_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "trace_id" text NOT NULL UNIQUE,
  "actor_user_id" uuid,
  "actor_role" text NOT NULL,
  "action" text NOT NULL,
  "entity_name" text NOT NULL,
  "entity_id" text NOT NULL,
  "previous_status" text,
  "new_status" text,
  "ip_address" text,
  "external_reference" text,
  "reason" text,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "audit_cases" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "case_code" text NOT NULL UNIQUE,
  "case_type" text NOT NULL CHECK ("case_type" IN ('access_review', 'data_change_review', 'payment_exception', 'result_correction', 'security_review', 'operations_exception', 'incident_followup')),
  "title" text NOT NULL,
  "description" text,
  "related_event_ids" jsonb NOT NULL,
  "source_modules" jsonb NOT NULL,
  "risk_level" text NOT NULL CHECK ("risk_level" IN ('low', 'medium', 'high', 'critical')),
  "assigned_to" uuid,
  "resolution_note" text,
  "status" text NOT NULL DEFAULT 'open' CHECK ("status" IN ('open', 'in_review', 'waiting_for_input', 'resolved', 'closed', 'reopened', 'archived')),
  "opened_at" timestamptz NOT NULL,
  "closed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "security_incidents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "incident_code" text NOT NULL UNIQUE,
  "incident_type" text NOT NULL CHECK ("incident_type" IN ('unauthorized_access', 'data_exposure', 'payment_issue', 'result_publication_issue', 'certificate_issue', 'file_leak', 'provider_webhook_issue', 'system_misconfiguration', 'other')),
  "severity" text NOT NULL CHECK ("severity" IN ('low', 'medium', 'high', 'critical')),
  "affected_modules" jsonb NOT NULL,
  "affected_school_ids" jsonb,
  "affected_student_count" integer,
  "related_event_ids" jsonb NOT NULL,
  "summary" text NOT NULL,
  "containment_action" text,
  "root_cause" text,
  "remediation_action" text,
  "reported_by" uuid,
  "owner" uuid,
  "status" text NOT NULL DEFAULT 'open' CHECK ("status" IN ('open', 'triaged', 'contained', 'remediated', 'closed', 'reopened', 'archived')),
  "opened_at" timestamptz NOT NULL,
  "closed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "access_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "review_code" text NOT NULL UNIQUE,
  "scope" text NOT NULL CHECK ("scope" IN ('all_roles', 'staff_roles', 'school_users', 'admin_roles', 'module_specific')),
  "module_id" text,
  "review_snapshot" jsonb NOT NULL,
  "exceptions_found" integer NOT NULL DEFAULT 0,
  "reviewed_by" uuid,
  "review_note" text,
  "status" text NOT NULL DEFAULT 'open' CHECK ("status" IN ('open', 'in_review', 'approved', 'exceptions_found', 'closed', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "closed_at" timestamptz,
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "reconciliation_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "recon_code" text NOT NULL UNIQUE,
  "recon_type" text NOT NULL CHECK ("recon_type" IN ('student_count_vs_payment', 'payment_vs_slot', 'slot_vs_material', 'material_vs_courier', 'courier_vs_omr', 'omr_vs_results', 'results_vs_certificates', 'notification_delivery', 'full_chain')),
  "scope" jsonb NOT NULL,
  "run_by" uuid,
  "run_started_at" timestamptz NOT NULL,
  "run_completed_at" timestamptz,
  "expected_count" integer,
  "matched_count" integer,
  "exception_count" integer,
  "recon_report" jsonb NOT NULL,
  "status" text NOT NULL DEFAULT 'running' CHECK ("status" IN ('running', 'passed', 'exceptions_found', 'failed', 'closed', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "audit_exports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "export_code" text NOT NULL UNIQUE,
  "export_scope" jsonb NOT NULL,
  "requested_by" uuid NOT NULL,
  "approved_by" uuid,
  "reason" text NOT NULL,
  "export_file" uuid,
  "expires_at" timestamptz,
  "status" text NOT NULL DEFAULT 'requested' CHECK ("status" IN ('requested', 'approved', 'generated', 'downloaded', 'expired', 'rejected', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "certificate_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "template_code" text NOT NULL UNIQUE,
  "template_name" text NOT NULL,
  "certificate_type" text NOT NULL CHECK ("certificate_type" IN ('participation', 'merit', 'winner', 'school', 'special_award')),
  "version" integer NOT NULL DEFAULT 1,
  "template_file" uuid,
  "template_config" jsonb NOT NULL,
  "required_merge_fields" jsonb NOT NULL,
  "status" text NOT NULL DEFAULT 'draft' CHECK ("status" IN ('draft', 'approved', 'active', 'superseded', 'archived')),
  "approved_by" uuid,
  "approved_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz
);

create table if not exists "certificate_eligibility_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "eligibility_code" text NOT NULL UNIQUE,
  "result_batch_id" uuid NOT NULL,
  "candidate_result_id" uuid NOT NULL,
  "candidate_id" text NOT NULL,
  "school_id" uuid NOT NULL,
  "award_type" text NOT NULL CHECK ("award_type" IN ('participation', 'merit', 'rank', 'school', 'special_award', 'not_eligible')),
  "eligibility_reason" text,
  "result_version" text NOT NULL,
  "eligibility_snapshot_hash" text NOT NULL,
  "eligibility_status" text NOT NULL DEFAULT 'eligible' CHECK ("eligibility_status" IN ('eligible', 'not_eligible', 'withheld', 'requires_review', 'superseded', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "certificates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "certificate_number" text NOT NULL UNIQUE,
  "verification_code" text NOT NULL UNIQUE,
  "student_id" uuid NOT NULL,
  "result_id" uuid NOT NULL,
  "school_id" uuid NOT NULL,
  "certificate_type" text,
  "pdf_file" uuid,
  "issued_at" timestamptz,
  "revoked_at" timestamptz,
  "revocation_reason" text NOT NULL,
  "status" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "certificate_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "request_code" text NOT NULL UNIQUE,
  "certificate_id" uuid,
  "request_type" text NOT NULL CHECK ("request_type" IN ('generate', 'bulk_generate', 'publish', 'reissue', 'revoke', 'impact_review', 'download_support')),
  "reason" text,
  "result_correction_id" uuid,
  "impact_summary" jsonb,
  "requested_by" uuid NOT NULL,
  "approved_by" uuid,
  "request_status" text NOT NULL DEFAULT 'draft' CHECK ("request_status" IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'applied', 'cancelled', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "certificate_download_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "certificate_id" uuid NOT NULL,
  "school_id" uuid,
  "event_code" text NOT NULL CHECK ("event_code" IN ('download_requested', 'download_granted', 'download_denied', 'download_completed', 'verification_viewed', 'verification_denied')),
  "actor_id" uuid,
  "actor_type" text NOT NULL CHECK ("actor_type" IN ('staff', 'school', 'public', 'system')),
  "ip_address" text,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "certificate_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "certificate_id" uuid NOT NULL,
  "event_code" text NOT NULL,
  "event_source" text NOT NULL CHECK ("event_source" IN ('system', 'certificate_admin', 'school_coordinator', 'public_verify', 'system_admin')),
  "previous_status" text,
  "new_status" text,
  "event_note" text,
  "actor_id" uuid,
  "ip_address" text,
  "user_agent" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "dashboard_preferences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "dashboard_view" text NOT NULL,
  "layout_config" jsonb NOT NULL,
  "default_filters" jsonb,
  "is_default" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "dashboard_alert_dismissals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "alert_id" text NOT NULL,
  "source_module" text NOT NULL,
  "source_entity_id" uuid,
  "dismiss_reason" text,
  "dismissed_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "dashboard_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "snapshot_code" text NOT NULL UNIQUE,
  "scope_hash" text NOT NULL,
  "role_scope" jsonb NOT NULL,
  "filter_scope" jsonb NOT NULL,
  "snapshot_payload" jsonb NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "courier_batches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "batch_code" text NOT NULL UNIQUE,
  "school_id" uuid NOT NULL,
  "participation_id" uuid NOT NULL,
  "courier_company" text NOT NULL,
  "awb_number" text NOT NULL,
  "dispatch_date" date NOT NULL,
  "package_count" integer NOT NULL,
  "sheets_expected" integer NOT NULL,
  "sheets_dispatched" integer NOT NULL,
  "sheets_received" integer,
  "receipt_file" uuid,
  "seal_condition" text,
  "status" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "courier_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "courier_batch_id" uuid NOT NULL,
  "event_code" text NOT NULL,
  "event_source" text NOT NULL CHECK ("event_source" IN ('school_coordinator', 'operations_staff', 'system', 'courier_provider', 'evaluation_center')),
  "previous_status" text,
  "new_status" text,
  "event_note" text,
  "event_file" uuid,
  "actor_id" uuid,
  "event_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "courier_vendors" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" text NOT NULL UNIQUE,
  "vendor_status" text NOT NULL CHECK ("vendor_status" IN ('active', 'inactive', 'blocked')),
  "school_id" uuid,
  "awb_number" text,
  "expected_count" integer,
  "received_count" integer,
  "proof_file" uuid,
  "reason" text,
  "metadata" jsonb,
  "created_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "courier_dispatch_batches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" text NOT NULL UNIQUE,
  "batch_status" text NOT NULL CHECK ("batch_status" IN ('draft', 'ready_for_dispatch', 'dispatched', 'in_transit', 'delivered', 'exception', 'closed', 'cancelled', 'archived')),
  "school_id" uuid,
  "awb_number" text,
  "expected_count" integer,
  "received_count" integer,
  "proof_file" uuid,
  "reason" text,
  "metadata" jsonb,
  "created_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "courier_shipments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" text NOT NULL UNIQUE,
  "shipment_status" text NOT NULL CHECK ("shipment_status" IN ('draft', 'ready', 'booked', 'picked_up', 'in_transit', 'delivered', 'receipt_pending', 'received', 'mismatch', 'lost', 'damaged', 'cancelled', 'closed', 'archived')),
  "school_id" uuid,
  "awb_number" text UNIQUE,
  "expected_count" integer,
  "received_count" integer,
  "proof_file" uuid,
  "reason" text,
  "metadata" jsonb,
  "created_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "courier_tracking_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_id" uuid NOT NULL,
  "event_code" text NOT NULL,
  "event_source" text,
  "reason" text,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "courier_receipts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" text NOT NULL UNIQUE,
  "receipt_status" text NOT NULL CHECK ("receipt_status" IN ('draft', 'submitted', 'confirmed', 'mismatch', 'rejected', 'closed', 'archived')),
  "school_id" uuid,
  "awb_number" text,
  "expected_count" integer,
  "received_count" integer,
  "proof_file" uuid,
  "reason" text,
  "metadata" jsonb,
  "created_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "courier_exceptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" text NOT NULL UNIQUE,
  "exception_status" text NOT NULL CHECK ("exception_status" IN ('open', 'under_review', 'awaiting_school', 'awaiting_vendor', 'resolved', 'accepted_with_risk', 'escalated', 'closed', 'archived')),
  "school_id" uuid,
  "awb_number" text,
  "expected_count" integer,
  "received_count" integer,
  "proof_file" uuid,
  "reason" text,
  "metadata" jsonb,
  "created_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "evaluation_answer_keys" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "answer_key_code" text NOT NULL UNIQUE,
  "exam_cycle_id" uuid NOT NULL,
  "subject_code" text NOT NULL,
  "grade_code" text NOT NULL,
  "paper_set_code" text NOT NULL,
  "key_version" text NOT NULL,
  "answer_key_payload" jsonb NOT NULL,
  "answer_key_file" uuid,
  "key_status" text NOT NULL DEFAULT 'draft' CHECK ("key_status" IN ('draft', 'under_review', 'approved', 'final', 'superseded', 'revoked', 'archived')),
  "uploaded_by" uuid NOT NULL,
  "approved_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "evaluation_import_batches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "import_batch_code" text NOT NULL UNIQUE,
  "exam_cycle_id" uuid NOT NULL,
  "exam_slot_id" uuid,
  "school_id" uuid,
  "courier_shipment_id" uuid,
  "source_type" text NOT NULL CHECK ("source_type" IN ('courier_handoff', 'school_upload', 'staff_upload', 'migration', 'manual_test')),
  "source_file" uuid,
  "expected_sheet_count" integer,
  "imported_sheet_count" integer NOT NULL DEFAULT 0,
  "valid_sheet_count" integer NOT NULL DEFAULT 0,
  "invalid_sheet_count" integer NOT NULL DEFAULT 0,
  "duplicate_candidate_count" integer NOT NULL DEFAULT 0,
  "quality_report" jsonb,
  "batch_status" text NOT NULL DEFAULT 'draft' CHECK ("batch_status" IN ('draft', 'uploaded', 'validating', 'validation_failed', 'validated', 'scoring', 'scored', 'under_review', 'approved_for_results', 'rejected', 'archived')),
  "uploaded_by" uuid NOT NULL,
  "approved_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "evaluation_candidate_responses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "import_batch_id" uuid NOT NULL,
  "candidate_id" text NOT NULL,
  "school_id" uuid NOT NULL,
  "response_payload" jsonb NOT NULL,
  "raw_scan_file" uuid,
  "parser_confidence" numeric,
  "response_status" text NOT NULL DEFAULT 'parsed' CHECK ("response_status" IN ('parsed', 'validated', 'invalid', 'exception', 'scored', 'voided')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "evaluation_score_batches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "score_batch_code" text NOT NULL UNIQUE,
  "import_batch_id" uuid NOT NULL,
  "answer_key_id" uuid NOT NULL,
  "score_formula_version" text NOT NULL,
  "scoring_snapshot_hash" text NOT NULL,
  "candidate_count" integer NOT NULL,
  "scored_count" integer NOT NULL,
  "exception_count" integer NOT NULL DEFAULT 0,
  "score_summary" jsonb,
  "score_batch_status" text NOT NULL DEFAULT 'draft' CHECK ("score_batch_status" IN ('draft', 'scoring', 'scored', 'under_review', 'approved_for_results', 'rejected', 'superseded', 'archived')),
  "scored_by" uuid,
  "approved_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "evaluation_candidate_scores" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "score_batch_id" uuid NOT NULL,
  "candidate_id" text NOT NULL,
  "school_id" uuid NOT NULL,
  "raw_score" numeric NOT NULL,
  "normalized_score" numeric,
  "correct_count" integer,
  "wrong_count" integer,
  "blank_count" integer,
  "score_details" jsonb,
  "score_status" text NOT NULL DEFAULT 'scored' CHECK ("score_status" IN ('scored', 'exception', 'voided', 'superseded')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "evaluation_exceptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "exception_code" text NOT NULL UNIQUE,
  "import_batch_id" uuid,
  "candidate_id" text,
  "exception_type" text NOT NULL CHECK ("exception_type" IN ('missing_candidate_id', 'duplicate_candidate_id', 'unreadable_scan', 'blank_answer_sheet', 'count_mismatch', 'answer_key_mismatch', 'school_mismatch', 'slot_mismatch', 'tampering_suspected', 'late_or_missing_batch', 'manual_correction_required')),
  "severity" text NOT NULL CHECK ("severity" IN ('low', 'medium', 'high', 'critical')),
  "description" text NOT NULL,
  "proof_file" uuid,
  "owner_id" uuid,
  "resolution_note" text,
  "exception_status" text NOT NULL DEFAULT 'open' CHECK ("exception_status" IN ('open', 'under_review', 'resolved', 'accepted_with_risk', 'escalated', 'closed', 'archived')),
  "created_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "evaluation_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "event_code" text NOT NULL,
  "previous_status" text,
  "new_status" text,
  "reason" text,
  "actor_id" uuid NOT NULL,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "exam_material_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "template_code" text NOT NULL,
  "template_name" text NOT NULL,
  "template_type" text NOT NULL CHECK ("template_type" IN ('question_paper', 'answer_sheet', 'cover_sheet', 'dispatch_manifest', 'bundle')),
  "template_version" text NOT NULL,
  "template_file" uuid,
  "template_schema" jsonb,
  "template_status" text NOT NULL DEFAULT 'draft' CHECK ("template_status" IN ('draft', 'under_review', 'approved', 'active', 'retired', 'archived')),
  "created_by" uuid NOT NULL,
  "approved_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "exam_material_packages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "package_code" text NOT NULL UNIQUE,
  "school_id" uuid NOT NULL,
  "exam_cycle_id" uuid NOT NULL,
  "exam_slot_id" uuid NOT NULL,
  "slot_assignment_id" uuid NOT NULL,
  "roster_batch_id" uuid NOT NULL,
  "content_set_code" text NOT NULL,
  "content_set_version" text NOT NULL,
  "template_version" text NOT NULL,
  "package_version" text NOT NULL,
  "roster_snapshot_hash" text NOT NULL,
  "slot_snapshot_hash" text NOT NULL,
  "package_status" text NOT NULL DEFAULT 'draft' CHECK ("package_status" IN ('draft', 'generation_requested', 'generated', 'under_review', 'approved', 'scheduled', 'released', 'downloaded', 'replaced', 'revoked', 'superseded', 'archived', 'failed')),
  "release_at" timestamptz,
  "released_at" timestamptz,
  "active_version" boolean NOT NULL DEFAULT true,
  "generated_by" uuid,
  "approved_by" uuid,
  "released_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "exam_material_files" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "file_code" text NOT NULL UNIQUE,
  "material_package_id" uuid NOT NULL,
  "file_type" text NOT NULL CHECK ("file_type" IN ('question_paper', 'answer_sheet', 'cover_sheet', 'dispatch_manifest', 'bundle_zip', 'other')),
  "file_ref" uuid NOT NULL,
  "file_hash" text NOT NULL,
  "file_size_bytes" integer NOT NULL,
  "page_count" integer,
  "watermark_applied" boolean NOT NULL DEFAULT false,
  "file_status" text NOT NULL DEFAULT 'generated' CHECK ("file_status" IN ('generated', 'approved', 'released', 'revoked', 'superseded', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "exam_material_approvals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "approval_code" text NOT NULL UNIQUE,
  "material_package_id" uuid NOT NULL,
  "approval_type" text NOT NULL CHECK ("approval_type" IN ('generation_review', 'question_paper_release', 'replacement', 'revocation', 'release_override', 'bulk_download_export')),
  "approval_level" text NOT NULL CHECK ("approval_level" IN ('single', 'dual_first', 'dual_final')),
  "reason" text,
  "requested_by" uuid NOT NULL,
  "approved_by" uuid,
  "approval_status" text NOT NULL DEFAULT 'pending' CHECK ("approval_status" IN ('pending', 'approved', 'rejected', 'cancelled', 'expired')),
  "approved_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "exam_material_download_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "material_package_id" uuid NOT NULL,
  "material_file_id" uuid,
  "school_id" uuid NOT NULL,
  "event_code" text NOT NULL CHECK ("event_code" IN ('download_requested', 'download_granted', 'download_denied', 'download_completed', 'download_failed', 'print_count_recorded')),
  "actor_id" uuid NOT NULL,
  "ip_address" text,
  "device_fingerprint" text,
  "file_hash" text,
  "reason" text,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "exam_material_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "school_id" uuid,
  "event_code" text NOT NULL,
  "previous_status" text,
  "new_status" text,
  "reason" text,
  "actor_id" uuid NOT NULL,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "exam_materials" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "material_code" text NOT NULL UNIQUE,
  "participation_id" uuid,
  "olympiad_id" uuid NOT NULL,
  "exam_slot_id" uuid,
  "material_type" text,
  "file" uuid NOT NULL,
  "release_at" timestamptz NOT NULL,
  "expires_at" timestamptz,
  "download_count" integer,
  "status" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "exam_material_downloads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "exam_material_id" uuid NOT NULL,
  "school_id" uuid NOT NULL,
  "participation_id" uuid NOT NULL,
  "file_type" text NOT NULL CHECK ("file_type" IN ('question_paper', 'omr_sheet', 'attendance_sheet', 'invigilator_declaration', 'candidate_list', 'bundle')),
  "downloaded_by" uuid NOT NULL,
  "downloaded_at" timestamptz NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "signed_url_id" text,
  "trace_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "exam_cycles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "cycle_code" text NOT NULL UNIQUE,
  "cycle_name" text NOT NULL,
  "olympiad_code" text NOT NULL,
  "subject_code" text,
  "grade_range" jsonb,
  "registration_start_at" timestamptz,
  "registration_end_at" timestamptz,
  "exam_window_start_at" timestamptz NOT NULL,
  "exam_window_end_at" timestamptz NOT NULL,
  "timezone" text NOT NULL DEFAULT 'Asia/Kolkata',
  "cycle_status" text NOT NULL DEFAULT 'draft' CHECK ("cycle_status" IN ('draft', 'under_review', 'approved', 'published', 'closed', 'archived')),
  "created_by" uuid NOT NULL,
  "approved_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "exam_slots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slot_code" text NOT NULL UNIQUE,
  "exam_date" date NOT NULL,
  "start_time" time NOT NULL,
  "end_time" time NOT NULL,
  "timezone" text,
  "mode" text,
  "capacity_schools" integer NOT NULL,
  "capacity_students" integer NOT NULL,
  "booked_schools" integer,
  "booked_students" integer,
  "eligible_grades" jsonb,
  "status" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "school_exam_slot_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "assignment_code" text NOT NULL UNIQUE,
  "school_id" uuid NOT NULL,
  "exam_cycle_id" uuid NOT NULL,
  "exam_slot_id" uuid NOT NULL,
  "roster_batch_id" uuid NOT NULL,
  "finance_invoice_id" uuid,
  "confirmed_student_count" integer NOT NULL,
  "assignment_source" text NOT NULL CHECK ("assignment_source" IN ('school_selected', 'staff_assigned', 'bulk_assigned', 'system_assigned', 'rescheduled')),
  "assignment_status" text NOT NULL DEFAULT 'draft' CHECK ("assignment_status" IN ('draft', 'pending_confirmation', 'confirmed', 'reschedule_requested', 'rescheduled', 'locked', 'cancelled', 'archived')),
  "payment_gate_status" text NOT NULL DEFAULT 'not_checked' CHECK ("payment_gate_status" IN ('not_checked', 'passed', 'failed', 'waived', 'credit_approved')),
  "roster_gate_status" text NOT NULL DEFAULT 'not_checked' CHECK ("roster_gate_status" IN ('not_checked', 'passed', 'failed')),
  "capacity_gate_status" text NOT NULL DEFAULT 'not_checked' CHECK ("capacity_gate_status" IN ('not_checked', 'passed', 'failed', 'override_approved')),
  "material_impact_status" text NOT NULL DEFAULT 'not_started' CHECK ("material_impact_status" IN ('not_started', 'not_required', 'review_required', 'approved', 'rejected')),
  "reason" text,
  "assigned_by" uuid NOT NULL,
  "confirmed_by" uuid,
  "confirmed_at" timestamptz,
  "locked_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "exam_slot_reschedule_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "reschedule_code" text NOT NULL UNIQUE,
  "assignment_id" uuid NOT NULL,
  "from_slot_id" uuid NOT NULL,
  "to_slot_id" uuid NOT NULL,
  "reason" text NOT NULL,
  "capacity_impact" jsonb,
  "material_impact" jsonb,
  "requested_by" uuid NOT NULL,
  "approved_by" uuid,
  "reschedule_status" text NOT NULL DEFAULT 'draft' CHECK ("reschedule_status" IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'applied', 'cancelled', 'archived')),
  "applied_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "exam_slot_conflicts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "assignment_id" uuid,
  "exam_slot_id" uuid,
  "conflict_type" text NOT NULL CHECK ("conflict_type" IN ('overlap', 'capacity_exceeded', 'blackout_window', 'payment_not_clear', 'roster_not_locked', 'school_blocked', 'material_impact')),
  "severity" text NOT NULL CHECK ("severity" IN ('info', 'warning', 'blocking', 'critical')),
  "conflict_status" text NOT NULL DEFAULT 'open' CHECK ("conflict_status" IN ('open', 'resolved', 'overridden', 'accepted', 'archived')),
  "details" jsonb,
  "resolution_note" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "exam_slot_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "school_id" uuid,
  "event_code" text NOT NULL,
  "previous_status" text,
  "new_status" text,
  "reason" text,
  "actor_id" uuid NOT NULL,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "exam_slot_bookings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "booking_code" text NOT NULL UNIQUE,
  "school_id" uuid NOT NULL,
  "participation_id" uuid NOT NULL UNIQUE,
  "exam_slot_id" uuid NOT NULL,
  "confirmed_student_count" integer NOT NULL,
  "payment_status_at_booking" text NOT NULL,
  "status" text NOT NULL DEFAULT 'reserved' CHECK ("status" IN ('reserved', 'confirmed', 'cancelled', 'rescheduled', 'locked')),
  "booked_by" uuid NOT NULL,
  "booked_at" timestamptz NOT NULL,
  "cancelled_by" uuid,
  "cancelled_at" timestamptz,
  "cancellation_reason" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "finance_invoices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "invoice_number" text NOT NULL UNIQUE,
  "school_id" uuid NOT NULL,
  "participation_id" uuid,
  "roster_batch_id" uuid NOT NULL,
  "confirmed_student_count" integer NOT NULL,
  "currency" text NOT NULL DEFAULT 'INR',
  "price_per_student" numeric NOT NULL,
  "gross_amount" numeric NOT NULL,
  "discount_amount" numeric NOT NULL DEFAULT 0,
  "tax_amount" numeric NOT NULL DEFAULT 0,
  "school_commission_amount" numeric NOT NULL DEFAULT 0,
  "net_payable_amount" numeric NOT NULL,
  "amount_paid" numeric NOT NULL DEFAULT 0,
  "balance_due" numeric NOT NULL,
  "invoice_status" text NOT NULL DEFAULT 'draft' CHECK ("invoice_status" IN ('draft', 'issued', 'partially_paid', 'paid', 'cancelled', 'voided', 'superseded')),
  "issued_at" timestamptz,
  "due_at" timestamptz,
  "invoice_pdf" uuid,
  "created_by" uuid NOT NULL,
  "approved_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "finance_payment_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "payment_link_code" text NOT NULL UNIQUE,
  "invoice_id" uuid NOT NULL,
  "school_id" uuid NOT NULL,
  "provider" text NOT NULL CHECK ("provider" IN ('mock', 'razorpay', 'bank_transfer', 'manual', 'other')),
  "provider_reference" text UNIQUE,
  "payment_url" text,
  "amount" numeric NOT NULL,
  "currency" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "link_status" text NOT NULL DEFAULT 'created' CHECK ("link_status" IN ('created', 'sent', 'opened', 'paid', 'expired', 'cancelled', 'failed')),
  "created_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "finance_payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "payment_reference" text NOT NULL UNIQUE,
  "invoice_id" uuid NOT NULL,
  "school_id" uuid NOT NULL,
  "payment_link_id" uuid,
  "provider" text NOT NULL CHECK ("provider" IN ('mock', 'razorpay', 'bank_transfer', 'manual', 'other')),
  "provider_payment_id" text,
  "manual_reference" text,
  "payment_proof_file" uuid,
  "amount" numeric NOT NULL,
  "currency" text NOT NULL,
  "paid_at" timestamptz,
  "payment_status" text NOT NULL DEFAULT 'pending' CHECK ("payment_status" IN ('pending', 'confirmed', 'failed', 'reversed', 'refunded', 'partially_refunded', 'cancelled')),
  "confirmation_source" text NOT NULL CHECK ("confirmation_source" IN ('gateway', 'manual', 'bank_reconciliation', 'mock')),
  "confirmed_by" uuid,
  "confirmation_reason" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "finance_adjustments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "adjustment_code" text NOT NULL UNIQUE,
  "invoice_id" uuid NOT NULL,
  "school_id" uuid NOT NULL,
  "adjustment_type" text NOT NULL CHECK ("adjustment_type" IN ('discount', 'waiver', 'credit_note', 'refund', 'reversal', 'tax_adjustment', 'commission_adjustment')),
  "amount" numeric NOT NULL,
  "reason" text NOT NULL,
  "impact_check" jsonb,
  "requested_by" uuid NOT NULL,
  "approved_by" uuid,
  "adjustment_status" text NOT NULL DEFAULT 'draft' CHECK ("adjustment_status" IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'applied', 'cancelled', 'archived')),
  "applied_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "finance_reconciliation_batches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "reconciliation_code" text NOT NULL UNIQUE,
  "provider" text NOT NULL CHECK ("provider" IN ('mock', 'razorpay', 'bank_transfer', 'manual', 'other')),
  "source_file" uuid,
  "total_records" integer NOT NULL DEFAULT 0,
  "matched_records" integer NOT NULL DEFAULT 0,
  "mismatch_records" integer NOT NULL DEFAULT 0,
  "exception_report" jsonb,
  "reconciliation_status" text NOT NULL DEFAULT 'not_started' CHECK ("reconciliation_status" IN ('not_started', 'matched', 'partially_matched', 'mismatch', 'exception', 'closed')),
  "closed_by" uuid,
  "closure_note" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "finance_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "school_id" uuid,
  "event_code" text NOT NULL,
  "previous_status" text,
  "new_status" text,
  "amount" numeric,
  "reason" text,
  "actor_id" uuid NOT NULL,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "notification_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "template_code" text NOT NULL UNIQUE,
  "event_code" text NOT NULL,
  "channel" text NOT NULL CHECK ("channel" IN ('email', 'sms', 'whatsapp', 'in_app')),
  "locale" text NOT NULL DEFAULT 'en-IN',
  "version" integer NOT NULL DEFAULT 1,
  "subject_template" text,
  "body_template" text NOT NULL,
  "required_variables" jsonb NOT NULL,
  "allowed_recipient_roles" jsonb NOT NULL,
  "provider_template_id" text,
  "status" text NOT NULL DEFAULT 'draft' CHECK ("status" IN ('draft', 'approved', 'active', 'superseded', 'archived')),
  "approved_by" uuid,
  "approved_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz
);

create table if not exists "notification_triggers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "trigger_code" text NOT NULL UNIQUE,
  "source_module" text NOT NULL,
  "event_code" text NOT NULL,
  "template_id" uuid NOT NULL,
  "recipient_scope_rule" jsonb NOT NULL,
  "priority" text NOT NULL DEFAULT 'normal' CHECK ("priority" IN ('low', 'normal', 'high', 'critical')),
  "critical_requires_approval" boolean NOT NULL DEFAULT false,
  "trigger_status" text NOT NULL DEFAULT 'draft' CHECK ("trigger_status" IN ('draft', 'active', 'paused', 'retired', 'archived')),
  "created_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "notification_batches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "batch_code" text NOT NULL UNIQUE,
  "batch_type" text NOT NULL CHECK ("batch_type" IN ('event_triggered', 'manual_single', 'bulk_announcement', 'system_alert', 'retry_batch')),
  "source_module" text,
  "source_entity_type" text,
  "source_entity_id" uuid,
  "template_id" uuid NOT NULL,
  "recipient_scope_snapshot" jsonb NOT NULL,
  "recipient_count" integer NOT NULL DEFAULT 0,
  "priority" text NOT NULL DEFAULT 'normal' CHECK ("priority" IN ('low', 'normal', 'high', 'critical')),
  "reason" text,
  "dry_run_report" jsonb,
  "batch_status" text NOT NULL DEFAULT 'draft' CHECK ("batch_status" IN ('draft', 'dry_run', 'under_review', 'approved', 'queued', 'sending', 'sent', 'partially_failed', 'failed', 'cancelled', 'archived')),
  "created_by" uuid NOT NULL,
  "approved_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "notification_recipients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "batch_id" uuid NOT NULL,
  "recipient_key" text NOT NULL,
  "recipient_type" text NOT NULL CHECK ("recipient_type" IN ('staff_user', 'school_user', 'school_contact', 'external_safe_list', 'public_later')),
  "recipient_entity_id" uuid,
  "school_id" uuid,
  "channel_address" text NOT NULL,
  "channel" text NOT NULL CHECK ("channel" IN ('email', 'in_app', 'sms_later', 'whatsapp_later', 'push_later')),
  "consent_status" text NOT NULL DEFAULT 'service_allowed' CHECK ("consent_status" IN ('service_allowed', 'marketing_allowed', 'unsubscribed', 'blocked', 'unknown')),
  "recipient_status" text NOT NULL DEFAULT 'resolved' CHECK ("recipient_status" IN ('resolved', 'deduplicated', 'blocked', 'queued', 'sent', 'failed', 'cancelled')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "notification_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "message_code" text NOT NULL UNIQUE,
  "batch_id" uuid NOT NULL,
  "recipient_id" uuid NOT NULL,
  "template_id" uuid NOT NULL,
  "rendered_subject" text,
  "rendered_body" text NOT NULL,
  "render_hash" text NOT NULL,
  "priority" text NOT NULL DEFAULT 'normal' CHECK ("priority" IN ('low', 'normal', 'high', 'critical')),
  "scheduled_at" timestamptz,
  "message_status" text NOT NULL DEFAULT 'draft' CHECK ("message_status" IN ('draft', 'queued', 'sending', 'sent', 'failed', 'cancelled', 'expired', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "notification_delivery_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "message_id" uuid NOT NULL,
  "provider_code" text NOT NULL,
  "provider_message_id" text,
  "attempt_number" integer NOT NULL,
  "attempt_status" text NOT NULL CHECK ("attempt_status" IN ('queued', 'sent', 'delivered', 'failed_temporary', 'failed_permanent', 'rate_limited', 'provider_rejected')),
  "failure_code" text,
  "provider_payload" jsonb,
  "attempted_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "notification_preferences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "recipient_contact_hash" text NOT NULL,
  "recipient_role" text NOT NULL,
  "channel" text NOT NULL CHECK ("channel" IN ('email', 'sms', 'whatsapp', 'in_app')),
  "event_group" text NOT NULL,
  "is_enabled" boolean NOT NULL DEFAULT true,
  "suppression_reason" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "notification_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_code" text NOT NULL,
  "event_idempotency_key" text NOT NULL UNIQUE,
  "source_module" text NOT NULL,
  "source_entity" text NOT NULL,
  "source_entity_id" uuid NOT NULL,
  "school_id" uuid,
  "participation_id" uuid,
  "event_payload" jsonb NOT NULL,
  "recipient_resolver" text NOT NULL,
  "status" text NOT NULL DEFAULT 'created' CHECK ("status" IN ('created', 'queued', 'partially_queued', 'suppressed', 'failed', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "notification_deliveries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "delivery_code" text NOT NULL UNIQUE,
  "event_id" uuid NOT NULL,
  "template_id" uuid NOT NULL,
  "recipient_user_id" uuid,
  "recipient_role" text NOT NULL,
  "recipient_name" text,
  "recipient_contact" text NOT NULL,
  "recipient_contact_hash" text NOT NULL,
  "school_id" uuid,
  "channel" text NOT NULL CHECK ("channel" IN ('email', 'sms', 'whatsapp', 'in_app')),
  "provider" text,
  "provider_message_id" text,
  "rendered_subject" text,
  "rendered_body" text,
  "scheduled_at" timestamptz,
  "sent_at" timestamptz,
  "delivered_at" timestamptz,
  "failed_at" timestamptz,
  "retry_count" integer NOT NULL DEFAULT 0,
  "last_error" text,
  "status" text NOT NULL DEFAULT 'queued' CHECK ("status" IN ('queued', 'rendered', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'retry_scheduled', 'suppressed', 'cancelled', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "answer_keys" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "answer_key_code" text NOT NULL UNIQUE,
  "olympiad_id" uuid NOT NULL,
  "grade" text NOT NULL,
  "subject" text NOT NULL,
  "paper_code" text NOT NULL,
  "version" integer NOT NULL DEFAULT 1,
  "answer_map" jsonb NOT NULL,
  "scoring_rule" jsonb NOT NULL,
  "status" text NOT NULL DEFAULT 'draft' CHECK ("status" IN ('draft', 'approved', 'active', 'superseded', 'archived')),
  "approved_by" uuid,
  "approved_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz
);

create table if not exists "omr_imports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "import_code" text NOT NULL UNIQUE,
  "participation_id" uuid NOT NULL,
  "courier_batch_id" uuid NOT NULL,
  "uploaded_file" uuid NOT NULL,
  "row_count" integer,
  "valid_count" integer,
  "error_count" integer,
  "review_status" text,
  "uploaded_by" uuid NOT NULL,
  "approved_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "omr_candidate_scores" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "omr_import_id" uuid NOT NULL,
  "student_id" uuid NOT NULL,
  "candidate_id" text NOT NULL,
  "school_id" uuid NOT NULL,
  "participation_id" uuid NOT NULL,
  "parsed_answers" jsonb NOT NULL,
  "raw_score" numeric NOT NULL DEFAULT 0,
  "negative_score" numeric NOT NULL DEFAULT 0,
  "total_score" numeric NOT NULL DEFAULT 0,
  "max_score" numeric NOT NULL,
  "score_breakdown" jsonb,
  "exception_flags" jsonb,
  "status" text NOT NULL DEFAULT 'parsed' CHECK ("status" IN ('parsed', 'scored', 'exception', 'approved', 'superseded')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "payment_code" text NOT NULL UNIQUE,
  "participation_id" uuid NOT NULL,
  "school_id" uuid NOT NULL,
  "expected_amount" numeric NOT NULL,
  "received_amount" numeric,
  "provider" text,
  "provider_link_id" text,
  "provider_payment_id" text,
  "payment_reference" text,
  "status" text,
  "manual_evidence_file" uuid NOT NULL,
  "reversal_reason" text NOT NULL,
  "reconciled_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "payment_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "payment_id" uuid NOT NULL,
  "event_code" text NOT NULL,
  "event_source" text NOT NULL CHECK ("event_source" IN ('system', 'razorpay_webhook', 'finance_admin', 'system_admin', 'reconciliation_job')),
  "previous_status" text,
  "new_status" text,
  "amount" numeric,
  "external_reference" text,
  "reason" text,
  "actor_id" uuid,
  "event_payload" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "report_definitions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "report_code" text NOT NULL UNIQUE,
  "report_name" text NOT NULL,
  "report_category" text NOT NULL CHECK ("report_category" IN ('school', 'finance', 'student', 'exam', 'material', 'courier', 'evaluation', 'results', 'certificates', 'notifications', 'support', 'tasks', 'audit_security', 'cross_module')),
  "source_modules" jsonb NOT NULL,
  "filter_schema" jsonb NOT NULL,
  "column_schema" jsonb NOT NULL,
  "classification" text NOT NULL DEFAULT 'internal' CHECK ("classification" IN ('internal', 'sensitive', 'restricted')),
  "report_version" text NOT NULL,
  "report_status" text NOT NULL DEFAULT 'draft' CHECK ("report_status" IN ('draft', 'under_review', 'active', 'retired', 'archived')),
  "created_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "export_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "export_code" text NOT NULL UNIQUE,
  "report_definition_id" uuid NOT NULL,
  "requested_format" text NOT NULL CHECK ("requested_format" IN ('csv', 'xlsx', 'pdf_later')),
  "filter_payload" jsonb NOT NULL,
  "filter_hash" text NOT NULL,
  "reason" text NOT NULL,
  "sensitivity_level" text NOT NULL CHECK ("sensitivity_level" IN ('internal', 'sensitive', 'restricted')),
  "requires_approval" boolean NOT NULL DEFAULT false,
  "requested_by" uuid NOT NULL,
  "approved_by" uuid,
  "export_status" text NOT NULL DEFAULT 'draft' CHECK ("export_status" IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'queued', 'generating', 'generated', 'failed', 'expired', 'cancelled', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "report_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "snapshot_code" text NOT NULL UNIQUE,
  "export_request_id" uuid NOT NULL,
  "report_definition_id" uuid NOT NULL,
  "report_version" text NOT NULL,
  "source_schema_versions" jsonb,
  "row_count" integer NOT NULL DEFAULT 0,
  "column_count" integer NOT NULL DEFAULT 0,
  "snapshot_hash" text NOT NULL,
  "snapshot_status" text NOT NULL DEFAULT 'created' CHECK ("snapshot_status" IN ('created', 'active', 'superseded', 'expired', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "export_files" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "file_code" text NOT NULL UNIQUE,
  "export_request_id" uuid NOT NULL,
  "snapshot_id" uuid NOT NULL,
  "file_ref" uuid,
  "file_format" text NOT NULL CHECK ("file_format" IN ('csv', 'xlsx', 'pdf_later')),
  "file_hash" text,
  "watermark_payload" jsonb,
  "expires_at" timestamptz,
  "file_status" text NOT NULL DEFAULT 'pending' CHECK ("file_status" IN ('pending', 'generated', 'downloaded', 'expired', 'failed', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "export_download_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "export_file_id" uuid NOT NULL,
  "downloaded_by" uuid,
  "actor_type" text NOT NULL CHECK ("actor_type" IN ('staff', 'school', 'system')),
  "school_id" uuid,
  "download_status" text NOT NULL CHECK ("download_status" IN ('granted', 'denied', 'expired', 'completed')),
  "ip_address" text,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "report_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "event_code" text NOT NULL,
  "previous_status" text,
  "new_status" text,
  "reason" text,
  "actor_id" uuid,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "result_code" text NOT NULL UNIQUE,
  "student_id" uuid NOT NULL,
  "participation_id" uuid NOT NULL,
  "school_id" uuid NOT NULL,
  "raw_score" numeric NOT NULL,
  "max_marks" numeric NOT NULL,
  "percentage" numeric,
  "school_rank" integer,
  "city_rank" integer,
  "state_rank" integer,
  "national_rank" integer,
  "award_category" text,
  "status" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "result_publications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "publication_code" text NOT NULL UNIQUE,
  "olympiad_id" uuid NOT NULL,
  "grade" text,
  "scope_type" text NOT NULL CHECK ("scope_type" IN ('all', 'grade', 'school', 'participation')),
  "scope_value" text,
  "publication_version" integer NOT NULL DEFAULT 1,
  "result_count" integer NOT NULL DEFAULT 0,
  "withheld_count" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'draft' CHECK ("status" IN ('draft', 'ready_for_review', 'approved', 'scheduled', 'published', 'paused', 'revoked', 'archived')),
  "scheduled_publish_at" timestamptz,
  "published_at" timestamptz,
  "approved_by" uuid,
  "approved_at" timestamptz,
  "publication_notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "result_corrections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "result_id" uuid NOT NULL,
  "correction_code" text NOT NULL UNIQUE,
  "correction_type" text NOT NULL CHECK ("correction_type" IN ('score_recalculation', 'candidate_mapping_fix', 'answer_key_revision', 'withhold', 'unwithhold', 'rank_recalculation', 'publication_error')),
  "previous_values" jsonb NOT NULL,
  "new_values" jsonb NOT NULL,
  "reason" text NOT NULL,
  "approved_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "result_batches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "result_batch_code" text NOT NULL UNIQUE,
  "exam_cycle_id" uuid NOT NULL,
  "evaluation_score_batch_id" uuid NOT NULL,
  "handoff_snapshot_hash" text NOT NULL,
  "result_version" text NOT NULL,
  "ranking_policy_version" text NOT NULL,
  "candidate_count" integer NOT NULL,
  "withheld_count" integer NOT NULL DEFAULT 0,
  "published_count" integer NOT NULL DEFAULT 0,
  "result_batch_status" text NOT NULL DEFAULT 'draft' CHECK ("result_batch_status" IN ('draft', 'generated', 'ranking', 'ranked', 'under_review', 'approved', 'scheduled', 'published', 'partially_published', 'withheld', 'correction_pending', 'corrected', 'superseded', 'archived')),
  "generated_by" uuid,
  "approved_by" uuid,
  "published_by" uuid,
  "published_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "candidate_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "result_batch_id" uuid NOT NULL,
  "candidate_id" text NOT NULL,
  "school_id" uuid NOT NULL,
  "grade_code" text NOT NULL,
  "subject_code" text NOT NULL,
  "raw_score" numeric NOT NULL,
  "normalized_score" numeric,
  "max_score" numeric NOT NULL,
  "percentage_score" numeric NOT NULL,
  "national_rank" integer,
  "state_rank" integer,
  "school_rank" integer,
  "grade_rank" integer,
  "subject_rank" integer,
  "result_status" text NOT NULL DEFAULT 'generated' CHECK ("result_status" IN ('generated', 'ranked', 'approved', 'published', 'withheld', 'corrected', 'superseded', 'voided')),
  "withhold_reason" text,
  "certificate_eligibility_status" text NOT NULL DEFAULT 'not_evaluated' CHECK ("certificate_eligibility_status" IN ('not_evaluated', 'eligible', 'not_eligible', 'withheld', 'requires_review')),
  "verification_code" text UNIQUE,
  "result_version" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "result_publication_windows" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "publication_code" text NOT NULL UNIQUE,
  "result_batch_id" uuid NOT NULL,
  "target_visibility" text NOT NULL CHECK ("target_visibility" IN ('staff_only', 'school_portal', 'parent_student_portal_later', 'public_lookup_later')),
  "publish_at" timestamptz,
  "publication_status" text NOT NULL DEFAULT 'draft' CHECK ("publication_status" IN ('draft', 'scheduled', 'published', 'paused', 'cancelled', 'archived')),
  "reason" text,
  "created_by" uuid NOT NULL,
  "approved_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "result_rank_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "snapshot_code" text NOT NULL UNIQUE,
  "result_batch_id" uuid NOT NULL,
  "ranking_dimension" text NOT NULL CHECK ("ranking_dimension" IN ('national', 'state', 'school', 'grade', 'subject')),
  "ranking_policy_version" text NOT NULL,
  "snapshot_hash" text NOT NULL,
  "rank_count" integer NOT NULL,
  "snapshot_status" text NOT NULL DEFAULT 'created' CHECK ("snapshot_status" IN ('created', 'active', 'superseded', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "result_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "candidate_id" text,
  "event_code" text NOT NULL,
  "previous_status" text,
  "new_status" text,
  "reason" text,
  "actor_id" uuid NOT NULL,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "portal_roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "role_id" text NOT NULL UNIQUE,
  "role_name" text NOT NULL,
  "description" text,
  "department" text NOT NULL,
  "risk_level" text NOT NULL CHECK ("risk_level" IN ('low', 'medium', 'high', 'critical')),
  "scope_model" text NOT NULL,
  "directus_role_id" uuid,
  "is_system_role" boolean NOT NULL DEFAULT true,
  "custom_role_allowed" boolean NOT NULL DEFAULT false,
  "role_status" text NOT NULL DEFAULT 'active' CHECK ("role_status" IN ('draft', 'active', 'deprecated', 'disabled', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "portal_permission_rules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "role_id" uuid NOT NULL,
  "module_id" text NOT NULL,
  "collection_name" text,
  "action" text NOT NULL CHECK ("action" IN ('create', 'read', 'update', 'archive', 'approve', 'reject', 'publish', 'revoke', 'download', 'export', 'assign', 'disable', 'reactivate', 'configure')),
  "is_allowed" boolean NOT NULL DEFAULT false,
  "scope_type" text NOT NULL CHECK ("scope_type" IN ('none', 'own', 'assigned', 'department', 'region', 'school', 'olympiad', 'queue', 'global', 'read_only_masked')),
  "condition_expression" text,
  "field_allowlist" jsonb,
  "field_denylist" jsonb,
  "requires_reason" boolean NOT NULL DEFAULT false,
  "requires_approval" boolean NOT NULL DEFAULT false,
  "requires_dual_approval" boolean NOT NULL DEFAULT false,
  "rule_status" text NOT NULL DEFAULT 'active' CHECK ("rule_status" IN ('draft', 'active', 'deprecated', 'disabled', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "role_change_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "request_code" text NOT NULL UNIQUE,
  "request_type" text NOT NULL CHECK ("request_type" IN ('new_role', 'role_update', 'role_disable', 'permission_add', 'permission_remove', 'permission_update', 'scope_policy_change', 'approval_matrix_change')),
  "target_role_id" uuid,
  "target_module_id" text,
  "proposed_change" jsonb NOT NULL,
  "reason" text NOT NULL,
  "requested_by" uuid NOT NULL,
  "approved_by" uuid,
  "security_reviewed_by" uuid,
  "status" text NOT NULL DEFAULT 'draft' CHECK ("status" IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'applied', 'cancelled', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "approval_policies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "action_code" text NOT NULL UNIQUE,
  "source_module" text NOT NULL,
  "maker_roles" jsonb NOT NULL,
  "approver_roles" jsonb NOT NULL,
  "dual_approval_required" boolean NOT NULL DEFAULT false,
  "same_person_forbidden" boolean NOT NULL DEFAULT true,
  "reason_required" boolean NOT NULL DEFAULT true,
  "approval_expires_after_hours" integer,
  "policy_status" text NOT NULL DEFAULT 'active' CHECK ("policy_status" IN ('draft', 'active', 'deprecated', 'disabled', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "school_leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "lead_code" text NOT NULL UNIQUE,
  "school_name" text NOT NULL,
  "normalized_school_name" text NOT NULL,
  "board" text,
  "address" text,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "country" text NOT NULL DEFAULT 'India',
  "website" text,
  "principal_name" text,
  "coordinator_name" text,
  "email" text,
  "phone" text,
  "lead_source" text NOT NULL CHECK ("lead_source" IN ('manual', 'csv_import', 'xlsx_import', 'website', 'referral', 'event', 'social', 'email_campaign', 'partner', 'other')),
  "source_details" text,
  "lead_owner_id" uuid NOT NULL,
  "stage" text NOT NULL DEFAULT 'new_lead' CHECK ("stage" IN ('new_lead', 'contacted', 'brochure_sent', 'demo_scheduled', 'demo_completed', 'proposal_sent', 'follow_up', 'payment_pending', 'converted', 'lost')),
  "lead_status" text NOT NULL DEFAULT 'active' CHECK ("lead_status" IN ('active', 'stale', 'duplicate_review', 'converted', 'lost', 'archived')),
  "expected_student_count" integer,
  "estimated_value" numeric,
  "followup_date" timestamptz,
  "last_contacted_at" timestamptz,
  "demo_scheduled_at" timestamptz,
  "proposal_sent_at" timestamptz,
  "lost_reason" text CHECK ("lost_reason" IN ('price', 'timing', 'not_interested', 'duplicate', 'wrong_contact', 'already_with_competitor', 'no_response', 'not_eligible', 'other')),
  "lost_reason_note" text,
  "duplicate_status" text NOT NULL DEFAULT 'unchecked' CHECK ("duplicate_status" IN ('unchecked', 'possible_duplicate', 'confirmed_duplicate', 'not_duplicate', 'merged', 'ignored')),
  "duplicate_of_lead_id" uuid,
  "converted_school_id" uuid,
  "conversion_note" text,
  "created_by" uuid NOT NULL,
  "updated_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "school_lead_interactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "interaction_code" text NOT NULL UNIQUE,
  "school_lead_id" uuid NOT NULL,
  "interaction_type" text NOT NULL CHECK ("interaction_type" IN ('call', 'email', 'whatsapp_manual', 'meeting', 'demo', 'proposal', 'note', 'system')),
  "interaction_at" timestamptz NOT NULL,
  "staff_owner_id" uuid NOT NULL,
  "summary" text NOT NULL,
  "outcome" text CHECK ("outcome" IN ('positive', 'neutral', 'negative', 'no_response', 'reschedule', 'converted', 'lost', 'other')),
  "next_followup_at" timestamptz,
  "attachment_file" uuid,
  "interaction_status" text NOT NULL DEFAULT 'recorded' CHECK ("interaction_status" IN ('recorded', 'edited', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "school_lead_import_batches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "batch_code" text NOT NULL UNIQUE,
  "source_file" uuid NOT NULL,
  "import_format" text NOT NULL CHECK ("import_format" IN ('csv', 'xlsx')),
  "uploaded_by" uuid NOT NULL,
  "default_lead_owner_id" uuid,
  "total_rows" integer NOT NULL DEFAULT 0,
  "valid_rows" integer NOT NULL DEFAULT 0,
  "invalid_rows" integer NOT NULL DEFAULT 0,
  "duplicate_rows" integer NOT NULL DEFAULT 0,
  "validation_report" jsonb,
  "duplicate_report" jsonb,
  "status" text NOT NULL DEFAULT 'uploaded' CHECK ("status" IN ('uploaded', 'validated', 'validation_failed', 'imported', 'partially_imported', 'cancelled', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "school_lead_stage_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "school_lead_id" uuid NOT NULL,
  "previous_stage" text,
  "new_stage" text NOT NULL,
  "event_code" text NOT NULL,
  "reason" text,
  "actor_id" uuid NOT NULL,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "school_onboarding_cases" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "onboarding_code" text NOT NULL UNIQUE,
  "source_type" text NOT NULL CHECK ("source_type" IN ('crm_conversion', 'direct_staff_created', 'school_self_submitted', 'migration')),
  "source_lead_id" uuid,
  "school_id" uuid,
  "school_name" text NOT NULL,
  "normalized_school_name" text NOT NULL,
  "board" text,
  "address" text NOT NULL,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "country" text NOT NULL DEFAULT 'India',
  "website" text,
  "coordinator_name" text NOT NULL,
  "coordinator_email" text NOT NULL,
  "coordinator_phone" text,
  "duplicate_check_status" text NOT NULL DEFAULT 'pending' CHECK ("duplicate_check_status" IN ('pending', 'possible_duplicate', 'cleared', 'confirmed_duplicate', 'merged')),
  "identity_verification_status" text NOT NULL DEFAULT 'pending' CHECK ("identity_verification_status" IN ('pending', 'verified', 'rejected', 'needs_more_info')),
  "coordinator_verification_status" text NOT NULL DEFAULT 'pending' CHECK ("coordinator_verification_status" IN ('pending', 'email_sent', 'verified', 'failed', 'needs_more_info')),
  "document_review_status" text NOT NULL DEFAULT 'not_required' CHECK ("document_review_status" IN ('not_required', 'pending', 'under_review', 'accepted', 'rejected')),
  "assigned_reviewer_id" uuid,
  "assigned_approver_id" uuid,
  "onboarding_status" text NOT NULL DEFAULT 'draft' CHECK ("onboarding_status" IN ('draft', 'submitted', 'under_review', 'needs_more_info', 'approved', 'rejected', 'activated', 'blocked', 'suspended', 'archived')),
  "approval_note" text,
  "rejection_reason" text,
  "block_reason" text,
  "sla_due_at" timestamptz,
  "sla_status" text NOT NULL DEFAULT 'not_started' CHECK ("sla_status" IN ('not_started', 'running', 'paused', 'breached', 'met', 'closed')),
  "approved_by" uuid,
  "approved_at" timestamptz,
  "activated_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "school_onboarding_documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "onboarding_case_id" uuid NOT NULL,
  "document_type" text NOT NULL CHECK ("document_type" IN ('authorization_letter', 'school_id_proof', 'coordinator_id_proof_optional', 'other')),
  "document_file" uuid NOT NULL,
  "uploaded_by" uuid NOT NULL,
  "review_status" text NOT NULL DEFAULT 'uploaded' CHECK ("review_status" IN ('uploaded', 'under_review', 'accepted', 'rejected', 'archived')),
  "review_note" text,
  "reviewed_by" uuid,
  "reviewed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "school_onboarding_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "onboarding_case_id" uuid NOT NULL,
  "event_code" text NOT NULL,
  "previous_status" text,
  "new_status" text,
  "reason" text,
  "actor_id" uuid NOT NULL,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "school_status_controls" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "school_id" uuid NOT NULL,
  "onboarding_case_id" uuid,
  "control_type" text NOT NULL CHECK ("control_type" IN ('none', 'blocked', 'suspended', 'security_hold')),
  "control_status" text NOT NULL DEFAULT 'active' CHECK ("control_status" IN ('active', 'released', 'archived')),
  "reason" text NOT NULL,
  "applied_by" uuid NOT NULL,
  "released_by" uuid,
  "applied_at" timestamptz NOT NULL,
  "released_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "schools" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "school_code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "board" text,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "country" text,
  "address" text,
  "principal_name" text,
  "coordinator_name" text NOT NULL,
  "coordinator_email" citext NOT NULL UNIQUE,
  "coordinator_mobile" text,
  "status" text,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "school_users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "directus_user_id" uuid NOT NULL,
  "school_id" uuid NOT NULL,
  "role_label" text,
  "is_primary" boolean,
  "status" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "participations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "participation_code" text NOT NULL UNIQUE,
  "school_id" uuid NOT NULL,
  "olympiad_id" uuid NOT NULL,
  "estimated_student_count" integer,
  "confirmed_student_count" integer,
  "gross_amount" numeric,
  "commission_amount" numeric,
  "net_amount_payable" numeric,
  "payment_status" text,
  "exam_slot_id" uuid,
  "consent_declaration_status" text,
  "status" text,
  "locked_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "security_audit_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "audit_event_code" text NOT NULL UNIQUE,
  "source_module" text NOT NULL,
  "event_type" text NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" uuid,
  "actor_id" uuid,
  "actor_role_snapshot" jsonb,
  "actor_scope_snapshot" jsonb,
  "action" text NOT NULL,
  "reason" text,
  "before_snapshot" jsonb,
  "after_snapshot" jsonb,
  "ip_address" text,
  "device_fingerprint" text,
  "request_id" text,
  "event_hash" text NOT NULL,
  "previous_event_hash" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "security_alerts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "alert_code" text NOT NULL UNIQUE,
  "alert_source" text NOT NULL,
  "alert_type" text NOT NULL,
  "severity" text NOT NULL CHECK ("severity" IN ('info', 'low', 'medium', 'high', 'critical')),
  "risk_score" integer,
  "summary" text NOT NULL,
  "details" jsonb,
  "linked_incident_id" uuid,
  "alert_status" text NOT NULL DEFAULT 'new' CHECK ("alert_status" IN ('new', 'acknowledged', 'escalated', 'converted_to_incident', 'dismissed', 'resolved', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "staff_login_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "staff_user_id" uuid,
  "email_attempted" text,
  "event_type" text NOT NULL CHECK ("event_type" IN ('login_success', 'login_failed', 'logout', 'session_revoked', 'magic_link_sent', 'password_reset_later', 'sso_later')),
  "ip_address" text,
  "device_fingerprint" text,
  "user_agent" text,
  "risk_score" integer,
  "failure_reason" text,
  "session_id_hash" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "permission_drift_findings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "finding_code" text NOT NULL UNIQUE,
  "staff_user_id" uuid,
  "role_or_permission_ref" text NOT NULL,
  "baseline_snapshot" jsonb,
  "current_snapshot" jsonb NOT NULL,
  "risk_level" text NOT NULL CHECK ("risk_level" IN ('low', 'medium', 'high', 'critical')),
  "finding_status" text NOT NULL DEFAULT 'open' CHECK ("finding_status" IN ('open', 'accepted', 'remediation_task_created', 'resolved', 'false_positive', 'archived')),
  "resolution_note" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "forensics_cases" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "case_code" text NOT NULL UNIQUE,
  "case_title" text NOT NULL,
  "linked_incident_id" uuid,
  "case_owner_id" uuid NOT NULL,
  "evidence_snapshot_hash" text,
  "case_summary" text,
  "findings_summary" text,
  "case_status" text NOT NULL DEFAULT 'open' CHECK ("case_status" IN ('open', 'collecting_evidence', 'analysis', 'findings_ready', 'closed', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "security_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "event_code" text NOT NULL,
  "previous_status" text,
  "new_status" text,
  "reason" text,
  "actor_id" uuid,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "staff_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "staff_code" text NOT NULL UNIQUE,
  "user_id" uuid NOT NULL UNIQUE,
  "full_name" text NOT NULL,
  "display_name" text,
  "email" text NOT NULL UNIQUE,
  "mobile" text,
  "department" text NOT NULL CHECK ("department" IN ('leadership', 'operations', 'sales', 'onboarding', 'finance', 'exam_operations', 'content', 'materials', 'courier', 'evaluation', 'results', 'certificates', 'communications', 'support', 'security', 'audit', 'system')),
  "primary_role" text NOT NULL,
  "secondary_roles" jsonb,
  "reporting_manager_id" uuid,
  "employment_type" text NOT NULL CHECK ("employment_type" IN ('full_time', 'part_time', 'contract', 'consultant', 'temporary', 'system_service')),
  "location" text,
  "timezone" text DEFAULT 'Asia/Muscat',
  "joining_date" date NOT NULL,
  "exit_date" date,
  "staff_status" text NOT NULL DEFAULT 'invited' CHECK ("staff_status" IN ('invited', 'active', 'suspended', 'disabled', 'exited', 'archived')),
  "last_login_at" timestamptz,
  "last_failed_login_at" timestamptz,
  "failed_login_count" integer NOT NULL DEFAULT 0,
  "invited_by" uuid,
  "disabled_by" uuid,
  "disable_reason" text,
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "staff_invitations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "invitation_code" text NOT NULL UNIQUE,
  "email" text NOT NULL,
  "full_name" text NOT NULL,
  "department" text NOT NULL,
  "primary_role" text NOT NULL,
  "assignment_scope_preview" jsonb,
  "invitation_token_hash" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "accepted_at" timestamptz,
  "cancelled_at" timestamptz,
  "invited_by" uuid NOT NULL,
  "invitation_status" text NOT NULL DEFAULT 'pending' CHECK ("invitation_status" IN ('pending', 'accepted', 'expired', 'cancelled', 'resent')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "staff_assignment_scopes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "staff_profile_id" uuid NOT NULL,
  "scope_type" text NOT NULL CHECK ("scope_type" IN ('global', 'department', 'region', 'state', 'school', 'olympiad', 'exam_cycle', 'work_queue')),
  "scope_value" text NOT NULL,
  "scope_label" text,
  "starts_at" timestamptz,
  "ends_at" timestamptz,
  "scope_status" text NOT NULL DEFAULT 'active' CHECK ("scope_status" IN ('active', 'paused', 'expired', 'revoked', 'archived')),
  "assigned_by" uuid NOT NULL,
  "assignment_reason" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "staff_access_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "staff_profile_id" uuid,
  "user_id" uuid,
  "event_code" text NOT NULL,
  "event_source" text NOT NULL CHECK ("event_source" IN ('system', 'super_admin', 'company_admin', 'security_admin', 'staff_user', 'auth_provider')),
  "previous_status" text,
  "new_status" text,
  "reason" text,
  "ip_address" text,
  "user_agent" text,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "student_roster_batches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "batch_code" text NOT NULL UNIQUE,
  "school_id" uuid NOT NULL,
  "participation_id" uuid,
  "source_type" text NOT NULL CHECK ("source_type" IN ('school_uploaded', 'staff_uploaded_on_behalf', 'migration', 'correction_batch')),
  "source_file" uuid,
  "uploaded_by" uuid NOT NULL,
  "upload_reason" text,
  "total_rows" integer NOT NULL DEFAULT 0,
  "valid_rows" integer NOT NULL DEFAULT 0,
  "invalid_rows" integer NOT NULL DEFAULT 0,
  "duplicate_rows" integer NOT NULL DEFAULT 0,
  "confirmed_student_count" integer,
  "validation_report" jsonb,
  "duplicate_report" jsonb,
  "batch_status" text NOT NULL DEFAULT 'uploaded' CHECK ("batch_status" IN ('uploaded', 'validating', 'validation_failed', 'validated', 'submitted_for_lock', 'locked', 'unlock_requested', 'correction_pending', 'superseded', 'archived')),
  "locked_by" uuid,
  "locked_at" timestamptz,
  "superseded_by_batch_id" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "student_roster_corrections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "correction_code" text NOT NULL UNIQUE,
  "school_id" uuid NOT NULL,
  "roster_batch_id" uuid NOT NULL,
  "student_id" uuid,
  "correction_type" text NOT NULL CHECK ("correction_type" IN ('add_student', 'remove_student', 'edit_student', 'merge_duplicate', 'void_candidate_id', 'regenerate_candidate_id')),
  "requested_change" jsonb NOT NULL,
  "reason" text NOT NULL,
  "impact_check" jsonb,
  "requested_by" uuid NOT NULL,
  "approved_by" uuid,
  "correction_status" text NOT NULL DEFAULT 'draft' CHECK ("correction_status" IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'applied', 'cancelled', 'archived')),
  "applied_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "candidate_id_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "school_id" uuid NOT NULL,
  "student_id" uuid NOT NULL,
  "roster_batch_id" uuid NOT NULL,
  "candidate_id" text NOT NULL,
  "event_code" text NOT NULL,
  "previous_candidate_id" text,
  "reason" text,
  "actor_id" uuid NOT NULL,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "student_roster_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "roster_batch_id" uuid NOT NULL,
  "event_code" text NOT NULL,
  "previous_status" text,
  "new_status" text,
  "reason" text,
  "actor_id" uuid NOT NULL,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "students" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "candidate_id" text NOT NULL UNIQUE,
  "school_id" uuid NOT NULL,
  "participation_id" uuid NOT NULL,
  "student_name" text NOT NULL,
  "grade" text NOT NULL,
  "section" text,
  "school_roll_number" text UNIQUE,
  "parent_guardian_name" text,
  "parent_contact" text,
  "consent_obtained" boolean NOT NULL,
  "consent_date" date,
  "status" text,
  "validation_errors" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "student_uploads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "upload_code" text NOT NULL UNIQUE,
  "school_id" uuid NOT NULL,
  "participation_id" uuid NOT NULL,
  "uploaded_file" uuid NOT NULL,
  "original_filename" text NOT NULL,
  "file_type" text NOT NULL CHECK ("file_type" IN ('csv', 'xlsx')),
  "row_count" integer NOT NULL DEFAULT 0,
  "valid_count" integer NOT NULL DEFAULT 0,
  "invalid_count" integer NOT NULL DEFAULT 0,
  "duplicate_warning_count" integer NOT NULL DEFAULT 0,
  "validation_report" jsonb,
  "status" text NOT NULL DEFAULT 'uploaded' CHECK ("status" IN ('uploaded', 'parsed', 'validation_failed', 'validation_passed', 'superseded', 'archived')),
  "uploaded_by" uuid NOT NULL,
  "uploaded_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "support_ticket_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "category_code" text NOT NULL UNIQUE,
  "category_name" text NOT NULL,
  "linked_module" text,
  "default_queue" text,
  "default_priority" text NOT NULL DEFAULT 'medium' CHECK ("default_priority" IN ('low', 'medium', 'high', 'critical')),
  "sla_minutes" integer NOT NULL,
  "restricted" boolean NOT NULL DEFAULT false,
  "category_status" text NOT NULL DEFAULT 'active' CHECK ("category_status" IN ('active', 'inactive', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "support_tickets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ticket_code" text NOT NULL UNIQUE,
  "ticket_source" text NOT NULL CHECK ("ticket_source" IN ('school', 'staff', 'system')),
  "school_id" uuid,
  "category_id" uuid NOT NULL,
  "subject" text NOT NULL,
  "description" text NOT NULL,
  "priority" text NOT NULL DEFAULT 'medium' CHECK ("priority" IN ('low', 'medium', 'high', 'critical')),
  "ticket_status" text NOT NULL DEFAULT 'new' CHECK ("ticket_status" IN ('new', 'open', 'assigned', 'waiting_on_school', 'waiting_on_staff', 'escalated', 'resolved', 'closed', 'reopened', 'archived')),
  "assigned_to" uuid,
  "assigned_queue" text,
  "sla_due_at" timestamptz,
  "sla_status" text NOT NULL DEFAULT 'not_started' CHECK ("sla_status" IN ('not_started', 'running', 'paused', 'breached', 'met')),
  "resolution_code" text,
  "resolution_summary" text,
  "created_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "closed_at" timestamptz,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "support_ticket_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ticket_id" uuid NOT NULL,
  "parent_message_id" uuid,
  "message_type" text NOT NULL CHECK ("message_type" IN ('school_reply', 'staff_reply', 'system_reply', 'internal_note')),
  "visibility" text NOT NULL DEFAULT 'ticket_participants' CHECK ("visibility" IN ('school_visible', 'staff_only', 'restricted_security')),
  "body" text NOT NULL,
  "author_id" uuid,
  "author_type" text NOT NULL CHECK ("author_type" IN ('school', 'staff', 'system')),
  "sensitive_flag" boolean NOT NULL DEFAULT false,
  "message_status" text NOT NULL DEFAULT 'active' CHECK ("message_status" IN ('active', 'redacted', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "support_ticket_attachments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ticket_id" uuid NOT NULL,
  "message_id" uuid,
  "file_ref" uuid NOT NULL,
  "file_name" text NOT NULL,
  "file_hash" text NOT NULL,
  "file_size_bytes" integer NOT NULL,
  "sensitive_flag" boolean NOT NULL DEFAULT false,
  "uploaded_by" uuid,
  "attachment_status" text NOT NULL DEFAULT 'active' CHECK ("attachment_status" IN ('active', 'quarantined', 'redacted', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "support_ticket_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ticket_id" uuid NOT NULL,
  "linked_module" text NOT NULL,
  "linked_entity_type" text NOT NULL,
  "linked_entity_id" uuid NOT NULL,
  "safe_summary_snapshot" jsonb,
  "link_status" text NOT NULL DEFAULT 'active' CHECK ("link_status" IN ('active', 'removed', 'archived')),
  "created_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "support_ticket_escalations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "escalation_code" text NOT NULL UNIQUE,
  "ticket_id" uuid NOT NULL,
  "escalation_level" text NOT NULL CHECK ("escalation_level" IN ('module_owner', 'operations_head', 'company_admin', 'security_reviewer')),
  "target_module" text,
  "reason" text NOT NULL,
  "owner_id" uuid,
  "resolution_note" text,
  "escalation_status" text NOT NULL DEFAULT 'open' CHECK ("escalation_status" IN ('open', 'under_review', 'resolved', 'rejected', 'closed', 'archived')),
  "created_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "support_ticket_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ticket_id" uuid NOT NULL,
  "event_code" text NOT NULL,
  "previous_status" text,
  "new_status" text,
  "reason" text,
  "actor_id" uuid,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "task_queues" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "queue_code" text NOT NULL UNIQUE,
  "queue_name" text NOT NULL,
  "queue_type" text NOT NULL CHECK ("queue_type" IN ('module_queue', 'role_queue', 'approval_queue', 'sla_queue', 'security_queue', 'support_queue', 'operations_queue')),
  "owning_module" text,
  "owner_role" text NOT NULL,
  "scope_rule" jsonb,
  "default_priority" text NOT NULL DEFAULT 'medium' CHECK ("default_priority" IN ('low', 'medium', 'high', 'critical')),
  "default_sla_minutes" integer,
  "queue_status" text NOT NULL DEFAULT 'active' CHECK ("queue_status" IN ('active', 'paused', 'inactive', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "work_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_code" text NOT NULL UNIQUE,
  "task_title" text NOT NULL,
  "task_description" text,
  "task_type" text NOT NULL CHECK ("task_type" IN ('manual', 'system_follow_up', 'approval', 'sla_breach', 'exception_resolution', 'module_action', 'support_follow_up', 'security_review')),
  "source_module" text,
  "source_entity_type" text,
  "source_entity_id" uuid,
  "queue_id" uuid NOT NULL,
  "assigned_to" uuid,
  "assigned_role" text,
  "priority" text NOT NULL DEFAULT 'medium' CHECK ("priority" IN ('low', 'medium', 'high', 'critical')),
  "task_status" text NOT NULL DEFAULT 'new' CHECK ("task_status" IN ('new', 'queued', 'assigned', 'in_progress', 'blocked', 'waiting', 'escalated', 'completed', 'cancelled', 'reopened', 'archived')),
  "sla_status" text NOT NULL DEFAULT 'not_started' CHECK ("sla_status" IN ('not_started', 'running', 'paused', 'breached', 'met', 'waived')),
  "due_at" timestamptz,
  "started_at" timestamptz,
  "completed_at" timestamptz,
  "completion_note" text,
  "outcome_code" text,
  "created_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "task_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_id" uuid NOT NULL,
  "assigned_to" uuid,
  "assigned_role" text,
  "assigned_queue_id" uuid NOT NULL,
  "assignment_reason" text,
  "assigned_by" uuid,
  "assignment_status" text NOT NULL DEFAULT 'active' CHECK ("assignment_status" IN ('active', 'superseded', 'cancelled', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "task_dependencies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_id" uuid NOT NULL,
  "dependency_type" text NOT NULL CHECK ("dependency_type" IN ('blocks', 'blocked_by', 'related_to', 'approval_for', 'follow_up_for')),
  "related_task_id" uuid,
  "related_module" text,
  "related_entity_type" text,
  "related_entity_id" uuid,
  "dependency_status" text NOT NULL DEFAULT 'active' CHECK ("dependency_status" IN ('active', 'resolved', 'cancelled', 'archived')),
  "created_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "task_comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_id" uuid NOT NULL,
  "comment_body" text NOT NULL,
  "comment_type" text NOT NULL CHECK ("comment_type" IN ('work_note', 'system_note', 'escalation_note', 'approval_note', 'completion_note')),
  "visibility" text NOT NULL DEFAULT 'staff_only' CHECK ("visibility" IN ('staff_only', 'queue_members', 'security_restricted')),
  "author_id" uuid,
  "comment_status" text NOT NULL DEFAULT 'active' CHECK ("comment_status" IN ('active', 'redacted', 'archived')),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "task_sla_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_id" uuid NOT NULL,
  "event_code" text NOT NULL CHECK ("event_code" IN ('sla_started', 'sla_paused', 'sla_resumed', 'sla_due_soon', 'sla_breached', 'sla_met', 'sla_waived')),
  "previous_sla_status" text,
  "new_sla_status" text,
  "reason" text,
  "actor_id" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "task_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "task_id" uuid NOT NULL,
  "event_code" text NOT NULL,
  "previous_status" text,
  "new_status" text,
  "reason" text,
  "actor_id" uuid,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "status" text,
  "archived_at" timestamptz,
  "version" text
);

create table if not exists "olympiads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "olympiad_code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "academic_year" text NOT NULL,
  "subject" text NOT NULL,
  "eligible_grades" jsonb NOT NULL,
  "registration_open_at" timestamptz NOT NULL,
  "registration_close_at" timestamptz NOT NULL,
  "exam_window_start" timestamptz NOT NULL,
  "exam_window_end" timestamptz NOT NULL,
  "fee_per_student" numeric NOT NULL,
  "school_commission_per_student" numeric NOT NULL,
  "max_marks" integer NOT NULL,
  "status" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
  "created_by" uuid,
  "archived_at" timestamptz,
  "version" text
);

-- ---- foreign keys ----
alter table "setting_groups" add constraint "fk_setting_groups_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "setting_definitions" add constraint "fk_setting_definitions_group_id" foreign key ("group_id") references "setting_groups" ("id");
alter table "setting_definitions" add constraint "fk_setting_definitions_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "setting_versions" add constraint "fk_setting_versions_requested_by" foreign key ("requested_by") references "staff_profiles" ("id");
alter table "setting_versions" add constraint "fk_setting_versions_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "setting_versions" add constraint "fk_setting_versions_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "setting_change_requests" add constraint "fk_setting_change_requests_setting_version_id" foreign key ("setting_version_id") references "setting_versions" ("id");
alter table "setting_change_requests" add constraint "fk_setting_change_requests_requested_by" foreign key ("requested_by") references "staff_profiles" ("id");
alter table "setting_change_requests" add constraint "fk_setting_change_requests_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "setting_change_requests" add constraint "fk_setting_change_requests_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "setting_activation_events" add constraint "fk_setting_activation_events_setting_version_id" foreign key ("setting_version_id") references "setting_versions" ("id");
alter table "setting_activation_events" add constraint "fk_setting_activation_events_previous_active_version_id" foreign key ("previous_active_version_id") references "setting_versions" ("id");
alter table "setting_activation_events" add constraint "fk_setting_activation_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "setting_activation_events" add constraint "fk_setting_activation_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "admin_setting_events" add constraint "fk_admin_setting_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "admin_setting_events" add constraint "fk_admin_setting_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "audit_events" add constraint "fk_audit_events_actor_user_id" foreign key ("actor_user_id") references "staff_profiles" ("id");
alter table "audit_events" add constraint "fk_audit_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "audit_cases" add constraint "fk_audit_cases_assigned_to" foreign key ("assigned_to") references "staff_profiles" ("id");
alter table "audit_cases" add constraint "fk_audit_cases_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "security_incidents" add constraint "fk_security_incidents_reported_by" foreign key ("reported_by") references "staff_profiles" ("id");
alter table "security_incidents" add constraint "fk_security_incidents_owner" foreign key ("owner") references "staff_profiles" ("id");
alter table "security_incidents" add constraint "fk_security_incidents_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "access_reviews" add constraint "fk_access_reviews_reviewed_by" foreign key ("reviewed_by") references "staff_profiles" ("id");
alter table "access_reviews" add constraint "fk_access_reviews_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "reconciliation_runs" add constraint "fk_reconciliation_runs_run_by" foreign key ("run_by") references "staff_profiles" ("id");
alter table "reconciliation_runs" add constraint "fk_reconciliation_runs_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "audit_exports" add constraint "fk_audit_exports_requested_by" foreign key ("requested_by") references "staff_profiles" ("id");
alter table "audit_exports" add constraint "fk_audit_exports_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "audit_exports" add constraint "fk_audit_exports_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "certificate_templates" add constraint "fk_certificate_templates_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "certificate_templates" add constraint "fk_certificate_templates_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "certificate_eligibility_snapshots" add constraint "fk_certificate_eligibility_snapshots_result_batch_id" foreign key ("result_batch_id") references "result_batches" ("id");
alter table "certificate_eligibility_snapshots" add constraint "fk_certificate_eligibility_snapshots_candidate_result_id" foreign key ("candidate_result_id") references "candidate_results" ("id");
alter table "certificate_eligibility_snapshots" add constraint "fk_certificate_eligibility_snapshots_school_id" foreign key ("school_id") references "schools" ("id");
alter table "certificate_eligibility_snapshots" add constraint "fk_certificate_eligibility_snapshots_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "certificates" add constraint "fk_certificates_student_id" foreign key ("student_id") references "students" ("id");
alter table "certificates" add constraint "fk_certificates_result_id" foreign key ("result_id") references "results" ("id");
alter table "certificates" add constraint "fk_certificates_school_id" foreign key ("school_id") references "schools" ("id");
alter table "certificates" add constraint "fk_certificates_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "certificate_requests" add constraint "fk_certificate_requests_certificate_id" foreign key ("certificate_id") references "certificates" ("id");
alter table "certificate_requests" add constraint "fk_certificate_requests_result_correction_id" foreign key ("result_correction_id") references "result_corrections" ("id");
alter table "certificate_requests" add constraint "fk_certificate_requests_requested_by" foreign key ("requested_by") references "staff_profiles" ("id");
alter table "certificate_requests" add constraint "fk_certificate_requests_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "certificate_requests" add constraint "fk_certificate_requests_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "certificate_download_events" add constraint "fk_certificate_download_events_certificate_id" foreign key ("certificate_id") references "certificates" ("id");
alter table "certificate_download_events" add constraint "fk_certificate_download_events_school_id" foreign key ("school_id") references "schools" ("id");
alter table "certificate_download_events" add constraint "fk_certificate_download_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "certificate_download_events" add constraint "fk_certificate_download_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "certificate_events" add constraint "fk_certificate_events_certificate_id" foreign key ("certificate_id") references "certificates" ("id");
alter table "certificate_events" add constraint "fk_certificate_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "certificate_events" add constraint "fk_certificate_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "dashboard_preferences" add constraint "fk_dashboard_preferences_user_id" foreign key ("user_id") references "staff_profiles" ("id");
alter table "dashboard_preferences" add constraint "fk_dashboard_preferences_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "dashboard_alert_dismissals" add constraint "fk_dashboard_alert_dismissals_user_id" foreign key ("user_id") references "staff_profiles" ("id");
alter table "dashboard_alert_dismissals" add constraint "fk_dashboard_alert_dismissals_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "dashboard_snapshots" add constraint "fk_dashboard_snapshots_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "courier_batches" add constraint "fk_courier_batches_school_id" foreign key ("school_id") references "schools" ("id");
alter table "courier_batches" add constraint "fk_courier_batches_participation_id" foreign key ("participation_id") references "participations" ("id");
alter table "courier_batches" add constraint "fk_courier_batches_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "courier_events" add constraint "fk_courier_events_courier_batch_id" foreign key ("courier_batch_id") references "courier_batches" ("id");
alter table "courier_events" add constraint "fk_courier_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "courier_events" add constraint "fk_courier_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "courier_vendors" add constraint "fk_courier_vendors_school_id" foreign key ("school_id") references "schools" ("id");
alter table "courier_vendors" add constraint "fk_courier_vendors_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "courier_dispatch_batches" add constraint "fk_courier_dispatch_batches_school_id" foreign key ("school_id") references "schools" ("id");
alter table "courier_dispatch_batches" add constraint "fk_courier_dispatch_batches_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "courier_shipments" add constraint "fk_courier_shipments_school_id" foreign key ("school_id") references "schools" ("id");
alter table "courier_shipments" add constraint "fk_courier_shipments_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "courier_tracking_events" add constraint "fk_courier_tracking_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "courier_receipts" add constraint "fk_courier_receipts_school_id" foreign key ("school_id") references "schools" ("id");
alter table "courier_receipts" add constraint "fk_courier_receipts_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "courier_exceptions" add constraint "fk_courier_exceptions_school_id" foreign key ("school_id") references "schools" ("id");
alter table "courier_exceptions" add constraint "fk_courier_exceptions_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "evaluation_answer_keys" add constraint "fk_evaluation_answer_keys_exam_cycle_id" foreign key ("exam_cycle_id") references "exam_cycles" ("id");
alter table "evaluation_answer_keys" add constraint "fk_evaluation_answer_keys_uploaded_by" foreign key ("uploaded_by") references "staff_profiles" ("id");
alter table "evaluation_answer_keys" add constraint "fk_evaluation_answer_keys_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "evaluation_answer_keys" add constraint "fk_evaluation_answer_keys_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "evaluation_import_batches" add constraint "fk_evaluation_import_batches_exam_cycle_id" foreign key ("exam_cycle_id") references "exam_cycles" ("id");
alter table "evaluation_import_batches" add constraint "fk_evaluation_import_batches_exam_slot_id" foreign key ("exam_slot_id") references "exam_slots" ("id");
alter table "evaluation_import_batches" add constraint "fk_evaluation_import_batches_school_id" foreign key ("school_id") references "schools" ("id");
alter table "evaluation_import_batches" add constraint "fk_evaluation_import_batches_courier_shipment_id" foreign key ("courier_shipment_id") references "courier_shipments" ("id");
alter table "evaluation_import_batches" add constraint "fk_evaluation_import_batches_uploaded_by" foreign key ("uploaded_by") references "staff_profiles" ("id");
alter table "evaluation_import_batches" add constraint "fk_evaluation_import_batches_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "evaluation_import_batches" add constraint "fk_evaluation_import_batches_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "evaluation_candidate_responses" add constraint "fk_evaluation_candidate_responses_import_batch_id" foreign key ("import_batch_id") references "evaluation_import_batches" ("id");
alter table "evaluation_candidate_responses" add constraint "fk_evaluation_candidate_responses_school_id" foreign key ("school_id") references "schools" ("id");
alter table "evaluation_candidate_responses" add constraint "fk_evaluation_candidate_responses_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "evaluation_score_batches" add constraint "fk_evaluation_score_batches_import_batch_id" foreign key ("import_batch_id") references "evaluation_import_batches" ("id");
alter table "evaluation_score_batches" add constraint "fk_evaluation_score_batches_answer_key_id" foreign key ("answer_key_id") references "evaluation_answer_keys" ("id");
alter table "evaluation_score_batches" add constraint "fk_evaluation_score_batches_scored_by" foreign key ("scored_by") references "staff_profiles" ("id");
alter table "evaluation_score_batches" add constraint "fk_evaluation_score_batches_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "evaluation_score_batches" add constraint "fk_evaluation_score_batches_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "evaluation_candidate_scores" add constraint "fk_evaluation_candidate_scores_score_batch_id" foreign key ("score_batch_id") references "evaluation_score_batches" ("id");
alter table "evaluation_candidate_scores" add constraint "fk_evaluation_candidate_scores_school_id" foreign key ("school_id") references "schools" ("id");
alter table "evaluation_candidate_scores" add constraint "fk_evaluation_candidate_scores_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "evaluation_exceptions" add constraint "fk_evaluation_exceptions_import_batch_id" foreign key ("import_batch_id") references "evaluation_import_batches" ("id");
alter table "evaluation_exceptions" add constraint "fk_evaluation_exceptions_owner_id" foreign key ("owner_id") references "staff_profiles" ("id");
alter table "evaluation_exceptions" add constraint "fk_evaluation_exceptions_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "evaluation_events" add constraint "fk_evaluation_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "evaluation_events" add constraint "fk_evaluation_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "exam_material_templates" add constraint "fk_exam_material_templates_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "exam_material_templates" add constraint "fk_exam_material_templates_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "exam_material_packages" add constraint "fk_exam_material_packages_school_id" foreign key ("school_id") references "schools" ("id");
alter table "exam_material_packages" add constraint "fk_exam_material_packages_exam_cycle_id" foreign key ("exam_cycle_id") references "exam_cycles" ("id");
alter table "exam_material_packages" add constraint "fk_exam_material_packages_exam_slot_id" foreign key ("exam_slot_id") references "exam_slots" ("id");
alter table "exam_material_packages" add constraint "fk_exam_material_packages_slot_assignment_id" foreign key ("slot_assignment_id") references "school_exam_slot_assignments" ("id");
alter table "exam_material_packages" add constraint "fk_exam_material_packages_roster_batch_id" foreign key ("roster_batch_id") references "student_roster_batches" ("id");
alter table "exam_material_packages" add constraint "fk_exam_material_packages_generated_by" foreign key ("generated_by") references "staff_profiles" ("id");
alter table "exam_material_packages" add constraint "fk_exam_material_packages_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "exam_material_packages" add constraint "fk_exam_material_packages_released_by" foreign key ("released_by") references "staff_profiles" ("id");
alter table "exam_material_packages" add constraint "fk_exam_material_packages_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "exam_material_files" add constraint "fk_exam_material_files_material_package_id" foreign key ("material_package_id") references "exam_material_packages" ("id");
alter table "exam_material_files" add constraint "fk_exam_material_files_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "exam_material_approvals" add constraint "fk_exam_material_approvals_material_package_id" foreign key ("material_package_id") references "exam_material_packages" ("id");
alter table "exam_material_approvals" add constraint "fk_exam_material_approvals_requested_by" foreign key ("requested_by") references "staff_profiles" ("id");
alter table "exam_material_approvals" add constraint "fk_exam_material_approvals_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "exam_material_approvals" add constraint "fk_exam_material_approvals_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "exam_material_download_events" add constraint "fk_exam_material_download_events_material_package_id" foreign key ("material_package_id") references "exam_material_packages" ("id");
alter table "exam_material_download_events" add constraint "fk_exam_material_download_events_material_file_id" foreign key ("material_file_id") references "exam_material_files" ("id");
alter table "exam_material_download_events" add constraint "fk_exam_material_download_events_school_id" foreign key ("school_id") references "schools" ("id");
alter table "exam_material_download_events" add constraint "fk_exam_material_download_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "exam_material_download_events" add constraint "fk_exam_material_download_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "exam_material_events" add constraint "fk_exam_material_events_school_id" foreign key ("school_id") references "schools" ("id");
alter table "exam_material_events" add constraint "fk_exam_material_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "exam_material_events" add constraint "fk_exam_material_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "exam_materials" add constraint "fk_exam_materials_participation_id" foreign key ("participation_id") references "participations" ("id");
alter table "exam_materials" add constraint "fk_exam_materials_olympiad_id" foreign key ("olympiad_id") references "olympiads" ("id");
alter table "exam_materials" add constraint "fk_exam_materials_exam_slot_id" foreign key ("exam_slot_id") references "exam_slots" ("id");
alter table "exam_materials" add constraint "fk_exam_materials_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "exam_material_downloads" add constraint "fk_exam_material_downloads_exam_material_id" foreign key ("exam_material_id") references "exam_materials" ("id");
alter table "exam_material_downloads" add constraint "fk_exam_material_downloads_school_id" foreign key ("school_id") references "schools" ("id");
alter table "exam_material_downloads" add constraint "fk_exam_material_downloads_participation_id" foreign key ("participation_id") references "participations" ("id");
alter table "exam_material_downloads" add constraint "fk_exam_material_downloads_downloaded_by" foreign key ("downloaded_by") references "staff_profiles" ("id");
alter table "exam_material_downloads" add constraint "fk_exam_material_downloads_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "exam_cycles" add constraint "fk_exam_cycles_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "exam_cycles" add constraint "fk_exam_cycles_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "exam_slots" add constraint "fk_exam_slots_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "school_exam_slot_assignments" add constraint "fk_school_exam_slot_assignments_school_id" foreign key ("school_id") references "schools" ("id");
alter table "school_exam_slot_assignments" add constraint "fk_school_exam_slot_assignments_exam_cycle_id" foreign key ("exam_cycle_id") references "exam_cycles" ("id");
alter table "school_exam_slot_assignments" add constraint "fk_school_exam_slot_assignments_exam_slot_id" foreign key ("exam_slot_id") references "exam_slots" ("id");
alter table "school_exam_slot_assignments" add constraint "fk_school_exam_slot_assignments_roster_batch_id" foreign key ("roster_batch_id") references "student_roster_batches" ("id");
alter table "school_exam_slot_assignments" add constraint "fk_school_exam_slot_assignments_finance_invoice_id" foreign key ("finance_invoice_id") references "finance_invoices" ("id");
alter table "school_exam_slot_assignments" add constraint "fk_school_exam_slot_assignments_assigned_by" foreign key ("assigned_by") references "staff_profiles" ("id");
alter table "school_exam_slot_assignments" add constraint "fk_school_exam_slot_assignments_confirmed_by" foreign key ("confirmed_by") references "staff_profiles" ("id");
alter table "school_exam_slot_assignments" add constraint "fk_school_exam_slot_assignments_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "exam_slot_reschedule_requests" add constraint "fk_exam_slot_reschedule_requests_assignment_id" foreign key ("assignment_id") references "school_exam_slot_assignments" ("id");
alter table "exam_slot_reschedule_requests" add constraint "fk_exam_slot_reschedule_requests_from_slot_id" foreign key ("from_slot_id") references "exam_slots" ("id");
alter table "exam_slot_reschedule_requests" add constraint "fk_exam_slot_reschedule_requests_to_slot_id" foreign key ("to_slot_id") references "exam_slots" ("id");
alter table "exam_slot_reschedule_requests" add constraint "fk_exam_slot_reschedule_requests_requested_by" foreign key ("requested_by") references "staff_profiles" ("id");
alter table "exam_slot_reschedule_requests" add constraint "fk_exam_slot_reschedule_requests_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "exam_slot_reschedule_requests" add constraint "fk_exam_slot_reschedule_requests_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "exam_slot_conflicts" add constraint "fk_exam_slot_conflicts_assignment_id" foreign key ("assignment_id") references "school_exam_slot_assignments" ("id");
alter table "exam_slot_conflicts" add constraint "fk_exam_slot_conflicts_exam_slot_id" foreign key ("exam_slot_id") references "exam_slots" ("id");
alter table "exam_slot_conflicts" add constraint "fk_exam_slot_conflicts_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "exam_slot_events" add constraint "fk_exam_slot_events_school_id" foreign key ("school_id") references "schools" ("id");
alter table "exam_slot_events" add constraint "fk_exam_slot_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "exam_slot_events" add constraint "fk_exam_slot_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "exam_slot_bookings" add constraint "fk_exam_slot_bookings_school_id" foreign key ("school_id") references "schools" ("id");
alter table "exam_slot_bookings" add constraint "fk_exam_slot_bookings_participation_id" foreign key ("participation_id") references "participations" ("id");
alter table "exam_slot_bookings" add constraint "fk_exam_slot_bookings_exam_slot_id" foreign key ("exam_slot_id") references "exam_slots" ("id");
alter table "exam_slot_bookings" add constraint "fk_exam_slot_bookings_booked_by" foreign key ("booked_by") references "staff_profiles" ("id");
alter table "exam_slot_bookings" add constraint "fk_exam_slot_bookings_cancelled_by" foreign key ("cancelled_by") references "staff_profiles" ("id");
alter table "exam_slot_bookings" add constraint "fk_exam_slot_bookings_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "finance_invoices" add constraint "fk_finance_invoices_school_id" foreign key ("school_id") references "schools" ("id");
alter table "finance_invoices" add constraint "fk_finance_invoices_participation_id" foreign key ("participation_id") references "participations" ("id");
alter table "finance_invoices" add constraint "fk_finance_invoices_roster_batch_id" foreign key ("roster_batch_id") references "student_roster_batches" ("id");
alter table "finance_invoices" add constraint "fk_finance_invoices_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "finance_invoices" add constraint "fk_finance_invoices_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "finance_payment_links" add constraint "fk_finance_payment_links_invoice_id" foreign key ("invoice_id") references "finance_invoices" ("id");
alter table "finance_payment_links" add constraint "fk_finance_payment_links_school_id" foreign key ("school_id") references "schools" ("id");
alter table "finance_payment_links" add constraint "fk_finance_payment_links_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "finance_payments" add constraint "fk_finance_payments_invoice_id" foreign key ("invoice_id") references "finance_invoices" ("id");
alter table "finance_payments" add constraint "fk_finance_payments_school_id" foreign key ("school_id") references "schools" ("id");
alter table "finance_payments" add constraint "fk_finance_payments_payment_link_id" foreign key ("payment_link_id") references "finance_payment_links" ("id");
alter table "finance_payments" add constraint "fk_finance_payments_confirmed_by" foreign key ("confirmed_by") references "staff_profiles" ("id");
alter table "finance_payments" add constraint "fk_finance_payments_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "finance_adjustments" add constraint "fk_finance_adjustments_invoice_id" foreign key ("invoice_id") references "finance_invoices" ("id");
alter table "finance_adjustments" add constraint "fk_finance_adjustments_school_id" foreign key ("school_id") references "schools" ("id");
alter table "finance_adjustments" add constraint "fk_finance_adjustments_requested_by" foreign key ("requested_by") references "staff_profiles" ("id");
alter table "finance_adjustments" add constraint "fk_finance_adjustments_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "finance_adjustments" add constraint "fk_finance_adjustments_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "finance_reconciliation_batches" add constraint "fk_finance_reconciliation_batches_closed_by" foreign key ("closed_by") references "staff_profiles" ("id");
alter table "finance_reconciliation_batches" add constraint "fk_finance_reconciliation_batches_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "finance_events" add constraint "fk_finance_events_school_id" foreign key ("school_id") references "schools" ("id");
alter table "finance_events" add constraint "fk_finance_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "finance_events" add constraint "fk_finance_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "notification_templates" add constraint "fk_notification_templates_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "notification_templates" add constraint "fk_notification_templates_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "notification_triggers" add constraint "fk_notification_triggers_template_id" foreign key ("template_id") references "notification_templates" ("id");
alter table "notification_triggers" add constraint "fk_notification_triggers_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "notification_batches" add constraint "fk_notification_batches_template_id" foreign key ("template_id") references "notification_templates" ("id");
alter table "notification_batches" add constraint "fk_notification_batches_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "notification_batches" add constraint "fk_notification_batches_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "notification_recipients" add constraint "fk_notification_recipients_batch_id" foreign key ("batch_id") references "notification_batches" ("id");
alter table "notification_recipients" add constraint "fk_notification_recipients_school_id" foreign key ("school_id") references "schools" ("id");
alter table "notification_recipients" add constraint "fk_notification_recipients_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "notification_messages" add constraint "fk_notification_messages_batch_id" foreign key ("batch_id") references "notification_batches" ("id");
alter table "notification_messages" add constraint "fk_notification_messages_recipient_id" foreign key ("recipient_id") references "notification_recipients" ("id");
alter table "notification_messages" add constraint "fk_notification_messages_template_id" foreign key ("template_id") references "notification_templates" ("id");
alter table "notification_messages" add constraint "fk_notification_messages_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "notification_delivery_attempts" add constraint "fk_notification_delivery_attempts_message_id" foreign key ("message_id") references "notification_messages" ("id");
alter table "notification_delivery_attempts" add constraint "fk_notification_delivery_attempts_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "notification_preferences" add constraint "fk_notification_preferences_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "notification_events" add constraint "fk_notification_events_school_id" foreign key ("school_id") references "schools" ("id");
alter table "notification_events" add constraint "fk_notification_events_participation_id" foreign key ("participation_id") references "participations" ("id");
alter table "notification_events" add constraint "fk_notification_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "notification_deliveries" add constraint "fk_notification_deliveries_event_id" foreign key ("event_id") references "notification_events" ("id");
alter table "notification_deliveries" add constraint "fk_notification_deliveries_template_id" foreign key ("template_id") references "notification_templates" ("id");
alter table "notification_deliveries" add constraint "fk_notification_deliveries_recipient_user_id" foreign key ("recipient_user_id") references "staff_profiles" ("id");
alter table "notification_deliveries" add constraint "fk_notification_deliveries_school_id" foreign key ("school_id") references "schools" ("id");
alter table "notification_deliveries" add constraint "fk_notification_deliveries_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "answer_keys" add constraint "fk_answer_keys_olympiad_id" foreign key ("olympiad_id") references "olympiads" ("id");
alter table "answer_keys" add constraint "fk_answer_keys_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "answer_keys" add constraint "fk_answer_keys_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "omr_imports" add constraint "fk_omr_imports_participation_id" foreign key ("participation_id") references "participations" ("id");
alter table "omr_imports" add constraint "fk_omr_imports_courier_batch_id" foreign key ("courier_batch_id") references "courier_batches" ("id");
alter table "omr_imports" add constraint "fk_omr_imports_uploaded_by" foreign key ("uploaded_by") references "staff_profiles" ("id");
alter table "omr_imports" add constraint "fk_omr_imports_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "omr_imports" add constraint "fk_omr_imports_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "omr_candidate_scores" add constraint "fk_omr_candidate_scores_omr_import_id" foreign key ("omr_import_id") references "omr_imports" ("id");
alter table "omr_candidate_scores" add constraint "fk_omr_candidate_scores_student_id" foreign key ("student_id") references "students" ("id");
alter table "omr_candidate_scores" add constraint "fk_omr_candidate_scores_school_id" foreign key ("school_id") references "schools" ("id");
alter table "omr_candidate_scores" add constraint "fk_omr_candidate_scores_participation_id" foreign key ("participation_id") references "participations" ("id");
alter table "omr_candidate_scores" add constraint "fk_omr_candidate_scores_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "payments" add constraint "fk_payments_participation_id" foreign key ("participation_id") references "participations" ("id");
alter table "payments" add constraint "fk_payments_school_id" foreign key ("school_id") references "schools" ("id");
alter table "payments" add constraint "fk_payments_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "payment_events" add constraint "fk_payment_events_payment_id" foreign key ("payment_id") references "payments" ("id");
alter table "payment_events" add constraint "fk_payment_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "payment_events" add constraint "fk_payment_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "report_definitions" add constraint "fk_report_definitions_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "export_requests" add constraint "fk_export_requests_report_definition_id" foreign key ("report_definition_id") references "report_definitions" ("id");
alter table "export_requests" add constraint "fk_export_requests_requested_by" foreign key ("requested_by") references "staff_profiles" ("id");
alter table "export_requests" add constraint "fk_export_requests_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "export_requests" add constraint "fk_export_requests_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "report_snapshots" add constraint "fk_report_snapshots_export_request_id" foreign key ("export_request_id") references "export_requests" ("id");
alter table "report_snapshots" add constraint "fk_report_snapshots_report_definition_id" foreign key ("report_definition_id") references "report_definitions" ("id");
alter table "report_snapshots" add constraint "fk_report_snapshots_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "export_files" add constraint "fk_export_files_export_request_id" foreign key ("export_request_id") references "export_requests" ("id");
alter table "export_files" add constraint "fk_export_files_snapshot_id" foreign key ("snapshot_id") references "report_snapshots" ("id");
alter table "export_files" add constraint "fk_export_files_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "export_download_events" add constraint "fk_export_download_events_export_file_id" foreign key ("export_file_id") references "export_files" ("id");
alter table "export_download_events" add constraint "fk_export_download_events_downloaded_by" foreign key ("downloaded_by") references "staff_profiles" ("id");
alter table "export_download_events" add constraint "fk_export_download_events_school_id" foreign key ("school_id") references "schools" ("id");
alter table "export_download_events" add constraint "fk_export_download_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "report_events" add constraint "fk_report_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "report_events" add constraint "fk_report_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "results" add constraint "fk_results_student_id" foreign key ("student_id") references "students" ("id");
alter table "results" add constraint "fk_results_participation_id" foreign key ("participation_id") references "participations" ("id");
alter table "results" add constraint "fk_results_school_id" foreign key ("school_id") references "schools" ("id");
alter table "results" add constraint "fk_results_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "result_publications" add constraint "fk_result_publications_olympiad_id" foreign key ("olympiad_id") references "olympiads" ("id");
alter table "result_publications" add constraint "fk_result_publications_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "result_publications" add constraint "fk_result_publications_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "result_corrections" add constraint "fk_result_corrections_result_id" foreign key ("result_id") references "results" ("id");
alter table "result_corrections" add constraint "fk_result_corrections_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "result_corrections" add constraint "fk_result_corrections_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "result_batches" add constraint "fk_result_batches_exam_cycle_id" foreign key ("exam_cycle_id") references "exam_cycles" ("id");
alter table "result_batches" add constraint "fk_result_batches_evaluation_score_batch_id" foreign key ("evaluation_score_batch_id") references "evaluation_score_batches" ("id");
alter table "result_batches" add constraint "fk_result_batches_generated_by" foreign key ("generated_by") references "staff_profiles" ("id");
alter table "result_batches" add constraint "fk_result_batches_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "result_batches" add constraint "fk_result_batches_published_by" foreign key ("published_by") references "staff_profiles" ("id");
alter table "result_batches" add constraint "fk_result_batches_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "candidate_results" add constraint "fk_candidate_results_result_batch_id" foreign key ("result_batch_id") references "result_batches" ("id");
alter table "candidate_results" add constraint "fk_candidate_results_school_id" foreign key ("school_id") references "schools" ("id");
alter table "candidate_results" add constraint "fk_candidate_results_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "result_publication_windows" add constraint "fk_result_publication_windows_result_batch_id" foreign key ("result_batch_id") references "result_batches" ("id");
alter table "result_publication_windows" add constraint "fk_result_publication_windows_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "result_publication_windows" add constraint "fk_result_publication_windows_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "result_rank_snapshots" add constraint "fk_result_rank_snapshots_result_batch_id" foreign key ("result_batch_id") references "result_batches" ("id");
alter table "result_rank_snapshots" add constraint "fk_result_rank_snapshots_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "result_events" add constraint "fk_result_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "result_events" add constraint "fk_result_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "portal_roles" add constraint "fk_portal_roles_directus_role_id" foreign key ("directus_role_id") references "portal_roles" ("id");
alter table "portal_roles" add constraint "fk_portal_roles_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "portal_permission_rules" add constraint "fk_portal_permission_rules_role_id" foreign key ("role_id") references "portal_roles" ("id");
alter table "portal_permission_rules" add constraint "fk_portal_permission_rules_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "role_change_requests" add constraint "fk_role_change_requests_target_role_id" foreign key ("target_role_id") references "portal_roles" ("id");
alter table "role_change_requests" add constraint "fk_role_change_requests_requested_by" foreign key ("requested_by") references "staff_profiles" ("id");
alter table "role_change_requests" add constraint "fk_role_change_requests_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "role_change_requests" add constraint "fk_role_change_requests_security_reviewed_by" foreign key ("security_reviewed_by") references "staff_profiles" ("id");
alter table "role_change_requests" add constraint "fk_role_change_requests_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "approval_policies" add constraint "fk_approval_policies_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "school_leads" add constraint "fk_school_leads_lead_owner_id" foreign key ("lead_owner_id") references "staff_profiles" ("id");
alter table "school_leads" add constraint "fk_school_leads_duplicate_of_lead_id" foreign key ("duplicate_of_lead_id") references "school_leads" ("id");
alter table "school_leads" add constraint "fk_school_leads_converted_school_id" foreign key ("converted_school_id") references "schools" ("id");
alter table "school_leads" add constraint "fk_school_leads_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "school_leads" add constraint "fk_school_leads_updated_by" foreign key ("updated_by") references "staff_profiles" ("id");
alter table "school_lead_interactions" add constraint "fk_school_lead_interactions_school_lead_id" foreign key ("school_lead_id") references "school_leads" ("id");
alter table "school_lead_interactions" add constraint "fk_school_lead_interactions_staff_owner_id" foreign key ("staff_owner_id") references "staff_profiles" ("id");
alter table "school_lead_interactions" add constraint "fk_school_lead_interactions_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "school_lead_import_batches" add constraint "fk_school_lead_import_batches_uploaded_by" foreign key ("uploaded_by") references "staff_profiles" ("id");
alter table "school_lead_import_batches" add constraint "fk_school_lead_import_batches_default_lead_owner_id" foreign key ("default_lead_owner_id") references "staff_profiles" ("id");
alter table "school_lead_import_batches" add constraint "fk_school_lead_import_batches_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "school_lead_stage_events" add constraint "fk_school_lead_stage_events_school_lead_id" foreign key ("school_lead_id") references "school_leads" ("id");
alter table "school_lead_stage_events" add constraint "fk_school_lead_stage_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "school_lead_stage_events" add constraint "fk_school_lead_stage_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "school_onboarding_cases" add constraint "fk_school_onboarding_cases_source_lead_id" foreign key ("source_lead_id") references "school_leads" ("id");
alter table "school_onboarding_cases" add constraint "fk_school_onboarding_cases_school_id" foreign key ("school_id") references "schools" ("id");
alter table "school_onboarding_cases" add constraint "fk_school_onboarding_cases_assigned_reviewer_id" foreign key ("assigned_reviewer_id") references "staff_profiles" ("id");
alter table "school_onboarding_cases" add constraint "fk_school_onboarding_cases_assigned_approver_id" foreign key ("assigned_approver_id") references "staff_profiles" ("id");
alter table "school_onboarding_cases" add constraint "fk_school_onboarding_cases_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "school_onboarding_cases" add constraint "fk_school_onboarding_cases_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "school_onboarding_documents" add constraint "fk_school_onboarding_documents_onboarding_case_id" foreign key ("onboarding_case_id") references "school_onboarding_cases" ("id");
alter table "school_onboarding_documents" add constraint "fk_school_onboarding_documents_uploaded_by" foreign key ("uploaded_by") references "staff_profiles" ("id");
alter table "school_onboarding_documents" add constraint "fk_school_onboarding_documents_reviewed_by" foreign key ("reviewed_by") references "staff_profiles" ("id");
alter table "school_onboarding_documents" add constraint "fk_school_onboarding_documents_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "school_onboarding_events" add constraint "fk_school_onboarding_events_onboarding_case_id" foreign key ("onboarding_case_id") references "school_onboarding_cases" ("id");
alter table "school_onboarding_events" add constraint "fk_school_onboarding_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "school_onboarding_events" add constraint "fk_school_onboarding_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "school_status_controls" add constraint "fk_school_status_controls_school_id" foreign key ("school_id") references "schools" ("id");
alter table "school_status_controls" add constraint "fk_school_status_controls_onboarding_case_id" foreign key ("onboarding_case_id") references "school_onboarding_cases" ("id");
alter table "school_status_controls" add constraint "fk_school_status_controls_applied_by" foreign key ("applied_by") references "staff_profiles" ("id");
alter table "school_status_controls" add constraint "fk_school_status_controls_released_by" foreign key ("released_by") references "staff_profiles" ("id");
alter table "school_status_controls" add constraint "fk_school_status_controls_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "schools" add constraint "fk_schools_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "school_users" add constraint "fk_school_users_directus_user_id" foreign key ("directus_user_id") references "staff_profiles" ("id");
alter table "school_users" add constraint "fk_school_users_school_id" foreign key ("school_id") references "schools" ("id");
alter table "school_users" add constraint "fk_school_users_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "participations" add constraint "fk_participations_school_id" foreign key ("school_id") references "schools" ("id");
alter table "participations" add constraint "fk_participations_olympiad_id" foreign key ("olympiad_id") references "olympiads" ("id");
alter table "participations" add constraint "fk_participations_exam_slot_id" foreign key ("exam_slot_id") references "exam_slots" ("id");
alter table "participations" add constraint "fk_participations_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "security_audit_events" add constraint "fk_security_audit_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "security_audit_events" add constraint "fk_security_audit_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "security_alerts" add constraint "fk_security_alerts_linked_incident_id" foreign key ("linked_incident_id") references "security_incidents" ("id");
alter table "security_alerts" add constraint "fk_security_alerts_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "staff_login_events" add constraint "fk_staff_login_events_staff_user_id" foreign key ("staff_user_id") references "staff_profiles" ("id");
alter table "staff_login_events" add constraint "fk_staff_login_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "permission_drift_findings" add constraint "fk_permission_drift_findings_staff_user_id" foreign key ("staff_user_id") references "staff_profiles" ("id");
alter table "permission_drift_findings" add constraint "fk_permission_drift_findings_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "forensics_cases" add constraint "fk_forensics_cases_linked_incident_id" foreign key ("linked_incident_id") references "security_incidents" ("id");
alter table "forensics_cases" add constraint "fk_forensics_cases_case_owner_id" foreign key ("case_owner_id") references "staff_profiles" ("id");
alter table "forensics_cases" add constraint "fk_forensics_cases_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "security_events" add constraint "fk_security_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "security_events" add constraint "fk_security_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "staff_profiles" add constraint "fk_staff_profiles_user_id" foreign key ("user_id") references "staff_profiles" ("id");
alter table "staff_profiles" add constraint "fk_staff_profiles_reporting_manager_id" foreign key ("reporting_manager_id") references "staff_profiles" ("id");
alter table "staff_profiles" add constraint "fk_staff_profiles_invited_by" foreign key ("invited_by") references "staff_profiles" ("id");
alter table "staff_profiles" add constraint "fk_staff_profiles_disabled_by" foreign key ("disabled_by") references "staff_profiles" ("id");
alter table "staff_profiles" add constraint "fk_staff_profiles_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "staff_invitations" add constraint "fk_staff_invitations_invited_by" foreign key ("invited_by") references "staff_profiles" ("id");
alter table "staff_invitations" add constraint "fk_staff_invitations_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "staff_assignment_scopes" add constraint "fk_staff_assignment_scopes_staff_profile_id" foreign key ("staff_profile_id") references "staff_profiles" ("id");
alter table "staff_assignment_scopes" add constraint "fk_staff_assignment_scopes_assigned_by" foreign key ("assigned_by") references "staff_profiles" ("id");
alter table "staff_assignment_scopes" add constraint "fk_staff_assignment_scopes_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "staff_access_events" add constraint "fk_staff_access_events_staff_profile_id" foreign key ("staff_profile_id") references "staff_profiles" ("id");
alter table "staff_access_events" add constraint "fk_staff_access_events_user_id" foreign key ("user_id") references "staff_profiles" ("id");
alter table "staff_access_events" add constraint "fk_staff_access_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "student_roster_batches" add constraint "fk_student_roster_batches_school_id" foreign key ("school_id") references "schools" ("id");
alter table "student_roster_batches" add constraint "fk_student_roster_batches_participation_id" foreign key ("participation_id") references "participations" ("id");
alter table "student_roster_batches" add constraint "fk_student_roster_batches_uploaded_by" foreign key ("uploaded_by") references "staff_profiles" ("id");
alter table "student_roster_batches" add constraint "fk_student_roster_batches_locked_by" foreign key ("locked_by") references "staff_profiles" ("id");
alter table "student_roster_batches" add constraint "fk_student_roster_batches_superseded_by_batch_id" foreign key ("superseded_by_batch_id") references "student_roster_batches" ("id");
alter table "student_roster_batches" add constraint "fk_student_roster_batches_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "student_roster_corrections" add constraint "fk_student_roster_corrections_school_id" foreign key ("school_id") references "schools" ("id");
alter table "student_roster_corrections" add constraint "fk_student_roster_corrections_roster_batch_id" foreign key ("roster_batch_id") references "student_roster_batches" ("id");
alter table "student_roster_corrections" add constraint "fk_student_roster_corrections_student_id" foreign key ("student_id") references "students" ("id");
alter table "student_roster_corrections" add constraint "fk_student_roster_corrections_requested_by" foreign key ("requested_by") references "staff_profiles" ("id");
alter table "student_roster_corrections" add constraint "fk_student_roster_corrections_approved_by" foreign key ("approved_by") references "staff_profiles" ("id");
alter table "student_roster_corrections" add constraint "fk_student_roster_corrections_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "candidate_id_events" add constraint "fk_candidate_id_events_school_id" foreign key ("school_id") references "schools" ("id");
alter table "candidate_id_events" add constraint "fk_candidate_id_events_student_id" foreign key ("student_id") references "students" ("id");
alter table "candidate_id_events" add constraint "fk_candidate_id_events_roster_batch_id" foreign key ("roster_batch_id") references "student_roster_batches" ("id");
alter table "candidate_id_events" add constraint "fk_candidate_id_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "candidate_id_events" add constraint "fk_candidate_id_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "student_roster_events" add constraint "fk_student_roster_events_roster_batch_id" foreign key ("roster_batch_id") references "student_roster_batches" ("id");
alter table "student_roster_events" add constraint "fk_student_roster_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "student_roster_events" add constraint "fk_student_roster_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "students" add constraint "fk_students_school_id" foreign key ("school_id") references "schools" ("id");
alter table "students" add constraint "fk_students_participation_id" foreign key ("participation_id") references "participations" ("id");
alter table "students" add constraint "fk_students_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "student_uploads" add constraint "fk_student_uploads_school_id" foreign key ("school_id") references "schools" ("id");
alter table "student_uploads" add constraint "fk_student_uploads_participation_id" foreign key ("participation_id") references "participations" ("id");
alter table "student_uploads" add constraint "fk_student_uploads_uploaded_by" foreign key ("uploaded_by") references "staff_profiles" ("id");
alter table "student_uploads" add constraint "fk_student_uploads_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "support_ticket_categories" add constraint "fk_support_ticket_categories_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "support_tickets" add constraint "fk_support_tickets_school_id" foreign key ("school_id") references "schools" ("id");
alter table "support_tickets" add constraint "fk_support_tickets_category_id" foreign key ("category_id") references "support_ticket_categories" ("id");
alter table "support_tickets" add constraint "fk_support_tickets_assigned_to" foreign key ("assigned_to") references "staff_profiles" ("id");
alter table "support_tickets" add constraint "fk_support_tickets_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "support_ticket_messages" add constraint "fk_support_ticket_messages_ticket_id" foreign key ("ticket_id") references "support_tickets" ("id");
alter table "support_ticket_messages" add constraint "fk_support_ticket_messages_parent_message_id" foreign key ("parent_message_id") references "support_ticket_messages" ("id");
alter table "support_ticket_messages" add constraint "fk_support_ticket_messages_author_id" foreign key ("author_id") references "staff_profiles" ("id");
alter table "support_ticket_messages" add constraint "fk_support_ticket_messages_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "support_ticket_attachments" add constraint "fk_support_ticket_attachments_ticket_id" foreign key ("ticket_id") references "support_tickets" ("id");
alter table "support_ticket_attachments" add constraint "fk_support_ticket_attachments_message_id" foreign key ("message_id") references "support_ticket_messages" ("id");
alter table "support_ticket_attachments" add constraint "fk_support_ticket_attachments_uploaded_by" foreign key ("uploaded_by") references "staff_profiles" ("id");
alter table "support_ticket_attachments" add constraint "fk_support_ticket_attachments_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "support_ticket_links" add constraint "fk_support_ticket_links_ticket_id" foreign key ("ticket_id") references "support_tickets" ("id");
alter table "support_ticket_links" add constraint "fk_support_ticket_links_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "support_ticket_escalations" add constraint "fk_support_ticket_escalations_ticket_id" foreign key ("ticket_id") references "support_tickets" ("id");
alter table "support_ticket_escalations" add constraint "fk_support_ticket_escalations_owner_id" foreign key ("owner_id") references "staff_profiles" ("id");
alter table "support_ticket_escalations" add constraint "fk_support_ticket_escalations_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "support_ticket_events" add constraint "fk_support_ticket_events_ticket_id" foreign key ("ticket_id") references "support_tickets" ("id");
alter table "support_ticket_events" add constraint "fk_support_ticket_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "support_ticket_events" add constraint "fk_support_ticket_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "task_queues" add constraint "fk_task_queues_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "work_tasks" add constraint "fk_work_tasks_queue_id" foreign key ("queue_id") references "task_queues" ("id");
alter table "work_tasks" add constraint "fk_work_tasks_assigned_to" foreign key ("assigned_to") references "staff_profiles" ("id");
alter table "work_tasks" add constraint "fk_work_tasks_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "task_assignments" add constraint "fk_task_assignments_task_id" foreign key ("task_id") references "work_tasks" ("id");
alter table "task_assignments" add constraint "fk_task_assignments_assigned_to" foreign key ("assigned_to") references "staff_profiles" ("id");
alter table "task_assignments" add constraint "fk_task_assignments_assigned_queue_id" foreign key ("assigned_queue_id") references "task_queues" ("id");
alter table "task_assignments" add constraint "fk_task_assignments_assigned_by" foreign key ("assigned_by") references "staff_profiles" ("id");
alter table "task_assignments" add constraint "fk_task_assignments_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "task_dependencies" add constraint "fk_task_dependencies_task_id" foreign key ("task_id") references "work_tasks" ("id");
alter table "task_dependencies" add constraint "fk_task_dependencies_related_task_id" foreign key ("related_task_id") references "work_tasks" ("id");
alter table "task_dependencies" add constraint "fk_task_dependencies_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "task_comments" add constraint "fk_task_comments_task_id" foreign key ("task_id") references "work_tasks" ("id");
alter table "task_comments" add constraint "fk_task_comments_author_id" foreign key ("author_id") references "staff_profiles" ("id");
alter table "task_comments" add constraint "fk_task_comments_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "task_sla_events" add constraint "fk_task_sla_events_task_id" foreign key ("task_id") references "work_tasks" ("id");
alter table "task_sla_events" add constraint "fk_task_sla_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "task_sla_events" add constraint "fk_task_sla_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "task_events" add constraint "fk_task_events_task_id" foreign key ("task_id") references "work_tasks" ("id");
alter table "task_events" add constraint "fk_task_events_actor_id" foreign key ("actor_id") references "staff_profiles" ("id");
alter table "task_events" add constraint "fk_task_events_created_by" foreign key ("created_by") references "staff_profiles" ("id");
alter table "olympiads" add constraint "fk_olympiads_created_by" foreign key ("created_by") references "staff_profiles" ("id");

-- ---- composite unique business keys ----
alter table "setting_groups" add constraint "uq_setting_groups_group_code" unique ("group_code");
alter table "setting_definitions" add constraint "uq_setting_definitions_setting_key" unique ("setting_key");
alter table "setting_definitions" add constraint "uq_setting_definitions_definition_version" unique ("definition_version");
alter table "setting_versions" add constraint "uq_setting_versions_setting_key" unique ("setting_key");
alter table "setting_versions" add constraint "uq_setting_versions_setting_version" unique ("setting_version");
alter table "setting_change_requests" add constraint "uq_setting_change_requests_change_request_code" unique ("change_request_code");
alter table "audit_cases" add constraint "uq_audit_cases_case_code" unique ("case_code");
alter table "security_incidents" add constraint "uq_security_incidents_incident_code" unique ("incident_code");
alter table "access_reviews" add constraint "uq_access_reviews_review_code" unique ("review_code");
alter table "reconciliation_runs" add constraint "uq_reconciliation_runs_recon_code" unique ("recon_code");
alter table "audit_exports" add constraint "uq_audit_exports_export_code" unique ("export_code");
alter table "certificate_templates" add constraint "uq_certificate_templates_template_code" unique ("template_code");
alter table "certificate_eligibility_snapshots" add constraint "uq_certificate_eligibility_snapshots_eligibility_code" unique ("eligibility_code");
alter table "certificate_requests" add constraint "uq_certificate_requests_request_code" unique ("request_code");
alter table "dashboard_snapshots" add constraint "uq_dashboard_snapshots_snapshot_code" unique ("snapshot_code");
alter table "evaluation_answer_keys" add constraint "uq_evaluation_answer_keys_answer_key_code" unique ("answer_key_code");
alter table "evaluation_answer_keys" add constraint "uq_evaluation_answer_keys_key_version" unique ("key_version");
alter table "evaluation_import_batches" add constraint "uq_evaluation_import_batches_import_batch_code" unique ("import_batch_code");
alter table "evaluation_candidate_responses" add constraint "uq_evaluation_candidate_responses_candidate_id" unique ("candidate_id");
alter table "evaluation_candidate_responses" add constraint "uq_evaluation_candidate_responses_import_batch_id" unique ("import_batch_id");
alter table "evaluation_score_batches" add constraint "uq_evaluation_score_batches_score_batch_code" unique ("score_batch_code");
alter table "evaluation_candidate_scores" add constraint "uq_evaluation_candidate_scores_candidate_id" unique ("candidate_id");
alter table "evaluation_candidate_scores" add constraint "uq_evaluation_candidate_scores_score_batch_id" unique ("score_batch_id");
alter table "evaluation_exceptions" add constraint "uq_evaluation_exceptions_exception_code" unique ("exception_code");
alter table "exam_material_templates" add constraint "uq_exam_material_templates_template_code" unique ("template_code");
alter table "exam_material_templates" add constraint "uq_exam_material_templates_template_version" unique ("template_version");
alter table "exam_material_packages" add constraint "uq_exam_material_packages_package_code" unique ("package_code");
alter table "exam_material_files" add constraint "uq_exam_material_files_file_code" unique ("file_code");
alter table "exam_material_approvals" add constraint "uq_exam_material_approvals_approval_code" unique ("approval_code");
alter table "exam_cycles" add constraint "uq_exam_cycles_cycle_code" unique ("cycle_code");
alter table "school_exam_slot_assignments" add constraint "uq_school_exam_slot_assignments_assignment_code" unique ("assignment_code");
alter table "exam_slot_reschedule_requests" add constraint "uq_exam_slot_reschedule_requests_reschedule_code" unique ("reschedule_code");
alter table "exam_slot_bookings" add constraint "uq_exam_slot_bookings_booking_code" unique ("booking_code");
alter table "exam_slot_bookings" add constraint "uq_exam_slot_bookings_participation_id" unique ("participation_id");
alter table "finance_invoices" add constraint "uq_finance_invoices_invoice_number" unique ("invoice_number");
alter table "finance_payment_links" add constraint "uq_finance_payment_links_payment_link_code" unique ("payment_link_code");
alter table "finance_payment_links" add constraint "uq_finance_payment_links_provider_reference" unique ("provider_reference");
alter table "finance_payments" add constraint "uq_finance_payments_payment_reference" unique ("payment_reference");
alter table "finance_adjustments" add constraint "uq_finance_adjustments_adjustment_code" unique ("adjustment_code");
alter table "finance_reconciliation_batches" add constraint "uq_finance_reconciliation_batches_reconciliation_code" unique ("reconciliation_code");
alter table "notification_templates" add constraint "uq_notification_templates_template_code" unique ("template_code");
alter table "notification_triggers" add constraint "uq_notification_triggers_trigger_code" unique ("trigger_code");
alter table "notification_batches" add constraint "uq_notification_batches_batch_code" unique ("batch_code");
alter table "notification_recipients" add constraint "uq_notification_recipients_batch_id" unique ("batch_id");
alter table "notification_recipients" add constraint "uq_notification_recipients_recipient_key" unique ("recipient_key");
alter table "notification_messages" add constraint "uq_notification_messages_message_code" unique ("message_code");
alter table "notification_events" add constraint "uq_notification_events_event_idempotency_key" unique ("event_idempotency_key");
alter table "notification_deliveries" add constraint "uq_notification_deliveries_delivery_code" unique ("delivery_code");
alter table "answer_keys" add constraint "uq_answer_keys_answer_key_code" unique ("answer_key_code");
alter table "report_definitions" add constraint "uq_report_definitions_report_code" unique ("report_code");
alter table "report_definitions" add constraint "uq_report_definitions_report_version" unique ("report_version");
alter table "export_requests" add constraint "uq_export_requests_export_code" unique ("export_code");
alter table "report_snapshots" add constraint "uq_report_snapshots_snapshot_code" unique ("snapshot_code");
alter table "export_files" add constraint "uq_export_files_file_code" unique ("file_code");
alter table "result_publications" add constraint "uq_result_publications_publication_code" unique ("publication_code");
alter table "result_batches" add constraint "uq_result_batches_result_batch_code" unique ("result_batch_code");
alter table "candidate_results" add constraint "uq_candidate_results_candidate_id" unique ("candidate_id");
alter table "candidate_results" add constraint "uq_candidate_results_result_batch_id" unique ("result_batch_id");
alter table "candidate_results" add constraint "uq_candidate_results_result_version" unique ("result_version");
alter table "result_publication_windows" add constraint "uq_result_publication_windows_publication_code" unique ("publication_code");
alter table "result_rank_snapshots" add constraint "uq_result_rank_snapshots_snapshot_code" unique ("snapshot_code");
alter table "portal_roles" add constraint "uq_portal_roles_role_id" unique ("role_id");
alter table "portal_roles" add constraint "uq_portal_roles_directus_role_id" unique ("directus_role_id");
alter table "role_change_requests" add constraint "uq_role_change_requests_request_code" unique ("request_code");
alter table "approval_policies" add constraint "uq_approval_policies_action_code" unique ("action_code");
alter table "school_leads" add constraint "uq_school_leads_lead_code" unique ("lead_code");
alter table "school_lead_import_batches" add constraint "uq_school_lead_import_batches_batch_code" unique ("batch_code");
alter table "school_onboarding_cases" add constraint "uq_school_onboarding_cases_onboarding_code" unique ("onboarding_code");
alter table "security_alerts" add constraint "uq_security_alerts_alert_code" unique ("alert_code");
alter table "permission_drift_findings" add constraint "uq_permission_drift_findings_finding_code" unique ("finding_code");
alter table "forensics_cases" add constraint "uq_forensics_cases_case_code" unique ("case_code");
alter table "staff_profiles" add constraint "uq_staff_profiles_staff_code" unique ("staff_code");
alter table "staff_profiles" add constraint "uq_staff_profiles_user_id" unique ("user_id");
alter table "staff_profiles" add constraint "uq_staff_profiles_email" unique ("email");
alter table "staff_invitations" add constraint "uq_staff_invitations_invitation_code" unique ("invitation_code");
alter table "student_roster_batches" add constraint "uq_student_roster_batches_batch_code" unique ("batch_code");
alter table "student_roster_corrections" add constraint "uq_student_roster_corrections_correction_code" unique ("correction_code");
alter table "support_ticket_categories" add constraint "uq_support_ticket_categories_category_code" unique ("category_code");
alter table "support_tickets" add constraint "uq_support_tickets_ticket_code" unique ("ticket_code");
alter table "support_ticket_escalations" add constraint "uq_support_ticket_escalations_escalation_code" unique ("escalation_code");
alter table "task_queues" add constraint "uq_task_queues_queue_code" unique ("queue_code");
alter table "work_tasks" add constraint "uq_work_tasks_task_code" unique ("task_code");

-- ---- indexes ----
create index if not exists "ix_setting_groups_created_by" on "setting_groups" ("created_by");
create index if not exists "ix_setting_groups_status" on "setting_groups" ("status");
create index if not exists "ix_setting_groups_archived_at" on "setting_groups" ("archived_at");
create index if not exists "ix_setting_definitions_group_id" on "setting_definitions" ("group_id");
create index if not exists "ix_setting_definitions_created_by" on "setting_definitions" ("created_by");
create index if not exists "ix_setting_definitions_status" on "setting_definitions" ("status");
create index if not exists "ix_setting_definitions_archived_at" on "setting_definitions" ("archived_at");
create index if not exists "ix_setting_versions_requested_by" on "setting_versions" ("requested_by");
create index if not exists "ix_setting_versions_approved_by" on "setting_versions" ("approved_by");
create index if not exists "ix_setting_versions_created_by" on "setting_versions" ("created_by");
create index if not exists "ix_setting_versions_status" on "setting_versions" ("status");
create index if not exists "ix_setting_versions_archived_at" on "setting_versions" ("archived_at");
create index if not exists "ix_setting_change_requests_setting_version_id" on "setting_change_requests" ("setting_version_id");
create index if not exists "ix_setting_change_requests_requested_by" on "setting_change_requests" ("requested_by");
create index if not exists "ix_setting_change_requests_approved_by" on "setting_change_requests" ("approved_by");
create index if not exists "ix_setting_change_requests_created_by" on "setting_change_requests" ("created_by");
create index if not exists "ix_setting_change_requests_status" on "setting_change_requests" ("status");
create index if not exists "ix_setting_change_requests_archived_at" on "setting_change_requests" ("archived_at");
create index if not exists "ix_setting_activation_events_setting_version_id" on "setting_activation_events" ("setting_version_id");
create index if not exists "ix_setting_activation_events_previous_active_version_id" on "setting_activation_events" ("previous_active_version_id");
create index if not exists "ix_setting_activation_events_actor_id" on "setting_activation_events" ("actor_id");
create index if not exists "ix_setting_activation_events_created_by" on "setting_activation_events" ("created_by");
create index if not exists "ix_setting_activation_events_status" on "setting_activation_events" ("status");
create index if not exists "ix_setting_activation_events_archived_at" on "setting_activation_events" ("archived_at");
create index if not exists "ix_admin_setting_events_actor_id" on "admin_setting_events" ("actor_id");
create index if not exists "ix_admin_setting_events_created_by" on "admin_setting_events" ("created_by");
create index if not exists "ix_admin_setting_events_status" on "admin_setting_events" ("status");
create index if not exists "ix_admin_setting_events_archived_at" on "admin_setting_events" ("archived_at");
create index if not exists "ix_audit_events_actor_user_id" on "audit_events" ("actor_user_id");
create index if not exists "ix_audit_events_created_by" on "audit_events" ("created_by");
create index if not exists "ix_audit_events_status" on "audit_events" ("status");
create index if not exists "ix_audit_events_archived_at" on "audit_events" ("archived_at");
create index if not exists "ix_audit_cases_assigned_to" on "audit_cases" ("assigned_to");
create index if not exists "ix_audit_cases_created_by" on "audit_cases" ("created_by");
create index if not exists "ix_audit_cases_status" on "audit_cases" ("status");
create index if not exists "ix_audit_cases_archived_at" on "audit_cases" ("archived_at");
create index if not exists "ix_security_incidents_reported_by" on "security_incidents" ("reported_by");
create index if not exists "ix_security_incidents_owner" on "security_incidents" ("owner");
create index if not exists "ix_security_incidents_created_by" on "security_incidents" ("created_by");
create index if not exists "ix_security_incidents_status" on "security_incidents" ("status");
create index if not exists "ix_security_incidents_archived_at" on "security_incidents" ("archived_at");
create index if not exists "ix_access_reviews_reviewed_by" on "access_reviews" ("reviewed_by");
create index if not exists "ix_access_reviews_created_by" on "access_reviews" ("created_by");
create index if not exists "ix_access_reviews_status" on "access_reviews" ("status");
create index if not exists "ix_access_reviews_archived_at" on "access_reviews" ("archived_at");
create index if not exists "ix_reconciliation_runs_run_by" on "reconciliation_runs" ("run_by");
create index if not exists "ix_reconciliation_runs_created_by" on "reconciliation_runs" ("created_by");
create index if not exists "ix_reconciliation_runs_status" on "reconciliation_runs" ("status");
create index if not exists "ix_reconciliation_runs_archived_at" on "reconciliation_runs" ("archived_at");
create index if not exists "ix_audit_exports_requested_by" on "audit_exports" ("requested_by");
create index if not exists "ix_audit_exports_approved_by" on "audit_exports" ("approved_by");
create index if not exists "ix_audit_exports_created_by" on "audit_exports" ("created_by");
create index if not exists "ix_audit_exports_status" on "audit_exports" ("status");
create index if not exists "ix_audit_exports_archived_at" on "audit_exports" ("archived_at");
create index if not exists "ix_certificate_templates_approved_by" on "certificate_templates" ("approved_by");
create index if not exists "ix_certificate_templates_created_by" on "certificate_templates" ("created_by");
create index if not exists "ix_certificate_templates_status" on "certificate_templates" ("status");
create index if not exists "ix_certificate_templates_archived_at" on "certificate_templates" ("archived_at");
create index if not exists "ix_certificate_eligibility_snapshots_result_batch_id" on "certificate_eligibility_snapshots" ("result_batch_id");
create index if not exists "ix_certificate_eligibility_snapshots_candidate_result_id" on "certificate_eligibility_snapshots" ("candidate_result_id");
create index if not exists "ix_certificate_eligibility_snapshots_school_id" on "certificate_eligibility_snapshots" ("school_id");
create index if not exists "ix_certificate_eligibility_snapshots_created_by" on "certificate_eligibility_snapshots" ("created_by");
create index if not exists "ix_certificate_eligibility_snapshots_status" on "certificate_eligibility_snapshots" ("status");
create index if not exists "ix_certificate_eligibility_snapshots_archived_at" on "certificate_eligibility_snapshots" ("archived_at");
create index if not exists "ix_certificates_student_id" on "certificates" ("student_id");
create index if not exists "ix_certificates_result_id" on "certificates" ("result_id");
create index if not exists "ix_certificates_school_id" on "certificates" ("school_id");
create index if not exists "ix_certificates_created_by" on "certificates" ("created_by");
create index if not exists "ix_certificates_status" on "certificates" ("status");
create index if not exists "ix_certificates_archived_at" on "certificates" ("archived_at");
create index if not exists "ix_certificate_requests_certificate_id" on "certificate_requests" ("certificate_id");
create index if not exists "ix_certificate_requests_result_correction_id" on "certificate_requests" ("result_correction_id");
create index if not exists "ix_certificate_requests_requested_by" on "certificate_requests" ("requested_by");
create index if not exists "ix_certificate_requests_approved_by" on "certificate_requests" ("approved_by");
create index if not exists "ix_certificate_requests_created_by" on "certificate_requests" ("created_by");
create index if not exists "ix_certificate_requests_status" on "certificate_requests" ("status");
create index if not exists "ix_certificate_requests_archived_at" on "certificate_requests" ("archived_at");
create index if not exists "ix_certificate_download_events_certificate_id" on "certificate_download_events" ("certificate_id");
create index if not exists "ix_certificate_download_events_school_id" on "certificate_download_events" ("school_id");
create index if not exists "ix_certificate_download_events_actor_id" on "certificate_download_events" ("actor_id");
create index if not exists "ix_certificate_download_events_created_by" on "certificate_download_events" ("created_by");
create index if not exists "ix_certificate_download_events_status" on "certificate_download_events" ("status");
create index if not exists "ix_certificate_download_events_archived_at" on "certificate_download_events" ("archived_at");
create index if not exists "ix_certificate_events_certificate_id" on "certificate_events" ("certificate_id");
create index if not exists "ix_certificate_events_actor_id" on "certificate_events" ("actor_id");
create index if not exists "ix_certificate_events_created_by" on "certificate_events" ("created_by");
create index if not exists "ix_certificate_events_status" on "certificate_events" ("status");
create index if not exists "ix_certificate_events_archived_at" on "certificate_events" ("archived_at");
create index if not exists "ix_dashboard_preferences_user_id" on "dashboard_preferences" ("user_id");
create index if not exists "ix_dashboard_preferences_created_by" on "dashboard_preferences" ("created_by");
create index if not exists "ix_dashboard_preferences_status" on "dashboard_preferences" ("status");
create index if not exists "ix_dashboard_preferences_archived_at" on "dashboard_preferences" ("archived_at");
create index if not exists "ix_dashboard_alert_dismissals_user_id" on "dashboard_alert_dismissals" ("user_id");
create index if not exists "ix_dashboard_alert_dismissals_created_by" on "dashboard_alert_dismissals" ("created_by");
create index if not exists "ix_dashboard_alert_dismissals_status" on "dashboard_alert_dismissals" ("status");
create index if not exists "ix_dashboard_alert_dismissals_archived_at" on "dashboard_alert_dismissals" ("archived_at");
create index if not exists "ix_dashboard_snapshots_created_by" on "dashboard_snapshots" ("created_by");
create index if not exists "ix_dashboard_snapshots_status" on "dashboard_snapshots" ("status");
create index if not exists "ix_dashboard_snapshots_archived_at" on "dashboard_snapshots" ("archived_at");
create index if not exists "ix_courier_batches_school_id" on "courier_batches" ("school_id");
create index if not exists "ix_courier_batches_participation_id" on "courier_batches" ("participation_id");
create index if not exists "ix_courier_batches_created_by" on "courier_batches" ("created_by");
create index if not exists "ix_courier_batches_status" on "courier_batches" ("status");
create index if not exists "ix_courier_batches_archived_at" on "courier_batches" ("archived_at");
create index if not exists "ix_courier_events_courier_batch_id" on "courier_events" ("courier_batch_id");
create index if not exists "ix_courier_events_actor_id" on "courier_events" ("actor_id");
create index if not exists "ix_courier_events_created_by" on "courier_events" ("created_by");
create index if not exists "ix_courier_events_status" on "courier_events" ("status");
create index if not exists "ix_courier_events_archived_at" on "courier_events" ("archived_at");
create index if not exists "ix_courier_vendors_school_id" on "courier_vendors" ("school_id");
create index if not exists "ix_courier_vendors_created_by" on "courier_vendors" ("created_by");
create index if not exists "ix_courier_vendors_status" on "courier_vendors" ("status");
create index if not exists "ix_courier_vendors_archived_at" on "courier_vendors" ("archived_at");
create index if not exists "ix_courier_dispatch_batches_school_id" on "courier_dispatch_batches" ("school_id");
create index if not exists "ix_courier_dispatch_batches_created_by" on "courier_dispatch_batches" ("created_by");
create index if not exists "ix_courier_dispatch_batches_status" on "courier_dispatch_batches" ("status");
create index if not exists "ix_courier_dispatch_batches_archived_at" on "courier_dispatch_batches" ("archived_at");
create index if not exists "ix_courier_shipments_school_id" on "courier_shipments" ("school_id");
create index if not exists "ix_courier_shipments_created_by" on "courier_shipments" ("created_by");
create index if not exists "ix_courier_shipments_status" on "courier_shipments" ("status");
create index if not exists "ix_courier_shipments_archived_at" on "courier_shipments" ("archived_at");
create index if not exists "ix_courier_tracking_events_created_by" on "courier_tracking_events" ("created_by");
create index if not exists "ix_courier_tracking_events_status" on "courier_tracking_events" ("status");
create index if not exists "ix_courier_tracking_events_archived_at" on "courier_tracking_events" ("archived_at");
create index if not exists "ix_courier_receipts_school_id" on "courier_receipts" ("school_id");
create index if not exists "ix_courier_receipts_created_by" on "courier_receipts" ("created_by");
create index if not exists "ix_courier_receipts_status" on "courier_receipts" ("status");
create index if not exists "ix_courier_receipts_archived_at" on "courier_receipts" ("archived_at");
create index if not exists "ix_courier_exceptions_school_id" on "courier_exceptions" ("school_id");
create index if not exists "ix_courier_exceptions_created_by" on "courier_exceptions" ("created_by");
create index if not exists "ix_courier_exceptions_status" on "courier_exceptions" ("status");
create index if not exists "ix_courier_exceptions_archived_at" on "courier_exceptions" ("archived_at");
create index if not exists "ix_evaluation_answer_keys_exam_cycle_id" on "evaluation_answer_keys" ("exam_cycle_id");
create index if not exists "ix_evaluation_answer_keys_uploaded_by" on "evaluation_answer_keys" ("uploaded_by");
create index if not exists "ix_evaluation_answer_keys_approved_by" on "evaluation_answer_keys" ("approved_by");
create index if not exists "ix_evaluation_answer_keys_created_by" on "evaluation_answer_keys" ("created_by");
create index if not exists "ix_evaluation_answer_keys_status" on "evaluation_answer_keys" ("status");
create index if not exists "ix_evaluation_answer_keys_archived_at" on "evaluation_answer_keys" ("archived_at");
create index if not exists "ix_evaluation_import_batches_exam_cycle_id" on "evaluation_import_batches" ("exam_cycle_id");
create index if not exists "ix_evaluation_import_batches_exam_slot_id" on "evaluation_import_batches" ("exam_slot_id");
create index if not exists "ix_evaluation_import_batches_school_id" on "evaluation_import_batches" ("school_id");
create index if not exists "ix_evaluation_import_batches_courier_shipment_id" on "evaluation_import_batches" ("courier_shipment_id");
create index if not exists "ix_evaluation_import_batches_uploaded_by" on "evaluation_import_batches" ("uploaded_by");
create index if not exists "ix_evaluation_import_batches_approved_by" on "evaluation_import_batches" ("approved_by");
create index if not exists "ix_evaluation_import_batches_created_by" on "evaluation_import_batches" ("created_by");
create index if not exists "ix_evaluation_import_batches_status" on "evaluation_import_batches" ("status");
create index if not exists "ix_evaluation_import_batches_archived_at" on "evaluation_import_batches" ("archived_at");
create index if not exists "ix_evaluation_candidate_responses_import_batch_id" on "evaluation_candidate_responses" ("import_batch_id");
create index if not exists "ix_evaluation_candidate_responses_school_id" on "evaluation_candidate_responses" ("school_id");
create index if not exists "ix_evaluation_candidate_responses_created_by" on "evaluation_candidate_responses" ("created_by");
create index if not exists "ix_evaluation_candidate_responses_status" on "evaluation_candidate_responses" ("status");
create index if not exists "ix_evaluation_candidate_responses_archived_at" on "evaluation_candidate_responses" ("archived_at");
create index if not exists "ix_evaluation_score_batches_import_batch_id" on "evaluation_score_batches" ("import_batch_id");
create index if not exists "ix_evaluation_score_batches_answer_key_id" on "evaluation_score_batches" ("answer_key_id");
create index if not exists "ix_evaluation_score_batches_scored_by" on "evaluation_score_batches" ("scored_by");
create index if not exists "ix_evaluation_score_batches_approved_by" on "evaluation_score_batches" ("approved_by");
create index if not exists "ix_evaluation_score_batches_created_by" on "evaluation_score_batches" ("created_by");
create index if not exists "ix_evaluation_score_batches_status" on "evaluation_score_batches" ("status");
create index if not exists "ix_evaluation_score_batches_archived_at" on "evaluation_score_batches" ("archived_at");
create index if not exists "ix_evaluation_candidate_scores_score_batch_id" on "evaluation_candidate_scores" ("score_batch_id");
create index if not exists "ix_evaluation_candidate_scores_school_id" on "evaluation_candidate_scores" ("school_id");
create index if not exists "ix_evaluation_candidate_scores_created_by" on "evaluation_candidate_scores" ("created_by");
create index if not exists "ix_evaluation_candidate_scores_status" on "evaluation_candidate_scores" ("status");
create index if not exists "ix_evaluation_candidate_scores_archived_at" on "evaluation_candidate_scores" ("archived_at");
create index if not exists "ix_evaluation_exceptions_import_batch_id" on "evaluation_exceptions" ("import_batch_id");
create index if not exists "ix_evaluation_exceptions_owner_id" on "evaluation_exceptions" ("owner_id");
create index if not exists "ix_evaluation_exceptions_created_by" on "evaluation_exceptions" ("created_by");
create index if not exists "ix_evaluation_exceptions_status" on "evaluation_exceptions" ("status");
create index if not exists "ix_evaluation_exceptions_archived_at" on "evaluation_exceptions" ("archived_at");
create index if not exists "ix_evaluation_events_actor_id" on "evaluation_events" ("actor_id");
create index if not exists "ix_evaluation_events_created_by" on "evaluation_events" ("created_by");
create index if not exists "ix_evaluation_events_status" on "evaluation_events" ("status");
create index if not exists "ix_evaluation_events_archived_at" on "evaluation_events" ("archived_at");
create index if not exists "ix_exam_material_templates_created_by" on "exam_material_templates" ("created_by");
create index if not exists "ix_exam_material_templates_approved_by" on "exam_material_templates" ("approved_by");
create index if not exists "ix_exam_material_templates_status" on "exam_material_templates" ("status");
create index if not exists "ix_exam_material_templates_archived_at" on "exam_material_templates" ("archived_at");
create index if not exists "ix_exam_material_packages_school_id" on "exam_material_packages" ("school_id");
create index if not exists "ix_exam_material_packages_exam_cycle_id" on "exam_material_packages" ("exam_cycle_id");
create index if not exists "ix_exam_material_packages_exam_slot_id" on "exam_material_packages" ("exam_slot_id");
create index if not exists "ix_exam_material_packages_slot_assignment_id" on "exam_material_packages" ("slot_assignment_id");
create index if not exists "ix_exam_material_packages_roster_batch_id" on "exam_material_packages" ("roster_batch_id");
create index if not exists "ix_exam_material_packages_generated_by" on "exam_material_packages" ("generated_by");
create index if not exists "ix_exam_material_packages_approved_by" on "exam_material_packages" ("approved_by");
create index if not exists "ix_exam_material_packages_released_by" on "exam_material_packages" ("released_by");
create index if not exists "ix_exam_material_packages_created_by" on "exam_material_packages" ("created_by");
create index if not exists "ix_exam_material_packages_status" on "exam_material_packages" ("status");
create index if not exists "ix_exam_material_packages_archived_at" on "exam_material_packages" ("archived_at");
create index if not exists "ix_exam_material_files_material_package_id" on "exam_material_files" ("material_package_id");
create index if not exists "ix_exam_material_files_created_by" on "exam_material_files" ("created_by");
create index if not exists "ix_exam_material_files_status" on "exam_material_files" ("status");
create index if not exists "ix_exam_material_files_archived_at" on "exam_material_files" ("archived_at");
create index if not exists "ix_exam_material_approvals_material_package_id" on "exam_material_approvals" ("material_package_id");
create index if not exists "ix_exam_material_approvals_requested_by" on "exam_material_approvals" ("requested_by");
create index if not exists "ix_exam_material_approvals_approved_by" on "exam_material_approvals" ("approved_by");
create index if not exists "ix_exam_material_approvals_created_by" on "exam_material_approvals" ("created_by");
create index if not exists "ix_exam_material_approvals_status" on "exam_material_approvals" ("status");
create index if not exists "ix_exam_material_approvals_archived_at" on "exam_material_approvals" ("archived_at");
create index if not exists "ix_exam_material_download_events_material_package_id" on "exam_material_download_events" ("material_package_id");
create index if not exists "ix_exam_material_download_events_material_file_id" on "exam_material_download_events" ("material_file_id");
create index if not exists "ix_exam_material_download_events_school_id" on "exam_material_download_events" ("school_id");
create index if not exists "ix_exam_material_download_events_actor_id" on "exam_material_download_events" ("actor_id");
create index if not exists "ix_exam_material_download_events_created_by" on "exam_material_download_events" ("created_by");
create index if not exists "ix_exam_material_download_events_status" on "exam_material_download_events" ("status");
create index if not exists "ix_exam_material_download_events_archived_at" on "exam_material_download_events" ("archived_at");
create index if not exists "ix_exam_material_events_school_id" on "exam_material_events" ("school_id");
create index if not exists "ix_exam_material_events_actor_id" on "exam_material_events" ("actor_id");
create index if not exists "ix_exam_material_events_created_by" on "exam_material_events" ("created_by");
create index if not exists "ix_exam_material_events_status" on "exam_material_events" ("status");
create index if not exists "ix_exam_material_events_archived_at" on "exam_material_events" ("archived_at");
create index if not exists "ix_exam_materials_participation_id" on "exam_materials" ("participation_id");
create index if not exists "ix_exam_materials_olympiad_id" on "exam_materials" ("olympiad_id");
create index if not exists "ix_exam_materials_exam_slot_id" on "exam_materials" ("exam_slot_id");
create index if not exists "ix_exam_materials_created_by" on "exam_materials" ("created_by");
create index if not exists "ix_exam_materials_status" on "exam_materials" ("status");
create index if not exists "ix_exam_materials_archived_at" on "exam_materials" ("archived_at");
create index if not exists "ix_exam_material_downloads_exam_material_id" on "exam_material_downloads" ("exam_material_id");
create index if not exists "ix_exam_material_downloads_school_id" on "exam_material_downloads" ("school_id");
create index if not exists "ix_exam_material_downloads_participation_id" on "exam_material_downloads" ("participation_id");
create index if not exists "ix_exam_material_downloads_downloaded_by" on "exam_material_downloads" ("downloaded_by");
create index if not exists "ix_exam_material_downloads_created_by" on "exam_material_downloads" ("created_by");
create index if not exists "ix_exam_material_downloads_status" on "exam_material_downloads" ("status");
create index if not exists "ix_exam_material_downloads_archived_at" on "exam_material_downloads" ("archived_at");
create index if not exists "ix_exam_cycles_created_by" on "exam_cycles" ("created_by");
create index if not exists "ix_exam_cycles_approved_by" on "exam_cycles" ("approved_by");
create index if not exists "ix_exam_cycles_status" on "exam_cycles" ("status");
create index if not exists "ix_exam_cycles_archived_at" on "exam_cycles" ("archived_at");
create index if not exists "ix_exam_slots_created_by" on "exam_slots" ("created_by");
create index if not exists "ix_exam_slots_status" on "exam_slots" ("status");
create index if not exists "ix_exam_slots_archived_at" on "exam_slots" ("archived_at");
create index if not exists "ix_school_exam_slot_assignments_school_id" on "school_exam_slot_assignments" ("school_id");
create index if not exists "ix_school_exam_slot_assignments_exam_cycle_id" on "school_exam_slot_assignments" ("exam_cycle_id");
create index if not exists "ix_school_exam_slot_assignments_exam_slot_id" on "school_exam_slot_assignments" ("exam_slot_id");
create index if not exists "ix_school_exam_slot_assignments_roster_batch_id" on "school_exam_slot_assignments" ("roster_batch_id");
create index if not exists "ix_school_exam_slot_assignments_finance_invoice_id" on "school_exam_slot_assignments" ("finance_invoice_id");
create index if not exists "ix_school_exam_slot_assignments_assigned_by" on "school_exam_slot_assignments" ("assigned_by");
create index if not exists "ix_school_exam_slot_assignments_confirmed_by" on "school_exam_slot_assignments" ("confirmed_by");
create index if not exists "ix_school_exam_slot_assignments_created_by" on "school_exam_slot_assignments" ("created_by");
create index if not exists "ix_school_exam_slot_assignments_status" on "school_exam_slot_assignments" ("status");
create index if not exists "ix_school_exam_slot_assignments_archived_at" on "school_exam_slot_assignments" ("archived_at");
create index if not exists "ix_exam_slot_reschedule_requests_assignment_id" on "exam_slot_reschedule_requests" ("assignment_id");
create index if not exists "ix_exam_slot_reschedule_requests_from_slot_id" on "exam_slot_reschedule_requests" ("from_slot_id");
create index if not exists "ix_exam_slot_reschedule_requests_to_slot_id" on "exam_slot_reschedule_requests" ("to_slot_id");
create index if not exists "ix_exam_slot_reschedule_requests_requested_by" on "exam_slot_reschedule_requests" ("requested_by");
create index if not exists "ix_exam_slot_reschedule_requests_approved_by" on "exam_slot_reschedule_requests" ("approved_by");
create index if not exists "ix_exam_slot_reschedule_requests_created_by" on "exam_slot_reschedule_requests" ("created_by");
create index if not exists "ix_exam_slot_reschedule_requests_status" on "exam_slot_reschedule_requests" ("status");
create index if not exists "ix_exam_slot_reschedule_requests_archived_at" on "exam_slot_reschedule_requests" ("archived_at");
create index if not exists "ix_exam_slot_conflicts_assignment_id" on "exam_slot_conflicts" ("assignment_id");
create index if not exists "ix_exam_slot_conflicts_exam_slot_id" on "exam_slot_conflicts" ("exam_slot_id");
create index if not exists "ix_exam_slot_conflicts_created_by" on "exam_slot_conflicts" ("created_by");
create index if not exists "ix_exam_slot_conflicts_status" on "exam_slot_conflicts" ("status");
create index if not exists "ix_exam_slot_conflicts_archived_at" on "exam_slot_conflicts" ("archived_at");
create index if not exists "ix_exam_slot_events_school_id" on "exam_slot_events" ("school_id");
create index if not exists "ix_exam_slot_events_actor_id" on "exam_slot_events" ("actor_id");
create index if not exists "ix_exam_slot_events_created_by" on "exam_slot_events" ("created_by");
create index if not exists "ix_exam_slot_events_status" on "exam_slot_events" ("status");
create index if not exists "ix_exam_slot_events_archived_at" on "exam_slot_events" ("archived_at");
create index if not exists "ix_exam_slot_bookings_school_id" on "exam_slot_bookings" ("school_id");
create index if not exists "ix_exam_slot_bookings_participation_id" on "exam_slot_bookings" ("participation_id");
create index if not exists "ix_exam_slot_bookings_exam_slot_id" on "exam_slot_bookings" ("exam_slot_id");
create index if not exists "ix_exam_slot_bookings_booked_by" on "exam_slot_bookings" ("booked_by");
create index if not exists "ix_exam_slot_bookings_cancelled_by" on "exam_slot_bookings" ("cancelled_by");
create index if not exists "ix_exam_slot_bookings_created_by" on "exam_slot_bookings" ("created_by");
create index if not exists "ix_exam_slot_bookings_status" on "exam_slot_bookings" ("status");
create index if not exists "ix_exam_slot_bookings_archived_at" on "exam_slot_bookings" ("archived_at");
create index if not exists "ix_finance_invoices_school_id" on "finance_invoices" ("school_id");
create index if not exists "ix_finance_invoices_participation_id" on "finance_invoices" ("participation_id");
create index if not exists "ix_finance_invoices_roster_batch_id" on "finance_invoices" ("roster_batch_id");
create index if not exists "ix_finance_invoices_created_by" on "finance_invoices" ("created_by");
create index if not exists "ix_finance_invoices_approved_by" on "finance_invoices" ("approved_by");
create index if not exists "ix_finance_invoices_status" on "finance_invoices" ("status");
create index if not exists "ix_finance_invoices_archived_at" on "finance_invoices" ("archived_at");
create index if not exists "ix_finance_payment_links_invoice_id" on "finance_payment_links" ("invoice_id");
create index if not exists "ix_finance_payment_links_school_id" on "finance_payment_links" ("school_id");
create index if not exists "ix_finance_payment_links_created_by" on "finance_payment_links" ("created_by");
create index if not exists "ix_finance_payment_links_status" on "finance_payment_links" ("status");
create index if not exists "ix_finance_payment_links_archived_at" on "finance_payment_links" ("archived_at");
create index if not exists "ix_finance_payments_invoice_id" on "finance_payments" ("invoice_id");
create index if not exists "ix_finance_payments_school_id" on "finance_payments" ("school_id");
create index if not exists "ix_finance_payments_payment_link_id" on "finance_payments" ("payment_link_id");
create index if not exists "ix_finance_payments_confirmed_by" on "finance_payments" ("confirmed_by");
create index if not exists "ix_finance_payments_created_by" on "finance_payments" ("created_by");
create index if not exists "ix_finance_payments_status" on "finance_payments" ("status");
create index if not exists "ix_finance_payments_archived_at" on "finance_payments" ("archived_at");
create index if not exists "ix_finance_adjustments_invoice_id" on "finance_adjustments" ("invoice_id");
create index if not exists "ix_finance_adjustments_school_id" on "finance_adjustments" ("school_id");
create index if not exists "ix_finance_adjustments_requested_by" on "finance_adjustments" ("requested_by");
create index if not exists "ix_finance_adjustments_approved_by" on "finance_adjustments" ("approved_by");
create index if not exists "ix_finance_adjustments_created_by" on "finance_adjustments" ("created_by");
create index if not exists "ix_finance_adjustments_status" on "finance_adjustments" ("status");
create index if not exists "ix_finance_adjustments_archived_at" on "finance_adjustments" ("archived_at");
create index if not exists "ix_finance_reconciliation_batches_closed_by" on "finance_reconciliation_batches" ("closed_by");
create index if not exists "ix_finance_reconciliation_batches_created_by" on "finance_reconciliation_batches" ("created_by");
create index if not exists "ix_finance_reconciliation_batches_status" on "finance_reconciliation_batches" ("status");
create index if not exists "ix_finance_reconciliation_batches_archived_at" on "finance_reconciliation_batches" ("archived_at");
create index if not exists "ix_finance_events_school_id" on "finance_events" ("school_id");
create index if not exists "ix_finance_events_actor_id" on "finance_events" ("actor_id");
create index if not exists "ix_finance_events_created_by" on "finance_events" ("created_by");
create index if not exists "ix_finance_events_status" on "finance_events" ("status");
create index if not exists "ix_finance_events_archived_at" on "finance_events" ("archived_at");
create index if not exists "ix_notification_templates_approved_by" on "notification_templates" ("approved_by");
create index if not exists "ix_notification_templates_created_by" on "notification_templates" ("created_by");
create index if not exists "ix_notification_templates_status" on "notification_templates" ("status");
create index if not exists "ix_notification_templates_archived_at" on "notification_templates" ("archived_at");
create index if not exists "ix_notification_triggers_template_id" on "notification_triggers" ("template_id");
create index if not exists "ix_notification_triggers_created_by" on "notification_triggers" ("created_by");
create index if not exists "ix_notification_triggers_status" on "notification_triggers" ("status");
create index if not exists "ix_notification_triggers_archived_at" on "notification_triggers" ("archived_at");
create index if not exists "ix_notification_batches_template_id" on "notification_batches" ("template_id");
create index if not exists "ix_notification_batches_created_by" on "notification_batches" ("created_by");
create index if not exists "ix_notification_batches_approved_by" on "notification_batches" ("approved_by");
create index if not exists "ix_notification_batches_status" on "notification_batches" ("status");
create index if not exists "ix_notification_batches_archived_at" on "notification_batches" ("archived_at");
create index if not exists "ix_notification_recipients_batch_id" on "notification_recipients" ("batch_id");
create index if not exists "ix_notification_recipients_school_id" on "notification_recipients" ("school_id");
create index if not exists "ix_notification_recipients_created_by" on "notification_recipients" ("created_by");
create index if not exists "ix_notification_recipients_status" on "notification_recipients" ("status");
create index if not exists "ix_notification_recipients_archived_at" on "notification_recipients" ("archived_at");
create index if not exists "ix_notification_messages_batch_id" on "notification_messages" ("batch_id");
create index if not exists "ix_notification_messages_recipient_id" on "notification_messages" ("recipient_id");
create index if not exists "ix_notification_messages_template_id" on "notification_messages" ("template_id");
create index if not exists "ix_notification_messages_created_by" on "notification_messages" ("created_by");
create index if not exists "ix_notification_messages_status" on "notification_messages" ("status");
create index if not exists "ix_notification_messages_archived_at" on "notification_messages" ("archived_at");
create index if not exists "ix_notification_delivery_attempts_message_id" on "notification_delivery_attempts" ("message_id");
create index if not exists "ix_notification_delivery_attempts_created_by" on "notification_delivery_attempts" ("created_by");
create index if not exists "ix_notification_delivery_attempts_status" on "notification_delivery_attempts" ("status");
create index if not exists "ix_notification_delivery_attempts_archived_at" on "notification_delivery_attempts" ("archived_at");
create index if not exists "ix_notification_preferences_created_by" on "notification_preferences" ("created_by");
create index if not exists "ix_notification_preferences_status" on "notification_preferences" ("status");
create index if not exists "ix_notification_preferences_archived_at" on "notification_preferences" ("archived_at");
create index if not exists "ix_notification_events_school_id" on "notification_events" ("school_id");
create index if not exists "ix_notification_events_participation_id" on "notification_events" ("participation_id");
create index if not exists "ix_notification_events_created_by" on "notification_events" ("created_by");
create index if not exists "ix_notification_events_status" on "notification_events" ("status");
create index if not exists "ix_notification_events_archived_at" on "notification_events" ("archived_at");
create index if not exists "ix_notification_deliveries_event_id" on "notification_deliveries" ("event_id");
create index if not exists "ix_notification_deliveries_template_id" on "notification_deliveries" ("template_id");
create index if not exists "ix_notification_deliveries_recipient_user_id" on "notification_deliveries" ("recipient_user_id");
create index if not exists "ix_notification_deliveries_school_id" on "notification_deliveries" ("school_id");
create index if not exists "ix_notification_deliveries_created_by" on "notification_deliveries" ("created_by");
create index if not exists "ix_notification_deliveries_status" on "notification_deliveries" ("status");
create index if not exists "ix_notification_deliveries_archived_at" on "notification_deliveries" ("archived_at");
create index if not exists "ix_answer_keys_olympiad_id" on "answer_keys" ("olympiad_id");
create index if not exists "ix_answer_keys_approved_by" on "answer_keys" ("approved_by");
create index if not exists "ix_answer_keys_created_by" on "answer_keys" ("created_by");
create index if not exists "ix_answer_keys_status" on "answer_keys" ("status");
create index if not exists "ix_answer_keys_archived_at" on "answer_keys" ("archived_at");
create index if not exists "ix_omr_imports_participation_id" on "omr_imports" ("participation_id");
create index if not exists "ix_omr_imports_courier_batch_id" on "omr_imports" ("courier_batch_id");
create index if not exists "ix_omr_imports_uploaded_by" on "omr_imports" ("uploaded_by");
create index if not exists "ix_omr_imports_approved_by" on "omr_imports" ("approved_by");
create index if not exists "ix_omr_imports_created_by" on "omr_imports" ("created_by");
create index if not exists "ix_omr_imports_status" on "omr_imports" ("status");
create index if not exists "ix_omr_imports_archived_at" on "omr_imports" ("archived_at");
create index if not exists "ix_omr_candidate_scores_omr_import_id" on "omr_candidate_scores" ("omr_import_id");
create index if not exists "ix_omr_candidate_scores_student_id" on "omr_candidate_scores" ("student_id");
create index if not exists "ix_omr_candidate_scores_school_id" on "omr_candidate_scores" ("school_id");
create index if not exists "ix_omr_candidate_scores_participation_id" on "omr_candidate_scores" ("participation_id");
create index if not exists "ix_omr_candidate_scores_created_by" on "omr_candidate_scores" ("created_by");
create index if not exists "ix_omr_candidate_scores_status" on "omr_candidate_scores" ("status");
create index if not exists "ix_omr_candidate_scores_archived_at" on "omr_candidate_scores" ("archived_at");
create index if not exists "ix_payments_participation_id" on "payments" ("participation_id");
create index if not exists "ix_payments_school_id" on "payments" ("school_id");
create index if not exists "ix_payments_created_by" on "payments" ("created_by");
create index if not exists "ix_payments_status" on "payments" ("status");
create index if not exists "ix_payments_archived_at" on "payments" ("archived_at");
create index if not exists "ix_payment_events_payment_id" on "payment_events" ("payment_id");
create index if not exists "ix_payment_events_actor_id" on "payment_events" ("actor_id");
create index if not exists "ix_payment_events_created_by" on "payment_events" ("created_by");
create index if not exists "ix_payment_events_status" on "payment_events" ("status");
create index if not exists "ix_payment_events_archived_at" on "payment_events" ("archived_at");
create index if not exists "ix_report_definitions_created_by" on "report_definitions" ("created_by");
create index if not exists "ix_report_definitions_status" on "report_definitions" ("status");
create index if not exists "ix_report_definitions_archived_at" on "report_definitions" ("archived_at");
create index if not exists "ix_export_requests_report_definition_id" on "export_requests" ("report_definition_id");
create index if not exists "ix_export_requests_requested_by" on "export_requests" ("requested_by");
create index if not exists "ix_export_requests_approved_by" on "export_requests" ("approved_by");
create index if not exists "ix_export_requests_created_by" on "export_requests" ("created_by");
create index if not exists "ix_export_requests_status" on "export_requests" ("status");
create index if not exists "ix_export_requests_archived_at" on "export_requests" ("archived_at");
create index if not exists "ix_report_snapshots_export_request_id" on "report_snapshots" ("export_request_id");
create index if not exists "ix_report_snapshots_report_definition_id" on "report_snapshots" ("report_definition_id");
create index if not exists "ix_report_snapshots_created_by" on "report_snapshots" ("created_by");
create index if not exists "ix_report_snapshots_status" on "report_snapshots" ("status");
create index if not exists "ix_report_snapshots_archived_at" on "report_snapshots" ("archived_at");
create index if not exists "ix_export_files_export_request_id" on "export_files" ("export_request_id");
create index if not exists "ix_export_files_snapshot_id" on "export_files" ("snapshot_id");
create index if not exists "ix_export_files_created_by" on "export_files" ("created_by");
create index if not exists "ix_export_files_status" on "export_files" ("status");
create index if not exists "ix_export_files_archived_at" on "export_files" ("archived_at");
create index if not exists "ix_export_download_events_export_file_id" on "export_download_events" ("export_file_id");
create index if not exists "ix_export_download_events_downloaded_by" on "export_download_events" ("downloaded_by");
create index if not exists "ix_export_download_events_school_id" on "export_download_events" ("school_id");
create index if not exists "ix_export_download_events_created_by" on "export_download_events" ("created_by");
create index if not exists "ix_export_download_events_status" on "export_download_events" ("status");
create index if not exists "ix_export_download_events_archived_at" on "export_download_events" ("archived_at");
create index if not exists "ix_report_events_actor_id" on "report_events" ("actor_id");
create index if not exists "ix_report_events_created_by" on "report_events" ("created_by");
create index if not exists "ix_report_events_status" on "report_events" ("status");
create index if not exists "ix_report_events_archived_at" on "report_events" ("archived_at");
create index if not exists "ix_results_student_id" on "results" ("student_id");
create index if not exists "ix_results_participation_id" on "results" ("participation_id");
create index if not exists "ix_results_school_id" on "results" ("school_id");
create index if not exists "ix_results_created_by" on "results" ("created_by");
create index if not exists "ix_results_status" on "results" ("status");
create index if not exists "ix_results_archived_at" on "results" ("archived_at");
create index if not exists "ix_result_publications_olympiad_id" on "result_publications" ("olympiad_id");
create index if not exists "ix_result_publications_approved_by" on "result_publications" ("approved_by");
create index if not exists "ix_result_publications_created_by" on "result_publications" ("created_by");
create index if not exists "ix_result_publications_status" on "result_publications" ("status");
create index if not exists "ix_result_publications_archived_at" on "result_publications" ("archived_at");
create index if not exists "ix_result_corrections_result_id" on "result_corrections" ("result_id");
create index if not exists "ix_result_corrections_approved_by" on "result_corrections" ("approved_by");
create index if not exists "ix_result_corrections_created_by" on "result_corrections" ("created_by");
create index if not exists "ix_result_corrections_status" on "result_corrections" ("status");
create index if not exists "ix_result_corrections_archived_at" on "result_corrections" ("archived_at");
create index if not exists "ix_result_batches_exam_cycle_id" on "result_batches" ("exam_cycle_id");
create index if not exists "ix_result_batches_evaluation_score_batch_id" on "result_batches" ("evaluation_score_batch_id");
create index if not exists "ix_result_batches_generated_by" on "result_batches" ("generated_by");
create index if not exists "ix_result_batches_approved_by" on "result_batches" ("approved_by");
create index if not exists "ix_result_batches_published_by" on "result_batches" ("published_by");
create index if not exists "ix_result_batches_created_by" on "result_batches" ("created_by");
create index if not exists "ix_result_batches_status" on "result_batches" ("status");
create index if not exists "ix_result_batches_archived_at" on "result_batches" ("archived_at");
create index if not exists "ix_candidate_results_result_batch_id" on "candidate_results" ("result_batch_id");
create index if not exists "ix_candidate_results_school_id" on "candidate_results" ("school_id");
create index if not exists "ix_candidate_results_created_by" on "candidate_results" ("created_by");
create index if not exists "ix_candidate_results_status" on "candidate_results" ("status");
create index if not exists "ix_candidate_results_archived_at" on "candidate_results" ("archived_at");
create index if not exists "ix_result_publication_windows_result_batch_id" on "result_publication_windows" ("result_batch_id");
create index if not exists "ix_result_publication_windows_created_by" on "result_publication_windows" ("created_by");
create index if not exists "ix_result_publication_windows_approved_by" on "result_publication_windows" ("approved_by");
create index if not exists "ix_result_publication_windows_status" on "result_publication_windows" ("status");
create index if not exists "ix_result_publication_windows_archived_at" on "result_publication_windows" ("archived_at");
create index if not exists "ix_result_rank_snapshots_result_batch_id" on "result_rank_snapshots" ("result_batch_id");
create index if not exists "ix_result_rank_snapshots_created_by" on "result_rank_snapshots" ("created_by");
create index if not exists "ix_result_rank_snapshots_status" on "result_rank_snapshots" ("status");
create index if not exists "ix_result_rank_snapshots_archived_at" on "result_rank_snapshots" ("archived_at");
create index if not exists "ix_result_events_actor_id" on "result_events" ("actor_id");
create index if not exists "ix_result_events_created_by" on "result_events" ("created_by");
create index if not exists "ix_result_events_status" on "result_events" ("status");
create index if not exists "ix_result_events_archived_at" on "result_events" ("archived_at");
create index if not exists "ix_portal_roles_directus_role_id" on "portal_roles" ("directus_role_id");
create index if not exists "ix_portal_roles_created_by" on "portal_roles" ("created_by");
create index if not exists "ix_portal_roles_status" on "portal_roles" ("status");
create index if not exists "ix_portal_roles_archived_at" on "portal_roles" ("archived_at");
create index if not exists "ix_portal_permission_rules_role_id" on "portal_permission_rules" ("role_id");
create index if not exists "ix_portal_permission_rules_created_by" on "portal_permission_rules" ("created_by");
create index if not exists "ix_portal_permission_rules_status" on "portal_permission_rules" ("status");
create index if not exists "ix_portal_permission_rules_archived_at" on "portal_permission_rules" ("archived_at");
create index if not exists "ix_role_change_requests_target_role_id" on "role_change_requests" ("target_role_id");
create index if not exists "ix_role_change_requests_requested_by" on "role_change_requests" ("requested_by");
create index if not exists "ix_role_change_requests_approved_by" on "role_change_requests" ("approved_by");
create index if not exists "ix_role_change_requests_security_reviewed_by" on "role_change_requests" ("security_reviewed_by");
create index if not exists "ix_role_change_requests_created_by" on "role_change_requests" ("created_by");
create index if not exists "ix_role_change_requests_status" on "role_change_requests" ("status");
create index if not exists "ix_role_change_requests_archived_at" on "role_change_requests" ("archived_at");
create index if not exists "ix_approval_policies_created_by" on "approval_policies" ("created_by");
create index if not exists "ix_approval_policies_status" on "approval_policies" ("status");
create index if not exists "ix_approval_policies_archived_at" on "approval_policies" ("archived_at");
create index if not exists "ix_school_leads_lead_owner_id" on "school_leads" ("lead_owner_id");
create index if not exists "ix_school_leads_duplicate_of_lead_id" on "school_leads" ("duplicate_of_lead_id");
create index if not exists "ix_school_leads_converted_school_id" on "school_leads" ("converted_school_id");
create index if not exists "ix_school_leads_created_by" on "school_leads" ("created_by");
create index if not exists "ix_school_leads_updated_by" on "school_leads" ("updated_by");
create index if not exists "ix_school_leads_status" on "school_leads" ("status");
create index if not exists "ix_school_leads_archived_at" on "school_leads" ("archived_at");
create index if not exists "ix_school_lead_interactions_school_lead_id" on "school_lead_interactions" ("school_lead_id");
create index if not exists "ix_school_lead_interactions_staff_owner_id" on "school_lead_interactions" ("staff_owner_id");
create index if not exists "ix_school_lead_interactions_created_by" on "school_lead_interactions" ("created_by");
create index if not exists "ix_school_lead_interactions_status" on "school_lead_interactions" ("status");
create index if not exists "ix_school_lead_interactions_archived_at" on "school_lead_interactions" ("archived_at");
create index if not exists "ix_school_lead_import_batches_uploaded_by" on "school_lead_import_batches" ("uploaded_by");
create index if not exists "ix_school_lead_import_batches_default_lead_owner_id" on "school_lead_import_batches" ("default_lead_owner_id");
create index if not exists "ix_school_lead_import_batches_created_by" on "school_lead_import_batches" ("created_by");
create index if not exists "ix_school_lead_import_batches_status" on "school_lead_import_batches" ("status");
create index if not exists "ix_school_lead_import_batches_archived_at" on "school_lead_import_batches" ("archived_at");
create index if not exists "ix_school_lead_stage_events_school_lead_id" on "school_lead_stage_events" ("school_lead_id");
create index if not exists "ix_school_lead_stage_events_actor_id" on "school_lead_stage_events" ("actor_id");
create index if not exists "ix_school_lead_stage_events_created_by" on "school_lead_stage_events" ("created_by");
create index if not exists "ix_school_lead_stage_events_status" on "school_lead_stage_events" ("status");
create index if not exists "ix_school_lead_stage_events_archived_at" on "school_lead_stage_events" ("archived_at");
create index if not exists "ix_school_onboarding_cases_source_lead_id" on "school_onboarding_cases" ("source_lead_id");
create index if not exists "ix_school_onboarding_cases_school_id" on "school_onboarding_cases" ("school_id");
create index if not exists "ix_school_onboarding_cases_assigned_reviewer_id" on "school_onboarding_cases" ("assigned_reviewer_id");
create index if not exists "ix_school_onboarding_cases_assigned_approver_id" on "school_onboarding_cases" ("assigned_approver_id");
create index if not exists "ix_school_onboarding_cases_approved_by" on "school_onboarding_cases" ("approved_by");
create index if not exists "ix_school_onboarding_cases_created_by" on "school_onboarding_cases" ("created_by");
create index if not exists "ix_school_onboarding_cases_status" on "school_onboarding_cases" ("status");
create index if not exists "ix_school_onboarding_cases_archived_at" on "school_onboarding_cases" ("archived_at");
create index if not exists "ix_school_onboarding_documents_onboarding_case_id" on "school_onboarding_documents" ("onboarding_case_id");
create index if not exists "ix_school_onboarding_documents_uploaded_by" on "school_onboarding_documents" ("uploaded_by");
create index if not exists "ix_school_onboarding_documents_reviewed_by" on "school_onboarding_documents" ("reviewed_by");
create index if not exists "ix_school_onboarding_documents_created_by" on "school_onboarding_documents" ("created_by");
create index if not exists "ix_school_onboarding_documents_status" on "school_onboarding_documents" ("status");
create index if not exists "ix_school_onboarding_documents_archived_at" on "school_onboarding_documents" ("archived_at");
create index if not exists "ix_school_onboarding_events_onboarding_case_id" on "school_onboarding_events" ("onboarding_case_id");
create index if not exists "ix_school_onboarding_events_actor_id" on "school_onboarding_events" ("actor_id");
create index if not exists "ix_school_onboarding_events_created_by" on "school_onboarding_events" ("created_by");
create index if not exists "ix_school_onboarding_events_status" on "school_onboarding_events" ("status");
create index if not exists "ix_school_onboarding_events_archived_at" on "school_onboarding_events" ("archived_at");
create index if not exists "ix_school_status_controls_school_id" on "school_status_controls" ("school_id");
create index if not exists "ix_school_status_controls_onboarding_case_id" on "school_status_controls" ("onboarding_case_id");
create index if not exists "ix_school_status_controls_applied_by" on "school_status_controls" ("applied_by");
create index if not exists "ix_school_status_controls_released_by" on "school_status_controls" ("released_by");
create index if not exists "ix_school_status_controls_created_by" on "school_status_controls" ("created_by");
create index if not exists "ix_school_status_controls_status" on "school_status_controls" ("status");
create index if not exists "ix_school_status_controls_archived_at" on "school_status_controls" ("archived_at");
create index if not exists "ix_schools_created_by" on "schools" ("created_by");
create index if not exists "ix_schools_status" on "schools" ("status");
create index if not exists "ix_schools_archived_at" on "schools" ("archived_at");
create index if not exists "ix_school_users_directus_user_id" on "school_users" ("directus_user_id");
create index if not exists "ix_school_users_school_id" on "school_users" ("school_id");
create index if not exists "ix_school_users_created_by" on "school_users" ("created_by");
create index if not exists "ix_school_users_status" on "school_users" ("status");
create index if not exists "ix_school_users_archived_at" on "school_users" ("archived_at");
create index if not exists "ix_participations_school_id" on "participations" ("school_id");
create index if not exists "ix_participations_olympiad_id" on "participations" ("olympiad_id");
create index if not exists "ix_participations_exam_slot_id" on "participations" ("exam_slot_id");
create index if not exists "ix_participations_created_by" on "participations" ("created_by");
create index if not exists "ix_participations_status" on "participations" ("status");
create index if not exists "ix_participations_archived_at" on "participations" ("archived_at");
create index if not exists "ix_security_audit_events_actor_id" on "security_audit_events" ("actor_id");
create index if not exists "ix_security_audit_events_created_by" on "security_audit_events" ("created_by");
create index if not exists "ix_security_audit_events_status" on "security_audit_events" ("status");
create index if not exists "ix_security_audit_events_archived_at" on "security_audit_events" ("archived_at");
create index if not exists "ix_security_alerts_linked_incident_id" on "security_alerts" ("linked_incident_id");
create index if not exists "ix_security_alerts_created_by" on "security_alerts" ("created_by");
create index if not exists "ix_security_alerts_status" on "security_alerts" ("status");
create index if not exists "ix_security_alerts_archived_at" on "security_alerts" ("archived_at");
create index if not exists "ix_staff_login_events_staff_user_id" on "staff_login_events" ("staff_user_id");
create index if not exists "ix_staff_login_events_created_by" on "staff_login_events" ("created_by");
create index if not exists "ix_staff_login_events_status" on "staff_login_events" ("status");
create index if not exists "ix_staff_login_events_archived_at" on "staff_login_events" ("archived_at");
create index if not exists "ix_permission_drift_findings_staff_user_id" on "permission_drift_findings" ("staff_user_id");
create index if not exists "ix_permission_drift_findings_created_by" on "permission_drift_findings" ("created_by");
create index if not exists "ix_permission_drift_findings_status" on "permission_drift_findings" ("status");
create index if not exists "ix_permission_drift_findings_archived_at" on "permission_drift_findings" ("archived_at");
create index if not exists "ix_forensics_cases_linked_incident_id" on "forensics_cases" ("linked_incident_id");
create index if not exists "ix_forensics_cases_case_owner_id" on "forensics_cases" ("case_owner_id");
create index if not exists "ix_forensics_cases_created_by" on "forensics_cases" ("created_by");
create index if not exists "ix_forensics_cases_status" on "forensics_cases" ("status");
create index if not exists "ix_forensics_cases_archived_at" on "forensics_cases" ("archived_at");
create index if not exists "ix_security_events_actor_id" on "security_events" ("actor_id");
create index if not exists "ix_security_events_created_by" on "security_events" ("created_by");
create index if not exists "ix_security_events_status" on "security_events" ("status");
create index if not exists "ix_security_events_archived_at" on "security_events" ("archived_at");
create index if not exists "ix_staff_profiles_user_id" on "staff_profiles" ("user_id");
create index if not exists "ix_staff_profiles_reporting_manager_id" on "staff_profiles" ("reporting_manager_id");
create index if not exists "ix_staff_profiles_invited_by" on "staff_profiles" ("invited_by");
create index if not exists "ix_staff_profiles_disabled_by" on "staff_profiles" ("disabled_by");
create index if not exists "ix_staff_profiles_created_by" on "staff_profiles" ("created_by");
create index if not exists "ix_staff_profiles_status" on "staff_profiles" ("status");
create index if not exists "ix_staff_profiles_archived_at" on "staff_profiles" ("archived_at");
create index if not exists "ix_staff_invitations_invited_by" on "staff_invitations" ("invited_by");
create index if not exists "ix_staff_invitations_created_by" on "staff_invitations" ("created_by");
create index if not exists "ix_staff_invitations_status" on "staff_invitations" ("status");
create index if not exists "ix_staff_invitations_archived_at" on "staff_invitations" ("archived_at");
create index if not exists "ix_staff_assignment_scopes_staff_profile_id" on "staff_assignment_scopes" ("staff_profile_id");
create index if not exists "ix_staff_assignment_scopes_assigned_by" on "staff_assignment_scopes" ("assigned_by");
create index if not exists "ix_staff_assignment_scopes_created_by" on "staff_assignment_scopes" ("created_by");
create index if not exists "ix_staff_assignment_scopes_status" on "staff_assignment_scopes" ("status");
create index if not exists "ix_staff_assignment_scopes_archived_at" on "staff_assignment_scopes" ("archived_at");
create index if not exists "ix_staff_access_events_staff_profile_id" on "staff_access_events" ("staff_profile_id");
create index if not exists "ix_staff_access_events_user_id" on "staff_access_events" ("user_id");
create index if not exists "ix_staff_access_events_created_by" on "staff_access_events" ("created_by");
create index if not exists "ix_staff_access_events_status" on "staff_access_events" ("status");
create index if not exists "ix_staff_access_events_archived_at" on "staff_access_events" ("archived_at");
create index if not exists "ix_student_roster_batches_school_id" on "student_roster_batches" ("school_id");
create index if not exists "ix_student_roster_batches_participation_id" on "student_roster_batches" ("participation_id");
create index if not exists "ix_student_roster_batches_uploaded_by" on "student_roster_batches" ("uploaded_by");
create index if not exists "ix_student_roster_batches_locked_by" on "student_roster_batches" ("locked_by");
create index if not exists "ix_student_roster_batches_superseded_by_batch_id" on "student_roster_batches" ("superseded_by_batch_id");
create index if not exists "ix_student_roster_batches_created_by" on "student_roster_batches" ("created_by");
create index if not exists "ix_student_roster_batches_status" on "student_roster_batches" ("status");
create index if not exists "ix_student_roster_batches_archived_at" on "student_roster_batches" ("archived_at");
create index if not exists "ix_student_roster_corrections_school_id" on "student_roster_corrections" ("school_id");
create index if not exists "ix_student_roster_corrections_roster_batch_id" on "student_roster_corrections" ("roster_batch_id");
create index if not exists "ix_student_roster_corrections_student_id" on "student_roster_corrections" ("student_id");
create index if not exists "ix_student_roster_corrections_requested_by" on "student_roster_corrections" ("requested_by");
create index if not exists "ix_student_roster_corrections_approved_by" on "student_roster_corrections" ("approved_by");
create index if not exists "ix_student_roster_corrections_created_by" on "student_roster_corrections" ("created_by");
create index if not exists "ix_student_roster_corrections_status" on "student_roster_corrections" ("status");
create index if not exists "ix_student_roster_corrections_archived_at" on "student_roster_corrections" ("archived_at");
create index if not exists "ix_candidate_id_events_school_id" on "candidate_id_events" ("school_id");
create index if not exists "ix_candidate_id_events_student_id" on "candidate_id_events" ("student_id");
create index if not exists "ix_candidate_id_events_roster_batch_id" on "candidate_id_events" ("roster_batch_id");
create index if not exists "ix_candidate_id_events_actor_id" on "candidate_id_events" ("actor_id");
create index if not exists "ix_candidate_id_events_created_by" on "candidate_id_events" ("created_by");
create index if not exists "ix_candidate_id_events_status" on "candidate_id_events" ("status");
create index if not exists "ix_candidate_id_events_archived_at" on "candidate_id_events" ("archived_at");
create index if not exists "ix_student_roster_events_roster_batch_id" on "student_roster_events" ("roster_batch_id");
create index if not exists "ix_student_roster_events_actor_id" on "student_roster_events" ("actor_id");
create index if not exists "ix_student_roster_events_created_by" on "student_roster_events" ("created_by");
create index if not exists "ix_student_roster_events_status" on "student_roster_events" ("status");
create index if not exists "ix_student_roster_events_archived_at" on "student_roster_events" ("archived_at");
create index if not exists "ix_students_school_id" on "students" ("school_id");
create index if not exists "ix_students_participation_id" on "students" ("participation_id");
create index if not exists "ix_students_created_by" on "students" ("created_by");
create index if not exists "ix_students_status" on "students" ("status");
create index if not exists "ix_students_archived_at" on "students" ("archived_at");
create index if not exists "ix_student_uploads_school_id" on "student_uploads" ("school_id");
create index if not exists "ix_student_uploads_participation_id" on "student_uploads" ("participation_id");
create index if not exists "ix_student_uploads_uploaded_by" on "student_uploads" ("uploaded_by");
create index if not exists "ix_student_uploads_created_by" on "student_uploads" ("created_by");
create index if not exists "ix_student_uploads_status" on "student_uploads" ("status");
create index if not exists "ix_student_uploads_archived_at" on "student_uploads" ("archived_at");
create index if not exists "ix_support_ticket_categories_created_by" on "support_ticket_categories" ("created_by");
create index if not exists "ix_support_ticket_categories_status" on "support_ticket_categories" ("status");
create index if not exists "ix_support_ticket_categories_archived_at" on "support_ticket_categories" ("archived_at");
create index if not exists "ix_support_tickets_school_id" on "support_tickets" ("school_id");
create index if not exists "ix_support_tickets_category_id" on "support_tickets" ("category_id");
create index if not exists "ix_support_tickets_assigned_to" on "support_tickets" ("assigned_to");
create index if not exists "ix_support_tickets_created_by" on "support_tickets" ("created_by");
create index if not exists "ix_support_tickets_status" on "support_tickets" ("status");
create index if not exists "ix_support_tickets_archived_at" on "support_tickets" ("archived_at");
create index if not exists "ix_support_ticket_messages_ticket_id" on "support_ticket_messages" ("ticket_id");
create index if not exists "ix_support_ticket_messages_parent_message_id" on "support_ticket_messages" ("parent_message_id");
create index if not exists "ix_support_ticket_messages_author_id" on "support_ticket_messages" ("author_id");
create index if not exists "ix_support_ticket_messages_created_by" on "support_ticket_messages" ("created_by");
create index if not exists "ix_support_ticket_messages_status" on "support_ticket_messages" ("status");
create index if not exists "ix_support_ticket_messages_archived_at" on "support_ticket_messages" ("archived_at");
create index if not exists "ix_support_ticket_attachments_ticket_id" on "support_ticket_attachments" ("ticket_id");
create index if not exists "ix_support_ticket_attachments_message_id" on "support_ticket_attachments" ("message_id");
create index if not exists "ix_support_ticket_attachments_uploaded_by" on "support_ticket_attachments" ("uploaded_by");
create index if not exists "ix_support_ticket_attachments_created_by" on "support_ticket_attachments" ("created_by");
create index if not exists "ix_support_ticket_attachments_status" on "support_ticket_attachments" ("status");
create index if not exists "ix_support_ticket_attachments_archived_at" on "support_ticket_attachments" ("archived_at");
create index if not exists "ix_support_ticket_links_ticket_id" on "support_ticket_links" ("ticket_id");
create index if not exists "ix_support_ticket_links_created_by" on "support_ticket_links" ("created_by");
create index if not exists "ix_support_ticket_links_status" on "support_ticket_links" ("status");
create index if not exists "ix_support_ticket_links_archived_at" on "support_ticket_links" ("archived_at");
create index if not exists "ix_support_ticket_escalations_ticket_id" on "support_ticket_escalations" ("ticket_id");
create index if not exists "ix_support_ticket_escalations_owner_id" on "support_ticket_escalations" ("owner_id");
create index if not exists "ix_support_ticket_escalations_created_by" on "support_ticket_escalations" ("created_by");
create index if not exists "ix_support_ticket_escalations_status" on "support_ticket_escalations" ("status");
create index if not exists "ix_support_ticket_escalations_archived_at" on "support_ticket_escalations" ("archived_at");
create index if not exists "ix_support_ticket_events_ticket_id" on "support_ticket_events" ("ticket_id");
create index if not exists "ix_support_ticket_events_actor_id" on "support_ticket_events" ("actor_id");
create index if not exists "ix_support_ticket_events_created_by" on "support_ticket_events" ("created_by");
create index if not exists "ix_support_ticket_events_status" on "support_ticket_events" ("status");
create index if not exists "ix_support_ticket_events_archived_at" on "support_ticket_events" ("archived_at");
create index if not exists "ix_task_queues_created_by" on "task_queues" ("created_by");
create index if not exists "ix_task_queues_status" on "task_queues" ("status");
create index if not exists "ix_task_queues_archived_at" on "task_queues" ("archived_at");
create index if not exists "ix_work_tasks_queue_id" on "work_tasks" ("queue_id");
create index if not exists "ix_work_tasks_assigned_to" on "work_tasks" ("assigned_to");
create index if not exists "ix_work_tasks_created_by" on "work_tasks" ("created_by");
create index if not exists "ix_work_tasks_status" on "work_tasks" ("status");
create index if not exists "ix_work_tasks_archived_at" on "work_tasks" ("archived_at");
create index if not exists "ix_task_assignments_task_id" on "task_assignments" ("task_id");
create index if not exists "ix_task_assignments_assigned_to" on "task_assignments" ("assigned_to");
create index if not exists "ix_task_assignments_assigned_queue_id" on "task_assignments" ("assigned_queue_id");
create index if not exists "ix_task_assignments_assigned_by" on "task_assignments" ("assigned_by");
create index if not exists "ix_task_assignments_created_by" on "task_assignments" ("created_by");
create index if not exists "ix_task_assignments_status" on "task_assignments" ("status");
create index if not exists "ix_task_assignments_archived_at" on "task_assignments" ("archived_at");
create index if not exists "ix_task_dependencies_task_id" on "task_dependencies" ("task_id");
create index if not exists "ix_task_dependencies_related_task_id" on "task_dependencies" ("related_task_id");
create index if not exists "ix_task_dependencies_created_by" on "task_dependencies" ("created_by");
create index if not exists "ix_task_dependencies_status" on "task_dependencies" ("status");
create index if not exists "ix_task_dependencies_archived_at" on "task_dependencies" ("archived_at");
create index if not exists "ix_task_comments_task_id" on "task_comments" ("task_id");
create index if not exists "ix_task_comments_author_id" on "task_comments" ("author_id");
create index if not exists "ix_task_comments_created_by" on "task_comments" ("created_by");
create index if not exists "ix_task_comments_status" on "task_comments" ("status");
create index if not exists "ix_task_comments_archived_at" on "task_comments" ("archived_at");
create index if not exists "ix_task_sla_events_task_id" on "task_sla_events" ("task_id");
create index if not exists "ix_task_sla_events_actor_id" on "task_sla_events" ("actor_id");
create index if not exists "ix_task_sla_events_created_by" on "task_sla_events" ("created_by");
create index if not exists "ix_task_sla_events_status" on "task_sla_events" ("status");
create index if not exists "ix_task_sla_events_archived_at" on "task_sla_events" ("archived_at");
create index if not exists "ix_task_events_task_id" on "task_events" ("task_id");
create index if not exists "ix_task_events_actor_id" on "task_events" ("actor_id");
create index if not exists "ix_task_events_created_by" on "task_events" ("created_by");
create index if not exists "ix_task_events_status" on "task_events" ("status");
create index if not exists "ix_task_events_archived_at" on "task_events" ("archived_at");
create index if not exists "ix_olympiads_created_by" on "olympiads" ("created_by");
create index if not exists "ix_olympiads_status" on "olympiads" ("status");
create index if not exists "ix_olympiads_archived_at" on "olympiads" ("archived_at");
