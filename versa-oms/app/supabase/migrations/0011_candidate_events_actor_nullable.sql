-- CHAIN-003: candidate_id_events may be written by the system/dev actor (not a staff_profiles row).
alter table "candidate_id_events" alter column "actor_id" drop not null;
