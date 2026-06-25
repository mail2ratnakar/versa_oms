// Suspicious-login scan (FR-SUSPICIOUS-LOGIN-2026-0030). Repeated failed logins for the same identity
// (email / IP / staff) is a brute-force / credential-stuffing signal. PURE so it is unit-tested; the
// runner raises security_alerts + an incident on high risk.
export type LoginEvent = { event_type?: string | null; email_attempted?: string | null; ip_address?: string | null; staff_user_id?: string | null; device_fingerprint?: string | null };
export type LoginAlert = { key: string; failures: number; severity: string; risk_score: number; summary: string };
export type LoginAnomaly = { key: string; kind: "impossible_travel" | "new_device"; distinct: number; severity: string; risk_score: number; summary: string };

const FAILED = "login_failed";
const RANK: Record<string, number> = { info: 0, low: 1, medium: 2, high: 3, critical: 4 };
function severityFor(n: number): string { return n >= 10 ? "critical" : n >= 5 ? "high" : "medium"; }

/** Group failed-login events by identity; flag any identity at/over the threshold. */
export function scanSuspiciousLogins(events: LoginEvent[], threshold = 5): LoginAlert[] {
  const counts = new Map<string, number>();
  for (const e of events) {
    if (e.event_type !== FAILED) continue;
    const key = String(e.email_attempted || e.ip_address || e.staff_user_id || "unknown");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const out: LoginAlert[] = [];
  for (const [key, failures] of counts) {
    if (failures < threshold) continue;
    out.push({ key, failures, severity: severityFor(failures), risk_score: Math.min(100, failures * 10), summary: `${failures} failed login attempts for '${key}'` });
  }
  return out;
}

export function maxSeverity(alerts: Array<{ severity: string }>): string | null {
  if (!alerts.length) return null;
  return alerts.reduce<string>((m, a) => ((RANK[a.severity] ?? 2) > (RANK[m] ?? 0) ? a.severity : m), "info");
}

// Login anomalies on SUCCESSFUL logins (FR-LOGIN-ANOMALY-2026-0033 — negative pack login monitoring):
// the same identity authenticating from multiple distinct IPs (impossible travel) or multiple distinct
// devices (new device) in the window. PURE — grouped from the event set, no history lookup.
export function scanLoginAnomalies(events: LoginEvent[]): LoginAnomaly[] {
  const byKey = new Map<string, { ips: Set<string>; devices: Set<string> }>();
  for (const e of events) {
    if (e.event_type !== "login_success") continue;
    const key = String(e.email_attempted || e.staff_user_id || e.ip_address || "unknown");
    const rec = byKey.get(key) ?? { ips: new Set<string>(), devices: new Set<string>() };
    if (e.ip_address) rec.ips.add(String(e.ip_address));
    if (e.device_fingerprint) rec.devices.add(String(e.device_fingerprint));
    byKey.set(key, rec);
  }
  const out: LoginAnomaly[] = [];
  for (const [key, r] of byKey) {
    if (r.ips.size >= 2) out.push({ key, kind: "impossible_travel", distinct: r.ips.size, severity: r.ips.size >= 4 ? "high" : "medium", risk_score: Math.min(100, r.ips.size * 20), summary: `${r.ips.size} distinct source IPs for '${key}'` });
    if (r.devices.size >= 2) out.push({ key, kind: "new_device", distinct: r.devices.size, severity: r.devices.size >= 4 ? "high" : "medium", risk_score: Math.min(100, r.devices.size * 15), summary: `${r.devices.size} distinct devices for '${key}'` });
  }
  return out;
}
