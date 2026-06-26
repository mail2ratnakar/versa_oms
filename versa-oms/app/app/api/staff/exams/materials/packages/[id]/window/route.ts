// WF-005 exceptions (FR-MATERIAL-WINDOW-2026-0041). When a school POSTPONES an exam, ops EXTEND the
// download window (new release_at / expires_at). When a school CANCELS, ops CANCEL it (package revoked ->
// the gate blocks all downloads). Reason required; audited.
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ok, err, meta } from "@/server/http/envelope";

const MOD = "exam_material_ops";
type Ctx = { params: Promise<{ id: string }> };
const isIso = (s: unknown): s is string => typeof s === "string" && !Number.isNaN(Date.parse(s));

export async function POST(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const guard = await requireStaffScope(request, MOD, "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { body = {}; }
  const action = String(body.action ?? "");
  const reason = String(body.reason ?? "").trim();
  if (!reason) return NextResponse.json(err("VALIDATION_FAILED", "A reason is required.", meta(guard.requestId, MOD), { field_errors: [{ field: "reason", message: "A reason is required." }] }), { status: 422 });

  const supabase = createSupabaseAdminClient();
  const { data: pkg } = await supabase.from("exam_material_packages").select("id, package_status, release_at, expires_at").eq("id", id).maybeSingle();
  const p = pkg as Record<string, unknown> | null;
  if (!p) return NextResponse.json(err("NOT_FOUND", "Material package not found.", meta(guard.requestId, MOD)), { status: 404 });
  const prev = String(p.package_status ?? "");

  if (action === "cancel") {
    // Exam cancelled -> revoke the package; the gate now blocks every download.
    await supabase.from("exam_material_packages").update({ package_status: "revoked", updated_at: new Date().toISOString() }).eq("id", id);
    await createAuditEvent({ sourceModule: MOD, action: "cancel_material_window", actor: guard.actor, entityType: "exam_material_packages", entityId: id, previousStatus: prev, newStatus: "revoked", reason });
    return NextResponse.json(ok({ id, package_status: "revoked" }, meta(guard.requestId, MOD)));
  }

  if (action === "extend") {
    // Exam postponed -> move the window (new open and/or new close). At least one is required.
    if (prev === "revoked" || prev === "superseded") return NextResponse.json(err("CONFLICT", "A revoked/superseded package cannot be extended; supersede with a fresh release.", meta(guard.requestId, MOD)), { status: 409 });
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (isIso(body.release_at)) patch.release_at = body.release_at;
    if (isIso(body.expires_at)) patch.expires_at = body.expires_at;
    if (body.expires_at === null) patch.expires_at = null; // explicit "no end"
    if (!("release_at" in patch) && !("expires_at" in patch)) return NextResponse.json(err("VALIDATION_FAILED", "Provide a new release_at and/or expires_at.", meta(guard.requestId, MOD), { field_errors: [{ field: "release_at", message: "Provide a new release_at and/or expires_at (ISO)." }] }), { status: 422 });
    await supabase.from("exam_material_packages").update(patch).eq("id", id);
    await createAuditEvent({ sourceModule: MOD, action: "extend_material_window", actor: guard.actor, entityType: "exam_material_packages", entityId: id, reason: `${reason} (release_at=${patch.release_at ?? p.release_at}, expires_at=${patch.expires_at ?? p.expires_at})` });
    return NextResponse.json(ok({ id, release_at: patch.release_at ?? p.release_at, expires_at: "expires_at" in patch ? patch.expires_at : p.expires_at }, meta(guard.requestId, MOD)));
  }

  return NextResponse.json(err("VALIDATION_FAILED", "action must be 'extend' or 'cancel'.", meta(guard.requestId, MOD), { field_errors: [{ field: "action", message: "action must be 'extend' or 'cancel'." }] }), { status: 422 });
}
