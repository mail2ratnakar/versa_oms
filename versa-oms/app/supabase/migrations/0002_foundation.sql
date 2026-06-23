-- Versa OMS foundation migration: idempotency + auth linkage.

create table if not exists "idempotency_keys" (
  "idempotency_key" text primary key,
  "module_id" text not null,
  "operation" text not null,
  "payload_hash" text not null,
  "response" jsonb,
  "actor_id" uuid,
  "created_at" timestamptz not null default now()
);
create index if not exists "ix_idempotency_keys_created_at" on "idempotency_keys" ("created_at");

-- Link staff/school identity rows to the Supabase auth user (nullable; FK added
-- when running against Supabase where the auth schema exists).
alter table "staff_profiles" add column if not exists "auth_user_id" uuid;
alter table "school_users" add column if not exists "auth_user_id" uuid;
create index if not exists "ix_staff_profiles_auth_user_id" on "staff_profiles" ("auth_user_id");
create index if not exists "ix_school_users_auth_user_id" on "school_users" ("auth_user_id");
