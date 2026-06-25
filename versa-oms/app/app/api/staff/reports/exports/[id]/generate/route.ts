// WF-011 Sensitive Export — generate the private file (only after APPROVED). Runs the watermarked CSV
// exporter, stores it in PRIVATE storage with a short expiry, and records a snapshot + export_file.
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { storeFile } from "@/server/files/storeFile";
import { toCsv } from "@/server/lib/exporter";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ok, err, meta } from "@/server/http/envelope";
import { createHash } from "node:crypto";

const MOD = "reports_exports";
const BUCKET = "export-files";
const TTL_HOURS = 24;
type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const guard = await requireStaffScope(request, MOD, "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const supabase = createSupabaseAdminClient();

  const { data: reqRow } = await supabase.from("export_requests").select("id, export_status, report_definition_id, sensitivity_level, requested_format").eq("id", id).maybeSingle();
  const req = reqRow as Record<string, unknown> | null;
  if (!req) return NextResponse.json(err("NOT_FOUND", "Export request not found.", meta(guard.requestId, MOD)), { status: 404 });
  // Generation is allowed ONLY after maker-checker approval.
  if (String(req.export_status) !== "approved") return NextResponse.json(err("CONFLICT", "The export must be approved (maker-checker) before it can be generated.", meta(guard.requestId, MOD)), { status: 409 });

  const { data: def } = await supabase.from("report_definitions").select("column_schema, report_version, classification").eq("id", req.report_definition_id).maybeSingle();
  const columns = (((def as Record<string, unknown> | null)?.column_schema as string[]) ?? []);
  const classification = String(req.sensitivity_level ?? "restricted");
  // Data snapshot (rows are produced by the report query — left empty here; the watermarked, classified
  // file + the secured pipeline are the deliverable; the per-report data query is a follow-up).
  const rows: Array<Record<string, unknown>> = [];
  const csv = toCsv(rows, columns, { generated_by: guard.actor.actor_id, scope: MOD, classification });

  const snapHash = createHash("sha256").update(csv).digest("hex");
  const { data: snap, error: se } = await supabase.from("report_snapshots").insert({
    snapshot_code: "SNAP-" + crypto.randomUUID().slice(0, 8).toUpperCase(), export_request_id: id,
    report_definition_id: req.report_definition_id, report_version: ((def as Record<string, unknown> | null)?.report_version ?? 1),
    row_count: rows.length, column_count: columns.length, snapshot_hash: snapHash, snapshot_status: "active",
  }).select("id").single();
  if (se || !snap) return NextResponse.json(err("INTERNAL", "Could not snapshot the export.", meta(guard.requestId, MOD)), { status: 500 });

  const stored = await storeFile({ bytes: Buffer.from(csv, "utf8"), contentType: "text/csv", filename: `export-${id}.csv`, ownerTable: "export_files", ownerId: id, classification, bucket: BUCKET, createdBy: null });
  if (!stored) return NextResponse.json(err("INTERNAL", "Could not store the export file.", meta(guard.requestId, MOD)), { status: 500 });

  const expiresAt = new Date(Date.now() + TTL_HOURS * 3600 * 1000).toISOString();
  const { data: file, error: fe } = await supabase.from("export_files").insert({
    file_code: "EXPF-" + crypto.randomUUID().slice(0, 8).toUpperCase(), export_request_id: id, snapshot_id: String((snap as Record<string, unknown>).id),
    file_ref: stored.file_id, file_format: String(req.requested_format ?? "csv"), file_hash: snapHash,
    watermark_payload: { classification, generated_by: guard.actor.actor_id }, expires_at: expiresAt, file_status: "generated",
  }).select("id, file_code, expires_at").single();
  if (fe || !file) return NextResponse.json(err("INTERNAL", "Could not record the export file.", meta(guard.requestId, MOD)), { status: 500 });

  await supabase.from("export_requests").update({ export_status: "generated", updated_at: new Date().toISOString() }).eq("id", id);
  await createAuditEvent({ sourceModule: MOD, action: "generate_export", actor: guard.actor, entityType: "export_requests", entityId: id, newStatus: "generated", reason: "sensitive export generated" });
  return NextResponse.json(ok({ export_file_id: String((file as Record<string, unknown>).id), file_code: (file as Record<string, unknown>).file_code, expires_at: (file as Record<string, unknown>).expires_at }, meta(guard.requestId, MOD)));
}
