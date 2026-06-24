-- FR-STAFF-USERS-2026-0001 — Staff identity foundation.
-- Seed an idempotent SYSTEM staff_profile so actor-stamped FK columns (e.g.
-- school_lead_interactions.staff_owner_id -> staff_profiles(id)) always have a
-- valid target, and the dev/system fallback actor resolves to a real UUID.
-- This is a service account (department=system, employment_type=system_service);
-- real human staff are created via the staff_users flow (separate, larger effort).

insert into "staff_profiles" (
  "id", "staff_code", "user_id", "full_name", "email", "department",
  "primary_role", "employment_type", "joining_date", "staff_status",
  "failed_login_count", "updated_at"
) values (
  '00000000-0000-0000-0000-000000000001',
  'STAFF-SYSTEM',
  '00000000-0000-0000-0000-000000000001',
  'System Service',
  'system@versa.local',
  'system',
  'super_admin',
  'system_service',
  '2026-01-01',
  'active',
  0,
  now()
) on conflict ("id") do nothing;
