// Shared suspicious-login runner (FR-SUSPICIOUS-LOGIN-2026-0030 + sweep). Loads recent failed logins, runs
// the PURE scan, raises security_alerts (idempotent), and opens an incident on high/critical. Called by the
// staff route AND the scheduled sweep job — single source.
import { scanSuspiciousLogins, maxSeverity, type LoginEvent } from "@/server/security/suspiciousLogins";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import type { Actor } from "@/server/types";
import { createHash } from "node:crypto";

type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const HIGH = new Set(["high", "critical"]);

export type LoginScanResult = { scanned_events: number; alerts: number; by_severity: Record<string, number>; incident_code: string | null };

export async function runSuspiciousLoginScan(supabase: Db, actor: Actor, threshold = 5): Promise<LoginScanResult> {
  const events = ((await supabase.from("staff_login_events").select("event_type, email_attempted, ip_address, staff_user_id")
    .eq("event_type", "login_failed").order("created_at", { ascending: false }).limit(5000)).data ?? []) as LoginEvent[];
  const alerts = scanSuspiciousLogins(events, threshold);

  for (const a of alerts) {
    const code = "LOGIN-" + createHash("sha256").update(a.key).digest("hex").slice(0, 10).toUpperCase();
    await supabase.from("security_alerts").upsert({
      alert_code: code, alert_source: "login_monitor", alert_type: "brute_force", severity: a.severity,
      risk_score: a.risk_score, summary: a.summary, details: { identity: a.key, failures: a.failures },
      alert_status: "new", updated_at: new Date().toISOString(),
    }, { onConflict: "alert_code", ignoreDuplicates: false });
  }

  const top = maxSeverity(alerts);
  let incidentCode: string | null = null;
  if (top && HIGH.has(top)) {
    const { data: existing } = await supabase.from("security_incidents")
      .select("incident_code").eq("incident_type", "unauthorized_access").eq("status", "open")
      .ilike("summary", "Suspicious logins detected%").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (existing) {
      incidentCode = String((existing as Record<string, unknown>).incident_code);
    } else {
      const code = "INC-" + crypto.randomUUID().slice(0, 8).toUpperCase();
      const { data: inc } = await supabase.from("security_incidents").insert({
        incident_code: code, incident_type: "unauthorized_access", severity: top,
        affected_modules: ["security_audit_console"], related_event_ids: [],
        summary: `Suspicious logins detected: ${alerts.length} identity(ies) over the failed-login threshold, highest severity ${top}.`,
        status: "open", opened_at: new Date().toISOString(), reported_by: isUuid(actor.actor_id) ? actor.actor_id : null,
        updated_at: new Date().toISOString(),
      }).select("incident_code").maybeSingle();
      incidentCode = ((inc as Record<string, unknown> | null)?.incident_code as string) ?? code;
    }
  }

  await createAuditEvent({ sourceModule: "security_audit_console", action: "suspicious_login_scan", actor, entityType: "security_alerts", entityId: "scan", reason: `scanned ${events.length} failed logins -> ${alerts.length} alert(s)` });
  const bySeverity = alerts.reduce<Record<string, number>>((acc, a) => ((acc[a.severity] = (acc[a.severity] ?? 0) + 1), acc), {});
  return { scanned_events: events.length, alerts: alerts.length, by_severity: bySeverity, incident_code: incidentCode };
}
