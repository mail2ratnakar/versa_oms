import { describe, it, expect } from "vitest";
import { parseOmrResponses } from "@/server/eval/omrIngest";

describe("OMR response parsing (FR-OMR-IMPORT-0010)", () => {
  it("parses candidate_id + question columns into per-candidate payloads", () => {
    const r = parseOmrResponses("candidate_id,Q1,Q2,Q3\nC1,A,B,C\nC2,A,X,\n");
    expect(r.ok).toBe(true);
    expect(r.rows).toEqual([
      { candidate_id: "C1", responses: { Q1: "A", Q2: "B", Q3: "C" } },
      { candidate_id: "C2", responses: { Q1: "A", Q2: "X", Q3: "" } },
    ]);
  });

  it("uppercases question headers and trims values", () => {
    const r = parseOmrResponses("candidate_id,q1\n C1 , a \n");
    expect(r.rows[0]).toEqual({ candidate_id: "C1", responses: { Q1: "a" } });
  });

  it("rejects a missing candidate_id column", () => {
    expect(parseOmrResponses("name,Q1\nx,A\n").ok).toBe(false);
  });

  it("rejects a file with no question columns", () => {
    const r = parseOmrResponses("candidate_id,name\nC1,x\n");
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toMatch(/question column/i);
  });

  it("flags blank + duplicate candidate rows instead of silently dropping them", () => {
    const r = parseOmrResponses("candidate_id,Q1\nC1,A\n,B\nC1,C\n");
    expect(r.rows.length).toBe(1); // only the first C1
    expect(r.errors.length).toBe(2); // 1 blank + 1 duplicate
  });

  it("ignores non-question columns (e.g. raw_scan_file)", () => {
    const r = parseOmrResponses("candidate_id,Q1,raw_scan_file\nC1,A,scan.png\n");
    expect(Object.keys(r.rows[0].responses)).toEqual(["Q1"]);
  });
});
