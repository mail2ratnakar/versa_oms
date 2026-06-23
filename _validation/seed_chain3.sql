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

-- CHAIN-004 fixture: an ISSUED invoice for the CH3 participation; participation starts unpaid.
update participations set payment_status='pending' where participation_code='E2E-PART-CH3';
insert into finance_invoices (invoice_number,school_id,participation_id,roster_batch_id,confirmed_student_count,price_per_student,gross_amount,net_payable_amount,balance_due,invoice_status,updated_at)
select 'E2E-INV-CH4', (select id from schools where school_code='E2E-CH3-SCH'), (select id from participations where participation_code='E2E-PART-CH3'), (select id from student_roster_batches where batch_code='E2E-ROSTER-CH3'), 2, 100, 200, 200, 200, 'issued', now()
on conflict (invoice_number) do update set invoice_status='issued', updated_at=now();
