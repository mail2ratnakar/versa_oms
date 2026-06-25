import { describe, it, expect } from "vitest";
import { partitionByRoster } from "@/server/eval/omrIngest";

const row = (candidate_id: string) => ({ candidate_id, responses: { Q1: "A" } });

describe("answer-sheet roster validation (FR-ANSWER-SHEET-ROSTER-VALIDATION-0020)", () => {
  it("accepts candidate_ids in the roster, rejects the unknown ones", () => {
    const roster = new Set(["E2ECH3SCH-00001", "E2ECH3SCH-00002"]);
    const r = partitionByRoster([row("E2ECH3SCH-00001"), row("FAKE-99999"), row("E2ECH3SCH-00002")], roster);
    expect(r.valid.map((x) => x.candidate_id)).toEqual(["E2ECH3SCH-00001", "E2ECH3SCH-00002"]);
    expect(r.unknown).toEqual(["FAKE-99999"]);
  });
  it("rejects all rows when the roster is empty (fail-safe)", () => {
    const r = partitionByRoster([row("X"), row("Y")], new Set());
    expect(r.valid).toEqual([]);
    expect(r.unknown).toEqual(["X", "Y"]);
  });
  it("accepts all when every candidate_id is known", () => {
    const r = partitionByRoster([row("A"), row("B")], new Set(["A", "B"]));
    expect(r.unknown).toEqual([]);
    expect(r.valid.length).toBe(2);
  });
  it("empty input -> empty partitions", () => {
    const r = partitionByRoster([], new Set(["A"]));
    expect(r.valid).toEqual([]);
    expect(r.unknown).toEqual([]);
  });
});
