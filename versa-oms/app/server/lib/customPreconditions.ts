// Hand-written transition preconditions (FRAMEWORK) that the kernel runs ALONGSIDE the generated
// transitionPreconditions — for cross-entity invariants too imperative for the declarative guard spec.
// Mirrors the domainEffects (generated + hand-written) merge pattern. Fail-closed.
// FR-LAST-SUPERADMIN-2026-0032 (negative pack GLOBAL-RBAC-003 / WF-012-NEG-002): the final active super
// admin cannot be suspended/disabled — that would lock the org out of governance.
import { PreconditionError } from "@/server/lib/transitionPreconditions";

type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;

/** PURE: a super_admin may not be suspended/disabled when they are the last active one. */
export function isLastActiveSuperAdmin(primaryRole: string, activeSuperAdminCount: number): boolean {
  return primaryRole === "super_admin" && activeSuperAdminCount <= 1;
}

async function assertNotLastSuperAdmin(supabase: Db, recordId: string): Promise<void> {
  const { data: staff } = await supabase.from("staff_profiles").select("primary_role").eq("id", recordId).maybeSingle();
  const role = (staff as Record<string, unknown> | null)?.primary_role as string | undefined;
  if (role !== "super_admin") return;
  const { count } = await supabase.from("staff_profiles").select("id", { count: "exact", head: true })
    .eq("primary_role", "super_admin").eq("staff_status", "active").is("archived_at", null);
  if (isLastActiveSuperAdmin("super_admin", count ?? 0)) {
    throw new PreconditionError("Cannot suspend or disable the last active super admin.");
  }
}

export const CUSTOM_PRECONDITIONS: Record<string, (supabase: Db, recordId: string) => Promise<void>> = {
  "staff_users:suspend": assertNotLastSuperAdmin,
  "staff_users:archive": assertNotLastSuperAdmin,
};

export async function runCustomPreconditions(moduleId: string, action: string, supabase: Db, recordId: string): Promise<void> {
  const fn = CUSTOM_PRECONDITIONS[`${moduleId}:${action}`];
  if (fn) await fn(supabase, recordId);
}
