-- School roster upload: batch updated_at defaults so a school-created batch needs no client timestamp.
alter table "student_roster_batches" alter column "updated_at" set default now();
