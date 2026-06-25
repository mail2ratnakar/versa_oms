import { describe, it, expect } from "vitest";
import { answerKeyMaxScore, scoreToResultRow } from "@/server/results/resultHandoff";

describe("score->result handoff mapping (FR-RESULT-HANDOFF-0009)", () => {
  it("computes max score from the answer key (questions * marksCorrect)", () => {
    expect(answerKeyMaxScore({ answers: { Q1: "A", Q2: "B", Q3: "C", Q4: "D" }, marksCorrect: 1 })).toBe(4);
    expect(answerKeyMaxScore({ answers: { Q1: "A", Q2: "B" }, marksCorrect: 4 })).toBe(8);
    expect(answerKeyMaxScore({ Q1: "A", Q2: "B", Q3: "C" })).toBe(3); // flat map, default marks=1
    expect(answerKeyMaxScore(null)).toBe(0);
  });

  it("maps a score to a candidate_result row with a computed percentage", () => {
    const row = scoreToResultRow({ resultBatchId: "rb", score: { candidate_id: "C1", school_id: "s", raw_score: 2 }, gradeCode: "5", subjectCode: "MATH", maxScore: 4 });
    expect(row).toMatchObject({
      result_batch_id: "rb", candidate_id: "C1", school_id: "s", grade_code: "5", subject_code: "MATH",
      raw_score: 2, max_score: 4, percentage_score: 50, result_status: "generated",
      certificate_eligibility_status: "not_evaluated", result_version: "v1",
    });
  });

  it("computes perfect and zero percentages", () => {
    const mk = (raw: number) => scoreToResultRow({ resultBatchId: "rb", score: { candidate_id: "C", school_id: "s", raw_score: raw }, gradeCode: "5", subjectCode: "MATH", maxScore: 4 }).percentage_score;
    expect(mk(4)).toBe(100);
    expect(mk(0)).toBe(0);
    expect(mk(3)).toBe(75);
  });

  it("guards divide-by-zero (maxScore 0 -> percentage 0, never NaN/Infinity)", () => {
    const row = scoreToResultRow({ resultBatchId: "rb", score: { candidate_id: "C", school_id: "s", raw_score: 5 }, gradeCode: "5", subjectCode: "MATH", maxScore: 0 });
    expect(row.percentage_score).toBe(0);
  });
});
