// Shared permission-drift runner (FR-PERMISSION-DRIFT-0027 + sweep 0029). Loads staff + roles, runs the
// PURE scan, persists findings idempotently, and opens an incident on high/critical. Called by the staff
// route AND the scheduled sweep job — single source.
import { scanPermissionDrift, maxRisk, type RoleRow, type StaffRow } from "@/server/security/permissionDrift";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import type { Actor } from "@/server/types";
import { createHash } from "node:crypto";

type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const HIGH = new Set(["high", "critical"]);

export type DriftScanResult = { scanned_staff: number; findings: number; by_risk: Record<string, number>; incident_code: string | null };

export async function runPermissionDriftScan(supabase: Db, actor: Actor): Promise<DriftScanResult> {
  const staff = ((await supabase.from("staff_profiles").select("id, primary_role, secondary_roles").is("archived_at", null).limit(2000)).data ?? []) as StaffRow[];
  const roles = ((await supabase.from("portal_roles").select("role_id, role_name, risk_level, role_status").limit(2000)).data ?? []) as RoleRow[];
  const findings = scanPermissionDrift(staff, roles);

  for (const f of findings) {
    const code = "DRIFT-" + createHash("sha256").update(f.staff_user_id + "|" + f.role_ref).digest("hex").slice(0, 10).toUpperCase();
    await supabase.from("permission_drift_findings").upsert({
      finding_code: code, staff_user_id: isUuid(f.staff_user_id) ? f.staff_user_id : null, role_or_permission_ref: f.role_ref,
      baseline_snapshot: f.baseline, current_snapshot: f.current, risk_level: f.risk_level, finding_status: "open",
      updated_at: new Date().toISOString(),
    }, { onConflict: "finding_code", ignoreDuplicates: false });
  }

  const top = maxRisk(findings);
  let incidentCode: string | null = null;
  if (top && HIGH.has(top)) {
    const { data: existing } = await supabase.from("security_incidents")
      .select("incident_code").eq("incident_type", "unauthorized_access").eq("status", "open")
      .ilike("summary", "Permission drift detected%").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (existing) {
      incidentCode = String((existing as Record<string, unknown>).incident_code);
    } else {
      const code = "INC-" + crypto.randomUUID().slice(0, 8).toUpperCase();
      const summary = `Permission drift detected: ${findings.length} finding(s), highest risk ${top} — staff holding non-active/unknown roles.`;
      const { data: inc } = await supabase.from("security_incidents").insert({
        incident_code: code, incident_type: "unauthorized_access", severity: top,
        affected_modules: ["security_audit_console", "roles_permissions"], related_event_ids: [],
        summary, status: "open", opened_at: new Date().toISOString(), reported_by: isUuid(actor.actor_id) ? actor.actor_id : null,
        updated_at: new Date().toISOString(),
      }).select("id, incident_code").maybeSingle();
      incidentCode = ((inc as Record<string, unknown> | null)?.incident_code as string) ?? code;
      if (inc) { const { notifyIncidentOpened } = await import("@/server/security/incidentNotify"); await notifyIncidentOpened(supabase, { id: String((inc as Record<string, unknown>).id), code: incidentCode, summary, severity: top }, actor); }
    }
  }

  await createAuditEvent({ sourceModule: "security_audit_console", action: "permission_drift_scan", actor, entityType: "permission_drift_findings", entityId: "scan", reason: `scanned ${staff.length} staff -> ${findings.length} drift finding(s)` });
  const byRisk = findings.reduce<Record<string, number>>((a, f) => ((a[f.risk_level] = (a[f.risk_level] ?? 0) + 1), a), {});
  return { scanned_staff: staff.length, findings: findings.length, by_risk: byRisk, incident_code: incidentCode };
}
