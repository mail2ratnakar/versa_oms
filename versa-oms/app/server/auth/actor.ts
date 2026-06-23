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
const DEV_STAFF: Actor = {
  actor_id: "dev-super-admin",
  actor_type: "staff",
  roles: ["super_admin"],
  scopes: ["global"],
};
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

function rolesFromProfile(profile: Record<string, unknown>): string[] {
  if (Array.isArray(profile.roles)) return profile.roles as string[];
  if (typeof profile.role === "string" && profile.role) return [profile.role as string];
  return [];
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
    if (!profile || profile.status === "disabled" || profile.status === "inactive") return null;
    return {
      actor_id: profile.id as string,
      actor_type: "staff",
      roles: rolesFromProfile(profile),
      scopes: Array.isArray(profile.scopes) ? (profile.scopes as string[]) : [],
    };
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
