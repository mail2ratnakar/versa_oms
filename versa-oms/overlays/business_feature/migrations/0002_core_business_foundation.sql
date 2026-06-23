-- Versa Olympiads core business foundation migration
-- Safe additive starter migration.
-- No hard delete. No destructive migration.

CREATE TABLE IF NOT EXISTS staff_users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  role_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  scope_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE TABLE IF NOT EXISTS school_users (
  id text PRIMARY KEY,
  school_id text NOT NULL,
  email text NOT NULL,
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE TABLE IF NOT EXISTS schools (
  id text PRIMARY KEY,
  school_code text NOT NULL UNIQUE,
  school_name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  board text,
  city text,
  state text,
  country text DEFAULT 'India',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE TABLE IF NOT EXISTS business_entities (
  id text PRIMARY KEY,
  module_id text NOT NULL,
  entity_type text NOT NULL,
  school_id text,
  status text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_business_entities_module ON business_entities(module_id);
CREATE INDEX IF NOT EXISTS idx_business_entities_school ON business_entities(school_id);
CREATE INDEX IF NOT EXISTS idx_business_entities_status ON business_entities(status);

CREATE TABLE IF NOT EXISTS audit_events (
  audit_event_id text PRIMARY KEY,
  source_module text NOT NULL,
  action text NOT NULL,
  actor_id text NOT NULL,
  actor_type text NOT NULL,
  role_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  scope_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  previous_status text,
  new_status text,
  reason text,
  request_id text,
  job_id text,
  risk text NOT NULL DEFAULT 'medium',
  safe_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  event_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_source_module ON audit_events(source_module);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor_type, actor_id);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  idempotency_key text PRIMARY KEY,
  module_id text NOT NULL,
  operation text NOT NULL,
  actor_id text NOT NULL,
  payload_hash text NOT NULL,
  response_snapshot jsonb,
  status text NOT NULL DEFAULT 'in_progress',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

CREATE TABLE IF NOT EXISTS feature_flags (
  flag_key text PRIMARY KEY,
  flag_value boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'development',
  risk text NOT NULL DEFAULT 'medium',
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
