import { describe, it, expect } from "vitest";
import { scanSuspiciousLogins, maxSeverity, type LoginEvent } from "@/server/security/suspiciousLogins";

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
