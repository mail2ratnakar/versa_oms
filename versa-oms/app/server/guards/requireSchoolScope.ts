import type { NextRequest } from "next/server";
import type { GuardResult } from "@/server/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveSchoolActor, devAuthAllowed } from "@/server/auth/actor";
import { err, meta, httpStatus } from "@/server/http/envelope";

/**
 * School authorization guard. Resolves the school actor server-side and binds
 * its school_id from the authenticated session — the browser-submitted school_id
 * is never trusted. Every school query must be filtered by actor.school_id.
 */
export async function requireSchoolScope(
  request: NextRequest,
  moduleId: string
): Promise<GuardResult> {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const supabase = await createSupabaseServerClient();
  let actor = await resolveSchoolActor(supabase);

  // Dev-only: bind the school actor to a specific school_id (e.g. to confirm a seeded
  // assignment in tests). Gated by devAuthAllowed() — never active in production.
  const devSchool = request.headers.get("x-dev-school");
  if (actor && devSchool && devAuthAllowed()) {
    actor = { ...actor, school_id: devSchool };
  }

  if (!actor || actor.actor_type !== "school" || !actor.school_id) {
    return {
      ok: false,
      status: httpStatus("AUTH_REQUIRED"),
      requestId,
      body: err("AUTH_REQUIRED", "School authentication required.", meta(requestId, moduleId)),
    };
  }
  return { ok: true, actor, requestId };
}
