// WF-005 upload (FR-MATERIAL-UPLOAD-2026-0040). Staff upload the actual exam-material PDFs — question-paper
// SETS (A-D) + the blank answer/OMR sheet — into a material package: store the bytes PRIVATELY and create
// the exam_material_files row. Once the package is released (release_at), schools download them time-gated
// via the existing secure download. GET lists a package's uploaded files.
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { storeFile } from "@/server/files/storeFile";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ok, err, meta } from "@/server/http/envelope";
import { createHash } from "node:crypto";

const MOD = "exam_material_ops_files";
const BUCKET = "exam-material-files";
const FILE_TYPES = new Set(["question_paper", "answer_sheet", "cover_sheet"]);

export async function GET(request: NextRequest) {
  const guard = await requireStaffScope(request, MOD, "read");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const packageId = request.nextUrl.searchParams.get("package_id") ?? "";
  const supabase = createSupabaseAdminClient();
  let q = supabase.from("exam_material_files").select("id, file_code, file_type, file_status, file_size_bytes, created_at").is("archived_at", null).order("created_at", { ascending: false }).limit(100);
  if (packageId) q = q.eq("material_package_id", packageId);
  const { data } = await q;
  return NextResponse.json(ok({ items: data ?? [], pagination: { page: 1, page_size: 100, total_count: (data ?? []).length, has_next: false, next_cursor: null } }, meta(guard.requestId, MOD)));
}

export async function POST(request: NextRequest) {
  const guard = await requireStaffScope(request, MOD, "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { body = {}; }
  const packageId = String(body.package_id ?? "").trim();
  const fileType = FILE_TYPES.has(String(body.file_type)) ? String(body.file_type) : "question_paper";
  const setCode = typeof body.set_code === "string" ? body.set_code.toUpperCase().replace(/[^A-D]/g, "") : "";
  const content = String(body.content ?? "");
  const fieldErrors = [
    ...(packageId ? [] : [{ field: "package_id", message: "A package_id is required." }]),
    ...(content ? [] : [{ field: "content", message: "File content is required." }]),
    ...(fileType === "question_paper" && !setCode ? [{ field: "set_code", message: "A set (A-D) is required for a question paper." }] : []),
  ];
  if (fieldErrors.length) return NextResponse.json(err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, MOD), { field_errors: fieldErrors }), { status: 422 });

  const supabase = createSupabaseAdminClient();
  const { data: pkg } = await supabase.from("exam_material_packages").select("id, school_id, package_status").eq("id", packageId).maybeSingle();
  const p = pkg as Record<string, unknown> | null;
  if (!p) return NextResponse.json(err("NOT_FOUND", "Material package not found.", meta(guard.requestId, MOD)), { status: 404 });

  const bytes = body.encoding === "base64" ? Buffer.from(content, "base64") : Buffer.from(content, "utf8");
  const stored = await storeFile({ bytes, contentType: "application/pdf", filename: `${fileType}${setCode ? "-set-" + setCode : ""}.pdf`, schoolId: (p.school_id as string) ?? null, ownerTable: "exam_material_files", ownerId: packageId, classification: "restricted", bucket: BUCKET, createdBy: null });
  if (!stored) return NextResponse.json(err("INTERNAL", "Could not store the material file.", meta(guard.requestId, MOD)), { status: 500 });

  const prefix = fileType === "answer_sheet" ? "MAS" : fileType === "cover_sheet" ? "MCS" : "MQP";
  const code = `${prefix}-${setCode ? "SET" + setCode + "-" : ""}` + crypto.randomUUID().slice(0, 8).toUpperCase();
  const { data: file, error } = await supabase.from("exam_material_files").insert({
    file_code: code, material_package_id: packageId, file_type: fileType, file_ref: stored.file_id,
    file_hash: createHash("sha256").update(bytes).digest("hex"), file_size_bytes: bytes.length,
    file_status: "generated", watermark_applied: false,
  }).select("id, file_code").single();
  if (error || !file) return NextResponse.json(err("INTERNAL", "Could not record the material file.", meta(guard.requestId, MOD)), { status: 500 });

  await createAuditEvent({ sourceModule: MOD, action: "upload_material", actor: guard.actor, entityType: "exam_material_files", entityId: String((file as Record<string, unknown>).id), reason: `uploaded ${fileType}${setCode ? " set " + setCode : ""}` });
  return NextResponse.json(ok({ file_id: (file as Record<string, unknown>).id, file_code: (file as Record<string, unknown>).file_code, file_type: fileType, set_code: setCode || null }, meta(guard.requestId, MOD)));
}
