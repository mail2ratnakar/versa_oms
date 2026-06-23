import { describe, it, expect } from "vitest";
import { makeCandidateId, assignCandidateIds } from "@/server/eval/candidateId";
import { transitionJobs } from "@/server/jobs/triggers";

describe("candidate-ID generation", () => {
  it("formats padded, prefixed, sortable IDs", () => {
    expect(makeCandidateId("school_ab", 1)).toBe("SCHOOLAB-00001");
    expect(makeCandidateId("VRS", 42)).toBe("VRS-00042");
  });
  it("assigns a sequential block to ordered student ids", () => {
    const out = assignCandidateIds(["a", "b", "c"], "X", 5);
    expect(out.map((o) => o.candidate_id)).toEqual(["X-00005", "X-00006", "X-00007"]);
  });
  it("roster lock fires the candidate-ID generation job", () => {
    expect(transitionJobs("student_roster_ops", "lock")).toContain("roster.generate_candidate_ids");
  });
});
