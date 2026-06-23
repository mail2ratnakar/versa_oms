-- Versa OMS platform tables: feature flags, file metadata, public verification.

create table if not exists "feature_flags" (
  "key" text primary key,
  "enabled" boolean not null default false,
  "description" text,
  "updated_by" uuid,
  "updated_at" timestamptz not null default now()
);

-- Private file metadata. Raw object paths live here; clients only ever get
-- short-lived signed URLs, never the path.
create table if not exists "file_metadata" (
  "id" uuid primary key default gen_random_uuid(),
  "bucket" text not null,
  "object_path" text not null,
  "content_type" text,
  "size_bytes" bigint,
  "classification" text not null default 'restricted',
  "owner_table" text,
  "owner_id" text,
  "school_id" uuid,
  "created_by" uuid,
  "created_at" timestamptz not null default now(),
  "archived_at" timestamptz
);
create index if not exists "ix_file_metadata_owner" on "file_metadata" ("owner_table", "owner_id");
create index if not exists "ix_file_metadata_school" on "file_metadata" ("school_id");

-- Public certificate verification — ONLY whitelisted minimal fields are exposed.
create table if not exists "public_verification" (
  "id" uuid primary key default gen_random_uuid(),
  "verification_code" text not null unique,
  "certificate_id" uuid,
  "candidate_name" text,
  "olympiad_name" text,
  "award" text,
  "status" text not null default 'valid',
  "issued_on" date,
  "created_at" timestamptz not null default now()
);
create index if not exists "ix_public_verification_status" on "public_verification" ("status");

-- Audit event hash chain (tamper-evidence).
alter table "audit_events" add column if not exists "event_hash" text;
alter table "audit_events" add column if not exists "prev_hash" text;

alter table "feature_flags" enable row level security;
alter table "feature_flags" force row level security;
alter table "file_metadata" enable row level security;
alter table "file_metadata" force row level security;
alter table "public_verification" enable row level security;
alter table "public_verification" force row level security;
