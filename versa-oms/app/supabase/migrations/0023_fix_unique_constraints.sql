-- FR-SCHEMA-UNIQUES-2026-0007: the DDL generator added single-column UNIQUE constraints on FK and
-- version columns across the schema (same class as candidate_results, fixed in 0022). Each forbids a
-- legitimate one-to-many or per-entity versioning. Replace with the correct natural keys. Idempotent.

-- OMR import: a candidate has one response record per import batch (not globally unique).
alter table "evaluation_candidate_responses" drop constraint if exists "uq_evaluation_candidate_responses_candidate_id";
alter table "evaluation_candidate_responses" drop constraint if exists "uq_evaluation_candidate_responses_import_batch_id";
alter table "evaluation_candidate_responses" add constraint "uq_evaluation_candidate_responses_batch_candidate" unique ("import_batch_id", "candidate_id");

-- OMR scoring: one score per candidate per score batch.
alter table "evaluation_candidate_scores" drop constraint if exists "uq_evaluation_candidate_scores_candidate_id";
alter table "evaluation_candidate_scores" drop constraint if exists "uq_evaluation_candidate_scores_score_batch_id";
alter table "evaluation_candidate_scores" add constraint "uq_evaluation_candidate_scores_batch_candidate" unique ("score_batch_id", "candidate_id");

-- Notification fan-out: many recipients per batch.
alter table "notification_recipients" drop constraint if exists "uq_notification_recipients_batch_id";
alter table "notification_recipients" add constraint "uq_notification_recipients_batch_recipient" unique ("batch_id", "recipient_key");

-- Answer-key versioning: version is unique within an exam-cycle/subject/grade/paper-set, not globally.
alter table "evaluation_answer_keys" drop constraint if exists "uq_evaluation_answer_keys_key_version";
alter table "evaluation_answer_keys" add constraint "uq_evaluation_answer_keys_natural" unique ("exam_cycle_id", "subject_code", "grade_code", "paper_set_code", "key_version");

-- Settings/report/material versioning: version is unique per parent entity, not globally.
alter table "setting_versions" drop constraint if exists "uq_setting_versions_setting_version";
alter table "setting_versions" add constraint "uq_setting_versions_key_version" unique ("setting_key", "setting_version");

alter table "setting_definitions" drop constraint if exists "uq_setting_definitions_definition_version";
alter table "setting_definitions" add constraint "uq_setting_definitions_key_version" unique ("setting_key", "definition_version");

alter table "report_definitions" drop constraint if exists "uq_report_definitions_report_version";
alter table "report_definitions" add constraint "uq_report_definitions_code_version" unique ("report_code", "report_version");

alter table "exam_material_templates" drop constraint if exists "uq_exam_material_templates_template_version";
alter table "exam_material_templates" add constraint "uq_exam_material_templates_code_version" unique ("template_code", "template_version");
