import type { NextRequest } from "next/server";
import type { GuardResult, ModuleAction } from "@/server/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveStaffActor } from "@/server/auth/actor";
import { can } from "@/server/permissions/registry";
import { err, meta, httpStatus } from "@/server/http/envelope";

/**
 * Staff authorization guard. Resolves the actor server-side (never trusts the
 * browser), then checks the module/action policy via the permission engine.
 * Returns a typed GuardResult; on deny the body is a standard error envelope.
 */
export async function requireStaffScope(
  request: NextRequest,
  moduleId: string,
  action: ModuleAction
): Promise<GuardResult> {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const supabase = await createSupabaseServerClient();
  const actor = await resolveStaffActor(supabase);

  if (!actor || actor.actor_type !== "staff") {
    return {
      ok: false,
      status: httpStatus("AUTH_REQUIRED"),
      requestId,
      body: err("AUTH_REQUIRED", "Staff authentication required.", meta(requestId, moduleId)),
    };
  }
  if (!can(actor, moduleId, action)) {
    return {
      ok: false,
      status: httpStatus("FORBIDDEN"),
      requestId,
      body: err("FORBIDDEN", `Not permitted to ${action} on ${moduleId}.`, meta(requestId, moduleId)),
    };
  }
  return { ok: true, actor, requestId };
}
