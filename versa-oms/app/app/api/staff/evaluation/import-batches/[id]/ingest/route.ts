// OMR response import (FR-OMR-IMPORT-0010): upload a candidate-responses CSV into an import batch.
// Custom sub-route; parse + scope + audit live in @/server/eval/omrIngest.
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { ok, err, meta } from "@/server/http/envelope";
import { ValidationError } from "@/server/lib/defineModule";
import { ingestOmrBatch } from "@/server/eval/omrIngest";

const M = "evaluation_ops_import_batches";

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireStaffScope(request, M, "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const { id } = await ctx.params;
  let body: { content?: string; filename?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }
  try {
    const data = await ingestOmrBatch({ actor: guard.actor, importBatchId: id, content: body.content, filename: body.filename });
    return NextResponse.json(ok(data, meta(guard.requestId, M)));
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json(err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, M), { field_errors: e.fieldErrors }), { status: 422 });
    }
    return NextResponse.json(err("INTERNAL", "Unexpected error.", meta(guard.requestId, M)), { status: 500 });
  }
}
