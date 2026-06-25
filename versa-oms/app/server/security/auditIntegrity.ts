// Shared audit-integrity check (FR-SECURITY-AUDIT-VERIFY-0026 + sweep 0029). Pages through the ENTIRE
// append-only audit log, verifies each event's hash, and opens (or reuses) a critical incident on tamper.
// Called by the staff route AND the scheduled sweep job — single source, no duplication.
import { verifyAuditChain, type AuditRow } from "@/server/audit/verifyAuditChain";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import type { Actor } from "@/server/types";

type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export type AuditIntegrityResult = { ok: boolean; checked: number; tampered: number; tampered_ids: string[]; coverage: "full" | "partial"; incident_code: string | null };

export async function runAuditIntegrityCheck(supabase: Db, actor: Actor): Promise<AuditIntegrityResult> {
  const PAGE = 1000;
  const MAX_PAGES = 100; // bound the work (100k events); report 'partial' rather than silently truncate.
  const rows: AuditRow[] = [];
  let capped = false;
  for (let p = 0; p < MAX_PAGES; p++) {
    const { data } = await supabase.from("audit_events")
      .select("id, action, entity_name, entity_id, actor_role, new_status, prev_hash, event_hash")
      .order("created_at", { ascending: false }).range(p * PAGE, p * PAGE + PAGE - 1);
    if (!data || data.length === 0) break;
    rows.push(...(data as AuditRow[]));
    if (data.length < PAGE) break;
    if (p === MAX_PAGES - 1) capped = true;
  }
  const v = verifyAuditChain(rows);

  let incidentCode: string | null = null;
  if (!v.ok) {
    const { data: existing } = await supabase.from("security_incidents")
      .select("incident_code").eq("incident_type", "system_misconfiguration").eq("status", "open")
      .ilike("summary", "Audit integrity check failed%").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (existing) {
      incidentCode = String((existing as Record<string, unknown>).incident_code);
    } else {
      const code = "INC-" + crypto.randomUUID().slice(0, 8).toUpperCase();
      const { data: inc } = await supabase.from("security_incidents").insert({
        incident_code: code, incident_type: "system_misconfiguration", severity: "critical",
        affected_modules: ["security_audit_console"], related_event_ids: v.tampered_ids,
        summary: `Audit integrity check failed: ${v.tampered} of ${v.checked} audit events tampered/forged.`,
        status: "open", opened_at: new Date().toISOString(), reported_by: isUuid(actor.actor_id) ? actor.actor_id : null,
        updated_at: new Date().toISOString(),
      }).select("incident_code").maybeSingle();
      incidentCode = ((inc as Record<string, unknown> | null)?.incident_code as string) ?? code;
    }
  }
  await createAuditEvent({ sourceModule: "security_audit_console", action: "verify_audit_chain", actor, entityType: "audit_events", entityId: "chain", reason: v.ok ? `verified ${v.checked} events` : `INTEGRITY FAILURE: ${v.tampered}/${v.checked} tampered` });
  return { ...v, coverage: capped ? "partial" : "full", incident_code: incidentCode };
}
