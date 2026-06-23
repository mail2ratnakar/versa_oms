-- Versa OMS dual-approval ledger (maker != checker enforcement).
create table if not exists "approvals" (
  "id" uuid primary key default gen_random_uuid(),
  "module_id" text,
  "table_name" text not null,
  "record_id" text not null,
  "action" text not null,
  "approver_id" text not null,
  "approver_role" text,
  "reason" text,
  "created_at" timestamptz not null default now()
);
create unique index if not exists "uq_approvals_distinct_approver"
  on "approvals" ("table_name", "record_id", "action", "approver_id");
create index if not exists "ix_approvals_record" on "approvals" ("table_name", "record_id", "action");

alter table "approvals" enable row level security;
alter table "approvals" force row level security;
