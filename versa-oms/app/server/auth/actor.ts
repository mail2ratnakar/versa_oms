import type { SupabaseClient } from "@supabase/supabase-js";
import type { Actor } from "@/server/types";
import { env } from "@/lib/env";

/**
 * Resolve the authenticated actor server-side. Roles/scopes are NEVER trusted
 * from the browser — they are loaded from the database for the signed-in user.
 *
 * Local-dev fallback: when no Supabase auth user exists AND we are running on the
 * local default URL, return a dev super-admin / dev school so the app is usable
 * before real auth is wired. This fallback is disabled the moment real Supabase
 * env vars are set (env.IS_LOCAL === false).
 */
// The seeded SYSTEM staff_profile (migration 0021). The dev/system fallback actor
// resolves to this real UUID so actor-stamped FK columns (staff_owner_id, etc.) are valid.
export const SYSTEM_STAFF_ID = "00000000-0000-0000-0000-000000000001";
const DEV_STAFF: Actor = {
  actor_id: SYSTEM_STAFF_ID,
  actor_type: "staff",
  roles: ["super_admin"],
  scopes: ["global"],
};
// The system actor for unattended automation (scheduled jobs/sweeps) — the seeded SYSTEM staff_profile.
export const SYSTEM_ACTOR: Actor = DEV_STAFF;
const DEV_SCHOOL: Actor = {
  actor_id: "dev-school",
  actor_type: "school",
  roles: ["school_coordinator"],
  scopes: ["school:dev-school"],
  school_id: "dev-school",
};

async function getUserId(supabase: SupabaseClient): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

// Roles come from the real columns: primary_role (+ secondary_roles jsonb array).
export function rolesFromProfile(profile: Record<string, unknown>): string[] {
  const roles: string[] = [];
  if (typeof profile.primary_role === "string" && profile.primary_role) roles.push(profile.primary_role);
  if (Array.isArray(profile.secondary_roles)) roles.push(...(profile.secondary_roles as unknown[]).filter((r): r is string => typeof r === "string" && !!r));
  return roles;
}

// Assignment scopes live in staff_assignment_scopes. Map scope_type:scope_value to the
// kernel's scope strings (state->region, work_queue->queue); only active scopes count.
export function scopesFromAssignments(rows: Array<Record<string, unknown>>): string[] {
  const alias: Record<string, string> = { state: "region", work_queue: "queue" };
  return (rows ?? [])
    .filter((r) => r.scope_status === "active" && r.scope_type)
    .map((r) => {
      const type = String(r.scope_type);
      if (type === "global") return "global";
      return `${alias[type] ?? type}:${String(r.scope_value ?? "")}`;
    })
    .filter((s) => s === "global" || !s.endsWith(":"));
}

/** Pure profile(+scopes) -> Actor mapping. Returns null for a missing/non-active profile (fail-closed). */
export function staffActorFromProfile(
  profile: Record<string, unknown> | null | undefined,
  scopeRows: Array<Record<string, unknown>>
): Actor | null {
  if (!profile || profile.staff_status !== "active") return null;
  return {
    actor_id: profile.id as string,
    actor_type: "staff",
    roles: rolesFromProfile(profile),
    scopes: scopesFromAssignments(scopeRows),
  };
}

// Dev-auth fallback is allowed in local mode OR when ALLOW_DEV_AUTH=true (used to
// verify app<->DB before real Supabase auth is wired). Disable before production.
export function devAuthAllowed(): boolean {
  // Never allow the dev-auth bypass in production, even if ALLOW_DEV_AUTH is set.
  if (process.env.NODE_ENV === "production") return false;
  return env.IS_LOCAL || process.env.ALLOW_DEV_AUTH === "true";
}

export async function resolveStaffActor(supabase: SupabaseClient): Promise<Actor | null> {
  const userId = await getUserId(supabase);
  if (!userId) return devAuthAllowed() ? DEV_STAFF : null;
  try {
    const { data: profile } = await supabase
      .from("staff_profiles")
      .select("*")
      .eq("auth_user_id", userId)
      .maybeSingle();
    if (!profile || profile.staff_status !== "active") return null;
    const { data: scopeRows } = await supabase
      .from("staff_assignment_scopes")
      .select("scope_type, scope_value, scope_status")
      .eq("staff_profile_id", profile.id);
    return staffActorFromProfile(profile as Record<string, unknown>, (scopeRows ?? []) as Array<Record<string, unknown>>);
  } catch {
    return null;
  }
}

export async function resolveSchoolActor(supabase: SupabaseClient): Promise<Actor | null> {
  const userId = await getUserId(supabase);
  if (!userId) return devAuthAllowed() ? DEV_SCHOOL : null;
  try {
    const { data: su } = await supabase
      .from("school_users")
      .select("*")
      .eq("auth_user_id", userId)
      .maybeSingle();
    if (!su || su.status === "disabled") return null;
    return {
      actor_id: su.id as string,
      actor_type: "school",
      roles: rolesFromProfile(su).length ? rolesFromProfile(su) : ["school_coordinator"],
      scopes: [`school:${su.school_id}`],
      school_id: su.school_id as string,
    };
  } catch {
    return null;
  }
}
