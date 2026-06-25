import { describe, it, expect } from "vitest";
import { scoreResponses } from "@/server/eval/scoring";

describe("OMR scoring (FR-OMR-SCORING-0008)", () => {
  const key = { answers: { Q1: "A", Q2: "B", Q3: "C", Q4: "D" }, marksCorrect: 1, marksWrong: 0 };

  it("scores an all-correct sheet", () => {
    expect(scoreResponses({ Q1: "A", Q2: "B", Q3: "C", Q4: "D" }, key)).toMatchObject({ score: 4, correct: 4, wrong: 0, unattempted: 0 });
  });
  it("scores a partial sheet (correct / wrong / blank)", () => {
    expect(scoreResponses({ Q1: "A", Q2: "X", Q3: "C", Q4: "" }, key)).toMatchObject({ score: 2, correct: 2, wrong: 1, unattempted: 1 });
  });
  it("scores an all-wrong sheet", () => {
    expect(scoreResponses({ Q1: "Z", Q2: "Z", Q3: "Z", Q4: "Z" }, key)).toMatchObject({ score: 0, correct: 0, wrong: 4 });
  });
  it("applies negative marking", () => {
    const nk = { answers: { Q1: "A", Q2: "B" }, marksCorrect: 4, marksWrong: 1 };
    expect(scoreResponses({ Q1: "A", Q2: "X" }, nk).score).toBe(3); // +4 correct, -1 wrong
  });
  it("matches case-insensitively and trims whitespace", () => {
    expect(scoreResponses({ Q1: " a " }, { answers: { Q1: "A" } }).correct).toBe(1);
  });
});
