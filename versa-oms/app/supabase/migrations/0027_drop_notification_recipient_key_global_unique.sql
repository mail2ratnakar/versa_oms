-- FR-NOTIFY-FANOUT-2026-0014: completes the 0023 sweep. notification_recipients.recipient_key carried a
-- leftover SINGLE-COLUMN global UNIQUE from 0001 (uq_notification_recipients_recipient_key) — it made a
-- recipient (e.g. a school coordinator) insertable into ONLY ONE batch ever, so they could never receive
-- a second notification. 0023 added the correct composite UNIQUE(batch_id, recipient_key) ("once per
-- batch") but missed dropping this one. Drop it; the composite remains the natural key.
-- Approved by founder 2026-06-25 (no-spec-relaxation rule: confirmed it's a leftover bug, not a control).
alter table "notification_recipients" drop constraint if exists "uq_notification_recipients_recipient_key";
