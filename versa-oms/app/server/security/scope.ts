import type { Actor } from "@/server/types";

/**
 * Staff assignment-scope. Admin/global roles see everything; other staff are
 * limited to their assigned schools (actor.scopes like "school:<id>"). Used by
 * the kernel to filter list queries for non-admin staff.
 */
const GLOBAL_ROLES = [
  "super_admin",
  "system_admin",
  "company_admin",
  "operations_head",
  "auditor_read_only_reviewer",
  "security_admin_reviewer",
];

// Tables carrying school_id — staff assignment-scope narrows lists on these.
export const SCHOOL_BEARING = new Set([
  "students",
  "payments",
  "results",
  "candidate_results",
  "certificates",
  "participations",
  "exam_material_packages",
  "school_exam_slot_assignments",
  "school_onboarding_cases",
  "school_leads",
  "student_roster_batches",
]);

export function isGlobalActor(actor: Actor): boolean {
  if (actor.scopes?.includes("global")) return true;
  return actor.roles.some((r) => GLOBAL_ROLES.includes(r));
}

export function assignedSchoolIds(actor: Actor): string[] {
  return (actor.scopes ?? []).filter((s) => s.startsWith("school:")).map((s) => s.slice("school:".length)).filter(Boolean);
}

/** Should this staff actor's list be narrowed to assigned schools on a school-bearing table? */
export function staffSchoolScopeFilter(actor: Actor): string[] | null {
  if (actor.actor_type !== "staff") return null;
  if (isGlobalActor(actor)) return null;
  const ids = assignedSchoolIds(actor);
  return ids.length ? ids : null;
}
