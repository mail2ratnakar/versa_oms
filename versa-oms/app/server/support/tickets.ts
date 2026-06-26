// WF-010 Support — kernel ops for school support tickets (extracted from the route so the route is thin
// wiring; the route validates via the compiled rule then calls these). FROZEN-KERNEL (domain + DB logic).
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import type { Actor } from "@/server/types";

const MOD = "school_support";

/** List the authenticated school's own tickets (school-scoped; internal notes are never returned here). */
export async function listSchoolTickets(schoolId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("support_tickets")
    .select("id, ticket_code, subject, ticket_status, sla_status, resolution_summary, created_at")
    .eq("school_id", schoolId || "__none__")
    .order("created_at", { ascending: false })
    .limit(100);
  return { items: data ?? [], pagination: { page: 1, page_size: 100, total_count: (data ?? []).length, has_next: false, next_cursor: null } };
}

/** A school views ONE of its own tickets + ONLY the school-visible messages (internal notes never returned).
 *  Cross-school -> NOT_FOUND (no leak). */
export async function getSchoolTicketDetail(schoolId: string, id: string): Promise<{ data: { ticket: Record<string, unknown>; messages: unknown[] } } | { error: { code: "NOT_FOUND"; message: string; status: number } }> {
  const supabase = createSupabaseAdminClient();
  const { data: t } = await supabase.from("support_tickets").select("id, school_id, ticket_code, subject, description, ticket_status, sla_status, resolution_summary, created_at").eq("id", id).maybeSingle();
  const ticket = t as Record<string, unknown> | null;
  if (!ticket || String(ticket.school_id ?? "") !== String(schoolId ?? "__none__")) {
    return { error: { code: "NOT_FOUND", message: "Ticket not found.", status: 404 } };
  }
  const { data: msgs } = await supabase
    .from("support_ticket_messages")
    .select("id, message_type, body, author_type, created_at")
    .eq("ticket_id", id).eq("visibility", "school_visible").eq("message_status", "active")
    .order("created_at", { ascending: true });
  const { school_id: _drop, ...safeTicket } = ticket;
  return { data: { ticket: safeTicket, messages: msgs ?? [] } };
}

type RaiseResult = { data: Record<string, unknown> } | { error: { code: "CONFLICT" | "INTERNAL"; message: string; status: number; field_errors?: { field: string; message: string }[] } };

/** Raise a ticket for a school: category resolved server-side, server-generated code, audited. */
export async function raiseSchoolTicket(schoolId: string, body: Record<string, unknown>, actor: Actor): Promise<RaiseResult> {
  const supabase = createSupabaseAdminClient();
  // Category is resolved server-side (the school never picks a uuid): the requested one if active, else a default.
  let categoryId = typeof body.category_id === "string" ? body.category_id : undefined;
  if (categoryId) {
    const { data: c } = await supabase.from("support_ticket_categories").select("id").eq("id", categoryId).eq("category_status", "active").maybeSingle();
    if (!c) categoryId = undefined;
  }
  if (!categoryId) {
    const { data: def } = await supabase.from("support_ticket_categories").select("id").eq("category_status", "active").order("created_at", { ascending: true }).limit(1).maybeSingle();
    categoryId = (def as Record<string, unknown> | null)?.id as string | undefined;
  }
  if (!categoryId) return { error: { code: "CONFLICT", message: "Support is not available yet (no category configured).", status: 409 } };

  const subject = String(body.subject ?? "").trim();
  const description = String(body.description ?? "").trim();
  const code = "TIC-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const { data, error } = await supabase.from("support_tickets").insert({
    ticket_code: code, ticket_source: "school", school_id: schoolId, category_id: categoryId,
    subject, description, ticket_status: "new", updated_at: new Date().toISOString(),
  }).select("id, ticket_code, ticket_status").single();
  if (error || !data) return { error: { code: "INTERNAL", message: "Could not raise the ticket.", status: 500 } };
  await createAuditEvent({ sourceModule: MOD, action: "create_ticket", actor, entityType: "support_tickets", entityId: String((data as Record<string, unknown>).id), reason: `school raised ticket ${code}` });
  return { data: data as Record<string, unknown> };
}
