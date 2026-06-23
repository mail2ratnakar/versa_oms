-- CHAIN-003 e2e fixture: a school + olympiad + participation + 2 students (null candidate_id)
-- + a roster batch ready to lock. Re-runnable. Run before tests/e2e/chain3_roster.spec.ts.
delete from student_roster_batches where batch_code = 'E2E-ROSTER-CH3';
delete from students where student_name like 'E2E CH3 Student%';
with oly as (
  insert into olympiads (olympiad_code,name,academic_year,subject,eligible_grades,registration_open_at,registration_close_at,exam_window_start,exam_window_end,fee_per_student,school_commission_per_student,max_marks,status)
  values ('E2E-OLY-CH3','E2E Olympiad','2026','Math','["5"]'::jsonb,now(),now(),now(),now(),100,10,50,'active') returning id),
sch as (
  insert into schools (school_code,name,city,state,coordinator_name,coordinator_email,status)
  values ('E2E-CH3-SCH','E2E CH3 School','Delhi','Delhi','Coord','ch3@versa.local','active') returning id),
part as (
  insert into participations (participation_code,school_id,olympiad_id)
  select 'E2E-PART-CH3', sch.id, oly.id from sch,oly returning id, school_id),
stu as (
  insert into students (school_id,participation_id,candidate_id,student_name,grade,consent_obtained,status)
  select part.school_id, part.id, null, 'E2E CH3 Student '||g, '5', true, 'registered' from part, generate_series(1,2) g returning id)
insert into student_roster_batches (batch_code,school_id,source_type,batch_status,updated_at)
select 'E2E-ROSTER-CH3', part.school_id, 'staff_uploaded_on_behalf', 'submitted_for_lock', now() from part;
