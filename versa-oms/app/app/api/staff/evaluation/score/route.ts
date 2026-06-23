import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { scoreResponses, type AnswerKey } from "@/server/eval/scoring";
import { rankCandidates } from "@/server/eval/ranking";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ok, err, meta } from "@/server/http/envelope";

/**
 * OMR scoring: given an answer key + candidate responses, compute scores server-side
 * and a ranking snapshot. Pure computation (scoring/ranking modules); audited.
 */
export async function POST(request: NextRequest) {
  const guard = await requireStaffScope(request, "evaluation_ops", "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });

  let body: { answer_key?: AnswerKey; responses?: Array<{ candidate_id: string; responses: Record<string, string | null> }> };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }
  if (!body.answer_key?.answers || !Array.isArray(body.responses)) {
    return NextResponse.json(
      err("VALIDATION_FAILED", "answer_key.answers and responses[] are required.", meta(guard.requestId, "evaluation_ops")),
      { status: 422 }
    );
  }

  const scored = body.responses.map((r) => {
    const s = scoreResponses(r.responses, body.answer_key as AnswerKey);
    return { candidateId: r.candidate_id, score: s.score, correct: s.correct, wrong: s.wrong, unattempted: s.unattempted };
  });
  const ranked = rankCandidates(scored.map((s) => ({ candidateId: s.candidateId, score: s.score })));
  const rankByCand = new Map(ranked.map((r) => [r.candidateId, r.rank]));
  const results = scored.map((s) => ({ ...s, rank: rankByCand.get(s.candidateId) }));

  await createAuditEvent({
    sourceModule: "evaluation_ops",
    action: "score",
    actor: guard.actor,
    entityType: "evaluation_score_batch",
    entityId: String(body.responses.length),
    reason: `scored ${body.responses.length} candidates`,
  });

  return NextResponse.json(ok({ count: results.length, results }, meta(guard.requestId, "evaluation_ops")));
}
