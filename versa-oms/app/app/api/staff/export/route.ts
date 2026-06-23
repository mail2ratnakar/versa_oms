import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { maskRecords } from "@/server/masking/masking";
import { toCsv } from "@/server/lib/exporter";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { err, meta } from "@/server/http/envelope";

// Whitelisted exportable tables (prevents arbitrary-table reads).
const ALLOWED = new Set([
  "finance_invoices", "school_leads", "students", "payments", "results",
  "certificates", "exam_slots", "courier_batches", "staff_profiles", "support_tickets",
]);

export async function GET(request: NextRequest) {
  const guard = await requireStaffScope(request, "reports_exports", "export");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });

  const table = request.nextUrl.searchParams.get("table") ?? "";
  if (!ALLOWED.has(table)) {
    return NextResponse.json(
      err("VALIDATION_FAILED", "Unknown or non-exportable table.", meta(guard.requestId, "reports_exports")),
      { status: 422 }
    );
  }

  let rows: Array<Record<string, unknown>> = [];
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from(table).select("*").is("archived_at", null).limit(1000);
    rows = (data ?? []) as Array<Record<string, unknown>>;
  } catch {
    rows = [];
  }

  // Mask sensitive fields per the actor's roles before the data leaves the server.
  const masked = maskRecords(rows, guard.actor);
  const columns = masked.length ? Object.keys(masked[0]) : ["id"];
  const csv = toCsv(masked, columns, { generated_by: guard.actor.actor_id, scope: table, classification: "sensitive" });

  await createAuditEvent({
    sourceModule: "reports_exports",
    action: "export",
    actor: guard.actor,
    entityType: table,
    entityId: "export",
    reason: `CSV export of ${table} (${masked.length} rows)`,
  });

  return new NextResponse(csv, {
    status: 200,
    headers: { "content-type": "text/csv", "content-disposition": `attachment; filename="${table}.csv"` },
  });
}
