-- payment evidence/reversal-reason are conditional (manual payments / reversals only).
alter table "payments" alter column "manual_evidence_file" drop not null;
alter table "payments" alter column "reversal_reason" drop not null;
