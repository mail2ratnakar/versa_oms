// WF-011 Sensitive Export — secure, expiry-gated download of the generated private export file.
// Short-lived signed URL (never the path, never logged); the download is audited; expired files blocked.
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSignedDownloadUrl } from "@/server/files/signedUrl";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ok, err, meta } from "@/server/http/envelope";

const MOD = "reports_exports";
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params; // export_request id
  const guard = await requireStaffScope(request, MOD, "download");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const supabase = createSupabaseAdminClient();

  const { data: f } = await supabase.from("export_files")
    .select("id, file_ref, expires_at, file_status").eq("export_request_id", id).eq("file_status", "generated")
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  const file = f as Record<string, unknown> | null;
  const actorId = isUuid(guard.actor.actor_id) ? guard.actor.actor_id : null;
  if (!file) return NextResponse.json(err("NOT_FOUND", "No generated export file.", meta(guard.requestId, MOD)), { status: 404 });

  // Expiry gate.
  if (file.expires_at && new Date(String(file.expires_at)).getTime() < Date.now()) {
    await supabase.from("export_files").update({ file_status: "expired" }).eq("id", file.id);
    await supabase.from("export_download_events").insert({ export_file_id: file.id, downloaded_by: actorId, actor_type: "staff", download_status: "expired" });
    return NextResponse.json(err("CONFLICT", "This export has expired. Request a fresh one.", meta(guard.requestId, MOD)), { status: 409 });
  }
  if (!file.file_ref) return NextResponse.json(err("CONFLICT", "No file attached.", meta(guard.requestId, MOD)), { status: 409 });

  const signed = await createSignedDownloadUrl({ fileId: String(file.file_ref), actorId: guard.actor.actor_id });
  if (!signed.download_url) {
    await supabase.from("export_download_events").insert({ export_file_id: file.id, downloaded_by: actorId, actor_type: "staff", download_status: "denied" });
    return NextResponse.json(err("CONFLICT", "File is not available for download.", meta(guard.requestId, MOD)), { status: 409 });
  }
  await supabase.from("export_download_events").insert({ export_file_id: file.id, downloaded_by: actorId, actor_type: "staff", download_status: "granted" });
  await createAuditEvent({ sourceModule: MOD, action: "download_export", actor: guard.actor, entityType: "export_files", entityId: String(file.id), reason: null });
  return NextResponse.json(ok({ download_url: signed.download_url, expires_at: signed.expires_at, ttl_seconds: signed.ttl_seconds }, meta(guard.requestId, MOD)));
}
