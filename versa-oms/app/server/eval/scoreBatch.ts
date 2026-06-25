// OMR batch scoring (FRAMEWORK — FR-OMR-SCORING-0008). Wires the dead scoreResponses helper to real
// data: reads an import batch's candidate responses + the approved answer key, scores each candidate
// server-side, and persists evaluation_candidate_scores. (The standalone /api/staff/evaluation/score
// endpoint is a stateless scorer; this is the persistent, batch-driven path.)
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ValidationError } from "@/server/lib/defineModule";
import { scoreResponses, type AnswerKey } from "@/server/eval/scoring";
import type { Actor } from "@/server/types";

export type ScoreBatchResult = { score_batch_id: string; scored: number; score_batch_status: string };

export async function scoreBatch(input: { actor: Actor; scoreBatchId: string }): Promise<ScoreBatchResult> {
  const supabase = createSupabaseAdminClient();

  const { data: sb } = await supabase.from("evaluation_score_batches").select("*").eq("id", input.scoreBatchId).maybeSingle();
  if (!sb) throw new ValidationError([{ field: "id", message: "Score batch not found." }]);
  const batch = sb as Record<string, unknown>;
  const importBatchId = batch.import_batch_id as string;

  const { data: ak } = await supabase.from("evaluation_answer_keys").select("answer_key_payload, key_status").eq("id", batch.answer_key_id as string).maybeSingle();
  if (!ak) throw new ValidationError([{ field: "answer_key", message: "Answer key not found." }]);
  if (((ak as Record<string, unknown>).key_status as string) !== "approved") {
    throw new ValidationError([{ field: "answer_key", message: "Answer key must be approved before scoring." }]);
  }
  // Accept either the AnswerKey shape ({answers, marksCorrect, marksWrong}) or a flat {qid: correct} map.
  const raw = ((ak as Record<string, unknown>).answer_key_payload ?? {}) as Record<string, unknown>;
  const key: AnswerKey = raw.answers ? (raw as unknown as AnswerKey) : { answers: raw as Record<string, string> };
  if (!key.answers || Object.keys(key.answers).length === 0) {
    throw new ValidationError([{ field: "answer_key", message: "Answer key has no answers; cannot score." }]);
  }

  const { data: resp } = await supabase.from("evaluation_candidate_responses").select("*").eq("import_batch_id", importBatchId).is("archived_at", null);
  const responses = (resp ?? []) as Array<Record<string, unknown>>;
  if (!responses.length) throw new ValidationError([{ field: "responses", message: "No candidate responses to score." }]);

  let scored = 0;
  for (const r of responses) {
    const rp = (r.response_payload ?? {}) as Record<string, unknown>;
    const answers = (rp.responses ?? rp) as Record<string, string | null>;
    const s = scoreResponses(answers, key);
    const { error } = await supabase.from("evaluation_candidate_scores").upsert(
      {
        score_batch_id: input.scoreBatchId,
        candidate_id: r.candidate_id,
        school_id: r.school_id,
        raw_score: s.score,
        correct_count: s.correct,
        wrong_count: s.wrong,
        blank_count: s.unattempted,
        score_status: "scored",
      },
      { onConflict: "score_batch_id,candidate_id" } // the natural key fixed in migration 0023
    );
    if (error) throw new ValidationError([{ field: "scores", message: "Failed to persist a candidate score." }]);
    scored += 1;
  }

  await supabase
    .from("evaluation_score_batches")
    .update({ scored_count: scored, candidate_count: responses.length, score_batch_status: "scored", updated_at: new Date().toISOString() })
    .eq("id", input.scoreBatchId);
  await createAuditEvent({
    sourceModule: "evaluation_ops_score_batches", action: "score", actor: input.actor,
    entityType: "evaluation_score_batches", entityId: input.scoreBatchId, newStatus: "scored",
    reason: `scored ${scored} candidates against the approved answer key`,
  });

  return { score_batch_id: input.scoreBatchId, scored, score_batch_status: "scored" };
}
