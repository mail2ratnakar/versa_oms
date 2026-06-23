-- System/seed-created roster batches may have no staff uploader.
alter table "student_roster_batches" alter column "uploaded_by" drop not null;
