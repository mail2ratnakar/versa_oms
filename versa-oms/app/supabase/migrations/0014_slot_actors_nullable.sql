-- System/seed-created exam cycles + slot assignments may have no staff actor.
alter table "exam_cycles" alter column "created_by" drop not null;
alter table "school_exam_slot_assignments" alter column "assigned_by" drop not null;
