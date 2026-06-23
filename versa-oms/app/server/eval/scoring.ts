/**
 * OMR scoring. Pure: given a candidate's responses and the answer key, compute
 * the score. Supports per-question marks and negative marking. No I/O.
 */
export type AnswerKey = {
  // questionId -> correct option(s)
  answers: Record<string, string>;
  marksCorrect?: number;
  marksWrong?: number; // negative marking (>=0; subtracted)
};

export type ScoreResult = {
  score: number;
  correct: number;
  wrong: number;
  unattempted: number;
  total: number;
};

export function scoreResponses(responses: Record<string, string | null>, key: AnswerKey): ScoreResult {
  const marksCorrect = key.marksCorrect ?? 1;
  const marksWrong = key.marksWrong ?? 0;
  let correct = 0;
  let wrong = 0;
  let unattempted = 0;
  const qids = Object.keys(key.answers);
  for (const q of qids) {
    const given = responses[q];
    if (given === null || given === undefined || given === "") {
      unattempted++;
      continue;
    }
    if (String(given).trim().toUpperCase() === String(key.answers[q]).trim().toUpperCase()) correct++;
    else wrong++;
  }
  const score = correct * marksCorrect - wrong * marksWrong;
  return { score, correct, wrong, unattempted, total: qids.length };
}
