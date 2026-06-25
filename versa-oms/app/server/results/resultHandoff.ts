// Score -> result handoff (FRAMEWORK — FR-RESULT-HANDOFF-0009). Turns an evaluation score batch's
// candidate scores into a result batch's candidate_results, ready for ranking. The mapping is pure
// (unit-tested); the DB copy is idempotent. Completes the chain: scores -> results -> ranking -> cert.
import type { Actor } from "@/server/types";

type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;

// max_score = number of questions * marks-per-correct. Accepts the AnswerKey shape ({answers, marksCorrect})
// or a flat {qid: correct} map. Pure.
export function answerKeyMaxScore(payload: unknown): number {
  const p = (payload ?? {}) as Record<string, unknown>;
  const answers = (p.answers ?? p) as Record<string, unknown>;
  const marks = Number(p.marksCorrect ?? 1);
  return Object.keys(answers ?? {}).length * (Number.isFinite(marks) ? marks : 1);
}

// Map one candidate score -> a candidate_results insert row. Pure (percentage computed, never client-set).
export function scoreToResultRow(input: {
  resultBatchId: string;
  score: { candidate_id: string; school_id: string; raw_score: number | string };
  gradeCode: string;
  subjectCode: string;
  maxScore: number;
}): Record<string, unknown> {
  const raw = Number(input.score.raw_score) || 0;
  const pct = input.maxScore > 0 ? Math.round((raw / input.maxScore) * 10000) / 100 : 0;
  return {
    result_batch_id: input.resultBatchId,
    candidate_id: input.score.candidate_id,
    school_id: input.score.school_id,
    grade_code: input.gradeCode,
    subject_code: input.subjectCode,
    raw_score: raw,
    max_score: input.maxScore,
    percentage_score: pct,
    result_status: "generated",
    certificate_eligibility_status: "not_evaluated",
    result_version: "v1",
  };
}

// Populate candidate_results for a result batch from its linked (scored) score batch. Idempotent
// upsert on the natural key (result_batch_id, candidate_id, subject_code). Returns rows written.
export async function handoffScoresToResults(supabase: Db, resultBatchId: string): Promise<number> {
  const { data: rb } = await supabase.from("result_batches").select("evaluation_score_batch_id").eq("id", resultBatchId).maybeSingle();
  const scoreBatchId = (rb as Record<string, unknown> | null)?.evaluation_score_batch_id as string | undefined;
  if (!scoreBatchId) return 0;
  const { data: sb } = await supabase.from("evaluation_score_batches").select("answer_key_id").eq("id", scoreBatchId).maybeSingle();
  const akId = (sb as Record<string, unknown> | null)?.answer_key_id as string | undefined;
  if (!akId) return 0;
  const { data: ak } = await supabase.from("evaluation_answer_keys").select("answer_key_payload, subject_code, grade_code").eq("id", akId).maybeSingle();
  const key = ak as Record<string, unknown> | null;
  if (!key) return 0;
  const maxScore = answerKeyMaxScore(key.answer_key_payload);
  const { data: scores } = await supabase.from("evaluation_candidate_scores").select("candidate_id, school_id, raw_score").eq("score_batch_id", scoreBatchId);
  const rows = ((scores ?? []) as Array<{ candidate_id: string; school_id: string; raw_score: number }>).map((s) =>
    scoreToResultRow({ resultBatchId, score: s, gradeCode: String(key.grade_code ?? ""), subjectCode: String(key.subject_code ?? ""), maxScore })
  );
  if (!rows.length) return 0;
  await supabase.from("candidate_results").upsert(rows, { onConflict: "result_batch_id,candidate_id,subject_code" });
  return rows.length;
}
