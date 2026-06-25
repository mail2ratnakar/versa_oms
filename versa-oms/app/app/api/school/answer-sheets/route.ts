// FR-ANSWER-SHEET-UPLOAD-2026-0019: a school returns its administered answer sheets. POST creates an
// import batch ON THE SCHOOL'S BEHALF (uploaded_by is a staff FK, so the system id is used; the real
// school actor is recorded in the audit) for the school's exam cycle, then ingests the OMR rows (reuses
// FR-OMR-IMPORT-0010). GET lists the school's own answer-sheet batches (downstream visibility).
import { NextRequest, NextResponse } from "next/server";
import { requireSchoolScope } from "@/server/guards/requireSchoolScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ingestOmrBatch } from "@/server/eval/omrIngest";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { SYSTEM_STAFF_ID } from "@/server/auth/actor";
import { ValidationError } from "@/server/lib/defineModule";
import { ok, err, meta } from "@/server/http/envelope";

const MOD = "school_answer_sheets";

export async function GET(request: NextRequest) {
  const guard = await requireSchoolScope(request, MOD);
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("evaluation_import_batches")
    .select("id, import_batch_code, source_type, batch_status, imported_sheet_count, valid_sheet_count, invalid_sheet_count, created_at")
    .eq("school_id", guard.actor.school_id ?? "__none__").eq("source_type", "school_upload").is("archived_at", null)
    .order("created_at", { ascending: false }).limit(100);
  return NextResponse.json(ok({ items: data ?? [], pagination: { page: 1, page_size: 100, total_count: (data ?? []).length, has_next: false, next_cursor: null } }, meta(guard.requestId, MOD)));
}

export async function POST(request: NextRequest) {
  const guard = await requireSchoolScope(request, MOD);
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const schoolId = String(guard.actor.school_id ?? "");
  if (!schoolId) return NextResponse.json(err("FORBIDDEN", "No school in scope.", meta(guard.requestId, MOD)), { status: 403 });
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { body = {}; }
  const content = String(body.content ?? "");
  if (!content.trim()) return NextResponse.json(err("VALIDATION_FAILED", "An answer-sheet CSV is required.", meta(guard.requestId, MOD), { field_errors: [{ field: "content", message: "An answer-sheet CSV is required." }] }), { status: 422 });

  const supabase = createSupabaseAdminClient();
  // Resolve the school's exam cycle: participation -> olympiad -> exam_cycle (server-side; not from the client).
  const { data: part } = await supabase.from("participations").select("olympiad_id").eq("school_id", schoolId).is("archived_at", null).limit(1).maybeSingle();
  const olympiadId = (part as Record<string, unknown> | null)?.olympiad_id as string | undefined;
  const { data: oly } = olympiadId ? await supabase.from("olympiads").select("olympiad_code").eq("id", olympiadId).maybeSingle() : { data: null };
  const olympiadCode = (oly as Record<string, unknown> | null)?.olympiad_code as string | undefined;
  const { data: cyc } = olympiadCode ? await supabase.from("exam_cycles").select("id").eq("olympiad_code", olympiadCode).order("created_at", { ascending: false }).limit(1).maybeSingle() : { data: null };
  const cycleId = (cyc as Record<string, unknown> | null)?.id as string | undefined;
  if (!cycleId) return NextResponse.json(err("CONFLICT", "No exam is scheduled for your school yet — answer sheets can't be uploaded.", meta(guard.requestId, MOD)), { status: 409 });

  const code = "ASB-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const { data: batch, error } = await supabase.from("evaluation_import_batches").insert({
    import_batch_code: code, exam_cycle_id: cycleId, school_id: schoolId, source_type: "school_upload",
    uploaded_by: SYSTEM_STAFF_ID, batch_status: "uploaded", updated_at: new Date().toISOString(),
  }).select("id").single();
  if (error || !batch) return NextResponse.json(err("INTERNAL", "Could not create the answer-sheet batch.", meta(guard.requestId, MOD)), { status: 500 });
  const batchId = String((batch as Record<string, unknown>).id);

  try {
    const result = await ingestOmrBatch({ actor: guard.actor, importBatchId: batchId, content });
    await createAuditEvent({ sourceModule: MOD, action: "upload_answer_sheets", actor: guard.actor, entityType: "evaluation_import_batches", entityId: batchId, newStatus: result.batch_status, reason: `school uploaded ${result.imported} answer sheet(s)` });
    return NextResponse.json(ok({ ...result, import_batch_code: code }, meta(guard.requestId, MOD)));
  } catch (e) {
    if (e instanceof ValidationError) {
      // Roll the empty batch back to a rejected state so a bad upload doesn't leave a phantom 'uploaded' batch.
      await supabase.from("evaluation_import_batches").update({ batch_status: "validation_failed", updated_at: new Date().toISOString() }).eq("id", batchId);
      return NextResponse.json(err("VALIDATION_FAILED", "The answer-sheet file could not be parsed.", meta(guard.requestId, MOD), { field_errors: e.fieldErrors }), { status: 422 });
    }
    return NextResponse.json(err("INTERNAL", "Unexpected error ingesting answer sheets.", meta(guard.requestId, MOD)), { status: 500 });
  }
}
