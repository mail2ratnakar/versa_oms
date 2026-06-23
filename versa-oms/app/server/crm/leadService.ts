import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findDuplicates, type Lead } from "@/server/crm/dedupe";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { ValidationError } from "@/server/lib/defineModule";
import { maskRecords, maskRecord } from "@/server/masking/masking";
import type { Actor } from "@/server/types";

export const CRM_STAGES = [
  "new_lead", "contacted", "brochure_sent", "demo_scheduled", "demo_completed",
  "proposal_sent", "follow_up", "payment_pending", "converted", "lost",
] as const;
export type CrmStage = (typeof CRM_STAGES)[number];

export function normalizeName(s?: string): string {
  return (s || "").toLowerCase().trim().replace(/\s+/g, " ");
}
function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
function leadCode(): string {
  return "LEAD-" + crypto.randomUUID().slice(0, 8).toUpperCase();
}
function actorId(a: Actor): string | null {
  return isUuid(a.actor_id) ? a.actor_id : null;
}

export async function listLeads(actor: Actor, searchParams: URLSearchParams) {
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const size = Math.min(100, Number.parseInt(searchParams.get("page_size") ?? "50", 10) || 50);
  try {
    const supabase = createSupabaseAdminClient();
    const { data, count } = await supabase
      .from("school_leads")
      .select("*", { count: "exact" })
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .range((page - 1) * size, page * size - 1);
    const items = maskRecords((data ?? []) as Array<Record<string, unknown>>, actor);
    return { items, pagination: { page, page_size: size, total_count: count ?? items.length, has_next: (count ?? 0) > page * size, next_cursor: null } };
  } catch {
    return { items: [], pagination: { page, page_size: size, total_count: 0, has_next: false, next_cursor: null } };
  }
}

export async function createLead(actor: Actor, payload: Record<string, unknown>) {
  const required = ["school_name", "city", "state", "lead_source"] as const;
  const missing = required.filter((k) => !String(payload[k] ?? "").trim());
  if (missing.length) throw new ValidationError(missing.map((f) => ({ field: f, message: "Required." })));

  const supabase = createSupabaseAdminClient();
  let duplicateWarning = false;
  try {
    const { data: existing } = await supabase.from("school_leads").select("school_name, city, state, email, phone, website").is("archived_at", null);
    duplicateWarning = findDuplicates([payload as Lead], (existing ?? []) as Lead[]).duplicates.length > 0;
  } catch {
    /* ignore */
  }

  const row: Record<string, unknown> = {
    lead_code: leadCode(),
    school_name: String(payload.school_name).trim(),
    normalized_school_name: normalizeName(String(payload.school_name)),
    board: payload.board ?? null,
    city: String(payload.city).trim(),
    state: String(payload.state).trim(),
    lead_source: String(payload.lead_source).trim(),
    email: payload.email ?? null,
    phone: payload.phone ?? null,
    coordinator_name: payload.coordinator_name ?? null,
    principal_name: payload.principal_name ?? null,
    expected_student_count: payload.expected_student_count ?? null,
    lead_owner_id: (payload.lead_owner_id as string) || null,
    stage: "new_lead",
    lead_status: "active",
    updated_at: new Date().toISOString(),
    created_by: actorId(actor),
  };
  const { data, error } = await supabase.from("school_leads").insert(row).select().single();
  if (error) throw new ValidationError([{ field: "lead", message: error.message }]);
  await createAuditEvent({ sourceModule: "school_crm", action: "create_lead", actor, entityType: "school_leads", entityId: String(data.id), reason: `lead ${row.lead_code}` });
  return { lead: maskRecord(data as Record<string, unknown>, actor), duplicate_warning: duplicateWarning };
}

export async function setStage(actor: Actor, id: string, stage: string) {
  if (!CRM_STAGES.includes(stage as CrmStage)) throw new ValidationError([{ field: "stage", message: `Unknown stage '${stage}'.` }]);
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("school_leads").update({ stage, updated_at: new Date().toISOString() }).eq("id", id);
  } catch {
    /* local */
  }
  await createAuditEvent({ sourceModule: "school_crm", action: "set_stage", actor, entityType: "school_leads", entityId: id, newStatus: stage, reason: `stage -> ${stage}` });
  return { id, stage, applied: true };
}

export async function assignLead(actor: Actor, id: string, ownerId: string) {
  if (!ownerId) throw new ValidationError([{ field: "lead_owner_id", message: "Owner is required." }]);
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("school_leads").update({ lead_owner_id: ownerId, updated_at: new Date().toISOString() }).eq("id", id);
  } catch {
    /* local */
  }
  await createAuditEvent({ sourceModule: "school_crm", action: "assign_lead", actor, entityType: "school_leads", entityId: id, reason: `owner -> ${ownerId}` });
  return { id, lead_owner_id: ownerId, applied: true };
}

export async function markLost(actor: Actor, id: string, reason: string) {
  if (!reason || !reason.trim()) throw new ValidationError([{ field: "reason", message: "A lost reason is mandatory." }]);
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("school_leads").update({ lead_status: "lost", stage: "lost", lost_reason: reason, updated_at: new Date().toISOString() }).eq("id", id);
  } catch {
    /* local */
  }
  await createAuditEvent({ sourceModule: "school_crm", action: "mark_lost", actor, entityType: "school_leads", entityId: id, newStatus: "lost", reason });
  return { id, lead_status: "lost", lost_reason: reason, applied: true };
}

/**
 * CHAIN-001 — lead conversion. Effects (post-conditions):
 *   1. lead.stage/status = converted   2. school created/linked
 *   3. onboarding_case opened (submitted)   4. onboarding review task assigned
 *   5. dashboard + onboarding queue updated (case/task appear)   6. audit written
 */
export async function convertLead(actor: Actor, id: string) {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  let schoolId: string | null = null;
  let onboardingCaseId: string | null = null;
  let taskId: string | null = null;
  try {
    const { data: lead } = await supabase.from("school_leads").select("*").eq("id", id).maybeSingle();
    if (!lead) throw new ValidationError([{ field: "id", message: "Lead not found." }]);
    const l = lead as Record<string, unknown>;

    // 2 — school created/linked
    const { data: created } = await supabase
      .from("schools")
      .insert({
        school_code: "SCH-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
        name: l.school_name, city: l.city, state: l.state,
        coordinator_name: l.coordinator_name ?? "Pending",
        coordinator_email: l.email ?? `pending+${crypto.randomUUID().slice(0, 6)}@versa.local`,
      })
      .select("id")
      .single();
    schoolId = (created as { id?: string } | null)?.id ?? null;

    // 1 — lead converted (+ link school)
    await supabase.from("school_leads").update({ lead_status: "converted", stage: "converted", converted_school_id: schoolId, updated_at: now }).eq("id", id);

    // 3 — onboarding case opened (this IS the onboarding-queue entry: step 5)
    const { data: oc } = await supabase
      .from("school_onboarding_cases")
      .insert({
        onboarding_code: "ONB-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
        source_type: "crm_conversion",
        school_name: l.school_name,
        normalized_school_name: l.normalized_school_name ?? normalizeName(String(l.school_name)),
        address: l.address ?? "Pending",
        city: l.city, state: l.state,
        coordinator_name: l.coordinator_name ?? "Pending",
        coordinator_email: l.email ?? `pending+${crypto.randomUUID().slice(0, 6)}@versa.local`,
        onboarding_status: "submitted",
        school_id: schoolId,
        source_lead_id: id,
        updated_at: now,
      })
      .select("id")
      .single();
    onboardingCaseId = (oc as { id?: string } | null)?.id ?? null;

    // 4 — onboarding review task assigned to the onboarding queue
    if (onboardingCaseId) {
      const { ensureQueue, createWorkTask } = await import("@/server/tasks/createTask");
      const queueId = await ensureQueue(supabase, { code: "ONBOARDING_REVIEW", name: "Onboarding Review", type: "approval_queue", owner: "school_onboarding_executive" });
      if (queueId) {
        taskId = await createWorkTask(supabase, { title: `Review onboarding: ${String(l.school_name)}`, type: "approval", queueId, sourceType: "school_onboarding_cases", sourceId: onboardingCaseId });
      }
    }
  } catch (e) {
    if (e instanceof ValidationError) throw e;
  }

  // 6 — audit the chain
  await createAuditEvent({ sourceModule: "school_crm", action: "convert_lead", actor, entityType: "school_leads", entityId: id, newStatus: "converted", reason: `converted → school ${schoolId ?? "(local)"}, onboarding ${onboardingCaseId ?? "(local)"}` });
  if (onboardingCaseId) {
    await createAuditEvent({ sourceModule: "school_onboarding_ops", action: "open_case", actor, entityType: "school_onboarding_cases", entityId: onboardingCaseId, newStatus: "submitted", reason: `opened from lead ${id}` });
  }
  return { id, lead_status: "converted", converted_school_id: schoolId, onboarding_case_id: onboardingCaseId, task_id: taskId, applied: true };
}

export async function listInteractions(actor: Actor, leadId: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from("school_lead_interactions").select("*").eq("lead_id", leadId).order("created_at", { ascending: false });
    return { items: maskRecords((data ?? []) as Array<Record<string, unknown>>, actor) };
  } catch {
    return { items: [] };
  }
}

export async function addInteraction(actor: Actor, leadId: string, payload: { channel?: string; note?: string }) {
  if (!payload.note || !payload.note.trim()) throw new ValidationError([{ field: "note", message: "Note is required." }]);
  const row = { lead_id: leadId, channel: payload.channel ?? "note", note: payload.note, created_by: actorId(actor), updated_at: new Date().toISOString() };
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("school_lead_interactions").insert(row);
  } catch {
    /* local */
  }
  await createAuditEvent({ sourceModule: "school_crm", action: "record_interaction", actor, entityType: "school_lead_interactions", entityId: leadId, reason: payload.channel ?? "note" });
  return { ...row, applied: true };
}
