// Shared suspicious-login runner (FR-SUSPICIOUS-LOGIN-2026-0030 + sweep). Loads recent failed logins, runs
// the PURE scan, raises security_alerts (idempotent), and opens an incident on high/critical. Called by the
// staff route AND the scheduled sweep job — single source.
import { scanSuspiciousLogins, scanLoginAnomalies, maxSeverity, type LoginEvent } from "@/server/security/suspiciousLogins";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import type { Actor } from "@/server/types";
import { createHash } from "node:crypto";

type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const HIGH = new Set(["high", "critical"]);
const LOCK_THRESHOLD = 10; // failed logins for one identity that trigger an automatic account lock

export type LoginScanResult = { scanned_events: number; alerts: number; by_severity: Record<string, number>; auto_locked: number; incident_code: string | null };

export async function runSuspiciousLoginScan(supabase: Db, actor: Actor, threshold = 5): Promise<LoginScanResult> {
  const events = ((await supabase.from("staff_login_events").select("event_type, email_attempted, ip_address, staff_user_id, device_fingerprint")
    .in("event_type", ["login_failed", "login_success"]).order("created_at", { ascending: false }).limit(5000)).data ?? []) as LoginEvent[];
  const bruteAlerts = scanSuspiciousLogins(events, threshold);
  const anomalies = scanLoginAnomalies(events);

  // Brute-force alerts.
  for (const a of bruteAlerts) {
    const code = "LOGIN-" + createHash("sha256").update(a.key).digest("hex").slice(0, 10).toUpperCase();
    await supabase.from("security_alerts").upsert({
      alert_code: code, alert_source: "login_monitor", alert_type: "brute_force", severity: a.severity,
      risk_score: a.risk_score, summary: a.summary, details: { identity: a.key, failures: a.failures },
      alert_status: "new", updated_at: new Date().toISOString(),
    }, { onConflict: "alert_code", ignoreDuplicates: false });
  }
  // Login anomalies (impossible travel / new device).
  for (const a of anomalies) {
    const code = "LOGIN-" + a.kind.toUpperCase().slice(0, 3) + "-" + createHash("sha256").update(a.key).digest("hex").slice(0, 10).toUpperCase();
    await supabase.from("security_alerts").upsert({
      alert_code: code, alert_source: "login_monitor", alert_type: a.kind, severity: a.severity,
      risk_score: a.risk_score, summary: a.summary, details: { identity: a.key, distinct: a.distinct },
      alert_status: "new", updated_at: new Date().toISOString(),
    }, { onConflict: "alert_code", ignoreDuplicates: false });
  }

  // Auto-lock: an active, non-super-admin staff with >= LOCK_THRESHOLD failed logins is suspended
  // (protective). The last-super-admin guard already protects super admins; we also skip them here.
  let autoLocked = 0;
  for (const a of bruteAlerts) {
    if (a.failures < LOCK_THRESHOLD) continue;
    const { data: staff } = await supabase.from("staff_profiles")
      .select("id, primary_role, staff_status").eq("email", a.key).maybeSingle();
    const s = staff as Record<string, unknown> | null;
    if (!s || s.staff_status !== "active" || s.primary_role === "super_admin") continue;
    await supabase.from("staff_profiles").update({ staff_status: "suspended", updated_at: new Date().toISOString() }).eq("id", s.id as string);
    await supabase.from("staff_access_events").insert({
      staff_profile_id: s.id, event_code: "auto_locked", event_source: "system",
      previous_status: "active", new_status: "suspended", reason: `auto-locked after ${a.failures} failed logins`,
    });
    await createAuditEvent({ sourceModule: "security_audit_console", action: "auto_lock_account", actor, entityType: "staff_profiles", entityId: String(s.id), newStatus: "suspended", reason: `auto-locked after ${a.failures} failed logins` });
    autoLocked++;
  }

  const alerts = [...bruteAlerts, ...anomalies];
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
      const summary = `Suspicious logins detected: ${alerts.length} signal(s) (brute-force / impossible-travel / new-device), highest severity ${top}.`;
      const { data: inc } = await supabase.from("security_incidents").insert({
        incident_code: code, incident_type: "unauthorized_access", severity: top,
        affected_modules: ["security_audit_console"], related_event_ids: [],
        summary, status: "open", opened_at: new Date().toISOString(), reported_by: isUuid(actor.actor_id) ? actor.actor_id : null,
        updated_at: new Date().toISOString(),
      }).select("id, incident_code").maybeSingle();
      incidentCode = ((inc as Record<string, unknown> | null)?.incident_code as string) ?? code;
      if (inc) { const { notifyIncidentOpened } = await import("@/server/security/incidentNotify"); await notifyIncidentOpened(supabase, { id: String((inc as Record<string, unknown>).id), code: incidentCode, summary, severity: top }, actor); }
    }
  }

  await createAuditEvent({ sourceModule: "security_audit_console", action: "suspicious_login_scan", actor, entityType: "security_alerts", entityId: "scan", reason: `scanned ${events.length} login events -> ${alerts.length} alert(s)` });
  const bySeverity = alerts.reduce<Record<string, number>>((acc, a) => ((acc[a.severity] = (acc[a.severity] ?? 0) + 1), acc), {});
  return { scanned_events: events.length, alerts: alerts.length, by_severity: bySeverity, auto_locked: autoLocked, incident_code: incidentCode };
}
