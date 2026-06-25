-- FR-NOTIFY-FANOUT-2026-0014: REVERTS 0025. Relaxing notification_batches.template_id was a mistake —
-- a required template is a legitimate control (every notification renders from an APPROVED template:
-- governed wording, approval lifecycle, audit, merge-field discipline). The fan-out must RESOLVE a
-- template for the event, not bypass the constraint. Restore NOT NULL (no null rows exist).
alter table "notification_batches" alter column "template_id" set not null;
