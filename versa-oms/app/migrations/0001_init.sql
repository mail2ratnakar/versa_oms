-- Versa Olympiads initial migration placeholder.
-- Production TODO:
-- 1. Generate real migrations from DATABASE_SCHEMA_REGISTRY.json.
-- 2. Use additive migrations first.
-- 3. Do not introduce hard delete behavior.
-- 4. Add audit fields and indexes.
-- 5. Add RLS/server-side policy mapping after stack decision.

CREATE TABLE IF NOT EXISTS migration_healthcheck (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
