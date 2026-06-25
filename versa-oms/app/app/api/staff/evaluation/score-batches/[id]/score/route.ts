// OMR scoring run (FR-OMR-SCORING-0008): score an evaluation score-batch against the approved
// answer key, persisting evaluation_candidate_scores. Custom sub-route (not a generic transition).
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { ok, err, meta } from "@/server/http/envelope";
import { ValidationError } from "@/server/lib/defineModule";
import { scoreBatch } from "@/server/eval/scoreBatch";

const M = "evaluation_ops_score_batches";

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireStaffScope(request, M, "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const { id } = await ctx.params;
  try {
    const data = await scoreBatch({ actor: guard.actor, scoreBatchId: id });
    return NextResponse.json(ok(data, meta(guard.requestId, M)));
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json(err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, M), { field_errors: e.fieldErrors }), { status: 422 });
    }
    return NextResponse.json(err("INTERNAL", "Unexpected error.", meta(guard.requestId, M)), { status: 500 });
  }
}
