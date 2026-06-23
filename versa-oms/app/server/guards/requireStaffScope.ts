import type { NextRequest } from "next/server";
import type { GuardResult, ModuleAction } from "@/server/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveStaffActor, devAuthAllowed } from "@/server/auth/actor";
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
  let actor = await resolveStaffActor(supabase);

  // Dev-only: simulate distinct actors (e.g. maker≠checker dual-approval) via a header.
  // Gated by devAuthAllowed() — never active in production.
  const devActor = request.headers.get("x-dev-actor");
  if (actor && devActor && devAuthAllowed()) {
    actor = { ...actor, actor_id: devActor };
  }

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
