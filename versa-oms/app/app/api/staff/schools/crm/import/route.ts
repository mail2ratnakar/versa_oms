import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findDuplicates, type Lead } from "@/server/crm/dedupe";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ok, err, meta } from "@/server/http/envelope";

/** Bulk lead import with duplicate detection (name+city/email/phone/website). */
export async function POST(request: NextRequest) {
  const guard = await requireStaffScope(request, "school_crm", "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });

  const idem = request.headers.get("x-idempotency-key");
  if (!idem) {
    return NextResponse.json(err("IDEMPOTENCY_KEY_REQUIRED", "X-Idempotency-Key is required.", meta(guard.requestId, "school_crm")), { status: 400 });
  }

  let body: { leads?: Lead[] };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }
  if (!Array.isArray(body.leads)) {
    return NextResponse.json(err("VALIDATION_FAILED", "leads[] is required.", meta(guard.requestId, "school_crm")), { status: 422 });
  }

  let existing: Lead[] = [];
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from("school_leads").select("school_name, city, state, email, phone, website").is("archived_at", null);
    existing = (data ?? []) as Lead[];
  } catch {
    existing = [];
  }

  const { unique, duplicates } = findDuplicates(body.leads, existing);
  let imported = 0;
  try {
    const supabase = createSupabaseAdminClient();
    for (const lead of unique) {
      const { error } = await supabase.from("school_leads").insert(lead as Record<string, unknown>);
      if (!error) imported++;
    }
  } catch {
    /* best-effort persistence */
  }

  await createAuditEvent({
    sourceModule: "school_crm",
    action: "import_leads",
    actor: guard.actor,
    entityType: "school_leads",
    entityId: "import",
    reason: `imported ${imported}, ${duplicates.length} duplicates skipped`,
  });

  return NextResponse.json(
    ok({ submitted: body.leads.length, imported, duplicates_skipped: duplicates.length, duplicates }, meta(guard.requestId, "school_crm")),
    { status: 201 }
  );
}
