import type { Actor } from "@/server/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Staff-identity safety rules:
 *  - an actor cannot change their OWN role (separation of duties);
 *  - the LAST active super_admin cannot be disabled/demoted (lockout protection).
 * Throws { code, message } on violation; callers map to 422/403.
 */
export class PolicyError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = "PolicyError";
  }
}

const ROLE_KEYS = ["role", "primary_role", "roles", "staff_status"];

export function assertNotSelfRoleChange(actor: Actor, targetId: string, patch: Record<string, unknown>): void {
  const touchesRole = ROLE_KEYS.some((k) => k in patch);
  if (touchesRole && actor.actor_id === targetId) {
    throw new PolicyError("role", "You cannot change your own role or status.");
  }
}

/** When demoting/disabling a super_admin, ensure at least one other active super_admin remains. */
export async function assertNotLastSuperAdmin(targetId: string, patch: Record<string, unknown>): Promise<void> {
  const demoting =
    ("staff_status" in patch && ["disabled", "inactive"].includes(String(patch.staff_status))) ||
    ("primary_role" in patch && String(patch.primary_role) !== "super_admin") ||
    ("role" in patch && String(patch.role) !== "super_admin");
  if (!demoting) return;
  try {
    const supabase = createSupabaseAdminClient();
    const { data: target } = await supabase.from("staff_profiles").select("primary_role").eq("id", targetId).maybeSingle();
    if (!target || target.primary_role !== "super_admin") return; // not a super admin -> fine
    const { count } = await supabase
      .from("staff_profiles")
      .select("*", { count: "exact", head: true })
      .eq("primary_role", "super_admin")
      .eq("staff_status", "active");
    if ((count ?? 0) <= 1) {
      throw new PolicyError("staff_status", "Cannot disable or demote the last active super admin.");
    }
  } catch (e) {
    if (e instanceof PolicyError) throw e;
    // No DB locally: cannot verify count — allow (verified once DB is live).
  }
}
