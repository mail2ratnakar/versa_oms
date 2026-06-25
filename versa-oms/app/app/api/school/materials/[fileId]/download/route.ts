// FR-MATERIAL-RELEASE-2026-0018: a school securely downloads an exam-material file (question paper / OMR)
// ONLY within the release window — released package + release_at passed + not revoked/superseded — and
// ONLY for its own school. Returns a short-lived signed URL (never the storage path; never logged).
import { NextRequest, NextResponse } from "next/server";
import { requireSchoolScope } from "@/server/guards/requireSchoolScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSignedDownloadUrl } from "@/server/files/signedUrl";
import { packageReleaseGate } from "@/server/materials/releaseGate";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ok, err, meta } from "@/server/http/envelope";

const MOD = "school_materials";
type Ctx = { params: Promise<{ fileId: string }> };
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const notFound = (rid: string) => NextResponse.json(err("NOT_FOUND", "Material not found.", meta(rid, MOD)), { status: 404 });

export async function GET(request: NextRequest, ctx: Ctx) {
  const { fileId } = await ctx.params;
  const guard = await requireSchoolScope(request, MOD);
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const supabase = createSupabaseAdminClient();
  const schoolId = String(guard.actor.school_id ?? "");

  const { data: file } = await supabase.from("exam_material_files").select("id, file_ref, file_status, material_package_id").eq("id", fileId).maybeSingle();
  if (!file) return notFound(guard.requestId);
  const f = file as Record<string, unknown>;
  const { data: pkg } = await supabase.from("exam_material_packages").select("id, school_id, package_status, release_at").eq("id", f.material_package_id).maybeSingle();
  if (!pkg) return notFound(guard.requestId);
  const p = pkg as Record<string, unknown>;

  // Own-school only (server-side; school_id never from the browser). Cross-school -> 404, no leak.
  if (!schoolId || String(p.school_id ?? "") !== schoolId) return notFound(guard.requestId);

  // Release time + status gate (school_access_policy: after release, not revoked/superseded).
  const gate = packageReleaseGate({ now: new Date(), releaseAt: (p.release_at as string | null) ?? null, packageStatus: String(p.package_status ?? ""), fileStatus: String(f.file_status ?? "") });
  const actorId = isUuid(guard.actor.actor_id) ? guard.actor.actor_id : schoolId;
  if (!gate.allowed) {
    await supabase.from("exam_material_download_events").insert({ material_package_id: p.id, material_file_id: f.id, school_id: p.school_id, event_code: "download_denied", actor_id: actorId, reason: gate.reason });
    return NextResponse.json(err("FORBIDDEN", gate.reason ?? "Not available.", meta(guard.requestId, MOD)), { status: 403 });
  }

  if (!f.file_ref) return NextResponse.json(err("CONFLICT", "No file is attached to this material.", meta(guard.requestId, MOD)), { status: 409 });
  const signed = await createSignedDownloadUrl({ fileId: String(f.file_ref), actorId: guard.actor.actor_id });
  if (!signed.download_url) return NextResponse.json(err("CONFLICT", "File is not available for download.", meta(guard.requestId, MOD)), { status: 409 });

  await supabase.from("exam_material_download_events").insert({ material_package_id: p.id, material_file_id: f.id, school_id: p.school_id, event_code: "download_granted", actor_id: actorId, file_hash: null });
  await createAuditEvent({ sourceModule: MOD, action: "download_material", actor: guard.actor, entityType: "exam_material_files", entityId: String(f.id), reason: null });
  // Only URL + expiry — never the object path; never log the signed URL (skill 10).
  return NextResponse.json(ok({ download_url: signed.download_url, expires_at: signed.expires_at, ttl_seconds: signed.ttl_seconds }, meta(guard.requestId, MOD)));
}
