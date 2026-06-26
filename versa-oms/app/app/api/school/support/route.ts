// WF-010 Support (FR-SUPPORT-CHAIN-2026-0023). School-facing support tickets. POST raises a ticket
// (school-scoped, server-generated code, default category resolved server-side); GET lists the school's
// own tickets. Internal staff notes are NEVER exposed here (see /[id] — only school_visible messages).
import { NextRequest, NextResponse } from "next/server";
import { requireSchoolScope } from "@/server/guards/requireSchoolScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { validateSupportTickets_create } from "@/server/rules/support_tickets.generated";
import { ok, err, meta } from "@/server/http/envelope";

const MOD = "school_support";

export async function GET(request: NextRequest) {
  const guard = await requireSchoolScope(request, MOD);
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("support_tickets")
    .select("id, ticket_code, subject, ticket_status, sla_status, resolution_summary, created_at")
    .eq("school_id", guard.actor.school_id ?? "__none__")
    .order("created_at", { ascending: false }).limit(100);
  return NextResponse.json(ok({ items: data ?? [], pagination: { page: 1, page_size: 100, total_count: (data ?? []).length, has_next: false, next_cursor: null } }, meta(guard.requestId, MOD)));
}

export async function POST(request: NextRequest) {
  const guard = await requireSchoolScope(request, MOD);
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const schoolId = String(guard.actor.school_id ?? "");
  if (!schoolId) return NextResponse.json(err("FORBIDDEN", "No school in scope.", meta(guard.requestId, MOD)), { status: 403 });
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { body = {}; }
  const subject = String(body.subject ?? "").trim();
  const description = String(body.description ?? "").trim();
  const fieldErrors = validateSupportTickets_create(body); // compiled from spec/rules/support_tickets.rules.json
  if (fieldErrors.length) return NextResponse.json(err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, MOD), { field_errors: fieldErrors }), { status: 422 });

  const supabase = createSupabaseAdminClient();
  // Category is resolved server-side (the school doesn't pick a uuid): the requested one if active, else a default active category.
  let categoryId = typeof body.category_id === "string" ? body.category_id : undefined;
  if (categoryId) {
    const { data: c } = await supabase.from("support_ticket_categories").select("id").eq("id", categoryId).eq("category_status", "active").maybeSingle();
    if (!c) categoryId = undefined;
  }
  if (!categoryId) {
    const { data: def } = await supabase.from("support_ticket_categories").select("id").eq("category_status", "active").order("created_at", { ascending: true }).limit(1).maybeSingle();
    categoryId = (def as Record<string, unknown> | null)?.id as string | undefined;
  }
  if (!categoryId) return NextResponse.json(err("CONFLICT", "Support is not available yet (no category configured).", meta(guard.requestId, MOD)), { status: 409 });

  const code = "TIC-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const { data, error } = await supabase.from("support_tickets").insert({
    ticket_code: code, ticket_source: "school", school_id: schoolId, category_id: categoryId,
    subject, description, ticket_status: "new", updated_at: new Date().toISOString(),
  }).select("id, ticket_code, ticket_status").single();
  if (error || !data) return NextResponse.json(err("INTERNAL", "Could not raise the ticket.", meta(guard.requestId, MOD)), { status: 500 });
  await createAuditEvent({ sourceModule: MOD, action: "create_ticket", actor: guard.actor, entityType: "support_tickets", entityId: String((data as Record<string, unknown>).id), reason: `school raised ticket ${code}` });
  return NextResponse.json(ok(data, meta(guard.requestId, MOD)));
}
