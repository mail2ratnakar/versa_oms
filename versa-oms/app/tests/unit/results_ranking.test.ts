import { describe, it, expect } from "vitest";
import { rankCandidates } from "@/server/eval/ranking";
import { assertNotPublished, ImmutableError, nextResultVersion } from "@/server/eval/immutability";
import { RESULT_DOMAIN_EFFECTS } from "@/server/results/resultEffects";

describe("results ranking — competition ranking (FR-RESULTS-RANKING-0006)", () => {
  it("ranks by score desc with ties sharing a rank (1,2,2,4)", () => {
    const r = rankCandidates([
      { candidateId: "a", score: 95 }, { candidateId: "b", score: 80 },
      { candidateId: "c", score: 80 }, { candidateId: "d", score: 20 },
    ]);
    expect(Object.fromEntries(r.map((x) => [x.candidateId, x.rank]))).toEqual({ a: 1, b: 2, c: 2, d: 4 });
  });
  it("orders ties by tie-break (higher first)", () => {
    const r = rankCandidates([{ candidateId: "a", score: 80, tieBreak: 5 }, { candidateId: "b", score: 80, tieBreak: 9 }]);
    expect(r[0].candidateId).toBe("b");
  });
});

describe("published-result immutability + versioning", () => {
  it("blocks editing a published result in place", () => {
    expect(() => assertNotPublished("published")).toThrow(ImmutableError);
    expect(() => assertNotPublished("partially_published")).toThrow(ImmutableError);
  });
  it("allows editing non-published states", () => {
    expect(() => assertNotPublished("ranked")).not.toThrow();
    expect(() => assertNotPublished(null)).not.toThrow();
  });
  it("a correction creates a superseding version", () => {
    expect(nextResultVersion({ version: "v1" })).toMatchObject({ version: "v2", supersedes_version: "v1", status: "correction_pending" });
  });
});

describe("ranking domain effect is wired", () => {
  it("registers results_ops:generate", () => {
    expect(typeof RESULT_DOMAIN_EFFECTS["results_ops:generate"]).toBe("function");
  });
});
