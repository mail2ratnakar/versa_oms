import { describe, it, expect } from "vitest";
import { certificateSeal, verifyCertificateSeal, publicVerificationResponse } from "@/server/eval/certificate";

const fields = { verification_code: "VRS-1", candidate_name: "Anita", olympiad_name: "Maths", award: "Gold", issued_on: "2026-01-01", status: "valid" };

describe("certificate digital seal (FR-CERT-SEAL-0011)", () => {
  it("is deterministic for the same fields + secret", () => {
    expect(certificateSeal(fields)).toBe(certificateSeal({ ...fields }));
  });

  it("changes if ANY sealed field is altered (tamper detection)", () => {
    const base = certificateSeal(fields);
    for (const k of ["verification_code", "candidate_name", "olympiad_name", "award", "issued_on", "status"]) {
      expect(certificateSeal({ ...fields, [k]: "TAMPERED" }), `seal must change when ${k} changes`).not.toBe(base);
    }
  });

  it("changes with the signing secret (unforgeable without it)", () => {
    expect(certificateSeal(fields, "secret-A")).not.toBe(certificateSeal(fields, "secret-B"));
  });

  it("verifyCertificateSeal: true for a matching seal, false for tampered/missing/garbage", () => {
    const seal = certificateSeal(fields);
    expect(verifyCertificateSeal(fields, seal)).toBe(true);
    expect(verifyCertificateSeal({ ...fields, candidate_name: "Other" }, seal)).toBe(false);
    expect(verifyCertificateSeal(fields, null)).toBe(false);
    expect(verifyCertificateSeal(fields, "deadbeef")).toBe(false);
  });

  it("publicVerificationResponse: integrity_verified reflects the stored seal", () => {
    expect(publicVerificationResponse({ ...fields, content_hash: certificateSeal(fields) }).integrity_verified).toBe(true);
    // a tampered field with the original seal -> integrity fails
    expect(publicVerificationResponse({ ...fields, candidate_name: "Hacked", content_hash: certificateSeal(fields) }).integrity_verified).toBe(false);
    expect(publicVerificationResponse(null).integrity_verified).toBe(false);
  });
});
