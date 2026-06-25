// Permission drift scan (FR-PERMISSION-DRIFT-2026-0027). Drift = a staff member still holds a role that
// is NO LONGER active in the role registry (deprecated/disabled/archived/draft) or that doesn't exist at
// all — privilege that should have been revoked. PURE so it is unit-tested; the route persists findings +
// opens an incident.
export type RoleRow = { role_id: string; role_name?: string | null; risk_level?: string | null; role_status?: string | null };
export type StaffRow = { id: string; primary_role?: string | null; secondary_roles?: string[] | null };
export type DriftFinding = { staff_user_id: string; role_ref: string; risk_level: string; baseline: Record<string, unknown>; current: Record<string, unknown>; reason: string };

const ACTIVE = "active";
const RANK: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };

export function scanPermissionDrift(staff: StaffRow[], roles: RoleRow[]): DriftFinding[] {
  const byId = new Map(roles.map((r) => [r.role_id, r]));
  const out: DriftFinding[] = [];
  for (const s of staff) {
    const held = [s.primary_role, ...(s.secondary_roles ?? [])].filter((x): x is string => !!x);
    for (const ref of held) {
      const role = byId.get(ref);
      if (!role) {
        out.push({ staff_user_id: s.id, role_ref: ref, risk_level: "high", baseline: { expected: "a governed, active role" }, current: { role_status: "unknown", assigned: true }, reason: `holds an unknown role '${ref}' (not in the role registry)` });
      } else if ((role.role_status ?? ACTIVE) !== ACTIVE) {
        out.push({ staff_user_id: s.id, role_ref: ref, risk_level: role.risk_level ?? "medium", baseline: { role_status: ACTIVE }, current: { role_status: role.role_status, assigned: true }, reason: `still holds '${role.role_name ?? ref}' which is ${role.role_status}` });
      }
    }
  }
  return out;
}

/** The highest risk among findings (drives incident severity); null if none. */
export function maxRisk(findings: DriftFinding[]): string | null {
  if (!findings.length) return null;
  return findings.reduce((m, f) => (RANK[f.risk_level] ?? 1) > (RANK[m] ?? 1) ? f.risk_level : m, "low");
}
