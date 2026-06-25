// Suspicious-login scan (FR-SUSPICIOUS-LOGIN-2026-0030). Repeated failed logins for the same identity
// (email / IP / staff) is a brute-force / credential-stuffing signal. PURE so it is unit-tested; the
// runner raises security_alerts + an incident on high risk.
export type LoginEvent = { event_type?: string | null; email_attempted?: string | null; ip_address?: string | null; staff_user_id?: string | null };
export type LoginAlert = { key: string; failures: number; severity: string; risk_score: number; summary: string };

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

export function maxSeverity(alerts: LoginAlert[]): string | null {
  if (!alerts.length) return null;
  return alerts.reduce((m, a) => ((RANK[a.severity] ?? 2) > (RANK[m] ?? 0) ? a.severity : m), "info");
}
