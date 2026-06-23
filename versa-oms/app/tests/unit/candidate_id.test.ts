import { describe, it, expect } from "vitest";
import { makeCandidateId, assignCandidateIds } from "@/server/eval/candidateId";
import { TRANSITION_EFFECTS } from "@/server/lib/transitionEffects";

describe("candidate-ID generation", () => {
  it("formats padded, prefixed, sortable IDs", () => {
    expect(makeCandidateId("school_ab", 1)).toBe("SCHOOLAB-00001");
    expect(makeCandidateId("VRS", 42)).toBe("VRS-00042");
  });
  it("assigns a sequential block to ordered student ids", () => {
    const out = assignCandidateIds(["a", "b", "c"], "X", 5);
    expect(out.map((o) => o.candidate_id)).toEqual(["X-00005", "X-00006", "X-00007"]);
  });
  it("roster lock is wired to the CHAIN-003 effect (candidate IDs + eligibility)", () => {
    expect(typeof TRANSITION_EFFECTS["student_roster_ops:lock"]).toBe("function");
  });
});
