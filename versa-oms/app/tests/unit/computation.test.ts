import { describe, it, expect } from "vitest";
import { scoreResponses } from "@/server/eval/scoring";
import { rankCandidates } from "@/server/eval/ranking";
import { generateVerificationCode, buildPublicVerification, publicVerificationResponse, qrPayload } from "@/server/eval/certificate";
import { assertNotPublished, nextResultVersion, ImmutableError } from "@/server/eval/immutability";

describe("OMR scoring", () => {
  const key = { answers: { q1: "A", q2: "B", q3: "C" }, marksCorrect: 4, marksWrong: 1 };
  it("scores correct/wrong/unattempted with negative marking", () => {
    const r = scoreResponses({ q1: "A", q2: "X", q3: null }, key);
    expect(r.correct).toBe(1);
    expect(r.wrong).toBe(1);
    expect(r.unattempted).toBe(1);
    expect(r.score).toBe(4 * 1 - 1 * 1);
  });
  it("is case-insensitive and full marks on all correct", () => {
    const r = scoreResponses({ q1: "a", q2: "b", q3: "c" }, key);
    expect(r.score).toBe(12);
    expect(r.wrong).toBe(0);
  });
});

describe("ranking snapshot (competition ranking)", () => {
  it("assigns 1,2,2,4 with ties", () => {
    const ranked = rankCandidates([
      { candidateId: "a", score: 90 },
      { candidateId: "b", score: 80 },
      { candidateId: "c", score: 80 },
      { candidateId: "d", score: 70 },
    ]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 2, 4]);
  });
});

describe("certificate verification + public projection", () => {
  it("generates a stable verification code + QR payload", () => {
    const code = generateVerificationCode("cert-1");
    expect(code).toMatch(/^VRS-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
    expect(generateVerificationCode("cert-1")).toBe(code);
    expect(qrPayload(code, "https://x")).toBe(`https://x/verify/certificate/${code}`);
  });
  it("public projection exposes ONLY whitelisted fields", () => {
    const cert = { id: "c1", candidate_name: "Asha", olympiad_name: "Math", award: "Gold", status: "valid", issued_on: "2026-06-01", parent_phone: "9999", internal_note: "secret", score: 98 };
    const pub = buildPublicVerification(cert, "VRS-1");
    expect(Object.keys(pub).sort()).toEqual(["award", "candidate_name", "certificate_id", "issued_on", "olympiad_name", "status", "verification_code"].sort());
    expect(JSON.stringify(pub)).not.toContain("9999");
    expect(JSON.stringify(pub)).not.toContain("secret");
  });
  it("verify response hides private fields and reflects revoked", () => {
    const ok = publicVerificationResponse({ verification_code: "v", status: "valid", candidate_name: "A", olympiad_name: "M", award: "Gold", issued_on: "2026-06-01" });
    expect(ok.verification_status).toBe("valid");
    expect("parent_phone" in ok).toBe(false);
    const rev = publicVerificationResponse({ verification_code: "v", status: "revoked" });
    expect(rev.verification_status).toBe("revoked");
    expect(publicVerificationResponse(null).verification_status).toBe("not_found");
  });
});

describe("result immutability + versioning", () => {
  it("blocks editing a published result and bumps version on correction", () => {
    expect(() => assertNotPublished("published")).toThrow(ImmutableError);
    expect(() => assertNotPublished("draft")).not.toThrow();
    const v = nextResultVersion({ version: "v1" });
    expect(v.version).toBe("v2");
    expect(v.supersedes_version).toBe("v1");
    expect(v.status).toBe("correction_pending");
  });
});
