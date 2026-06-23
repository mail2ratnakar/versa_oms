-- CHAIN-002: explicit portal-access flags set on onboarding activation.
alter table "schools" add column if not exists "portal_enabled" boolean not null default false;
alter table "schools" add column if not exists "roster_upload_enabled" boolean not null default false;
