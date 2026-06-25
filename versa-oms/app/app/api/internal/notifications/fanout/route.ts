// FR-NOTIFY-FANOUT-0014: drain pending notification_events -> resolved recipient batches.
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { drainPendingEvents } from "@/server/notifications/fanout";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ok, meta } from "@/server/http/envelope";

export async function POST(request: NextRequest) {
  const guard = await requireStaffScope(request, "notification_ops", "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const result = await drainPendingEvents(guard.actor);
  await createAuditEvent({
    sourceModule: "notification_ops", action: "drain_fanout", actor: guard.actor,
    entityType: "notification_events", entityId: "queue", reason: `fanned ${result.fanned}, suppressed ${result.suppressed} of ${result.processed}`,
  });
  return NextResponse.json(ok(result, meta(guard.requestId, "notification_ops")));
}
