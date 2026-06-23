-- Versa OMS background job runs (worker orchestration ledger).
create table if not exists "job_runs" (
  "id" uuid primary key default gen_random_uuid(),
  "job_type" text not null,
  "queue_id" text not null,
  "payload" jsonb,
  "idempotency_key" text not null,
  "status" text not null,
  "attempts" integer not null default 0,
  "error" text,
  "result" jsonb,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz
);
create unique index if not exists "uq_job_runs_idem" on "job_runs" ("job_type", "idempotency_key");
create index if not exists "ix_job_runs_status" on "job_runs" ("status");

alter table "job_runs" enable row level security;
alter table "job_runs" force row level security;
