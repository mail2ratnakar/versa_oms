// WF-010 Support (FR-SUPPORT-CHAIN-2026-0023). A school views ONE of its own tickets + ONLY the
// school-visible messages — internal staff notes (visibility staff_only / restricted_security) are
// NEVER returned here. Own-school only; cross-school -> 404 (no leak). A whitelisted ticket view.
import { NextRequest, NextResponse } from "next/server";
import { requireSchoolScope } from "@/server/guards/requireSchoolScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ok, err, meta } from "@/server/http/envelope";

const MOD = "school_support";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const guard = await requireSchoolScope(request, MOD);
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const supabase = createSupabaseAdminClient();
  const { data: t } = await supabase.from("support_tickets").select("id, school_id, ticket_code, subject, description, ticket_status, sla_status, resolution_summary, created_at").eq("id", id).maybeSingle();
  const ticket = t as Record<string, unknown> | null;
  if (!ticket || String(ticket.school_id ?? "") !== String(guard.actor.school_id ?? "__none__")) {
    return NextResponse.json(err("NOT_FOUND", "Ticket not found.", meta(guard.requestId, MOD)), { status: 404 });
  }
  // THE CONTROL: only school_visible + active messages — internal notes are excluded server-side.
  const { data: msgs } = await supabase
    .from("support_ticket_messages")
    .select("id, message_type, body, author_type, created_at")
    .eq("ticket_id", id).eq("visibility", "school_visible").eq("message_status", "active")
    .order("created_at", { ascending: true });
  const { school_id: _drop, ...safeTicket } = ticket; // never echo internal routing
  return NextResponse.json(ok({ ticket: safeTicket, messages: msgs ?? [] }, meta(guard.requestId, MOD)));
}
