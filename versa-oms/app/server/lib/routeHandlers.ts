import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { requireSchoolScope } from "@/server/guards/requireSchoolScope";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ok, err, meta } from "@/server/http/envelope";
import { ValidationError, ConflictError } from "@/server/lib/defineModule";

type Service = {
  listModuleRecords: (i: { actor: any; searchParams: URLSearchParams }) => Promise<unknown>;
  createModuleRecord: (i: { actor: any; payload: Record<string, unknown>; idempotencyKey: string }) => Promise<Record<string, unknown>>;
};

type ItemService = {
  getModuleRecord: (i: { actor: any; id: string }) => Promise<Record<string, unknown> | null>;
  updateModuleRecord: (i: { actor: any; id: string; payload: Record<string, unknown> }) => Promise<Record<string, unknown>>;
};

type ActionService = {
  getTransition: (action: string) => { klass: "write" | "approve" } | undefined;
  transitionModuleRecord: (i: { actor: any; id: string; action: string; reason?: string | null }) => Promise<Record<string, unknown>>;
};

/**
 * Build uniform staff GET/POST route handlers for a module. Centralizes the
 * guard → idempotency → validation → audit → standard-envelope flow so every
 * module route is consistent and correct.
 */
export function makeStaffRouteHandlers(moduleId: string, service: Service) {
  async function GET(request: NextRequest) {
    const guard = await requireStaffScope(request, moduleId, "read");
    if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
    const data = await service.listModuleRecords({ actor: guard.actor, searchParams: request.nextUrl.searchParams });
    return NextResponse.json(ok(data, meta(guard.requestId, moduleId)));
  }

  async function POST(request: NextRequest) {
    const guard = await requireStaffScope(request, moduleId, "write");
    if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });

    const idempotencyKey = request.headers.get("x-idempotency-key");
    if (!idempotencyKey) {
      return NextResponse.json(
        err("IDEMPOTENCY_KEY_REQUIRED", "X-Idempotency-Key is required.", meta(guard.requestId, moduleId)),
        { status: 400 }
      );
    }

    let payload: Record<string, unknown>;
    try {
      payload = (await request.json()) as Record<string, unknown>;
    } catch {
      payload = {};
    }

    try {
      const data = await service.createModuleRecord({ actor: guard.actor, payload, idempotencyKey });
      const audit = await createAuditEvent({
        sourceModule: moduleId,
        action: "create",
        actor: guard.actor,
        entityType: moduleId,
        entityId: String(data.id ?? ""),
        reason: (payload.reason as string) ?? null,
      });
      return NextResponse.json(ok(data, meta(guard.requestId, moduleId, audit.audit_event_id)), { status: 201 });
    } catch (e) {
      if (e instanceof ValidationError) {
        return NextResponse.json(
          err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, moduleId), { field_errors: e.fieldErrors }),
          { status: 422 }
        );
      }
      if (e instanceof ConflictError) {
        return NextResponse.json(err("CONFLICT", "Idempotency conflict.", meta(guard.requestId, moduleId)), { status: 409 });
      }
      return NextResponse.json(err("INTERNAL", "Unexpected error.", meta(guard.requestId, moduleId)), { status: 500 });
    }
  }

  return { GET, POST };
}

/**
 * School-portal route handlers. Uses requireSchoolScope so every query is bound
 * to the authenticated school's school_id server-side. GET is always available;
 * POST (e.g. roster upload) only when allowCreate is set.
 */
export function makeSchoolRouteHandlers(moduleId: string, service: Service, opts: { allowCreate?: boolean } = {}) {
  async function GET(request: NextRequest) {
    const guard = await requireSchoolScope(request, moduleId);
    if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
    const data = await service.listModuleRecords({ actor: guard.actor, searchParams: request.nextUrl.searchParams });
    return NextResponse.json(ok(data, meta(guard.requestId, moduleId)));
  }

  async function POST(request: NextRequest) {
    const guard = await requireSchoolScope(request, moduleId);
    if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
    if (!opts.allowCreate) {
      return NextResponse.json(err("FORBIDDEN", "Not permitted.", meta(guard.requestId, moduleId)), { status: 403 });
    }
    const idempotencyKey = request.headers.get("x-idempotency-key");
    if (!idempotencyKey) {
      return NextResponse.json(
        err("IDEMPOTENCY_KEY_REQUIRED", "X-Idempotency-Key is required.", meta(guard.requestId, moduleId)),
        { status: 400 }
      );
    }
    let payload: Record<string, unknown>;
    try {
      payload = (await request.json()) as Record<string, unknown>;
    } catch {
      payload = {};
    }
    try {
      const data = await service.createModuleRecord({ actor: guard.actor, payload, idempotencyKey });
      const audit = await createAuditEvent({
        sourceModule: moduleId,
        action: "create",
        actor: guard.actor,
        entityType: moduleId,
        entityId: String(data.id ?? ""),
        reason: (payload.reason as string) ?? null,
      });
      return NextResponse.json(ok(data, meta(guard.requestId, moduleId, audit.audit_event_id)), { status: 201 });
    } catch (e) {
      if (e instanceof ValidationError) {
        return NextResponse.json(
          err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, moduleId), { field_errors: e.fieldErrors }),
          { status: 422 }
        );
      }
      if (e instanceof ConflictError) {
        return NextResponse.json(err("CONFLICT", "Idempotency conflict.", meta(guard.requestId, moduleId)), { status: 409 });
      }
      return NextResponse.json(err("INTERNAL", "Unexpected error.", meta(guard.requestId, moduleId)), { status: 500 });
    }
  }

  return { GET, POST };
}

type Ctx = { params: Promise<Record<string, string>> };

/** GET one record + PATCH update, by id, for a module. */
export function makeStaffItemHandlers(moduleId: string, service: ItemService) {
  async function GET(request: NextRequest, ctx: Ctx) {
    const guard = await requireStaffScope(request, moduleId, "read");
    if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
    const { id } = await ctx.params;
    const data = await service.getModuleRecord({ actor: guard.actor, id });
    if (!data) return NextResponse.json(err("NOT_FOUND", "Record not found.", meta(guard.requestId, moduleId)), { status: 404 });
    return NextResponse.json(ok(data, meta(guard.requestId, moduleId)));
  }

  async function PATCH(request: NextRequest, ctx: Ctx) {
    const guard = await requireStaffScope(request, moduleId, "write");
    if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
    const { id } = await ctx.params;
    let payload: Record<string, unknown>;
    try {
      payload = (await request.json()) as Record<string, unknown>;
    } catch {
      payload = {};
    }
    try {
      const data = await service.updateModuleRecord({ actor: guard.actor, id, payload });
      const audit = await createAuditEvent({
        sourceModule: moduleId,
        action: "update",
        actor: guard.actor,
        entityType: moduleId,
        entityId: id,
        reason: (payload.reason as string) ?? null,
      });
      return NextResponse.json(ok(data, meta(guard.requestId, moduleId, audit.audit_event_id)));
    } catch (e) {
      if (e instanceof ValidationError) {
        return NextResponse.json(
          err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, moduleId), { field_errors: e.fieldErrors }),
          { status: 422 }
        );
      }
      return NextResponse.json(err("INTERNAL", "Unexpected error.", meta(guard.requestId, moduleId)), { status: 500 });
    }
  }

  return { GET, PATCH };
}

/** POST a status transition (approve/publish/release/confirm/lock/...) on a record. */
export function makeStaffActionHandler(moduleId: string, service: ActionService) {
  async function POST(request: NextRequest, ctx: Ctx) {
    const { id, action } = await ctx.params;
    const transition = service.getTransition(action);
    const requiredPerm = transition?.klass ?? "approve";
    const guard = await requireStaffScope(request, moduleId, requiredPerm);
    if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }
    const reason = (body.reason as string) ?? null;
    try {
      const data = await service.transitionModuleRecord({ actor: guard.actor, id, action, reason });
      const audit = await createAuditEvent({
        sourceModule: moduleId,
        action,
        actor: guard.actor,
        entityType: moduleId,
        entityId: id,
        reason,
        previousStatus: (data.previous_status as string) ?? null,
        newStatus: (data.status as string) ?? null,
      });
      return NextResponse.json(ok(data, meta(guard.requestId, moduleId, audit.audit_event_id)));
    } catch (e) {
      if (e instanceof ValidationError) {
        return NextResponse.json(
          err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, moduleId), { field_errors: e.fieldErrors }),
          { status: 422 }
        );
      }
      return NextResponse.json(err("INTERNAL", "Unexpected error.", meta(guard.requestId, moduleId)), { status: 500 });
    }
  }
  return { POST };
}
