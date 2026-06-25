-- CHAIN-003 e2e fixtures (idempotent; respects no-hard-delete triggers via reset/upsert).
-- Run before tests/e2e/chain3_roster.spec.ts:
--   docker ... psql ... -f _validation/seed_chain3.sql
-- Positive: active school + 2 students (null candidate_id) + lockable batch.
-- Negative: BLOCKED school + batch (precondition must reject lock).

-- reset event log (deletable) so re-runs start clean
delete from candidate_id_events where school_id in (select id from schools where school_code in ('E2E-CH3-SCH','E2E-CH3-BLK'));

-- coded parents: upsert
insert into olympiads (olympiad_code,name,academic_year,subject,eligible_grades,registration_open_at,registration_close_at,exam_window_start,exam_window_end,fee_per_student,school_commission_per_student,max_marks,status)
values ('E2E-OLY-CH3','E2E Olympiad','2026','Math','["5"]'::jsonb,now(),now(),now(),now(),100,10,50,'active')
on conflict (olympiad_code) do nothing;
insert into schools (school_code,name,city,state,coordinator_name,coordinator_email,status)
values ('E2E-CH3-SCH','E2E CH3 School','Delhi','Delhi','Coord','ch3@versa.local','active')
on conflict (school_code) do update set status='active';
insert into schools (school_code,name,city,state,coordinator_name,coordinator_email,status)
values ('E2E-CH3-BLK','E2E CH3 Blocked School','Delhi','Delhi','Coord','blk@versa.local','blocked')
on conflict (school_code) do update set status='blocked';
insert into participations (participation_code,school_id,olympiad_id)
select 'E2E-PART-CH3', (select id from schools where school_code='E2E-CH3-SCH'), (select id from olympiads where olympiad_code='E2E-OLY-CH3')
on conflict (participation_code) do nothing;

-- students: reset existing to null candidate_id (no hard delete), insert any missing
update students set candidate_id=null, status='registered' where student_name like 'E2E CH3 Student%';
insert into students (school_id,participation_id,candidate_id,student_name,grade,consent_obtained,status)
select (select id from schools where school_code='E2E-CH3-SCH'), (select id from participations where participation_code='E2E-PART-CH3'), null, 'E2E CH3 Student '||g, '5', true, 'registered'
from generate_series(1,2) g
where not exists (select 1 from students where student_name = 'E2E CH3 Student '||g);

-- batches: upsert, reset to lockable
insert into student_roster_batches (batch_code,school_id,source_type,batch_status,updated_at)
select 'E2E-ROSTER-CH3', (select id from schools where school_code='E2E-CH3-SCH'), 'staff_uploaded_on_behalf', 'submitted_for_lock', now()
on conflict (batch_code) do update set batch_status='submitted_for_lock', updated_at=now();
insert into student_roster_batches (batch_code,school_id,source_type,batch_status,updated_at)
select 'E2E-ROSTER-BLOCKED', (select id from schools where school_code='E2E-CH3-BLK'), 'staff_uploaded_on_behalf', 'submitted_for_lock', now()
on conflict (batch_code) do update set batch_status='submitted_for_lock', updated_at=now();

-- CHAIN-005 fixture: exam cycle + slot + two pending slot assignments for the CH3 school.
insert into exam_cycles (cycle_code,cycle_name,olympiad_code,exam_window_start_at,exam_window_end_at,updated_at)
values ('E2E-CYCLE-CH5','E2E Cycle','E2E-OLY-CH3',now(),now(),now()) on conflict (cycle_code) do nothing;
insert into exam_slots (slot_code,exam_date,start_time,end_time,capacity_schools,capacity_students)
values ('E2E-SLOT-CH5', current_date, '10:00', '12:00', 10, 500) on conflict (slot_code) do nothing;
-- OK: all gates passed (school can confirm)
insert into school_exam_slot_assignments (assignment_code,school_id,exam_cycle_id,exam_slot_id,roster_batch_id,confirmed_student_count,assignment_source,assignment_status,payment_gate_status,roster_gate_status,capacity_gate_status,updated_at)
select 'E2E-ASSIGN-OK', (select id from schools where school_code='E2E-CH3-SCH'), (select id from exam_cycles where cycle_code='E2E-CYCLE-CH5'), (select id from exam_slots where slot_code='E2E-SLOT-CH5'), (select id from student_roster_batches where batch_code='E2E-ROSTER-CH3'), 2, 'school_selected', 'pending_confirmation', 'passed', 'passed', 'passed', now()
on conflict (assignment_code) do update set assignment_status='pending_confirmation', payment_gate_status='passed', roster_gate_status='passed', capacity_gate_status='passed', updated_at=now();
-- BLOCKED: roster gate failed (confirm must be rejected by precondition)
insert into school_exam_slot_assignments (assignment_code,school_id,exam_cycle_id,exam_slot_id,roster_batch_id,confirmed_student_count,assignment_source,assignment_status,payment_gate_status,roster_gate_status,capacity_gate_status,updated_at)
select 'E2E-ASSIGN-BLOCKED', (select id from schools where school_code='E2E-CH3-SCH'), (select id from exam_cycles where cycle_code='E2E-CYCLE-CH5'), (select id from exam_slots where slot_code='E2E-SLOT-CH5'), (select id from student_roster_batches where batch_code='E2E-ROSTER-CH3'), 2, 'school_selected', 'pending_confirmation', 'passed', 'failed', 'passed', now()
on conflict (assignment_code) do update set assignment_status='pending_confirmation', roster_gate_status='failed', updated_at=now();

-- staff FINANCE: a pending payment on the CH3 invoice (staff confirms it)
insert into finance_payments (payment_reference, invoice_id, school_id, provider, amount, currency, confirmation_source, payment_status)
select 'E2E-FPAY-7001', (select id from finance_invoices where invoice_number='E2E-INV-CH4'), (select id from schools where school_code='E2E-CH3-SCH'), 'manual', 200, 'INR', 'manual', 'pending'
on conflict (payment_reference) do update set payment_status='pending';

-- staff EVALUATION: an answer key under review (staff approves it)
insert into evaluation_answer_keys (answer_key_code, exam_cycle_id, subject_code, grade_code, paper_set_code, key_version, answer_key_payload, key_status)
select 'E2E-AKEY-7002', (select id from exam_cycles where cycle_code='E2E-CYCLE-CH5'), 'MATH', '5', 'SET-7002', 7002, '{}'::jsonb, 'under_review'
on conflict (answer_key_code) do update set key_status='under_review';

-- staff CERTIFICATE request under review (staff approves)
insert into certificate_requests (request_code, request_type, request_status)
select 'E2E-CREQ-7003', 'generate', 'under_review'
on conflict (request_code) do update set request_status='under_review';

-- staff RESULT publication approved (staff publishes)
insert into result_publications (publication_code, olympiad_id, scope_type, status)
select 'E2E-PUB-7004', (select id from olympiads where olympiad_code='E2E-OLY-CH3'), 'all', 'approved'
on conflict (publication_code) do update set status='approved';

-- school-side CERTIFICATE download fixture: a published certificate for a CH3 student
insert into certificates (certificate_number, verification_code, student_id, school_id, status)
select 'E2E-CERT-CH5', 'VRS-E2E-CH5', (select id from students where student_name='E2E CH3 Student 1' limit 1), (select id from schools where school_code='E2E-CH3-SCH'), 'published'
on conflict (certificate_number) do update set status='published';

-- school-side PAYMENTS fixture: a payment in draft the school can turn into a payment link
insert into payments (payment_code, participation_id, school_id, expected_amount, status)
select 'E2E-PAY-CH5', (select id from participations where participation_code='E2E-PART-CH3'), (select id from schools where school_code='E2E-CH3-SCH'), 200, 'payment_draft'
on conflict (payment_code) do update set status='payment_draft';

-- CHAIN-004 fixture: an ISSUED invoice for the CH3 participation; participation starts unpaid.
update participations set payment_status='pending' where participation_code='E2E-PART-CH3';
insert into finance_invoices (invoice_number,school_id,participation_id,roster_batch_id,confirmed_student_count,price_per_student,gross_amount,net_payable_amount,balance_due,invoice_status,updated_at)
select 'E2E-INV-CH4', (select id from schools where school_code='E2E-CH3-SCH'), (select id from participations where participation_code='E2E-PART-CH3'), (select id from student_roster_batches where batch_code='E2E-ROSTER-CH3'), 2, 100, 200, 200, 200, 'issued', now()
on conflict (invoice_number) do update set invoice_status='issued', updated_at=now();

-- FR-RESULTS-RANKING-2026-0006 fixtures: evaluation import -> score batch -> result batch + scored
-- candidate_results (ranks NULL, status reset each run so the generate e2e re-ranks idempotently).
insert into evaluation_import_batches (import_batch_code, exam_cycle_id, source_type, uploaded_by, updated_at)
select 'E2E-IMP-CH6', (select id from exam_cycles where cycle_code='E2E-CYCLE-CH5'), 'manual_test', (select id from staff_profiles limit 1), now()
on conflict (import_batch_code) do update set updated_at=now();

insert into evaluation_score_batches (score_batch_code, import_batch_id, answer_key_id, score_formula_version, scoring_snapshot_hash, candidate_count, scored_count, updated_at)
select 'E2E-SCORE-CH6', (select id from evaluation_import_batches where import_batch_code='E2E-IMP-CH6'), (select id from evaluation_answer_keys where answer_key_code='E2E-AKEY-7002'), 'v1', 'scorehash', 4, 4, now()
on conflict (score_batch_code) do update set updated_at=now();

insert into result_batches (result_batch_code, exam_cycle_id, evaluation_score_batch_id, handoff_snapshot_hash, result_version, ranking_policy_version, candidate_count, result_batch_status, updated_at)
select 'E2E-RESBATCH-CH6', (select id from exam_cycles where cycle_code='E2E-CYCLE-CH5'), (select id from evaluation_score_batches where score_batch_code='E2E-SCORE-CH6'), 'handoffhash', 'v1', 'v1', 4, 'draft', now()
on conflict (result_batch_code) do update set result_batch_status='draft', updated_at=now();

insert into result_batches (result_batch_code, exam_cycle_id, evaluation_score_batch_id, handoff_snapshot_hash, result_version, ranking_policy_version, candidate_count, result_batch_status, updated_at)
select 'E2E-RESBATCH-PUB', (select id from exam_cycles where cycle_code='E2E-CYCLE-CH5'), (select id from evaluation_score_batches where score_batch_code='E2E-SCORE-CH6'), 'handoffhash', 'v1', 'v1', 1, 'published', now()
on conflict (result_batch_code) do update set result_batch_status='published', updated_at=now();

insert into candidate_results (result_batch_id, candidate_id, school_id, grade_code, subject_code, raw_score, max_score, percentage_score, result_status, certificate_eligibility_status, result_version, updated_at)
select (select id from result_batches where result_batch_code='E2E-RESBATCH-CH6'), v.cand, (select id from schools where school_code='E2E-CH3-SCH'), '5', 'MATH', v.raw, 100, v.raw, 'generated', 'not_evaluated', 'v1', now()
from (values ('E2ECH6-1', 95::numeric), ('E2ECH6-2', 80), ('E2ECH6-3', 80), ('E2ECH6-4', 20)) as v(cand, raw)
where not exists (select 1 from candidate_results c where c.result_batch_id=(select id from result_batches where result_batch_code='E2E-RESBATCH-CH6') and c.candidate_id=v.cand);

update candidate_results set result_status='generated', certificate_eligibility_status='not_evaluated', national_rank=null, grade_rank=null, subject_rank=null, updated_at=now()
where result_batch_id=(select id from result_batches where result_batch_code='E2E-RESBATCH-CH6');

-- FR-OMR-SCORING-2026-0008 fixtures: a real (approved) answer key + candidate responses to score.
update evaluation_answer_keys
  set answer_key_payload='{"answers":{"Q1":"A","Q2":"B","Q3":"C","Q4":"D"},"marksCorrect":1,"marksWrong":0}'::jsonb, key_status='approved', updated_at=now()
  where answer_key_code='E2E-AKEY-7002';

insert into evaluation_candidate_responses (import_batch_id, candidate_id, school_id, response_payload, updated_at)
select (select id from evaluation_import_batches where import_batch_code='E2E-IMP-CH6'), v.cand, (select id from schools where school_code='E2E-CH3-SCH'), v.payload::jsonb, now()
from (values
  ('E2ESCORE-1', '{"Q1":"A","Q2":"B","Q3":"C","Q4":"D"}'),
  ('E2ESCORE-2', '{"Q1":"A","Q2":"X","Q3":"C","Q4":""}'),
  ('E2ESCORE-3', '{"Q1":"Z","Q2":"Z","Q3":"Z","Q4":"Z"}')
) as v(cand, payload)
on conflict (import_batch_id, candidate_id) do update set response_payload=excluded.response_payload, updated_at=now();

-- FR-RESULT-HANDOFF-2026-0009 fixture: a result batch linked to the scored score batch, with NO
-- candidate_results — results_ops:generate populates them from the scores then ranks. Reset to draft each run.
insert into result_batches (result_batch_code, exam_cycle_id, evaluation_score_batch_id, handoff_snapshot_hash, result_version, ranking_policy_version, candidate_count, result_batch_status, updated_at)
select 'E2E-RESBATCH-HANDOFF', (select id from exam_cycles where cycle_code='E2E-CYCLE-CH5'), (select id from evaluation_score_batches where score_batch_code='E2E-SCORE-CH6'), 'handoffhash', 'v1', 'v1', 0, 'draft', now()
on conflict (result_batch_code) do update set result_batch_status='draft', updated_at=now();

-- FR-OMR-IMPORT-2026-0010 fixture: an ISOLATED, school-scoped import batch for the response-import e2e
-- (kept separate from E2E-IMP-CH6 so scoring/ranking fixtures stay clean).
insert into evaluation_import_batches (import_batch_code, exam_cycle_id, school_id, source_type, uploaded_by, batch_status, updated_at)
select 'E2E-IMP-OMR', (select id from exam_cycles where cycle_code='E2E-CYCLE-CH5'), (select id from schools where school_code='E2E-CH3-SCH'), 'school_upload', (select id from staff_profiles limit 1), 'draft', now()
on conflict (import_batch_code) do update set school_id=excluded.school_id, batch_status='draft', updated_at=now();

-- FR-NOTIFY-FANOUT-2026-0014 fixtures: an ACTIVE template for school_activated + two events (one with a
-- template -> fans out; one without -> suppressed + surfaced). Events reset to 'created' each seed run.
insert into notification_templates (template_code, event_code, channel, body_template, required_variables, allowed_recipient_roles, status)
select 'E2E-NTMPL-ACTIVATED', 'school_activated', 'email', 'Your school is now active.', '[]'::jsonb, '["school_coordinator"]'::jsonb, 'active'
on conflict (template_code) do update set status='active', event_code='school_activated', channel='email';

-- crm_followup_due template so FR-NOTIFY-AUTOTRIGGER-0017 (raise -> immediate fan-out) produces a batch.
insert into notification_templates (template_code, event_code, channel, body_template, required_variables, allowed_recipient_roles, status)
select 'E2E-NTMPL-FOLLOWUP', 'crm_followup_due', 'in_app', 'A CRM follow-up is due.', '[]'::jsonb, '["sales_manager"]'::jsonb, 'active'
on conflict (template_code) do update set status='active', event_code='crm_followup_due', channel='in_app';

insert into notification_events (event_code, event_idempotency_key, source_module, source_entity, source_entity_id, event_payload, recipient_resolver, school_id, status)
select 'school_activated', 'E2E-NEVENT-ACTIVATED', 'school_onboarding_ops', 'schools', (select id from schools where school_code='E2E-CH3-SCH'), '{}'::jsonb, 'school_coordinator', (select id from schools where school_code='E2E-CH3-SCH'), 'created'
on conflict (event_idempotency_key) do update set status='created';

insert into notification_events (event_code, event_idempotency_key, source_module, source_entity, source_entity_id, event_payload, recipient_resolver, school_id, status)
select 'e2e_no_template_event', 'E2E-NEVENT-NOTMPL', 'school_onboarding_ops', 'schools', (select id from schools where school_code='E2E-CH3-SCH'), '{}'::jsonb, 'school_coordinator', (select id from schools where school_code='E2E-CH3-SCH'), 'created'
on conflict (event_idempotency_key) do update set status='created';
