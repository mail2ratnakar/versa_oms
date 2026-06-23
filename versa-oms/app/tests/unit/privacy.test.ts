import { describe, it, expect } from "vitest";
import { logger } from "@/server/lib/logger";
import { publicVerificationResponse } from "@/server/eval/certificate";

describe("privacy: log redaction", () => {
  it("redacts sensitive keys at multiple levels", () => {
    const r = logger.redact({
      action: "create",
      password: "p",
      nested: { answer_key: "ABCD", parent_phone: "9999", safe: "ok" },
    }) as Record<string, unknown>;
    expect(r.action).toBe("create");
    expect(r.password).toBe("[redacted]");
    const nested = r.nested as Record<string, unknown>;
    expect(nested.answer_key).toBe("[redacted]");
    expect(nested.parent_phone).toBe("[redacted]");
    expect(nested.safe).toBe("ok");
  });
});

describe("privacy: public verification leaks nothing private", () => {
  it("never returns private fields even if present on the row", () => {
    const resp = publicVerificationResponse({
      verification_code: "v",
      status: "valid",
      candidate_name: "Asha",
      olympiad_name: "Math",
      award: "Gold",
      issued_on: "2026-06-01",
      // private fields that must not appear:
      parent_phone: "9999999999",
      internal_note: "do not expose",
      raw_omr: "scan",
    } as Record<string, unknown>);
    const json = JSON.stringify(resp);
    expect(json).not.toContain("9999999999");
    expect(json).not.toContain("do not expose");
    expect(json).not.toContain("raw_omr");
    expect(resp.verification_status).toBe("valid");
  });
});
