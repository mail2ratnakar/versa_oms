// WF-015 Security / Audit Drift (FR-SECURITY-AUDIT-VERIFY-2026-0026). Verify the audit log's integrity:
// recompute each event's hash from its stored prev_hash + canonical core; any mismatch = a tampered/forged
// audit row. On failure, OPEN a critical security incident referencing the offending events. Audited.
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyAuditChain, type AuditRow } from "@/server/audit/verifyAuditChain";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ok, meta } from "@/server/http/envelope";

const MOD = "security_audit_console";
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export async function GET(request: NextRequest) {
  const guard = await requireStaffScope(request, MOD, "read");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const supabase = createSupabaseAdminClient();
  // Per-event integrity is independent of order; check the most RECENT events (Supabase caps the page,
  // so newest-first ensures a freshly-tampered row is in the window).
  const { data } = await supabase.from("audit_events")
    .select("id, action, entity_name, entity_id, actor_role, new_status, prev_hash, event_hash")
    .order("created_at", { ascending: false }).limit(1000);
  const result = verifyAuditChain((data ?? []) as AuditRow[]);

  let incidentCode: string | null = null;
  if (!result.ok) {
    // Reuse an already-open audit-integrity incident (don't spam a new one every verify).
    const { data: existing } = await supabase.from("security_incidents")
      .select("incident_code").eq("incident_type", "system_misconfiguration").eq("status", "open")
      .ilike("summary", "Audit integrity check failed%").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (existing) {
      incidentCode = String((existing as Record<string, unknown>).incident_code);
    } else {
      const code = "INC-" + crypto.randomUUID().slice(0, 8).toUpperCase();
      const { data: inc } = await supabase.from("security_incidents").insert({
        incident_code: code, incident_type: "system_misconfiguration", severity: "critical",
        affected_modules: ["security_audit_console"], related_event_ids: result.tampered_ids,
        summary: `Audit integrity check failed: ${result.tampered} of ${result.checked} audit events tampered/forged.`,
        status: "open", opened_at: new Date().toISOString(), reported_by: isUuid(guard.actor.actor_id) ? guard.actor.actor_id : null,
        updated_at: new Date().toISOString(),
      }).select("incident_code").maybeSingle();
      incidentCode = ((inc as Record<string, unknown> | null)?.incident_code as string) ?? code;
    }
  }
  await createAuditEvent({ sourceModule: MOD, action: "verify_audit_chain", actor: guard.actor, entityType: "audit_events", entityId: "chain", reason: result.ok ? `verified ${result.checked} events` : `INTEGRITY FAILURE: ${result.tampered}/${result.checked} tampered` });
  return NextResponse.json(ok({ ...result, incident_code: incidentCode }, meta(guard.requestId, MOD)));
}
