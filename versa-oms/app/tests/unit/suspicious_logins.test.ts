import { describe, it, expect } from "vitest";
import { scanSuspiciousLogins, scanLoginAnomalies, maxSeverity, type LoginEvent } from "@/server/security/suspiciousLogins";

const fail = (email: string): LoginEvent => ({ event_type: "login_failed", email_attempted: email });
const ok = (email: string): LoginEvent => ({ event_type: "login_success", email_attempted: email });

describe("suspicious login scan (FR-SUSPICIOUS-LOGIN-2026-0030)", () => {
  it("no alert below the threshold", () => {
    expect(scanSuspiciousLogins([fail("a@x"), fail("a@x"), fail("a@x")], 5)).toEqual([]);
  });
  it("flags an identity at/over the threshold (with count + severity)", () => {
    const a = scanSuspiciousLogins(Array.from({ length: 6 }, () => fail("a@x")), 5);
    expect(a).toHaveLength(1);
    expect(a[0]).toMatchObject({ key: "a@x", failures: 6, severity: "high" });
    expect(a[0].risk_score).toBe(60);
  });
  it("only counts failures, not successes", () => {
    const events = [...Array.from({ length: 5 }, () => fail("a@x")), ok("a@x"), ok("a@x")];
    expect(scanSuspiciousLogins(events, 5)).toHaveLength(1);
  });
  it("severity escalates to critical at 10+", () => {
    const a = scanSuspiciousLogins(Array.from({ length: 12 }, () => fail("a@x")), 5);
    expect(a[0].severity).toBe("critical");
  });
  it("groups by identity (separate emails are separate alerts)", () => {
    const events = [...Array.from({ length: 5 }, () => fail("a@x")), ...Array.from({ length: 5 }, () => fail("b@x"))];
    const a = scanSuspiciousLogins(events, 5);
    expect(a).toHaveLength(2);
    expect(maxSeverity(a)).toBe("high");
  });
  it("falls back to IP then staff when no email", () => {
    const events = Array.from({ length: 5 }, () => ({ event_type: "login_failed", ip_address: "1.2.3.4" } as LoginEvent));
    expect(scanSuspiciousLogins(events, 5)[0].key).toBe("1.2.3.4");
  });
});

const ok2 = (email: string, ip: string, dev?: string): LoginEvent => ({ event_type: "login_success", email_attempted: email, ip_address: ip, device_fingerprint: dev });

describe("login anomalies — impossible travel / new device (FR-LOGIN-ANOMALY-2026-0033)", () => {
  it("no anomaly for a single IP + single device", () => {
    expect(scanLoginAnomalies([ok2("a@x", "1.1.1.1", "d1"), ok2("a@x", "1.1.1.1", "d1")])).toEqual([]);
  });
  it("flags impossible travel (multiple distinct IPs for one identity)", () => {
    const a = scanLoginAnomalies([ok2("a@x", "1.1.1.1"), ok2("a@x", "2.2.2.2")]);
    const it = a.find((x) => x.kind === "impossible_travel");
    expect(it?.distinct).toBe(2);
  });
  it("flags new device (multiple distinct device fingerprints)", () => {
    const a = scanLoginAnomalies([ok2("a@x", "1.1.1.1", "d1"), ok2("a@x", "1.1.1.1", "d2")]);
    expect(a.find((x) => x.kind === "new_device")?.distinct).toBe(2);
  });
  it("severity escalates to high at 4+ distinct IPs", () => {
    const a = scanLoginAnomalies(["1.1.1.1", "2.2.2.2", "3.3.3.3", "4.4.4.4"].map((ip) => ok2("a@x", ip)));
    expect(a.find((x) => x.kind === "impossible_travel")?.severity).toBe("high");
  });
  it("only counts successful logins", () => {
    const events = [ok2("a@x", "1.1.1.1"), { event_type: "login_failed", email_attempted: "a@x", ip_address: "2.2.2.2" } as LoginEvent];
    expect(scanLoginAnomalies(events)).toEqual([]);
  });
});
