import { describe, it, expect } from "vitest";
import { signPayload, verifySignature } from "@/server/finance/webhook";

describe("payment webhook signature", () => {
  const secret = "test-secret";
  const payload = JSON.stringify({ payment_id: "p1", status: "paid" });

  it("verifies a correctly signed payload", () => {
    const sig = signPayload(payload, secret);
    expect(verifySignature(payload, sig, secret)).toBe(true);
  });
  it("rejects a tampered payload", () => {
    const sig = signPayload(payload, secret);
    expect(verifySignature(JSON.stringify({ payment_id: "p1", status: "failed" }), sig, secret)).toBe(false);
  });
  it("rejects a wrong secret and empty signature", () => {
    const sig = signPayload(payload, secret);
    expect(verifySignature(payload, sig, "other")).toBe(false);
    expect(verifySignature(payload, "", secret)).toBe(false);
  });
});
