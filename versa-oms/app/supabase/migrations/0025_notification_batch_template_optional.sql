-- FR-NOTIFY-FANOUT-2026-0014: event-driven (system) notification batches have no template — the
-- template_id NOT NULL was an over-constraint (conditional-field class; 0018 already relaxed created_by
-- on this table). Make it nullable so the event fan-out can create a batch without a template.
alter table "notification_batches" alter column "template_id" drop not null;
