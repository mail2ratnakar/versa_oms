import { describe, it, expect } from "vitest";
import { computeOnCreate } from "@/server/lib/createCompute";
import { DOMAIN_EFFECTS } from "@/server/certificates/certEffects";
import { publicVerificationResponse } from "@/server/eval/certificate";

describe("certificate identity is server-generated (P2.4 / P3.9)", () => {
  it("generates a CERT- number + VRS- verification code, overwriting client-supplied values", () => {
    const a = computeOnCreate("certificates", { certificate_number: "HACKED-001", verification_code: "GUESSABLE" });
    expect(a.certificate_number).toMatch(/^CERT-[0-9A-F]{8}$/);
    expect(a.verification_code).toMatch(/^VRS-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
    expect(a.certificate_number).not.toBe("HACKED-001");
  });
  it("codes are unique per call (unguessable)", () => {
    const x = computeOnCreate("certificates", {});
    const y = computeOnCreate("certificates", {});
    expect(x.verification_code).not.toBe(y.verification_code);
  });
});

describe("certificate domain effects + public projection (whitelist)", () => {
  it("publish + revoke effects are registered on the kernel domain-effect hook", () => {
    expect(typeof DOMAIN_EFFECTS["core_certificates:publish"]).toBe("function");
    expect(typeof DOMAIN_EFFECTS["core_certificates:revoke"]).toBe("function");
  });
  it("public verify response exposes ONLY whitelisted fields (no PII/scores/ids leak)", () => {
    const r = publicVerificationResponse({
      verification_code: "VRS-1", status: "valid", candidate_name: "A", olympiad_name: "O",
      award: "Gold", issued_on: "2026-01-01",
      student_id: "LEAK-ID", parent_contact: "9999999999", raw_score: 88, school_id: "S",
    } as Record<string, unknown>);
    expect(Object.keys(r).sort()).toEqual(
      ["award", "candidate_name", "integrity_verified", "issued_on", "olympiad_name", "verification_code", "verification_status"].sort()
    );
    const json = JSON.stringify(r);
    expect(json).not.toContain("LEAK-ID");
    expect(json).not.toContain("9999999999");
    expect(json).not.toContain("88");
  });
  it("reflects revoked + not_found states", () => {
    expect(publicVerificationResponse({ status: "revoked", verification_code: "x" }).verification_status).toBe("revoked");
    expect(publicVerificationResponse(null).verification_status).toBe("not_found");
  });
});
