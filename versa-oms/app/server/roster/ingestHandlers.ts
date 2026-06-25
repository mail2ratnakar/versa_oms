// Route-handler factory for roster file ingestion (FRAMEWORK). Shared by the
// school self-upload route and the staff upload-on-behalf route — both POST the
// uploaded file to /<base>/[id]/ingest and run the same ingestService.
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { requireSchoolScope } from "@/server/guards/requireSchoolScope";
import { ok, err, meta } from "@/server/http/envelope";
import { ValidationError } from "@/server/lib/defineModule";
import { ingestRosterBatch, type IngestPayload } from "@/server/roster/ingestService";

type Ctx = { params: Promise<Record<string, string>> };

export function makeRosterIngestHandler(moduleId: string, scope: "staff" | "school") {
  async function POST(request: NextRequest, ctx: Ctx) {
    const guard = scope === "staff"
      ? await requireStaffScope(request, moduleId, "write")
      : await requireSchoolScope(request, moduleId);
    if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });

    const { id } = await ctx.params;
    let payload: IngestPayload;
    try {
      payload = (await request.json()) as IngestPayload;
    } catch {
      payload = {};
    }
    try {
      const data = await ingestRosterBatch({ actor: guard.actor, moduleId, batchId: id, payload });
      return NextResponse.json(ok(data, meta(guard.requestId, moduleId)));
    } catch (e) {
      if (e instanceof ValidationError) {
        return NextResponse.json(
          err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, moduleId), { field_errors: e.fieldErrors }),
          { status: 422 }
        );
      }
      return NextResponse.json(err("INTERNAL", "Unexpected error.", meta(guard.requestId, moduleId)), { status: 500 });
    }
  }
  return { POST };
}
