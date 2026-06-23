import type { NextRequest } from "next/server";
import { resolveActor } from "@/server/auth/resolveActor";
import { canAccessModule, type ModuleAction } from "@/server/security/permissions";
import { errorResponse } from "@/server/core/response";

export async function requireStaffActor(request: NextRequest, moduleId: string, action: ModuleAction) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const actor = await resolveActor(request);

  if (actor.actor_type !== "staff" && actor.actor_type !== "system") {
    return {
      ok: false as const,
      status: 401,
      requestId,
      body: errorResponse({
        code: "AUTH_REQUIRED",
        message: "Staff authentication required.",
        requestId,
        moduleId,
        status: 401
      }).body
    };
  }

  if (!canAccessModule(actor, moduleId, action)) {
    return {
      ok: false as const,
      status: 403,
      requestId,
      body: errorResponse({
        code: "ACCESS_DENIED",
        message: "Access denied.",
        requestId,
        moduleId,
        status: 403
      }).body
    };
  }

  return { ok: true as const, actor, requestId };
}

export async function requireSchoolActor(request: NextRequest, moduleId: string) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const actor = await resolveActor(request);

  if (actor.actor_type !== "school" || !actor.school_id) {
    return {
      ok: false as const,
      status: 401,
      requestId,
      body: errorResponse({
        code: "SCHOOL_AUTH_REQUIRED",
        message: "School authentication required.",
        requestId,
        moduleId,
        status: 401
      }).body
    };
  }

  return { ok: true as const, actor, requestId, schoolId: actor.school_id };
}
