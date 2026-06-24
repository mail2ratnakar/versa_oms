import type { Actor } from "@/server/types";

/**
 * Staff assignment-scope (full model). Admin/global roles see everything; other
 * staff are limited to their assigned schools / regions / olympiads / queues.
 * Scopes are strings like "school:<id>", "region:<state>", "olympiad:<id>",
 * "queue:<name>". The kernel applies every dimension the table supports.
 */
const GLOBAL_ROLES = [
  "super_admin", "system_admin", "company_admin", "operations_head",
  "auditor_read_only_reviewer", "security_admin_reviewer",
];

export const SCHOOL_BEARING = new Set([
  "students", "payments", "results", "candidate_results", "certificates", "participations",
  "exam_material_packages", "school_exam_slot_assignments", "school_onboarding_cases",
  "school_leads", "student_roster_batches",
]);

type Dimension = { prefix: string; column: string; tables: Set<string> };
const DIMENSIONS: Dimension[] = [
  { prefix: "school:", column: "school_id", tables: SCHOOL_BEARING },
  { prefix: "region:", column: "state", tables: new Set(["school_leads", "school_onboarding_cases", "schools"]) },
  { prefix: "olympiad:", column: "olympiad_id", tables: new Set(["answer_keys", "exam_materials", "participations", "result_publications"]) },
  { prefix: "queue:", column: "queue_name", tables: new Set(["work_tasks"]) },
];

export function isGlobalActor(actor: Actor): boolean {
  if (actor.scopes?.includes("global")) return true;
  return actor.roles.some((r) => GLOBAL_ROLES.includes(r));
}

export function scopeValues(actor: Actor, prefix: string): string[] {
  return (actor.scopes ?? []).filter((s) => s.startsWith(prefix)).map((s) => s.slice(prefix.length)).filter(Boolean);
}

export function assignedSchoolIds(actor: Actor): string[] {
  return scopeValues(actor, "school:");
}

/** Back-compat: school-only filter (used by the export route). */
export function staffSchoolScopeFilter(actor: Actor): string[] | null {
  if (actor.actor_type !== "staff" || isGlobalActor(actor)) return null;
  const ids = assignedSchoolIds(actor);
  return ids.length ? ids : null;
}

/** Every (column, values) filter that applies to this actor on this table. */
export function applicableFilters(actor: Actor, table: string): Array<{ column: string; values: string[] }> {
  if (actor.actor_type !== "staff" || isGlobalActor(actor)) return [];
  const out: Array<{ column: string; values: string[] }> = [];
  for (const d of DIMENSIONS) {
    if (!d.tables.has(table)) continue;
    const v = scopeValues(actor, d.prefix);
    if (v.length) out.push({ column: d.column, values: v });
  }
  return out;
}

/**
 * Record-level assignment scope (the AND-of-dimensions used by the list, plus an
 * ownership escape hatch). Used to fail-closed on per-record actions so a known id
 * can't be used to act outside scope (OWASP A01 IDOR). Mirrors the list's `.in`
 * semantics; an actor who OWNS the record (ownerColumn === actor_id) is always in
 * scope (honours policies like "assigned_leads OR region"). Global/unscoped staff
 * and non-staff actors are unrestricted here (school scope is enforced separately).
 */
export function recordInScope(actor: Actor, table: string, record: Record<string, unknown>, ownerColumn?: string): boolean {
  if (actor.actor_type !== "staff" || isGlobalActor(actor)) return true;
  if (ownerColumn && record[ownerColumn] && String(record[ownerColumn]) === actor.actor_id) return true;
  const filters = applicableFilters(actor, table);
  if (!filters.length) return true; // no assignment dimensions apply to this table for this actor
  return filters.every((f) => f.values.includes(String(record[f.column] ?? "")));
}
