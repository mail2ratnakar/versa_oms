import { NextRequest, NextResponse } from "next/server";
import { requireStaffActor } from "@/server/guards/requireActor";
import { successResponse, errorResponse } from "@/server/core/response";
import { createModuleService } from "@/server/modules/factory";
import { writeAuditEvent } from "@/server/audit/auditWriter";
import { checkIdempotency, completeIdempotency } from "@/server/idempotency/idempotencyStore";

const moduleId = "company_dashboard";

export async function GET(request: NextRequest) {
  const guard = await requireStaffActor(request, moduleId, "read");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });

  const service = createModuleService(moduleId);
  const data = await service.list({ actor: guard.actor });

  return NextResponse.json(successResponse({
    data,
    requestId: guard.requestId,
    moduleId
  }));
}

export async function POST(request: NextRequest) {
  const guard = await requireStaffActor(request, moduleId, "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });

  const idempotencyKey = request.headers.get("x-idempotency-key");
  if (!idempotencyKey) {
    const err = errorResponse({
      code: "IDEMPOTENCY_KEY_REQUIRED",
      message: "X-Idempotency-Key is required.",
      requestId: guard.requestId,
      moduleId,
      status: 400
    });
    return NextResponse.json(err.body, { status: err.status });
  }

  const payload = await request.json();
  const idem = await checkIdempotency({
    idempotencyKey,
    moduleId,
    operation: "create_business_entity",
    actorId: guard.actor.actor_id,
    payload
  });

  if (!idem.ok && idem.conflict) {
    const err = errorResponse({
      code: "IDEMPOTENCY_CONFLICT",
      message: "Idempotency key was reused with different payload.",
      requestId: guard.requestId,
      moduleId,
      status: 409
    });
    return NextResponse.json(err.body, { status: err.status });
  }

  if (idem.ok && idem.replay) {
    return NextResponse.json(idem.response);
  }

  const service = createModuleService(moduleId);
  const created = await service.create({
    actor: guard.actor,
    entityType: String(payload.entity_type ?? "business_entity"),
    status: "draft",
    data: payload.data ?? {}
  });

  const audit = await writeAuditEvent({
    sourceModule: moduleId,
    action: "business_entity.created",
    actor: guard.actor,
    entityType: created.entity_type,
    entityId: created.id,
    newStatus: created.status,
    reason: payload.reason ?? null,
    requestId: guard.requestId,
    risk: "medium",
    safeSnapshot: created
  });

  const response = successResponse({
    data: created,
    requestId: guard.requestId,
    moduleId,
    auditEventId: audit.audit_event_id
  });

  await completeIdempotency({ idempotencyKey, response });
  return NextResponse.json(response, { status: 201 });
}
