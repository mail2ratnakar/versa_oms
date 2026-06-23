-- CHAIN-003: candidate_id is server-assigned on roster lock (null until then).
alter table "students" alter column "candidate_id" drop not null;
